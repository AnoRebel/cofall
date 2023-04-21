/// <reference types="hark" />
// original source code is taken from:
// https://github.com/SimpleWebRTC/hark
// copyright goes to &yet team
// edited by Muaz Khan for RTCMultiConnection.js
// And again, by AnoRebel, for Cofall

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
const hark = (
  stream: MediaStream,
  options: import("@/types/hark").HarkOptions,
): import("@/types/hark").Harker => {
  const audioContextType = window.webkitAudioContext || window.AudioContext;

  const harker: import("@/types/hark").Harker = {};
  harker.events = {};
  harker.on = (event, callback) => {
    harker.events[event] = callback;
  };

  harker.emit = (...args) => {
    if (harker.events[args[0]]) {
      harker.events[args[0]](
        args[1],
        args[2],
        args[3],
        args[4],
      );
    }
  };

  // make it not break in non-supported browsers
  if (!audioContextType) return harker;

  options = options || {};
  // Config
  const smoothing = options.smoothing || 0.1,
    play = options.play,
    history = options.history || 10;
  let interval = options.interval || 50,
    threshold = options.threshold,
    running = true;

  // Setup Audio Context
  // if (!window.audioContext00) {
  //   window.audioContext00 = new audioContextType();
  // }
  // use a single audio context due to hardware limits
  // Ensure that just a single AudioContext is internally created
  const audioContext = options.audioContext ||
    new audioContextType();

  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  // don't play for self
  gainNode.gain.value = 0;

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = smoothing;
  const fftBins = new Float32Array(analyser.fftSize);

  //WebRTC Stream
  const sourceNode = audioContext.createMediaStreamSource(stream);
  threshold = threshold || -50;

  sourceNode.connect(analyser);
  if (play) analyser.connect(audioContext.destination);

  harker.speaking = false;

  harker.setThreshold = (t: number) => {
    threshold = t;
  };

  harker.setInterval = (i: number) => {
    interval = i;
  };

  harker.stop = () => {
    running = false;
    harker.emit!("volume_change", -100, threshold);
    if (harker.speaking) {
      harker.speaking = false;
      harker.emit!("stopped_speaking");
    }
  };
  harker.speakingHistory = [];
  for (let i = 0; i < history; i++) {
    harker.speakingHistory.push(0);
  }

  // Poll the analyser node to determine if speaking
  // and emit events if changed
  const looper = () => {
    setTimeout(() => {
      //check if stop has been called
      if (!running) {
        return;
      }

      const currentVolume = getMaxVolume(analyser, fftBins);

      harker.emit!("volume_change", currentVolume, threshold);

      let history = 0;
      if (currentVolume > threshold! && !harker.speaking) {
        // trigger quickly, short history
        for (
          let i = harker.speakingHistory!.length - 3;
          i < harker.speakingHistory!.length;
          i++
        ) {
          history += harker.speakingHistory![i];
        }
        if (history >= 2) {
          harker.speaking = true;
          harker.emit!("speaking");
        }
      } else if (currentVolume < threshold! && harker.speaking) {
        for (let j = 0; j < harker.speakingHistory!.length; j++) {
          history += harker.speakingHistory![j];
        }
        if (history === 0) {
          harker.speaking = false;
          harker.emit!("stopped_speaking");
        }
      }
      harker.speakingHistory!.shift();
      harker.speakingHistory!.push(0 + Number(currentVolume > threshold!));

      looper();
    }, interval);
  };
  looper();

  const getMaxVolume = (
    analyser: AnalyserNode,
    fftBins: Float32Array,
  ): number => {
    let maxVolume = -Infinity;
    analyser.getFloatFrequencyData(fftBins);

    for (let i = 4, ii = fftBins.length; i < ii; i++) {
      if (fftBins[i] > maxVolume && fftBins[i] < 0) {
        maxVolume = fftBins[i];
      }
    }

    return maxVolume;
  };

  return harker;
};

export default hark;
