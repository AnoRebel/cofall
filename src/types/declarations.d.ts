// "files": ["./declarations.d.ts"], in tsconfig.json
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
