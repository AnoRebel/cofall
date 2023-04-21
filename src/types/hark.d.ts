/// <reference types="node" />

declare namespace Hark {
  interface HarkOptions {
    smoothing?: number;
    play?: boolean;
    history?: number;
    interval?: number;
    threshold?: number;
    audioContext?: AudioContext;
  }
  interface Harker {
    events?: {};
    on?: (event: string, callback: any) => void;
    emit?: (...args: any) => void;
    speaking?: boolean;
    setThreshold?: (t: number) => void;
    setInterval?: (t: number) => void;
    stop?: () => void;
    speakingHistory?: Array<number>;
  }
}

export = Hark;
