import * as map from "lib0/map";
import * as error from "lib0/error";
import * as random from "lib0/random";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { Observable } from "lib0/observable";
import * as logging from "lib0/logging";
import * as promise from "lib0/promise";
import * as bc from "lib0/broadcastchannel";
import * as buffer from "lib0/buffer";
import * as math from "lib0/math";
import { createMutex, type mutex } from "lib0/mutex";

import Peer from "@/utils/tiny-peer";
import * as Y from "yjs";
import { Socket } from "socket.io-client";
import type { Instance as PeerInstance } from "@/types/tiny-peer";
import { type Ref, ref } from "vue";

import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";

import * as cryptoutils from "@/utils/y-webrtc/crypto";
import { useSocket } from "@/utils";

const log = logging.createModuleLogger("y-webrtc");

const messageSync = 0;
const messageQueryAwareness = 3;
const messageAwareness = 1;
const messageBcPeerId = 4;

/**
 * @type {Map<string, SignalingConn>}
 */
const signalingConns: Map<string, SignalingConn> = new Map();

/**
 * @type {Map<string,Room>}
 */
const rooms: Map<string, Room> = new Map();

/**
 * @param {Room} room
 */
const checkIsSynced = (room: Room) => {
  let synced = true;
  room.webrtcConns.forEach((peer: WebrtcConn) => {
    if (!peer.synced.value) {
      synced = false;
    }
  });
  if ((!synced && room.synced.value) || (synced && !room.synced.value)) {
    room.synced.value = synced;
    room.provider.emit("synced", [{ synced }]);
    log("synced ", logging.BOLD, room.name, logging.UNBOLD, " with all peers");
  }
};

/**
 * @param {Room} room
 * @param {Uint8Array} buf
 * @param {function} syncedCallback
 * @return {encoding.Encoder?}
 */
const readMessage = (
  room: Room,
  buf: Uint8Array,
  syncedCallback: () => void,
): encoding.Encoder | null => {
  const decoder = decoding.createDecoder(buf);
  const encoder = encoding.createEncoder();
  const messageType = decoding.readVarUint(decoder);
  if (room === undefined) {
    return null;
  }
  const awareness = room.awareness;
  const doc = room.doc;
  let sendReply = false;
  switch (messageType) {
    case messageSync: {
      encoding.writeVarUint(encoder, messageSync);
      const syncMessageType = syncProtocol.readSyncMessage(
        decoder,
        encoder,
        doc,
        room,
      );
      if (
        syncMessageType === syncProtocol.messageYjsSyncStep2 &&
        !room.synced.value
      ) {
        syncedCallback();
      }
      if (syncMessageType === syncProtocol.messageYjsSyncStep1) {
        sendReply = true;
      }
      break;
    }
    case messageQueryAwareness:
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          awareness,
          Array.from(awareness.getStates().keys()),
        ),
      );
      sendReply = true;
      break;
    case messageAwareness:
      awarenessProtocol.applyAwarenessUpdate(
        awareness,
        decoding.readVarUint8Array(decoder),
        room,
      );
      break;
    case messageBcPeerId: {
      const add = decoding.readUint8(decoder) === 1;
      const peerName = decoding.readVarString(decoder);
      if (
        peerName !== room.peerId &&
        ((room.bcConns.has(peerName) && !add) ||
          (!room.bcConns.has(peerName) && add))
      ) {
        const removed = [];
        const added = [];
        if (add) {
          room.bcConns.add(peerName);
          added.push(peerName);
        } else {
          room.bcConns.delete(peerName);
          removed.push(peerName);
        }
        room.provider.emit("peers", [
          {
            added,
            removed,
            webrtcPeers: Array.from(room.webrtcConns.keys()),
            bcPeers: Array.from(room.bcConns),
          },
        ]);
        broadcastBcPeerId(room);
      }
      break;
    }
    default:
      console.error("Unable to compute message");
      return encoder;
  }
  if (!sendReply) {
    // nothing has been written, no answer created
    return null;
  }
  return encoder;
};

/**
 * @param {WebrtcConn} peerConn
 * @param {Uint8Array} buf
 * @return {encoding.Encoder?}
 */
const readPeerMessage = (
  peerConn: WebrtcConn,
  buf: Uint8Array,
): encoding.Encoder | null => {
  const room = peerConn.room;
  log(
    "received message from ",
    logging.BOLD,
    peerConn.remotePeerId,
    logging.GREY,
    " (",
    room.name,
    ")",
    logging.UNBOLD,
    logging.UNCOLOR,
  );
  return readMessage(room, buf, () => {
    peerConn.synced.value = true;
    log(
      "synced ",
      logging.BOLD,
      room.name,
      logging.UNBOLD,
      " with ",
      logging.BOLD,
      peerConn.remotePeerId,
    );
    checkIsSynced(room);
  });
};

/**
 * @param {WebrtcConn} webrtcConn
 * @param {encoding.Encoder} encoder
 */
const sendWebrtcConn = (webrtcConn: WebrtcConn, encoder: encoding.Encoder) => {
  log(
    "send message to ",
    logging.BOLD,
    webrtcConn.remotePeerId,
    logging.UNBOLD,
    logging.GREY,
    " (",
    webrtcConn.room.name,
    ")",
    logging.UNCOLOR,
  );
  try {
    webrtcConn.peer.send(encoding.toUint8Array(encoder));
  } catch (e) {}
};

/**
 * @param {Room} room
 * @param {Uint8Array} m
 */
const broadcastWebrtcConn = (room: Room, m: Uint8Array) => {
  log("broadcast message in ", logging.BOLD, room.name, logging.UNBOLD);
  room.webrtcConns.forEach((conn: WebrtcConn) => {
    try {
      conn.peer.send(m);
    } catch (e) {}
  });
};

export class WebrtcConn {
  room: Room;
  remotePeerId: string;
  closed: Ref<boolean>;
  connected: Ref<boolean>;
  synced: Ref<boolean>;
  peer: PeerInstance;

  constructor(
    signalingConn: SignalingConn,
    initiator: boolean,
    remotePeerId: string,
    room: Room,
  ) {
    log("establishing connection to ", logging.BOLD, remotePeerId);
    this.room = room;
    this.remotePeerId = remotePeerId;
    this.closed = ref(false);
    this.connected = ref(false);
    this.synced = ref(false);
    /**
     * @type {any}
     */
    this.peer = new Peer({ initiator, ...room.provider.peerOpts });
    this.peer.on("signal", (signal) => {
      publishSignalingMessage(signalingConn, room, {
        to: remotePeerId,
        from: room.peerId,
        type: "signal",
        signal,
      });
    });
    this.peer.on("connect", () => {
      log("connected to ", logging.BOLD, remotePeerId);
      this.connected.value = true;
      // send sync step 1
      const provider = room.provider;
      const doc = provider.doc;
      const awareness = room.awareness;
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeSyncStep1(encoder, doc);
      sendWebrtcConn(this, encoder);
      const awarenessStates = awareness.getStates();
      if (awarenessStates.size > 0) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageAwareness);
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(
            awareness,
            Array.from(awarenessStates.keys()),
          ),
        );
        sendWebrtcConn(this, encoder);
      }
    });
    this.peer.on("close", () => {
      this.connected.value = false;
      this.closed.value = true;
      if (room.webrtcConns.has(this.remotePeerId)) {
        room.webrtcConns.delete(this.remotePeerId);
        room.provider.emit("peers", [
          {
            removed: [this.remotePeerId],
            added: [],
            webrtcPeers: Array.from(room.webrtcConns.keys()),
            bcPeers: Array.from(room.bcConns),
          },
        ]);
      }
      checkIsSynced(room);
      this.peer.destroy();
      log("closed connection to ", logging.BOLD, remotePeerId);
      announceSignalingInfo(room);
    });
    this.peer.on("error", (err) => {
      log("Error in connection to ", logging.BOLD, remotePeerId, ": ", err);
      announceSignalingInfo(room);
    });
    this.peer.on("data", (data) => {
      const answer = readPeerMessage(this, data);
      if (answer !== null) {
        sendWebrtcConn(this, answer);
      }
    });
  }

  destroy() {
    this.peer.destroy();
  }
}

/**
 * @param {Room} room
 * @param {Uint8Array} m
 */
const broadcastBcMessage = (room: Room, m: Uint8Array) =>
  cryptoutils.encrypt(m, room.key).then((data) =>
    room.mux(() => bc.publish(room.name, data))
  );

/**
 * @param {Room} room
 * @param {Uint8Array} m
 */
const broadcastRoomMessage = (room: Room, m: Uint8Array) => {
  if (room.bcconnected.value) {
    broadcastBcMessage(room, m);
  }
  broadcastWebrtcConn(room, m);
};

/**
 * @param {Room} room
 */
const announceSignalingInfo = (room: Room) => {
  signalingConns.forEach((conn: SignalingConn) => {
    // only subcribe if connection is established, otherwise the conn automatically subscribes to all rooms
    if (conn.socket.connected) {
      conn.socket.emit("subscribe", { topics: [room.name] });
      if (room.webrtcConns.size < room.provider.maxConns) {
        publishSignalingMessage(conn, room, {
          type: "announce",
          from: room.peerId,
        });
      }
    }
  });
};

/**
 * @param {Room} room
 */
const broadcastBcPeerId = (room: Room) => {
  if (room.provider.filterBcConns) {
    // broadcast peerId via broadcastchannel
    const encoderPeerIdBc = encoding.createEncoder();
    encoding.writeVarUint(encoderPeerIdBc, messageBcPeerId);
    encoding.writeUint8(encoderPeerIdBc, 1);
    encoding.writeVarString(encoderPeerIdBc, room.peerId);
    broadcastBcMessage(room, encoding.toUint8Array(encoderPeerIdBc));
  }
};

export class Room {
  peerId: string;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  provider: WebrtcProvider;
  synced: Ref<boolean>;
  name: string;
  key: CryptoKey | null;
  webrtcConns: Map<string, WebrtcConn>;
  bcConns: Set<string>;
  mux: mutex;
  bcconnected: Ref<boolean>;
  _bcSubscriber: (data: ArrayBuffer) => void;
  _docUpdateHandler: (update: Uint8Array, origin: any) => void;
  _awarenessUpdateHandler: (changed: any, origin: any) => void;
  _beforeUnloadHandler: () => void;

  /**
   * @param {Y.Doc} doc
   * @param {WebrtcProvider} provider
   * @param {string} name
   * @param {CryptoKey|null} key
   */
  constructor(
    doc: Y.Doc,
    provider: WebrtcProvider,
    name: string,
    key: CryptoKey | null,
  ) {
    /**
     * Do not assume that peerId is unique. This is only meant for sending signaling messages.
     *
     * @type {string}
     */
    this.peerId = random.uuidv4();
    this.doc = doc;
    /**
     * @type {awarenessProtocol.Awareness}
     */
    this.awareness = provider.awareness;
    this.provider = provider;
    this.synced = ref(false);
    this.name = name;
    // @todo make key secret by scoping
    this.key = key;
    /**
     * @type {Map<string, WebrtcConn>}
     */
    this.webrtcConns = new Map();
    /**
     * @type {Set<string>}
     */
    this.bcConns = new Set();
    this.mux = createMutex();
    this.bcconnected = ref(false);
    /**
     * @param {ArrayBuffer} data
     */
    this._bcSubscriber = (data: ArrayBuffer) =>
      cryptoutils.decrypt(new Uint8Array(data), key).then((m) =>
        this.mux(() => {
          const reply = readMessage(this, m, () => {});
          if (reply) {
            broadcastBcMessage(this, encoding.toUint8Array(reply));
          }
        })
      );
    /**
     * Listens to Yjs updates and sends them to remote peers
     *
     * @param {Uint8Array} update
     * @param {any} origin
     */
    this._docUpdateHandler = (update: Uint8Array, origin: any) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      broadcastRoomMessage(this, encoding.toUint8Array(encoder));
    };
    /**
     * Listens to Awareness updates and sends them to remote peers
     *
     * @param {any} changed
     * @param {any} origin
     */
    this._awarenessUpdateHandler = (
      { added, updated, removed },
      origin: any,
    ) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoderAwareness = encoding.createEncoder();
      encoding.writeVarUint(encoderAwareness, messageAwareness);
      encoding.writeVarUint8Array(
        encoderAwareness,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients),
      );
      broadcastRoomMessage(this, encoding.toUint8Array(encoderAwareness));
    };

    this._beforeUnloadHandler = () => {
      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        [doc.clientID],
        "window unload",
      );
      rooms.forEach((room) => {
        room.disconnect();
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this._beforeUnloadHandler);
    } else if (typeof process !== "undefined") {
      process.on("exit", this._beforeUnloadHandler);
    }
  }

  connect() {
    this.doc.on("update", this._docUpdateHandler);
    this.awareness.on("update", this._awarenessUpdateHandler);
    // signal through all available signaling connections
    announceSignalingInfo(this);
    const roomName = this.name;
    bc.subscribe(roomName, this._bcSubscriber);
    this.bcconnected.value = true;
    // broadcast peerId via broadcastchannel
    broadcastBcPeerId(this);
    // write sync step 1
    const encoderSync = encoding.createEncoder();
    encoding.writeVarUint(encoderSync, messageSync);
    syncProtocol.writeSyncStep1(encoderSync, this.doc);
    broadcastBcMessage(this, encoding.toUint8Array(encoderSync));
    // broadcast local state
    const encoderState = encoding.createEncoder();
    encoding.writeVarUint(encoderState, messageSync);
    syncProtocol.writeSyncStep2(encoderState, this.doc);
    broadcastBcMessage(this, encoding.toUint8Array(encoderState));
    // write queryAwareness
    const encoderAwarenessQuery = encoding.createEncoder();
    encoding.writeVarUint(encoderAwarenessQuery, messageQueryAwareness);
    broadcastBcMessage(this, encoding.toUint8Array(encoderAwarenessQuery));
    // broadcast local awareness state
    const encoderAwarenessState = encoding.createEncoder();
    encoding.writeVarUint(encoderAwarenessState, messageAwareness);
    encoding.writeVarUint8Array(
      encoderAwarenessState,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID,
      ]),
    );
    broadcastBcMessage(this, encoding.toUint8Array(encoderAwarenessState));
  }

  disconnect() {
    // signal through all available signaling connections
    signalingConns.forEach((conn: SignalingConn) => {
      if (conn.socket.connected) {
        conn.socket.emit("unsubscribe", { topics: [this.name] });
      }
    });
    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      [this.doc.clientID],
      "disconnect",
    );
    // broadcast peerId removal via broadcastchannel
    const encoderPeerIdBc = encoding.createEncoder();
    encoding.writeVarUint(encoderPeerIdBc, messageBcPeerId);
    encoding.writeUint8(encoderPeerIdBc, 0); // remove peerId from other bc peers
    encoding.writeVarString(encoderPeerIdBc, this.peerId);
    broadcastBcMessage(this, encoding.toUint8Array(encoderPeerIdBc));

    bc.unsubscribe(this.name, this._bcSubscriber);
    this.bcconnected.value = false;
    this.doc.off("update", this._docUpdateHandler);
    this.awareness.off("update", this._awarenessUpdateHandler);
    this.webrtcConns.forEach((conn: WebrtcConn) => conn.destroy());
  }

  destroy() {
    this.disconnect();
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this._beforeUnloadHandler);
    } else if (typeof process !== "undefined") {
      process.off("exit", this._beforeUnloadHandler);
    }
  }
}

/**
 * @param {Y.Doc} doc
 * @param {WebrtcProvider} provider
 * @param {string} name
 * @param {CryptoKey|null} key
 * @return {Room}
 */
const openRoom = (
  doc: Y.Doc,
  provider: WebrtcProvider,
  name: string,
  key: CryptoKey | null,
): Room => {
  // there must only be one room
  if (rooms.has(name)) {
    throw error.create(`A Yjs Doc connected to room "${name}" already exists!`);
  }
  const room = new Room(doc, provider, name, key);
  rooms.set(name, room);
  return room;
};

/**
 * @param {SignalingConn} conn
 * @param {Room} room
 * @param {any} data
 */
const publishSignalingMessage = (
  conn: SignalingConn,
  room: Room,
  data: any,
) => {
  if (room.key) {
    cryptoutils.encryptJson(data, room.key).then((data) => {
      conn.socket.emit("publish", {
        topic: room.name,
        data: buffer.toBase64(data),
      });
    });
  } else {
    conn.socket.emit("publish", { topic: room.name, data });
  }
};

export class SignalingConn {
  providers: Set<WebrtcProvider>;
  url: string;
  socket: Socket;

  constructor(url: string) {
    /**
     * @type {Set<WebrtcProvider>}
     */
    this.providers = new Set();
    this.url = url;
    this.socket = useSocket(url);
    this.socket.on("connect", () => {
      log(`connected (${url})`);
      const topics = Array.from(rooms.keys());
      this.socket.emit("subscribe", { topics });
      rooms.forEach((room: Room) =>
        publishSignalingMessage(this, room, {
          type: "announce",
          from: room.peerId,
        })
      );
    });
    this.socket.on("message", (m) => {
      switch (m.type) {
        case "publish": {
          const roomName = m.topic;
          const room = rooms.get(roomName);
          if (room == null || typeof roomName !== "string") {
            return;
          }
          const execMessage = (data: any) => {
            const webrtcConns = room.webrtcConns;
            const peerId = room.peerId;
            if (
              data == null ||
              data.from === peerId ||
              (data.to !== undefined && data.to !== peerId) ||
              room.bcConns.has(data.from)
            ) {
              // ignore messages that are not addressed to this conn, or from clients that are connected via broadcastchannel
              return;
            }
            const emitPeerChange = webrtcConns.has(data.from)
              ? () => {}
              : () =>
                room.provider.emit("peers", [
                  {
                    removed: [],
                    added: [data.from],
                    webrtcPeers: Array.from(room.webrtcConns.keys()),
                    bcPeers: Array.from(room.bcConns),
                  },
                ]);
            switch (data.type) {
              case "announce":
                if (webrtcConns.size < room.provider.maxConns) {
                  map.setIfUndefined(
                    webrtcConns,
                    data.from,
                    () => new WebrtcConn(this, true, data.from, room),
                  );
                  emitPeerChange();
                }
                break;
              case "signal":
                if (data.to === peerId) {
                  map
                    .setIfUndefined(
                      webrtcConns,
                      data.from,
                      () => new WebrtcConn(this, false, data.from, room),
                    )
                    .peer.signal(data.signal);
                  emitPeerChange();
                }
                break;
            }
          };
          if (room.key) {
            if (typeof m.data === "string") {
              cryptoutils.decryptJson(buffer.fromBase64(m.data), room.key).then(
                execMessage,
              );
            }
          } else {
            execMessage(m.data);
          }
        }
      }
    });
    this.socket.on("disconnect", () => log(`disconnect (${url})`));
  }
}

/**
 * @typedef {Object} ProviderOptions
 * @property {Array<string>} [signaling]
 * @property {string} [password]
 * @property {awarenessProtocol.Awareness} [awareness]
 * @property {number} [maxConns]
 * @property {boolean} [filterBcConns]
 * @property {any} [peerOpts]
 */

/**
 * @extends Observable<string>
 */
export class WebrtcProvider extends Observable<string> {
  roomName: string;
  doc: Y.Doc;
  filterBcConns: boolean;
  awareness: awarenessProtocol.Awareness;
  shouldConnect: boolean;
  signalingUrls: string[];
  signalingConns: SignalingConn[];
  maxConns: number;
  peerOpts: any;
  key: Promise<CryptoKey | null>;
  room: Room | null;

  constructor(
    roomName: string,
    doc: Y.Doc,
    {
      signaling = ["http://localhost"],
      password = null,
      awareness = new awarenessProtocol.Awareness(doc),
      maxConns = 20 + math.floor(random.rand() * 15), // the random factor reduces the chance that n clients form a cluster
      filterBcConns = true,
      peerOpts = {}, // simple-peer options. See https://github.com/feross/simple-peer#peer--new-peeropts
    } = {},
  ) {
    super();
    this.roomName = roomName;
    this.doc = doc;
    this.filterBcConns = filterBcConns;
    this.awareness = awareness;
    this.shouldConnect = false;
    this.signalingUrls = signaling;
    this.signalingConns = [];
    this.maxConns = maxConns;
    this.peerOpts = peerOpts;
    /**
     * @type {PromiseLike<CryptoKey | null>}
     */
    this.key = password
      ? cryptoutils.deriveKey(password, roomName)
      : /** @type {PromiseLike<null>} */ (promise.resolve(null));
    /**
     * @type {Room|null}
     */
    this.room = null;
    this.key.then((key) => {
      this.room = openRoom(doc, this, roomName, key);
      if (this.shouldConnect) {
        this.room.connect();
      } else {
        this.room.disconnect();
      }
    });
    this.connect();
    this.destroy = this.destroy.bind(this);
    doc.on("destroy", this.destroy);
  }

  /**
   * @type {boolean}
   */
  get connected() {
    return this.room !== null && this.shouldConnect;
  }

  connect() {
    this.shouldConnect = true;
    this.signalingUrls.forEach((url) => {
      const signalingConn = map.setIfUndefined(
        signalingConns,
        url,
        () => new SignalingConn(url),
      );
      this.signalingConns.push(signalingConn);
      signalingConn.providers.add(this);
    });
    if (this.room) {
      this.room.connect();
    }
  }

  disconnect() {
    this.shouldConnect = false;
    this.signalingConns.forEach((conn) => {
      conn.providers.delete(this);
      if (conn.providers.size === 0) {
        conn.socket.disconnect();
        signalingConns.delete(conn.url);
      }
    });
    if (this.room) {
      this.room.disconnect();
    }
  }

  destroy() {
    this.doc.off("destroy", this.destroy);
    // need to wait for key before deleting room
    this.key.then(() => {
      /** @type {Room} */ (this.room).destroy();
      rooms.delete(this.roomName);
    });
    super.destroy();
  }
}
