/// <reference types="webrtc" />
import * as DetectRTC from "@/utils/rtc/DetectRTC";
import * as RecordRTC from "@/utils/rtc/RecordRTC";
import * as FileBufferReader from "@/utils/rtc/FileBufferReader";
import * as FileSelector from "@/utils/rtc/FileSelector";
import * as Adapter from "@/utils/rtc/adapter";
import MultiStreamsMixer from "multistreamsmixer";
import * as RTCMultiConnection from "rtcmulticonnection";
import { io } from "socket.io-client";
import * as Vue from "vue";
import { enableVueBindings, getYjsValue, syncedStore } from "@syncedstore/core";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "@/utils/y-webrtc";
import type * as Y from "yjs";

// const videoConstraints = {
//   width: {
//     ideal: 1280,
//   },
//   height: {
//     ideal: 720,
//   },
//   frameRate: 30,
// };

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = (
    constraints?: MediaStreamConstraints | undefined,
  ): Promise<MediaStream> => {
    // First get ahold of the legacy getUserMedia, if present
    const getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      alert("getUserMedia API is not supported by this browser.");
      return Promise.reject(
        new Error("getUserMedia is not implemented in this browser"),
      );
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise((resolve, reject) => {
      getUserMedia.call(navigator, constraints || {}, resolve, reject);
    });
  };
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getDisplayMedia as it would overwrite existing properties.
// Here, we will just add the getDisplayMedia property if it's missing.
if (navigator.mediaDevices.getDisplayMedia === undefined) {
  navigator.mediaDevices.getDisplayMedia = (
    options?: DisplayMediaStreamOptions | undefined,
  ): Promise<MediaStream> => {
    // First get ahold of the legacy getUserMedia, if present
    const getDisplayMedia = navigator.getDisplayMedia ||
      navigator.webkitGetDisplayMedia || navigator.mozGetDisplayMedia;

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getDisplayMedia) {
      alert("getDisplayMedia API is not supported by this browser.");
      return Promise.reject(
        new Error("getDisplayMedia is not implemented in this browser"),
      );
    }

    // Otherwise, wrap the call to the old navigator.getDisplayMedia with a Promise
    return new Promise((resolve, reject) => {
      getDisplayMedia.call(navigator, options || {}, resolve, reject);
    });
  };
}

const useSocket = (url = import.meta.env.VITE_SOCKET_URL) => {
  const socket = io(url);
  return {
    socket,
  };
};

const useRTCProvider = (name: string, ydoc: Y.Doc) => {
  const provider = new WebrtcProvider(name, ydoc, {
    signaling: [import.meta.env.VITE_SOCKET_URL],
  });
  const persistence = new IndexeddbPersistence(name, ydoc);
  persistence.whenSynced.then(() => {
    console.log("loaded data from indexed db");
  });
  persistence.on("synced", () => {
    console.log("content from the database is loaded");
  });
  return {
    provider,
    persistence,
  };
};

const useSyncStore = (shape = {}) => {
  localStorage.log = "true";
  enableVueBindings(Vue);
  const store = syncedStore(shape);
  const doc = getYjsValue(store);
  return {
    doc,
    store,
  };
};

const useRTC = () => {
  const rtc = new RTCMultiConnection();
  rtc.socketURL = import.meta.env.VITE_SOCKET_URL;
  rtc.enableFileSharing = true; // by default, it is "false"
  // rtc.sdpConstraints.mandatory = {
  //   OfferToReceiveAudio: true,
  //   OfferToReceiveVideo: true,
  // };
  // rtc.session = {
  //   audio: true,
  //   video: true,
  // };
  // rtc.mediaConstraints = {
  //   video: videoConstraints,
  //   audio: true,
  // };
  // rtc.onMediaError = (e) => {
  //   if (e.message === "Concurrent mic process limit.") {
  //     if (DetectRTC.audioInputDevices.length <= 1) {
  //       alert(
  //         "Please select external microphone. Check github issue number 483.",
  //       );
  //       return;
  //     }
  //
  //     const secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
  //     rtc.mediaConstraints.audio = {
  //       deviceId: secondaryMic,
  //     };
  //
  //     rtc.join(rtc.sessionid);
  //   }
  //   console.log(e);
  // };
  return {
    rtc,
  };
};

const getScreen = async (opts = { video: true }) => {
  const screen = await navigator.mediaDevices.getDisplayMedia(opts);
  return { screen };
};

const getCamera = async (opts = { video: true, audio: false }) => {
  const camera = await navigator.mediaDevices.getUserMedia(opts);
  return { camera };
};

const getAudio = async (opts = { video: false, audio: true }) => {
  const audio = await navigator.mediaDevices.getUserMedia(opts);
  return { audio };
};

const getCameraAndScreen = async (camera: MediaStream, screen: MediaStream) => {
  const mixer = new MultiStreamsMixer([camera, screen]);
  // mixer.frameInterval = 1;
  // mixer.startDrawingFrames();
  // mixer.getMixedStream();
  // mixer.releaseStreams();
  return { mixer };
};

export {
  Adapter,
  DetectRTC,
  FileBufferReader,
  FileSelector,
  getAudio,
  getCamera,
  getCameraAndScreen,
  getScreen,
  RecordRTC,
  useRTC,
  useRTCProvider,
  useSocket,
  useSyncStore,
};
