import Peer, { MediaConnection, DataConnection } from 'peerjs'
import type { MediaState, SharedFile } from '~/types'

export const useWebRTC = () => {
  const peer = ref<Peer | null>(null)
  const peerId = ref<string>('')
  const localStream = ref<MediaStream | null>(null)
  const remoteStreams = ref<Map<string, MediaStream>>(new Map())
  const connections = ref<Map<string, MediaConnection>>(new Map())
  const dataConnections = ref<Map<string, DataConnection>>(new Map())

  const mediaState = ref<MediaState>({
    audioEnabled: false,
    videoEnabled: false,
    screenSharing: false,
  })

  const isInitialized = ref(false)
  const error = ref<string | null>(null)

  // Initialize PeerJS
  const initialize = async (userId: string) => {
    try {
      peer.value = new Peer(userId, {
        debug: 2,
      })

      peer.value.on('open', (id) => {
        peerId.value = id
        isInitialized.value = true
      })

      peer.value.on('call', async (call) => {
        // Answer incoming call with local stream
        if (localStream.value) {
          call.answer(localStream.value)
        } else {
          call.answer()
        }

        call.on('stream', (stream) => {
          remoteStreams.value.set(call.peer, stream)
        })

        call.on('close', () => {
          remoteStreams.value.delete(call.peer)
        })

        connections.value.set(call.peer, call)
      })

      peer.value.on('connection', (conn) => {
        dataConnections.value.set(conn.peer, conn)

        conn.on('data', (data: any) => {
          if (data.type === 'file') {
            // Handle incoming file
            handleIncomingFile(data)
          }
        })
      })

      peer.value.on('error', (err) => {
        error.value = err.message
        console.error('PeerJS error:', err)
      })

    } catch (err: any) {
      error.value = err.message
    }
  }

  // Get user media
  const getUserMedia = async (audio: boolean = true, video: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio,
        video,
      })
      localStream.value = stream
      mediaState.value.audioEnabled = audio
      mediaState.value.videoEnabled = video
      return stream
    } catch (err: any) {
      error.value = `Failed to access media: ${err.message}`
      throw err
    }
  }

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })
      localStream.value = stream
      mediaState.value.screenSharing = true

      // Handle when user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      return stream
    } catch (err: any) {
      error.value = `Failed to share screen: ${err.message}`
      throw err
    }
  }

  // Stop screen sharing
  const stopScreenShare = () => {
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
      mediaState.value.screenSharing = false
    }
  }

  // Call a peer
  const callPeer = (remotePeerId: string) => {
    if (!peer.value || !localStream.value) return

    const call = peer.value.call(remotePeerId, localStream.value)

    call.on('stream', (stream) => {
      remoteStreams.value.set(remotePeerId, stream)
    })

    call.on('close', () => {
      remoteStreams.value.delete(remotePeerId)
    })

    connections.value.set(remotePeerId, call)
  }

  // Connect to peer for data
  const connectToPeer = (remotePeerId: string) => {
    if (!peer.value) return

    const conn = peer.value.connect(remotePeerId)

    conn.on('open', () => {
      dataConnections.value.set(remotePeerId, conn)
    })

    conn.on('data', (data: any) => {
      if (data.type === 'file') {
        handleIncomingFile(data)
      }
    })
  }

  // Send file to peer
  const sendFile = async (remotePeerId: string, file: File) => {
    const conn = dataConnections.value.get(remotePeerId)
    if (!conn) {
      connectToPeer(remotePeerId)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const reader = new FileReader()
    reader.onload = () => {
      const data = {
        type: 'file',
        name: file.name,
        size: file.size,
        mimeType: file.type,
        data: reader.result,
      }

      const connection = dataConnections.value.get(remotePeerId)
      connection?.send(data)
    }
    reader.readAsArrayBuffer(file)
  }

  // Handle incoming file
  const incomingFiles = ref<SharedFile[]>([])
  const handleIncomingFile = (data: any) => {
    const blob = new Blob([data.data], { type: data.mimeType })
    const url = URL.createObjectURL(blob)

    const file: SharedFile = {
      id: crypto.randomUUID(),
      name: data.name,
      size: data.size,
      type: data.mimeType,
      url,
      userId: data.senderId || '',
      username: data.senderName || 'Unknown',
      timestamp: new Date(),
    }

    incomingFiles.value.push(file)
  }

  // Toggle audio
  const toggleAudio = () => {
    if (localStream.value) {
      const audioTrack = localStream.value.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        mediaState.value.audioEnabled = audioTrack.enabled
      }
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (localStream.value) {
      const videoTrack = localStream.value.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        mediaState.value.videoEnabled = videoTrack.enabled
      }
    }
  }

  // Disconnect from peer
  const disconnectPeer = (remotePeerId: string) => {
    connections.value.get(remotePeerId)?.close()
    dataConnections.value.get(remotePeerId)?.close()
    connections.value.delete(remotePeerId)
    dataConnections.value.delete(remotePeerId)
    remoteStreams.value.delete(remotePeerId)
  }

  // Cleanup
  const cleanup = () => {
    // Stop all tracks
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
    }

    // Close all connections
    connections.value.forEach(conn => conn.close())
    dataConnections.value.forEach(conn => conn.close())

    // Destroy peer
    if (peer.value) {
      peer.value.destroy()
      peer.value = null
    }

    // Clear state
    connections.value.clear()
    dataConnections.value.clear()
    remoteStreams.value.clear()
    isInitialized.value = false
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    peer: readonly(peer),
    peerId: readonly(peerId),
    localStream: readonly(localStream),
    remoteStreams: readonly(remoteStreams),
    mediaState: readonly(mediaState),
    isInitialized: readonly(isInitialized),
    error: readonly(error),
    incomingFiles: readonly(incomingFiles),
    initialize,
    getUserMedia,
    startScreenShare,
    stopScreenShare,
    callPeer,
    connectToPeer,
    sendFile,
    toggleAudio,
    toggleVideo,
    disconnectPeer,
    cleanup,
  }
}
