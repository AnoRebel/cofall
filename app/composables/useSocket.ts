import { io, Socket } from 'socket.io-client'
import type { Message, MediaState } from '~/types'

export const useSocket = () => {
  const config = useRuntimeConfig()
  const socket = ref<Socket | null>(null)
  const connected = ref(false)
  const error = ref<string | null>(null)

  const connect = () => {
    if (socket.value?.connected) return

    socket.value = io(config.public.signalingServer, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.value.on('connect', () => {
      connected.value = true
      error.value = null
    })

    socket.value.on('disconnect', () => {
      connected.value = false
    })

    socket.value.on('connect_error', (err) => {
      error.value = err.message
      connected.value = false
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  // Room methods
  const joinRoom = (room: string, user: string) => {
    socket.value?.emit('room', { room, user })
  }

  const leaveRoom = (room: string, user: string) => {
    socket.value?.emit('room:left', { room, user })
  }

  // Code methods
  const sendCode = (data: { code: string; room: string; typing: string; status: string }) => {
    socket.value?.emit('code', data)
  }

  const sendCodeToUser = (room: string, code: string) => {
    socket.value?.emit('send:code', { room, code })
  }

  const changeMode = (mode: string, room: string) => {
    socket.value?.emit('code:mode', { mode, room })
  }

  // Chat methods
  const sendMessage = (room: string, user: string, message: string) => {
    socket.value?.emit('chat', { room, user, message })
  }

  const sendTyping = (room: string, user: string) => {
    socket.value?.emit('chat:typing', { room, user })
  }

  // Event listeners
  const onRoomData = (callback: (data: { users: string[] }) => void) => {
    socket.value?.on('room:data', callback)
  }

  const onCodeInit = (callback: (data: any) => void) => {
    socket.value?.on('code:init', callback)
  }

  const onReceiveCode = (callback: (data: any) => void) => {
    socket.value?.on('receive:code', callback)
  }

  const onCodeModeChange = (callback: (mode: string) => void) => {
    socket.value?.on('code:mode_change', callback)
  }

  const onLoad = (callback: () => void) => {
    socket.value?.on('load', callback)
  }

  const onChatNew = (callback: (data: Message) => void) => {
    socket.value?.on('chat:new', callback)
  }

  const onUserTyping = (callback: (data: { user: string }) => void) => {
    socket.value?.on('user:typing', callback)
  }

  // Clean up listeners
  const removeAllListeners = () => {
    socket.value?.removeAllListeners()
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket: readonly(socket),
    connected: readonly(connected),
    error: readonly(error),
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendCode,
    sendCodeToUser,
    changeMode,
    sendMessage,
    sendTyping,
    onRoomData,
    onCodeInit,
    onReceiveCode,
    onCodeModeChange,
    onLoad,
    onChatNew,
    onUserTyping,
    removeAllListeners,
  }
}
