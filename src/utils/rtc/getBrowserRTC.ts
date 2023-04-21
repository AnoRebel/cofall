/// <reference types="webrtc" />
// originally pulled out of simple-peer

const getBrowserRTC = () => {
  if (typeof window === "undefined") return null;
  const wrtc = {
    RTCPeerConnection: window.mozRTCPeerConnection ||
      window.RTCPeerConnection ||
      window.webkitRTCPeerConnection,
    RTCSessionDescription: window.mozRTCSessionDescription ||
      window.RTCSessionDescription || window.webkitRTCSessionDescription,
    RTCIceCandidate: window.mozRTCIceCandidate || window.RTCIceCandidate ||
      window.webkitRTCIceCandidate,
  };
  if (!wrtc.RTCPeerConnection) return null;
  return wrtc;
};

export default getBrowserRTC;
