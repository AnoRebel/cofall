/// <reference types="webrtc" />
import * as DetectRTC from "@/utils/rtc/DetectRTC";
import * as RecordRTC from "@/utils/rtc/RecordRTC";
// @ts-ignore
import * as FileBufferReader from "@/utils/rtc/FileBufferReader";
// @ts-ignore
import * as FileSelector from "@/utils/rtc/FileSelector";
import * as Adapter from "@/utils/rtc/adapter";
/// @ts-ignore
import MultiStreamsMixer from "multistreamsmixer";
/// @ts-ignore
import * as RTCMultiConnection from "rtcmulticonnection";
import { io } from "socket.io-client";
// import type Socket from "socket.io-client";
import * as Vue from "vue";
/// @ts-ignore
import { enableVueBindings, syncedStore, SyncedText } from "@syncedstore/core";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "@/utils/y-webrtc";
import type * as Y from "yjs";
import FileSaver from "file-saver";
import { RangeSet, StateEffect, StateField } from "@codemirror/state";
import { EditorView, gutter, GutterMarker } from "@codemirror/view";
import { fileExts as fileExtensions } from "./options";

// REUSERS
let socket: any;
// REUSERS
const save = (
  data: { code: any; title: string; lang: string },
): void => {
  const fileExtension = (lang: any): string => fileExtensions[lang];

  const fileNameify = (name: string): string => name.split(" ").join("_");

  const blob = new Blob([data.code], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(
    blob,
    `${fileNameify(data.title)}.${fileExtension(data.lang)}`,
  );
};

const FullScreen = {
  activate: (element: HTMLElement) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullscreen) {
      element.mozRequestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  },
  deactivate: (element: HTMLElement) => {
    if (element.exitFullscreen) {
      element.exitFullscreen();
    } else if (element.mozCancelFullscreen) {
      element.mozCancelFullscreen();
    } else if (element.webkitExitFullscreen) {
      element.webkitExitFullscreen();
    }
  },
};

const Notifier = {
  perm: (): void => {
    if (Notification.permission !== "granted") Notification.requestPermission();
  },
  start: (data: any, url: string, icon: string, name: string) => {
    name = name ||
      "notiwin" +
        ((n) => {
          let rnd = "";
          for (let i = 0; i < n; i++) rnd += Math.floor(Math.random() * 10);
          return rnd;
        })(5);
    if (!("Notification" in window)) {
      console.log(
        "Your browser does not support desktop notifications, please try Chrome or Firefox.",
      );
      return false;
    }

    let notifyMsg;
    const now = Date.now();
    if (data.message.length >= 80) {
      notifyMsg = `${data.message.substring(0, 77)}...`;
    } else {
      notifyMsg = data.message;
    }

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    } else {
      icon = icon && icon.match(/^.*\.(jpeg|jpg|gif|png)/gi)
        ? icon
        : "http://ob9oayzh3.bkt.clouddn.com/images.png";
      const title = `(Cofall) ${data.user}`;
      const notification = new Notification(title, {
        icon: icon,
        body: notifyMsg,
        tag: `${data.user}-${now}`,
        badge: "/favicon.png",
        vibrate: window.navigator.vibrate([200, 100]),
        renotify: true,
        lang: "en",
        dir: "ltr",
        sound: "/sound.mp3",
      });
      notification.onclick = () => {
        window.open(url, name);
      };
    }
  },
  focus: (data: any, url: string, icon: string) => {
    if (!("Notification" in window)) {
      console.log(
        "Your browser does not support desktop notifications, please try Chrome or Firefox.",
      );
      return false;
    }

    let notifyMsg;
    const now = Date.now();
    if (data.message.length >= 80) {
      notifyMsg = `${data.message.substring(0, 77)}...`;
    } else {
      notifyMsg = data.message;
    }

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    } else {
      icon = icon && icon.match(/^.*\.(jpeg|jpg|gif|png)/gi)
        ? icon
        : "http://ob9oayzh3.bkt.clouddn.com/images.png";
      const title = `(Cofall) ${data.user}`;
      const notification = new Notification(title, {
        icon: icon,
        body: notifyMsg,
        tag: `${data.user}-${now}`,
        badge: "/favicon.png",
        vibrate: window.navigator.vibrate([200, 100]),
        renotify: true,
        lang: "en",
        dir: "ltr",
        sound: "/sound.mp3",
      });
      notification.onclick = () => {
        parent.focus();
        window.focus(); //just in case, older browsers
        notification.close();
      };
    }
  },
};

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

const useSocket = (url: string = import.meta.env.VITE_SOCKET_URL) => {
  // TODO: Rethink this logic
  if (socket) return socket;
  socket = io(url);
  return socket;
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

const useSyncedStore = (shape = {}) => {
  localStorage.log = "true";
  enableVueBindings(Vue);
  const store = syncedStore(shape);
  return store;
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
  return rtc;
};

const getScreen = async (opts = { video: true }) => {
  const screen = await navigator.mediaDevices.getDisplayMedia(opts);
  return screen;
};

const getCamera = async (opts = { video: true, audio: false }) => {
  const camera = await navigator.mediaDevices.getUserMedia(opts);
  return camera;
};

const getAudio = async (opts = { video: false, audio: true }) => {
  const audio = await navigator.mediaDevices.getUserMedia(opts);
  return audio;
};

const getCameraAndScreen = async (camera: MediaStream, screen: MediaStream) => {
  const mixer = new MultiStreamsMixer([camera, screen]);
  // mixer.frameInterval = 1;
  // mixer.startDrawingFrames();
  // mixer.getMixedStream();
  // mixer.releaseStreams();
  return mixer;
};

const breakpointEffect = StateEffect.define<{ pos: number; on: boolean }>({
  map: (val, mapping) => ({ pos: mapping.mapPos(val.pos), on: val.on }),
});

const breakpointMarker = new class extends GutterMarker {
  toDOM() {
    return document.createTextNode("●");
  }
}();

const breakpointState = StateField.define<RangeSet<GutterMarker>>({
  create() {
    return RangeSet.empty;
  },
  update(set, transaction) {
    set = set.map(transaction.changes);
    for (const e of transaction.effects) {
      if (e.is(breakpointEffect)) {
        if (e.value.on) {
          set = set.update({ add: [breakpointMarker.range(e.value.pos)] });
        } else {
          set = set.update({ filter: (from) => from != e.value.pos });
        }
      }
    }
    return set;
  },
});

function toggleBreakpoint(view: EditorView, pos: number) {
  const breakpoints = view.state.field(breakpointState);
  let hasBreakpoint = false;
  breakpoints.between(pos, pos, () => {
    hasBreakpoint = true;
  });
  view.dispatch({
    effects: breakpointEffect.of({ pos, on: !hasBreakpoint }),
  });
}

const breakpointGutter = [
  breakpointState,
  gutter({
    class: "cm-breakpoint-gutter",
    markers: (v) => v.state.field(breakpointState),
    initialSpacer: () => breakpointMarker,
    domEventHandlers: {
      mousedown(view, line) {
        toggleBreakpoint(view, line.from);
        return true;
      },
    },
  }),
  EditorView.baseTheme({
    ".cm-breakpoint-gutter .cm-gutterElement": {
      color: "red",
      paddingLeft: "5px",
      cursor: "default",
    },
  }),
];

export {
  Adapter,
  breakpointGutter,
  DetectRTC,
  FileBufferReader,
  FileSelector,
  FullScreen,
  getAudio,
  getCamera,
  getCameraAndScreen,
  getScreen,
  Notifier,
  RecordRTC,
  save,
  useRTC,
  useRTCProvider,
  useSocket,
  useSyncedStore,
};
