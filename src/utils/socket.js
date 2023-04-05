import * as DetectRTC from "@/utils/rtc/DetectRTC";
import * as RecordRTC from "@/utils/rtc/RecordRTC";
import * as FileBufferReader from "@/utils/rtc/FileBufferReader";
import * as FileSelector from "@/utils/rtc/FileSelector";
import * as Adapter from "@/utils/rtc/adapter";
import MultiStreamsMixer from "multistreamsmixer";
import * as RTCMultiConnection from "rtcmulticonnection";
import { io } from "socket.io-client";

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
  navigator.mediaDevices.getUserMedia = function (constraints) {
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
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  };
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getDisplayMedia as it would overwrite existing properties.
// Here, we will just add the getDisplayMedia property if it's missing.
if (navigator.mediaDevices.getDisplayMedia === undefined) {
  navigator.mediaDevices.getDisplayMedia = function (constraints) {
    // First get ahold of the legacy getUserMedia, if present
    const getDisplayMedia = navigator.getDisplayMedia ||
      navigator.webkitGetDisplayMedia ||
      navigator.mozGetDisplayMedia;

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
      getDisplayMedia.call(navigator, constraints, resolve, reject);
    });
  };
}

const useSocket = () => {
  const socket = io(import.meta.env.VITE_SOCKET_URL);
  return {
    socket,
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

const getMic = async (opts = { video: false, audio: true }) => {
  const audio = await navigator.mediaDevices.getUserMedia(opts);
  return { audio };
};

const getCameraAndScreen = async (camera, screen) => {
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
  getCamera,
  getCameraAndScreen,
  getMic,
  getScreen,
  RecordRTC,
  useRTC,
  useSocket,
};
