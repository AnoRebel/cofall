<script setup lang="ts">
import { saveAs } from 'file-saver'
import type { Message, MessageReaction, SharedFile, FileTransfer } from '#imports'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const { user } = useUserSession()
const colorMode = useColorMode()
const toast = useToast()

// Room name from route
const roomName = computed(() => route.params.room as string)

// Socket connection
const {
  connected,
  error: socketError,
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
} = useSocket()

// Code editor
const { createEditor, destroyEditor, getValue, setValue, setLanguage, fileExtensions } = useCodeEditor()

// State
const editorContainer = ref<HTMLElement | null>(null)
const users = ref<string[]>([])
const messages = ref<Message[]>([])
const typingUsers = ref<string[]>([])
const currentLanguage = ref('javascript')
const codingStatus = ref<'none' | 'block'>('none')
const currentCoder = ref('')
const chatInput = ref('')
const showChat = ref(true)
const showUsers = ref(true)
const showFiles = ref(false)
const showFilesDashboard = ref(false)
const isSending = ref(false)
const isLoading = ref(true)

// File manager
const { openFilePicker, importedFiles } = useFileManager()

// Handle message reactions
const handleReaction = (messageId: string, emoji: string) => {
  const message = messages.value.find(m => m.id === messageId)
  if (!message) return

  if (!message.reactions) message.reactions = []

  const existing = message.reactions.find(r => r.emoji === emoji)
  if (existing) {
    if (existing.users.includes(user.value?.username || '')) {
      existing.users = existing.users.filter(u => u !== user.value?.username)
      existing.count--
      if (existing.count === 0) {
        message.reactions = message.reactions.filter(r => r.emoji !== emoji)
      }
    } else {
      existing.users.push(user.value?.username || '')
      existing.count++
    }
  } else {
    message.reactions.push({
      emoji,
      users: [user.value?.username || ''],
      count: 1
    })
  }
}

// Handle view-once message
const handleViewMessage = (messageId: string) => {
  const message = messages.value.find(m => m.id === messageId)
  if (message && message.viewOnce) {
    if (!message.viewedBy) message.viewedBy = []
    message.viewedBy.push(user.value?.username || '')
  }
}

// Handle delete message
const handleDeleteMessage = (messageId: string) => {
  const message = messages.value.find(m => m.id === messageId)
  if (message) {
    message.isDeleted = true
  }
}

// Handle send message with options
const handleSendMessageWithOptions = (data: { content: string; selfDestruct?: number; viewOnce?: boolean }) => {
  const message = {
    id: crypto.randomUUID(),
    roomId: roomName.value,
    userId: user.value?.id || '',
    username: user.value?.username || 'Anonymous',
    content: data.content,
    type: 'text' as const,
    timestamp: new Date(),
    reactions: [],
    selfDestruct: data.selfDestruct,
    selfDestructAt: data.selfDestruct ? new Date(Date.now() + data.selfDestruct * 1000) : undefined,
    viewOnce: data.viewOnce,
  }

  sendMessage(roomName.value, user.value?.username || 'Anonymous', data.content)
  messages.value.push(message)
  scrollToBottom()
}

// Handle file selection from browser
const handleFileSelect = (file: any) => {
  setValue(file.content)
  setLanguage(file.type)
  currentLanguage.value = file.type
  changeMode(file.type, roomName.value)
  showFiles.value = false
  toast.add({
    title: 'File loaded',
    description: file.name,
    color: 'success',
  })
}

// Language options
const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'sql', label: 'SQL' },
  { value: 'php', label: 'PHP' },
  { value: 'markdown', label: 'Markdown' },
]

// Debounced code sync
const debouncedSendCode = useDebounceFn((code: string) => {
  sendCode({
    code,
    room: roomName.value,
    typing: user.value?.username || 'Anonymous',
    status: 'none',
  })
}, 300)

// Initialize editor and socket
onMounted(async () => {
  if (!editorContainer.value) return

  // Create editor
  createEditor(editorContainer.value, '', {
    language: currentLanguage.value,
    theme: colorMode.value as 'dark' | 'light',
    onChange: (value) => {
      debouncedSendCode(value)
    },
  })

  // Connect to socket
  connect()

  // Wait for connection then join room
  await nextTick()

  setTimeout(() => {
    joinRoom(roomName.value, user.value?.username || 'Anonymous')
    isLoading.value = false
  }, 500)

  // Set up socket listeners
  onRoomData((data) => {
    users.value = data.users
  })

  onCodeInit((data) => {
    if (data?.code) {
      setValue(data.code)
    }
    if (data?.mode) {
      currentLanguage.value = data.mode
      setLanguage(data.mode)
    }
  })

  onReceiveCode((data) => {
    if (data?.code !== undefined) {
      const currentCode = getValue()
      if (data.code !== currentCode) {
        setValue(data.code)
      }
    }
    if (data?.typing) {
      currentCoder.value = data.typing
    }
    codingStatus.value = data?.status || 'none'
  })

  onCodeModeChange((mode) => {
    currentLanguage.value = mode
    setLanguage(mode)
  })

  onLoad(() => {
    sendCodeToUser(roomName.value, getValue())
  })

  onChatNew((message) => {
    messages.value.push(message)
    scrollToBottom()

    // Show notification if not focused
    if (document.hidden && message.user !== user.value?.username) {
      showNotification(message)
    }
  })

  onUserTyping((data) => {
    if (data.user !== user.value?.username) {
      if (!typingUsers.value.includes(data.user)) {
        typingUsers.value.push(data.user)
      }

      // Remove after 3 seconds
      setTimeout(() => {
        typingUsers.value = typingUsers.value.filter(u => u !== data.user)
      }, 3000)
    }
  })
})

// Clean up on unmount
onUnmounted(() => {
  leaveRoom(roomName.value, user.value?.username || 'Anonymous')
  destroyEditor()
  disconnect()
})

// Handle language change
const handleLanguageChange = (lang: string) => {
  currentLanguage.value = lang
  setLanguage(lang)
  changeMode(lang, roomName.value)
}

// Send chat message
const handleSendMessage = () => {
  if (!chatInput.value.trim()) return

  sendMessage(roomName.value, user.value?.username || 'Anonymous', chatInput.value)
  chatInput.value = ''
}

// Handle typing indicator
const handleTyping = () => {
  sendTyping(roomName.value, user.value?.username || 'Anonymous')
}

// Scroll chat to bottom
const chatContainer = ref<HTMLElement | null>(null)
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// Export code
const exportCode = () => {
  const code = getValue()
  const extension = fileExtensions[currentLanguage.value] || 'txt'
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `${roomName.value}.${extension}`)

  toast.add({
    title: 'Code exported',
    description: `Saved as ${roomName.value}.${extension}`,
    color: 'success',
  })
}

// Show notification
const showNotification = (message: Message) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`${message.user} in ${roomName.value}`, {
      body: message.content.substring(0, 100),
      icon: '/icon.png',
    })
  }
}

// Request notification permission
onMounted(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

// Format timestamp
const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex flex-col">
    <!-- Room header -->
    <div class="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
      <div class="flex items-center gap-3">
        <NuxtLink to="/rooms" class="text-muted-foreground hover:text-foreground">
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-hashtag" class="w-4 h-4 text-primary" />
          <span class="font-semibold">{{ roomName }}</span>
        </div>

        <!-- Connection status -->
        <div class="flex items-center gap-1.5 ml-4">
          <span class="relative flex h-2 w-2">
            <span v-if="connected" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2" :class="connected ? 'bg-success' : 'bg-destructive'"></span>
          </span>
          <span class="text-xs text-muted-foreground">
            {{ connected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Language selector -->
        <USelectMenu
          v-model="currentLanguage"
          :items="languageOptions"
          value-key="value"
          @update:model-value="handleLanguageChange"
          class="w-36"
        />

        <!-- Export button -->
        <UButton variant="outline" size="sm" @click="exportCode">
          <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
          Export
        </UButton>

        <!-- Media controls -->
        <MediaControls :room-id="roomName" :users="users" />

        <!-- Toggle buttons -->
        <UButton
          variant="ghost"
          size="sm"
          @click="showFiles = !showFiles"
          :class="showFiles ? 'bg-muted' : ''"
        >
          <UIcon name="i-heroicons-folder" class="w-4 h-4" />
        </UButton>
        <UButton
          variant="ghost"
          size="sm"
          @click="showUsers = !showUsers"
          :class="showUsers ? 'bg-muted' : ''"
        >
          <UIcon name="i-heroicons-users" class="w-4 h-4" />
        </UButton>
        <UButton
          variant="ghost"
          size="sm"
          @click="showChat = !showChat"
          :class="showChat ? 'bg-muted' : ''"
        >
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4" />
        </UButton>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Code editor -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Status bar -->
        <div v-if="currentCoder && codingStatus === 'none'" class="px-3 py-1 bg-accent/10 border-b border-border text-xs text-accent">
          <UIcon name="i-heroicons-pencil" class="w-3 h-3 inline mr-1" />
          {{ currentCoder }} is typing...
        </div>

        <!-- Editor container -->
        <div ref="editorContainer" class="flex-1 overflow-hidden bg-editor-bg"></div>
      </div>

      <!-- Sidebar -->
      <div v-if="showChat || showUsers || showFiles" class="w-80 border-l border-border flex flex-col bg-card/30">
        <!-- Files panel -->
        <div v-if="showFiles" class="border-b border-border max-h-60">
          <FileBrowser @select-file="handleFileSelect" />
        </div>
        <!-- Users panel -->
        <div v-if="showUsers" class="border-b border-border">
          <div class="px-3 py-2 text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span>Online ({{ users.length }})</span>
          </div>
          <div class="max-h-32 overflow-y-auto p-2" v-auto-animate>
            <div
              v-for="u in users"
              :key="u"
              class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50"
            >
              <UAvatar
                :alt="u"
                size="xs"
                :src="`https://api.dicebear.com/7.x/pixel-art/svg?seed=${u}`"
              />
              <span class="text-sm truncate">
                {{ u }}
                <span v-if="u === user?.username" class="text-xs text-muted-foreground">(you)</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Chat panel -->
        <div v-if="showChat" class="flex-1 flex flex-col min-h-0">
          <div class="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border flex items-center justify-between">
            <span>Chat</span>
            <UButton variant="ghost" size="xs" @click="showFilesDashboard = true">
              <UIcon name="i-heroicons-arrow-up-tray" class="w-3 h-3" />
            </UButton>
          </div>

          <!-- Messages -->
          <div ref="chatContainer" class="flex-1 overflow-y-auto p-3 space-y-3" v-auto-animate>
            <ChatMessage
              v-for="message in messages"
              :key="message.id"
              :message="message"
              :is-own="message.username === user?.username"
              :on-react="handleReaction"
              :on-view="handleViewMessage"
              :on-delete="handleDeleteMessage"
              @react="handleReaction"
              @view="handleViewMessage"
              @reply="() => {}"
            />

            <!-- Typing indicator -->
            <div v-if="typingUsers.length > 0" class="text-xs text-muted-foreground italic animate-pulse">
              {{ typingUsers.join(', ') }} {{ typingUsers.length === 1 ? 'is' : 'are' }} typing...
            </div>
          </div>

          <!-- Message input with options -->
          <ChatInput
            :disabled="!connected"
            @send="handleSendMessageWithOptions"
            @typing="handleTyping"
            @attach-file="showFilesDashboard = true"
          />
        </div>
      </div>
    </div>

    <!-- Page loader -->
    <PageLoader :show="isLoading" text="Connecting to room..." />

    <!-- File share dashboard -->
    <FileShareDashboard
      :open="showFilesDashboard"
      @close="showFilesDashboard = false"
      @download="(file) => {}"
      @delete="(id) => {}"
      @share="(file) => {}"
    />
  </div>
</template>

<style>
.cm-editor {
  height: 100%;
}

.cm-scroller {
  overflow: auto;
}
</style>
