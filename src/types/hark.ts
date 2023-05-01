/// <reference types="node" />

export type HarkOptions = {
  smoothing?: number;
  play?: boolean;
  history?: number;
  interval?: number;
  threshold?: number;
  audioContext?: AudioContext;
};

export type Harker = {
  events: {};
  on?: (event: string, callback: any) => void;
  emit?: (...args: any) => void;
  speaking?: boolean;
  setThreshold?: (t: number) => void;
  setInterval?: (t: number) => void;
  stop?: () => void;
  speakingHistory?: Array<number>;
};
