// User types
export interface User {
  id: string
  username: string
  email?: string
  avatar?: string
  status: 'online' | 'offline' | 'away' | 'busy'
  createdAt: Date
}

export interface AuthUser {
  id: string
  username: string
  email: string
  avatar?: string
}

// Room types
export interface Room {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'group'
  ownerId: string
  participants: string[]
  maxParticipants: number
  language: string
  theme: string
  createdAt: Date
  updatedAt: Date
}

export interface RoomState {
  code: string
  language: string
  theme: string
  cursorPositions: Record<string, CursorPosition>
  typingUsers: string[]
}

export interface CursorPosition {
  userId: string
  username: string
  line: number
  column: number
  color: string
}

// Chat types
export interface MessageReaction {
  emoji: string
  users: string[]
  count: number
}

export interface Message {
  id: string
  roomId: string
  userId: string
  username: string
  content: string
  type: 'text' | 'code' | 'file' | 'image' | 'system'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  timestamp: Date
  isPrivate?: boolean
  recipientId?: string
  // New features
  reactions?: MessageReaction[]
  selfDestruct?: number // seconds until deletion
  selfDestructAt?: Date
  viewOnce?: boolean
  viewedBy?: string[]
  isDeleted?: boolean
  replyTo?: string // message id
}

export interface ChatState {
  messages: Message[]
  typingUsers: string[]
  unreadCount: number
}

// WebRTC types
export interface MediaState {
  audioEnabled: boolean
  videoEnabled: boolean
  screenSharing: boolean
}

export interface PeerConnection {
  peerId: string
  userId: string
  username: string
  stream?: MediaStream
  mediaState: MediaState
}

// File sharing types
export interface SharedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadProgress?: number
  userId: string
  username: string
  timestamp: Date
}

export interface FileTransfer {
  id: string
  fileName: string
  fileSize: number
  progress: number
  status: 'pending' | 'transferring' | 'completed' | 'failed'
  senderId: string
  receiverId: string
}

// Socket event types
export interface SocketEvents {
  // Room events
  'room:join': { room: string; user: string }
  'room:leave': { room: string; user: string }
  'room:data': { users: string[] }
  'room:created': Room

  // Code events
  'code:change': { code: string; room: string; userId: string }
  'code:sync': { code: string; language: string; theme: string }
  'code:cursor': CursorPosition
  'code:mode': { mode: string; room: string }

  // Chat events
  'chat:message': Message
  'chat:typing': { room: string; user: string }
  'chat:private': Message

  // WebRTC signaling
  'webrtc:offer': { from: string; to: string; offer: RTCSessionDescriptionInit }
  'webrtc:answer': { from: string; to: string; answer: RTCSessionDescriptionInit }
  'webrtc:ice-candidate': { from: string; to: string; candidate: RTCIceCandidateInit }
  'webrtc:media-state': { userId: string; state: MediaState }
}

// Editor configuration
export interface EditorConfig {
  language: string
  theme: string
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
  autoComplete: boolean
}

export interface LanguageOption {
  value: string
  label: string
  extension: string
  icon?: string
}

export interface ThemeOption {
  value: string
  label: string
  isDark: boolean
}

// Notification types
export interface AppNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  sound?: boolean
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
