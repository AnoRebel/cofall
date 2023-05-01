/// <reference types="tiny-peer" />
/*! simple-peer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
import Debug from "debug";
import getBrowserRTC from "@/utils/rtc/getBrowserRTC";
import randomstring from "random-string";
import { EventEmitter } from "events";
import type EventEmitterOptions from "events";
import errCode from "err-code";

const debug = Debug("simple-peer");

// fast, tiny `queueMicrotask` shim for modern engines
let promise: Promise<void>;
typeof queueMicrotask === "function"
  ? queueMicrotask.bind(typeof window !== "undefined" ? window : globalThis)
  // reuse resolved promise, and allocate it lazily
  : (cb: () => void) =>
    (promise || (promise = Promise.resolve()))
      .then(cb)
      .catch((err: any) =>
        setTimeout(() => {
          throw err;
        }, 0)
      );

const MAX_BUFFERED_AMOUNT = 64 * 1024;
const ICECOMPLETE_TIMEOUT = 5 * 1000;
const CHANNEL_CLOSING_TIMEOUT = 5 * 1000;

// HACK: Filter trickle lines when trickle is disabled #354
const filterTrickle = (sdp: any) => {
  return sdp.replace(/a=ice-options:trickle\s\n/g, "");
};

const warn = (message: string) => console.warn(message);

// Types and Interfaces

declare namespace TinyPeer {
  interface Options {
    /** set to `true` if this is the initiating peer */
    initiator?: boolean | undefined;
    /** custom webrtc data channel configuration (used by [`createDataChannel`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createDataChannel)) */
    channelConfig?: RTCDataChannelInit | undefined;
    /** custom webrtc data channel name */
    channelName?: string | undefined;
    /** custom webrtc configuration (used by [`RTCPeerConnection`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) constructor) */
    config?: RTCConfiguration | undefined;
    /** custom offer options (used by [`createOffer`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer) method) */
    offerOptions?: RTCOfferOptions | undefined;
    /** custom answer options (used by [`createAnswer`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer) method) */
    answerOptions?: RTCAnswerOptions | undefined;
    /** function to transform the generated SDP signaling data (for advanced users) */
    sdpTransform?: ((this: Instance, sdp: string) => string) | undefined;
    /** if video/voice is desired, pass stream returned from [`getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) */
    stream?: MediaStream | undefined;
    /** an array of MediaStreams returned from [`getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) */
    streams?: MediaStream[] | undefined;
    /** set to `false` to disable [trickle ICE](http://webrtchacks.com/trickle-ice/) and get a single 'signal' event (slower) */
    trickle?: boolean | undefined;
    /** similar to `trickle`, needs to be set to `false` to disable trickling, defaults to `false` */
    allowHalfTrickle?: boolean | undefined;
    /** if `trickle` is set to `false`, determines how long to wait before providing an offer or answer; default value is 5000 milliseconds  */
    iceCompleteTimeout?: number | undefined;
    /** custom webrtc implementation, mainly useful in node to specify in the [wrtc](https://npmjs.com/package/wrtc) package. */
    wrtc?: {
      RTCPeerConnection: typeof RTCPeerConnection;
      RTCSessionDescription: typeof RTCSessionDescription;
      RTCIceCandidate: typeof RTCIceCandidate;
    } | undefined;
    /** set to true to create the stream in Object Mode. In this mode, incoming string data is not automatically converted to Buffer objects. */
    objectMode?: boolean | undefined;
  }
  interface TinyPeer {
    prototype: Instance;
    /**
     * Create a new WebRTC peer connection.
     *
     * A "data channel" for text/binary communication is always established, because it's cheap and often useful. For video/voice communication, pass the stream option.
     *
     * If opts is specified, then the default options (see <https://github.com/feross/simple-peer#peer--new-peeropts>) will be overridden.
     */
    new (opts?: Options): Instance;

    /** Detect native WebRTC support in the javascript environment. */
    readonly WEBRTC_SUPPORT: boolean;

    // ********************************
    // methods which are not documented
    // ********************************

    /**
     * Expose peer and data channel config for overriding all Peer
     * instances. Otherwise, just set opts.config or opts.channelConfig
     * when constructing a Peer.
     */
    config: RTCConfiguration;
    /**
     * Expose peer and data channel config for overriding all Peer
     * instances. Otherwise, just set opts.config or opts.channelConfig
     * when constructing a Peer.
     */
    channelConfig: RTCDataChannelInit;
  }

  type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;

  type TinyPeerData = string | Buffer | TypedArray | ArrayBuffer | Blob;

  type SignalData =
    | {
      type: "transceiverRequest";
      transceiverRequest: {
        kind: string;
        init?: RTCRtpTransceiverInit | undefined;
      };
    }
    | {
      type: "renegotiate";
      renegotiate: true;
    }
    | {
      type: "candidate";
      candidate: RTCIceCandidate;
    }
    | RTCSessionDescriptionInit;

  interface Instance extends EventEmitter {
    /**
     * Call this method whenever the remote peer emits a `peer.on('signal')` event.
     *
     * The `data` will encapsulate a webrtc offer, answer, or ice candidate. These messages help
     * the peers to eventually establish a direct connection to each other. The contents of these
     * strings are an implementation detail that can be ignored by the user of this module;
     * simply pass the data from 'signal' events to the remote peer and call `peer.signal(data)`
     * to get connected.
     */
    signal(data: string | SignalData): void;

    /**
     * Send text/binary data to the remote peer. `data` can be any of several types: `String`,
     * `Buffer` (see [buffer](https://github.com/feross/buffer)), `ArrayBufferView` (`Uint8Array`,
     * etc.), `ArrayBuffer`, or `Blob` (in browsers that support it).
     *
     * Note: If this method is called before the `peer.on('connect')` event has fired,
     * then an exception will be thrown. Use `peer.write(data)`
     * (which is inherited from the node.js [duplex stream](https://nodejs.org/api/stream.html) interface)
     * if you want this data to be buffered instead.
     */
    send(data: TinyPeerData): void;

    /** Add a `MediaStream` to the connection. */
    addStream(stream: MediaStream): void;

    /** Remove a `MediaStream` from the connection. */
    removeStream(stream: MediaStream): void;

    /** Add a `MediaStreamTrack` to the connection. Must also pass the `MediaStream` you want to attach it to. */
    addTrack(track: MediaStreamTrack, stream: MediaStream): void;

    /** Remove a `MediaStreamTrack` from the connection. Must also pass the `MediaStream` that it was attached to. */
    removeTrack(track: MediaStreamTrack, stream: MediaStream): void;

    /** Replace a `MediaStreamTrack` with another track. Must also pass the `MediaStream` that the old track was attached to. */
    replaceTrack(
      oldTrack: MediaStreamTrack,
      newTrack: MediaStreamTrack,
      stream: MediaStream,
    ): void;

    /** Add a `RTCRtpTransceiver` to the connection. Can be used to add transceivers before adding tracks. Automatically called as necessary by `addTrack`. */
    addTransceiver(kind: string, init?: RTCRtpTransceiverInit): void;

    // TODO: https://github.com/feross/simple-peer/blob/d972548299a50f836ca91c36e39304ef0f9474b7/index.js#L427
    // destroy(onclose?: () => void): void;
    /**
     * Destroy and cleanup this peer connection.
     *
     * If the optional `err` parameter is passed, then it will be emitted as an `'error'`
     * event on the stream.
     */
    destroy(error?: Error): any;

    // ********************************
    // methods which are not documented
    // ********************************

    readonly bufferSize: number;
    readonly connected: boolean;
    readonly streams: MediaStream[];

    address():
      | { port: undefined; family: undefined; address: undefined }
      | { port: number; family: "IPv6" | "IPv4"; address: string };

    // used for debug logging
    _debug(message?: any, ...optionalParams: any[]): void;

    // ******
    // events
    // ******
    addListener(
      event: "connect" | "close" | "end" | "pause" | "readable" | "resume",
      listener: () => void,
    ): this;
    addListener(event: "signal", listener: (data: SignalData) => void): this;
    addListener(event: "stream", listener: (stream: MediaStream) => void): this;
    addListener(
      event: "track",
      listener: (track: MediaStreamTrack, stream: MediaStream) => void,
    ): this;
    addListener(event: "data", listener: (chunk: any) => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(
      event: string | symbol,
      listener: (...args: any[]) => void,
    ): this;

    emit(
      event: "connect" | "close" | "end" | "pause" | "readable" | "resume",
    ): boolean;
    emit(event: "signal", data: SignalData): this;
    emit(event: "stream", stream: MediaStream): this;
    emit(event: "track", track: MediaStreamTrack, stream: MediaStream): this;
    emit(event: "data", chunk: any): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;

    on(
      event: "connect" | "close" | "end" | "pause" | "readable" | "resume",
      listener: () => void,
    ): this;
    on(event: "signal", listener: (data: SignalData) => void): this;
    on(event: "stream", listener: (stream: MediaStream) => void): this;
    on(
      event: "track",
      listener: (track: MediaStreamTrack, stream: MediaStream) => void,
    ): this;
    on(event: "data", listener: (chunk: any) => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;

    once(
      event: "connect" | "close" | "end" | "pause" | "readable" | "resume",
      listener: () => void,
    ): this;
    once(event: "signal", listener: (data: SignalData) => void): this;
    once(event: "stream", listener: (stream: MediaStream) => void): this;
    once(
      event: "track",
      listener: (track: MediaStreamTrack, stream: MediaStream) => void,
    ): this;
    once(event: "data", listener: (chunk: any) => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;

    prependListener(
      event: "connect" | "close" | "end" | "pause" | "readable" | "resume",
      listener: () => void,
    ): this;
    prependListener(
      event: "signal",
      listener: (data: SignalData) => void,
    ): this;
    prependListener(
      event: "stream",
      listener: (stream: MediaStream) => void,
    ): this;
    prependListener(
      event: "track",
      listener: (track: MediaStreamTrack, stream: MediaStream) => void,
    ): this;
    prependListener(event: "data", listener: (chunk: any) => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(
      event: string | symbol,
      listener: (...args: any[]) => void,
    ): this;

    prependOnceListener(
      event: "connect" | "close" | "end" | "pause" | "readable" | "resume",
      listener: () => void,
    ): this;
    prependOnceListener(
      event: "signal",
      listener: (data: SignalData) => void,
    ): this;
    prependOnceListener(
      event: "stream",
      listener: (stream: MediaStream) => void,
    ): this;
    prependOnceListener(
      event: "track",
      listener: (track: MediaStreamTrack, stream: MediaStream) => void,
    ): this;
    prependOnceListener(event: "data", listener: (chunk: any) => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(
      event: string | symbol,
      listener: (...args: any[]) => void,
    ): this;

    removeListener(
      event: "connect" | "close" | "end" | "pause" | "readable" | "resume",
      listener: () => void,
    ): this;
    removeListener(event: "signal", listener: (data: SignalData) => void): this;
    removeListener(
      event: "stream",
      listener: (stream: MediaStream) => void,
    ): this;
    removeListener(
      event: "track",
      listener: (track: MediaStreamTrack, stream: MediaStream) => void,
    ): this;
    removeListener(event: "data", listener: (chunk: any) => void): this;
    removeListener(event: "error", listener: (err: Error) => void): this;
    removeListener(
      event: string | symbol,
      listener: (...args: any[]) => void,
    ): this;
  }
}
/*
 * End of Types and Interfaces
 */

/**
 * WebRTC peer connection. Same API as node core `net.Socket`, plus a few extra methods.
 * Duplex stream.
 * @param {Object} opts
 */
class TinyPeer extends EventEmitter {
  constructor(opts: any) {
    opts = Object.assign({
      allowHalfOpen: false,
    }, opts);

    super(opts);

    this._id = opts.id || randomstring({ length: 20 });
    this._debug("new peer %o", opts);

    this.channelName = opts.initiator
      ? opts.channelName || randomstring({ length: 20 })
      : null;

    this.initiator = opts.initiator || false;
    this.channelConfig = opts.channelConfig || Peer.channelConfig;
    this.channelNegotiated = this.channelConfig.negotiated;
    this.config = Object.assign({}, TinyPeer.config, opts.config);
    this.proprietaryConstraints = Object.assign(
      {},
      TinyPeer.proprietaryConstraints,
      opts.proprietaryConstraints,
    );
    this.offerOptions = opts.offerOptions || {};
    this.answerOptions = opts.answerOptions || {};
    this.sdpTransform = opts.sdpTransform || ((sdp) => sdp);
    this.streams = opts.streams || (opts.stream ? [opts.stream] : []); // support old "stream" option
    this.trickle = opts.trickle !== undefined ? opts.trickle : true;
    this.allowHalfTrickle = opts.allowHalfTrickle !== undefined
      ? opts.allowHalfTrickle
      : false;
    this.iceCompleteTimeout = opts.iceCompleteTimeout || ICECOMPLETE_TIMEOUT;

    this.destroyed = false;
    this.destroying = false;
    this._connected = false;

    this.remoteAddress = undefined;
    this.remoteFamily = undefined;
    this.remotePort = undefined;
    this.localAddress = undefined;
    this.localFamily = undefined;
    this.localPort = undefined;

    this._wrtc = (opts.wrtc && typeof opts.wrtc === "object")
      ? opts.wrtc
      : getBrowserRTC();

    if (!this._wrtc) {
      if (typeof window === "undefined") {
        throw errCode(
          new Error(
            "No WebRTC support: Specify `opts.wrtc` option in this environment",
          ),
          "ERR_WEBRTC_SUPPORT",
        );
      } else {
        throw errCode(
          new Error("No WebRTC support: Not a supported browser"),
          "ERR_WEBRTC_SUPPORT",
        );
      }
    }

    this._pcReady = false;
    this._channelReady = false;
    this._iceComplete = false; // ice candidate trickle done (got null candidate)
    this._iceCompleteTimer = null; // send an offer/answer anyway after some timeout
    this._channel = null;
    this._pendingCandidates = [];

    this._isNegotiating = false; // is this peer waiting for negotiation to complete?
    this._firstNegotiation = true;
    this._batchedNegotiation = false; // batch synchronous negotiations
    this._queuedNegotiation = false; // is there a queued negotiation request?
    this._sendersAwaitingStable = [];
    this._senderMap = new Map();
    this._closingInterval = null;

    this._remoteTracks = [];
    this._remoteStreams = [];

    this._chunk = null;
    this._cb = null;
    this._interval = null;

    try {
      this._pc = new (this._wrtc.RTCPeerConnection)(
        this.config,
        this.proprietaryConstraints,
      );
    } catch (err) {
      this.destroy(errCode(err, "ERR_PC_CONSTRUCTOR"));
      return;
    }

    // We prefer feature detection whenever possible, but sometimes that's not
    // possible for certain implementations.
    this._isReactNativeWebrtc = typeof this._pc._peerConnectionId === "number";

    this._pc.oniceconnectionstatechange = () => {
      this._onIceStateChange();
    };
    this._pc.onicegatheringstatechange = () => {
      this._onIceStateChange();
    };
    this._pc.onconnectionstatechange = () => {
      this._onConnectionStateChange();
    };
    this._pc.onsignalingstatechange = () => {
      this._onSignalingStateChange();
    };
    this._pc.onicecandidate = (event) => {
      this._onIceCandidate(event);
    };

    // HACK: Fix for odd Firefox behavior, see: https://github.com/feross/simple-peer/pull/783
    if (typeof this._pc.peerIdentity === "object") {
      this._pc.peerIdentity.catch((err) => {
        this.destroy(errCode(err, "ERR_PC_PEER_IDENTITY"));
      });
    }

    // Other spec events, unused by this implementation:
    // - onconnectionstatechange
    // - onicecandidateerror
    // - onfingerprintfailure
    // - onnegotiationneeded

    if (this.initiator || this.channelNegotiated) {
      this._setupData({
        channel: this._pc.createDataChannel(
          this.channelName,
          this.channelConfig,
        ),
      });
    } else {
      this._pc.ondatachannel = (event) => {
        this._setupData(event);
      };
    }

    if (this.streams) {
      this.streams.forEach((stream) => {
        this.addStream(stream);
      });
    }
    this._pc.ontrack = (event) => {
      this._onTrack(event);
    };

    this._debug("initial negotiation");
    this._needsNegotiation();

    this._onFinishBound = () => {
      this._onFinish();
    };
    this.once("finish", this._onFinishBound);
  }

  get bufferSize() {
    return (this._channel && this._channel.bufferedAmount) || 0;
  }

  // HACK: it's possible channel.readyState is "closing" before peer.destroy() fires
  // https://bugs.chromium.org/p/chromium/issues/detail?id=882743
  get connected() {
    return (this._connected && this._channel.readyState === "open");
  }

  address() {
    return {
      port: this.localPort,
      family: this.localFamily,
      address: this.localAddress,
    };
  }

  signal(data) {
    if (this.destroying) return;
    if (this.destroyed) {
      throw errCode(
        new Error("cannot signal after peer is destroyed"),
        "ERR_DESTROYED",
      );
    }
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (err) {
        data = {};
      }
    }
    this._debug("signal()");

    if (data.renegotiate && this.initiator) {
      this._debug("got request to renegotiate");
      this._needsNegotiation();
    }
    if (data.transceiverRequest && this.initiator) {
      this._debug("got request for transceiver");
      this.addTransceiver(
        data.transceiverRequest.kind,
        data.transceiverRequest.init,
      );
    }
    if (data.candidate) {
      if (this._pc.remoteDescription && this._pc.remoteDescription.type) {
        this._addIceCandidate(data.candidate);
      } else {
        this._pendingCandidates.push(data.candidate);
      }
    }
    if (data.sdp) {
      this._pc.setRemoteDescription(
        new (this._wrtc.RTCSessionDescription)(data),
      )
        .then(() => {
          if (this.destroyed) return;

          this._pendingCandidates.forEach((candidate) => {
            this._addIceCandidate(candidate);
          });
          this._pendingCandidates = [];

          if (this._pc.remoteDescription.type === "offer") this._createAnswer();
        })
        .catch((err) => {
          this.destroy(errCode(err, "ERR_SET_REMOTE_DESCRIPTION"));
        });
    }
    if (
      !data.sdp && !data.candidate && !data.renegotiate &&
      !data.transceiverRequest
    ) {
      this.destroy(
        errCode(
          new Error("signal() called with invalid signal data"),
          "ERR_SIGNALING",
        ),
      );
    }
  }

  _addIceCandidate(candidate) {
    const iceCandidateObj = new this._wrtc.RTCIceCandidate(candidate);
    this._pc.addIceCandidate(iceCandidateObj)
      .catch((err) => {
        if (
          !iceCandidateObj.address || iceCandidateObj.address.endsWith(".local")
        ) {
          warn("Ignoring unsupported ICE candidate.");
        } else {
          this.destroy(errCode(err, "ERR_ADD_ICE_CANDIDATE"));
        }
      });
  }

  /**
   * Send text/binary data to the remote peer.
   * @param {ArrayBufferView|ArrayBuffer|Buffer|string|Blob} chunk
   */
  send(chunk) {
    if (this.destroying) return;
    if (this.destroyed) {
      throw errCode(
        new Error("cannot send after peer is destroyed"),
        "ERR_DESTROYED",
      );
    }
    this._channel.send(chunk);
  }

  /**
   * Add a Transceiver to the connection.
   * @param {String} kind
   * @param {Object} init
   */
  addTransceiver(kind, init) {
    if (this.destroying) return;
    if (this.destroyed) {
      throw errCode(
        new Error("cannot addTransceiver after peer is destroyed"),
        "ERR_DESTROYED",
      );
    }
    this._debug("addTransceiver()");

    if (this.initiator) {
      try {
        this._pc.addTransceiver(kind, init);
        this._needsNegotiation();
      } catch (err) {
        this.destroy(errCode(err, "ERR_ADD_TRANSCEIVER"));
      }
    } else {
      this.emit("signal", { // request initiator to renegotiate
        type: "transceiverRequest",
        transceiverRequest: { kind, init },
      });
    }
  }

  /**
   * Add a MediaStream to the connection.
   * @param {MediaStream} stream
   */
  addStream(stream) {
    if (this.destroying) return;
    if (this.destroyed) {
      throw errCode(
        new Error("cannot addStream after peer is destroyed"),
        "ERR_DESTROYED",
      );
    }
    this._debug("addStream()");

    stream.getTracks().forEach((track) => {
      this.addTrack(track, stream);
    });
  }

  /**
   * Add a MediaStreamTrack to the connection.
   * @param {MediaStreamTrack} track
   * @param {MediaStream} stream
   */
  addTrack(track, stream) {
    if (this.destroying) return;
    if (this.destroyed) {
      throw errCode(
        new Error("cannot addTrack after peer is destroyed"),
        "ERR_DESTROYED",
      );
    }
    this._debug("addTrack()");

    const submap = this._senderMap.get(track) || new Map(); // nested Maps map [track, stream] to sender
    let sender = submap.get(stream);
    if (!sender) {
      sender = this._pc.addTrack(track, stream);
      submap.set(stream, sender);
      this._senderMap.set(track, submap);
      this._needsNegotiation();
    } else if (sender.removed) {
      throw errCode(
        new Error(
          "Track has been removed. You should enable/disable tracks that you want to re-add.",
        ),
        "ERR_SENDER_REMOVED",
      );
    } else {
      throw errCode(
        new Error("Track has already been added to that stream."),
        "ERR_SENDER_ALREADY_ADDED",
      );
    }
  }

  /**
   * Replace a MediaStreamTrack by another in the connection.
   * @param {MediaStreamTrack} oldTrack
   * @param {MediaStreamTrack} newTrack
   * @param {MediaStream} stream
   */
  replaceTrack(oldTrack, newTrack, stream) {
    if (this.destroying) return;
    if (this.destroyed) {
      throw errCode(
        new Error("cannot replaceTrack after peer is destroyed"),
        "ERR_DESTROYED",
      );
    }
    this._debug("replaceTrack()");

    const submap = this._senderMap.get(oldTrack);
    const sender = submap ? submap.get(stream) : null;
    if (!sender) {
      throw errCode(
        new Error("Cannot replace track that was never added."),
        "ERR_TRACK_NOT_ADDED",
      );
    }
    if (newTrack) this._senderMap.set(newTrack, submap);

    if (sender.replaceTrack != null) {
      sender.replaceTrack(newTrack);
    } else {
      this.destroy(
        errCode(
          new Error("replaceTrack is not supported in this browser"),
          "ERR_UNSUPPORTED_REPLACETRACK",
        ),
      );
    }
  }

  /**
   * Remove a MediaStreamTrack from the connection.
   * @param {MediaStreamTrack} track
   * @param {MediaStream} stream
   */
  removeTrack(track, stream) {
    if (this.destroying) return;
    if (this.destroyed) {
      throw errCode(
        new Error("cannot removeTrack after peer is destroyed"),
        "ERR_DESTROYED",
      );
    }
    this._debug("removeSender()");

    const submap = this._senderMap.get(track);
    const sender = submap ? submap.get(stream) : null;
    if (!sender) {
      throw errCode(
        new Error("Cannot remove track that was never added."),
        "ERR_TRACK_NOT_ADDED",
      );
    }
    try {
      sender.removed = true;
      this._pc.removeTrack(sender);
    } catch (err) {
      if (err.name === "NS_ERROR_UNEXPECTED") {
        this._sendersAwaitingStable.push(sender); // HACK: Firefox must wait until (signalingState === stable) https://bugzilla.mozilla.org/show_bug.cgi?id=1133874
      } else {
        this.destroy(errCode(err, "ERR_REMOVE_TRACK"));
      }
    }
    this._needsNegotiation();
  }

  /**
   * Remove a MediaStream from the connection.
   * @param {MediaStream} stream
   */
  removeStream(stream) {
    if (this.destroying) return;
    if (this.destroyed) {
      throw errCode(
        new Error("cannot removeStream after peer is destroyed"),
        "ERR_DESTROYED",
      );
    }
    this._debug("removeSenders()");

    stream.getTracks().forEach((track) => {
      this.removeTrack(track, stream);
    });
  }

  _needsNegotiation() {
    this._debug("_needsNegotiation");
    if (this._batchedNegotiation) return; // batch synchronous renegotiations
    this._batchedNegotiation = true;
    queueMicrotask(() => {
      this._batchedNegotiation = false;
      if (this.initiator || !this._firstNegotiation) {
        this._debug("starting batched negotiation");
        this.negotiate();
      } else {
        this._debug("non-initiator initial negotiation request discarded");
      }
      this._firstNegotiation = false;
    });
  }

  negotiate() {
    if (this.destroying) return;
    if (this.destroyed) {
      throw errCode(
        new Error("cannot negotiate after peer is destroyed"),
        "ERR_DESTROYED",
      );
    }

    if (this.initiator) {
      if (this._isNegotiating) {
        this._queuedNegotiation = true;
        this._debug("already negotiating, queueing");
      } else {
        this._debug("start negotiation");
        setTimeout(() => { // HACK: Chrome crashes if we immediately call createOffer
          this._createOffer();
        }, 0);
      }
    } else {
      if (this._isNegotiating) {
        this._queuedNegotiation = true;
        this._debug("already negotiating, queueing");
      } else {
        this._debug("requesting negotiation from initiator");
        this.emit("signal", { // request initiator to renegotiate
          type: "renegotiate",
          renegotiate: true,
        });
      }
    }
    this._isNegotiating = true;
  }

  destroy(err) {
    this._destroy(err, () => {});
  }

  _destroy(err, cb) {
    if (this.destroyed || this.destroying) return;
    this.destroying = true;

    this._debug("destroying (error: %s)", err && (err.message || err));

    queueMicrotask(() => { // allow events concurrent with the call to _destroy() to fire (see #692)
      this.destroyed = true;
      this.destroying = false;

      this._debug("destroy (error: %s)", err && (err.message || err));

      this._connected = false;
      this._pcReady = false;
      this._channelReady = false;
      this._remoteTracks = null;
      this._remoteStreams = null;
      this._senderMap = null;

      clearInterval(this._closingInterval);
      this._closingInterval = null;

      clearInterval(this._interval);
      this._interval = null;
      this._chunk = null;
      this._cb = null;

      if (this._onFinishBound) {
        this.removeListener("finish", this._onFinishBound);
      }
      this._onFinishBound = null;

      if (this._channel) {
        try {
          this._channel.close();
        } catch (err) {}

        // allow events concurrent with destruction to be handled
        this._channel.onmessage = null;
        this._channel.onopen = null;
        this._channel.onclose = null;
        this._channel.onerror = null;
      }
      if (this._pc) {
        try {
          this._pc.close();
        } catch (err) {}

        // allow events concurrent with destruction to be handled
        this._pc.oniceconnectionstatechange = null;
        this._pc.onicegatheringstatechange = null;
        this._pc.onsignalingstatechange = null;
        this._pc.onicecandidate = null;
        this._pc.ontrack = null;
        this._pc.ondatachannel = null;
      }
      this._pc = null;
      this._channel = null;

      if (err) this.emit("error", err);
      this.emit("close");
      cb();
    });
  }

  _setupData(event) {
    if (!event.channel) {
      // In some situations `pc.createDataChannel()` returns `undefined` (in wrtc),
      // which is invalid behavior. Handle it gracefully.
      // See: https://github.com/feross/simple-peer/issues/163
      return this.destroy(
        errCode(
          new Error("Data channel event is missing `channel` property"),
          "ERR_DATA_CHANNEL",
        ),
      );
    }

    this._channel = event.channel;
    this._channel.binaryType = "arraybuffer";

    if (typeof this._channel.bufferedAmountLowThreshold === "number") {
      this._channel.bufferedAmountLowThreshold = MAX_BUFFERED_AMOUNT;
    }

    this.channelName = this._channel.label;

    this._channel.onmessage = (event) => {
      this._onChannelMessage(event);
    };
    this._channel.onbufferedamountlow = () => {
      this._onChannelBufferedAmountLow();
    };
    this._channel.onopen = () => {
      this._onChannelOpen();
    };
    this._channel.onclose = () => {
      this._onChannelClose();
    };
    this._channel.onerror = (event) => {
      const err = event.error instanceof Error ? event.error : new Error(
        `Datachannel error: ${event.message} ${event.filename}:${event.lineno}:${event.colno}`,
      );
      this.destroy(errCode(err, "ERR_DATA_CHANNEL"));
    };

    // HACK: Chrome will sometimes get stuck in readyState "closing", let's check for this condition
    // https://bugs.chromium.org/p/chromium/issues/detail?id=882743
    let isClosing = false;
    this._closingInterval = setInterval(() => { // No "onclosing" event
      if (this._channel && this._channel.readyState === "closing") {
        if (isClosing) this._onChannelClose(); // closing timed out: equivalent to onclose firing
        isClosing = true;
      } else {
        isClosing = false;
      }
    }, CHANNEL_CLOSING_TIMEOUT);
  }

  _read() {}

  _write(chunk, encoding, cb) {
    if (this.destroyed) {
      return cb(
        errCode(
          new Error("cannot write after peer is destroyed"),
          "ERR_DATA_CHANNEL",
        ),
      );
    }

    if (this._connected) {
      try {
        this.send(chunk);
      } catch (err) {
        return this.destroy(errCode(err, "ERR_DATA_CHANNEL"));
      }
      if (this._channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
        this._debug(
          "start backpressure: bufferedAmount %d",
          this._channel.bufferedAmount,
        );
        this._cb = cb;
      } else {
        cb(null);
      }
    } else {
      this._debug("write before connect");
      this._chunk = chunk;
      this._cb = cb;
    }
  }

  // When stream finishes writing, close socket. Half open connections are not
  // supported.
  _onFinish() {
    if (this.destroyed) return;

    // Wait a bit before destroying so the socket flushes.
    // TODO: is there a more reliable way to accomplish this?
    const destroySoon = () => {
      setTimeout(() => this.destroy(), 1000);
    };

    if (this._connected) {
      destroySoon();
    } else {
      this.once("connect", destroySoon);
    }
  }

  _startIceCompleteTimeout() {
    if (this.destroyed) return;
    if (this._iceCompleteTimer) return;
    this._debug("started iceComplete timeout");
    this._iceCompleteTimer = setTimeout(() => {
      if (!this._iceComplete) {
        this._iceComplete = true;
        this._debug("iceComplete timeout completed");
        this.emit("iceTimeout");
        this.emit("_iceComplete");
      }
    }, this.iceCompleteTimeout);
  }

  _createOffer() {
    if (this.destroyed) return;

    this._pc.createOffer(this.offerOptions)
      .then((offer) => {
        if (this.destroyed) return;
        if (!this.trickle && !this.allowHalfTrickle) {
          offer.sdp = filterTrickle(offer.sdp);
        }
        offer.sdp = this.sdpTransform(offer.sdp);

        const sendOffer = () => {
          if (this.destroyed) return;
          const signal = this._pc.localDescription || offer;
          this._debug("signal");
          this.emit("signal", {
            type: signal.type,
            sdp: signal.sdp,
          });
        };

        const onSuccess = () => {
          this._debug("createOffer success");
          if (this.destroyed) return;
          if (this.trickle || this._iceComplete) sendOffer();
          else this.once("_iceComplete", sendOffer); // wait for candidates
        };

        const onError = (err) => {
          this.destroy(errCode(err, "ERR_SET_LOCAL_DESCRIPTION"));
        };

        this._pc.setLocalDescription(offer)
          .then(onSuccess)
          .catch(onError);
      })
      .catch((err) => {
        this.destroy(errCode(err, "ERR_CREATE_OFFER"));
      });
  }

  _requestMissingTransceivers() {
    if (this._pc.getTransceivers) {
      this._pc.getTransceivers().forEach((transceiver) => {
        if (
          !transceiver.mid && transceiver.sender.track && !transceiver.requested
        ) {
          transceiver.requested = true; // HACK: Safari returns negotiated transceivers with a null mid
          this.addTransceiver(transceiver.sender.track.kind);
        }
      });
    }
  }

  _createAnswer() {
    if (this.destroyed) return;

    this._pc.createAnswer(this.answerOptions)
      .then((answer) => {
        if (this.destroyed) return;
        if (!this.trickle && !this.allowHalfTrickle) {
          answer.sdp = filterTrickle(answer.sdp);
        }
        answer.sdp = this.sdpTransform(answer.sdp);

        const sendAnswer = () => {
          if (this.destroyed) return;
          const signal = this._pc.localDescription || answer;
          this._debug("signal");
          this.emit("signal", {
            type: signal.type,
            sdp: signal.sdp,
          });
          if (!this.initiator) this._requestMissingTransceivers();
        };

        const onSuccess = () => {
          if (this.destroyed) return;
          if (this.trickle || this._iceComplete) sendAnswer();
          else this.once("_iceComplete", sendAnswer);
        };

        const onError = (err) => {
          this.destroy(errCode(err, "ERR_SET_LOCAL_DESCRIPTION"));
        };

        this._pc.setLocalDescription(answer)
          .then(onSuccess)
          .catch(onError);
      })
      .catch((err) => {
        this.destroy(errCode(err, "ERR_CREATE_ANSWER"));
      });
  }

  _onConnectionStateChange() {
    if (this.destroyed) return;
    if (this._pc.connectionState === "failed") {
      this.destroy(
        errCode(new Error("Connection failed."), "ERR_CONNECTION_FAILURE"),
      );
    }
  }

  _onIceStateChange() {
    if (this.destroyed) return;
    const iceConnectionState = this._pc.iceConnectionState;
    const iceGatheringState = this._pc.iceGatheringState;

    this._debug(
      "iceStateChange (connection: %s) (gathering: %s)",
      iceConnectionState,
      iceGatheringState,
    );
    this.emit("iceStateChange", iceConnectionState, iceGatheringState);

    if (
      iceConnectionState === "connected" || iceConnectionState === "completed"
    ) {
      this._pcReady = true;
      this._maybeReady();
    }
    if (iceConnectionState === "failed") {
      this.destroy(
        errCode(
          new Error("Ice connection failed."),
          "ERR_ICE_CONNECTION_FAILURE",
        ),
      );
    }
    if (iceConnectionState === "closed") {
      this.destroy(
        errCode(
          new Error("Ice connection closed."),
          "ERR_ICE_CONNECTION_CLOSED",
        ),
      );
    }
  }

  getStats(cb) {
    // statreports can come with a value array instead of properties
    const flattenValues = (report) => {
      if (Object.prototype.toString.call(report.values) === "[object Array]") {
        report.values.forEach((value) => {
          Object.assign(report, value);
        });
      }
      return report;
    };

    // Promise-based getStats() (standard)
    if (this._pc.getStats.length === 0 || this._isReactNativeWebrtc) {
      this._pc.getStats()
        .then((res) => {
          const reports = [];
          res.forEach((report) => {
            reports.push(flattenValues(report));
          });
          cb(null, reports);
        }, (err) => cb(err));

      // Single-parameter callback-based getStats() (non-standard)
    } else if (this._pc.getStats.length > 0) {
      this._pc.getStats((res) => {
        // If we destroy connection in `connect` callback this code might happen to run when actual connection is already closed
        if (this.destroyed) return;

        const reports = [];
        res.result().forEach((result) => {
          const report = {};
          result.names().forEach((name) => {
            report[name] = result.stat(name);
          });
          report.id = result.id;
          report.type = result.type;
          report.timestamp = result.timestamp;
          reports.push(flattenValues(report));
        });
        cb(null, reports);
      }, (err) => cb(err));

      // Unknown browser, skip getStats() since it's anyone's guess which style of
      // getStats() they implement.
    } else {
      cb(null, []);
    }
  }

  _maybeReady() {
    this._debug(
      "maybeReady pc %s channel %s",
      this._pcReady,
      this._channelReady,
    );
    if (
      this._connected || this._connecting || !this._pcReady ||
      !this._channelReady
    ) return;

    this._connecting = true;

    // HACK: We can't rely on order here, for details see https://github.com/js-platform/node-webrtc/issues/339
    const findCandidatePair = () => {
      if (this.destroyed) return;

      this.getStats((err, items) => {
        if (this.destroyed) return;

        // Treat getStats error as non-fatal. It's not essential.
        if (err) items = [];

        const remoteCandidates = {};
        const localCandidates = {};
        const candidatePairs = {};
        let foundSelectedCandidatePair = false;

        items.forEach((item) => {
          // TODO: Once all browsers support the hyphenated stats report types, remove
          // the non-hypenated ones
          if (
            item.type === "remotecandidate" || item.type === "remote-candidate"
          ) {
            remoteCandidates[item.id] = item;
          }
          if (
            item.type === "localcandidate" || item.type === "local-candidate"
          ) {
            localCandidates[item.id] = item;
          }
          if (item.type === "candidatepair" || item.type === "candidate-pair") {
            candidatePairs[item.id] = item;
          }
        });

        const setSelectedCandidatePair = (selectedCandidatePair) => {
          foundSelectedCandidatePair = true;

          let local = localCandidates[selectedCandidatePair.localCandidateId];

          if (local && (local.ip || local.address)) {
            // Spec
            this.localAddress = local.ip || local.address;
            this.localPort = Number(local.port);
          } else if (local && local.ipAddress) {
            // Firefox
            this.localAddress = local.ipAddress;
            this.localPort = Number(local.portNumber);
          } else if (
            typeof selectedCandidatePair.googLocalAddress === "string"
          ) {
            // TODO: remove this once Chrome 58 is released
            local = selectedCandidatePair.googLocalAddress.split(":");
            this.localAddress = local[0];
            this.localPort = Number(local[1]);
          }
          if (this.localAddress) {
            this.localFamily = this.localAddress.includes(":")
              ? "IPv6"
              : "IPv4";
          }

          let remote =
            remoteCandidates[selectedCandidatePair.remoteCandidateId];

          if (remote && (remote.ip || remote.address)) {
            // Spec
            this.remoteAddress = remote.ip || remote.address;
            this.remotePort = Number(remote.port);
          } else if (remote && remote.ipAddress) {
            // Firefox
            this.remoteAddress = remote.ipAddress;
            this.remotePort = Number(remote.portNumber);
          } else if (
            typeof selectedCandidatePair.googRemoteAddress === "string"
          ) {
            // TODO: remove this once Chrome 58 is released
            remote = selectedCandidatePair.googRemoteAddress.split(":");
            this.remoteAddress = remote[0];
            this.remotePort = Number(remote[1]);
          }
          if (this.remoteAddress) {
            this.remoteFamily = this.remoteAddress.includes(":")
              ? "IPv6"
              : "IPv4";
          }

          this._debug(
            "connect local: %s:%s remote: %s:%s",
            this.localAddress,
            this.localPort,
            this.remoteAddress,
            this.remotePort,
          );
        };

        items.forEach((item) => {
          // Spec-compliant
          if (item.type === "transport" && item.selectedCandidatePairId) {
            setSelectedCandidatePair(
              candidatePairs[item.selectedCandidatePairId],
            );
          }

          // Old implementations
          if (
            (item.type === "googCandidatePair" &&
              item.googActiveConnection === "true") ||
            ((item.type === "candidatepair" ||
              item.type === "candidate-pair") && item.selected)
          ) {
            setSelectedCandidatePair(item);
          }
        });

        // Ignore candidate pair selection in browsers like Safari 11 that do not have any local or remote candidates
        // But wait until at least 1 candidate pair is available
        if (
          !foundSelectedCandidatePair &&
          (!Object.keys(candidatePairs).length ||
            Object.keys(localCandidates).length)
        ) {
          setTimeout(findCandidatePair, 100);
          return;
        } else {
          this._connecting = false;
          this._connected = true;
        }

        if (this._chunk) {
          try {
            this.send(this._chunk);
          } catch (err) {
            return this.destroy(errCode(err, "ERR_DATA_CHANNEL"));
          }
          this._chunk = null;
          this._debug('sent chunk from "write before connect"');

          const cb = this._cb;
          this._cb = null;
          cb(null);
        }

        // If `bufferedAmountLowThreshold` and 'onbufferedamountlow' are unsupported,
        // fallback to using setInterval to implement backpressure.
        if (typeof this._channel.bufferedAmountLowThreshold !== "number") {
          this._interval = setInterval(() => this._onInterval(), 150);
          if (this._interval.unref) this._interval.unref();
        }

        this._debug("connect");
        this.emit("connect");
      });
    };
    findCandidatePair();
  }

  _onInterval() {
    if (
      !this._cb || !this._channel ||
      this._channel.bufferedAmount > MAX_BUFFERED_AMOUNT
    ) {
      return;
    }
    this._onChannelBufferedAmountLow();
  }

  _onSignalingStateChange() {
    if (this.destroyed) return;

    if (this._pc.signalingState === "stable") {
      this._isNegotiating = false;

      // HACK: Firefox doesn't yet support removing tracks when signalingState !== 'stable'
      this._debug("flushing sender queue", this._sendersAwaitingStable);
      this._sendersAwaitingStable.forEach((sender) => {
        this._pc.removeTrack(sender);
        this._queuedNegotiation = true;
      });
      this._sendersAwaitingStable = [];

      if (this._queuedNegotiation) {
        this._debug("flushing negotiation queue");
        this._queuedNegotiation = false;
        this._needsNegotiation(); // negotiate again
      } else {
        this._debug("negotiated");
        this.emit("negotiated");
      }
    }

    this._debug("signalingStateChange %s", this._pc.signalingState);
    this.emit("signalingStateChange", this._pc.signalingState);
  }

  _onIceCandidate(event) {
    if (this.destroyed) return;
    if (event.candidate && this.trickle) {
      this.emit("signal", {
        type: "candidate",
        candidate: {
          candidate: event.candidate.candidate,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid,
        },
      });
    } else if (!event.candidate && !this._iceComplete) {
      this._iceComplete = true;
      this.emit("_iceComplete");
    }
    // as soon as we've received one valid candidate start timeout
    if (event.candidate) {
      this._startIceCompleteTimeout();
    }
  }

  _onChannelMessage(event) {
    if (this.destroyed) return;
    this.emit("data", event.data);
  }

  _onChannelBufferedAmountLow() {
    if (this.destroyed || !this._cb) return;
    this._debug(
      "ending backpressure: bufferedAmount %d",
      this._channel.bufferedAmount,
    );
    const cb = this._cb;
    this._cb = null;
    cb(null);
  }

  _onChannelOpen() {
    if (this._connected || this.destroyed) return;
    this._debug("on channel open");
    this._channelReady = true;
    this._maybeReady();
  }

  _onChannelClose() {
    if (this.destroyed) return;
    this._debug("on channel close");
    this.destroy();
  }

  _onTrack(event) {
    if (this.destroyed) return;
    const { track, receiver, streams } = event;

    streams.forEach((eventStream) => {
      this._debug("on track");
      this.emit("track", track, eventStream, receiver);

      this._remoteTracks.push({ track, stream: eventStream });

      if (
        this._remoteStreams.some((remoteStream) => {
          return remoteStream.id === eventStream.id;
        })
      ) return; // Only fire one 'stream' event, even though there may be multiple tracks per stream

      this._remoteStreams.push(eventStream);
      queueMicrotask(() => {
        this._debug("on stream");
        this.emit("stream", eventStream, receiver); // ensure all tracks have been added
      });
    });
  }

  _debug(...args) {
    // const args = [].slice.call(arguments);
    args[0] = "[" + this._id + "] " + args[0];
    debug.apply(null, args);
  }
}

TinyPeer.WEBRTC_SUPPORT = !!getBrowserRTC();

/**
 * Expose peer and data channel config for overriding all Peer
 * instances. Otherwise, just set opts.config or opts.channelConfig
 * when constructing a Peer.
 */
TinyPeer.config = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:global.stun.twilio.com:3478",
      ],
    },
  ],
  sdpSemantics: "unified-plan",
};

TinyPeer.channelConfig = {};
TinyPeer.proprietaryConstraints = {};

export default TinyPeer;
