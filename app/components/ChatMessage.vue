<script setup lang="ts">
import { useMotion } from 'motion-v'
import type { Message, MessageReaction } from '~/types'

const props = defineProps<{
  message: Message
  isOwn: boolean
  onReact: (messageId: string, emoji: string) => void
  onView: (messageId: string) => void
  onDelete: (messageId: string) => void
}>()

const emit = defineEmits<{
  (e: 'react', messageId: string, emoji: string): void
  (e: 'view', messageId: string): void
  (e: 'reply', messageId: string): void
}>()

const messageRef = ref<HTMLElement | null>(null)
const showReactions = ref(false)
const showActions = ref(false)
const isViewed = ref(false)
const timeLeft = ref<number | null>(null)

// Common emoji reactions
const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👀']

// Format timestamp
const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Format file size
const formatSize = (bytes?: number) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Handle view-once message
const handleView = () => {
  if (props.message.viewOnce && !isViewed.value && !props.isOwn) {
    isViewed.value = true
    emit('view', props.message.id)
  }
}

// Self-destruct countdown
let destructInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Animate message entry
  if (messageRef.value) {
    useMotion(messageRef.value, {
      initial: { opacity: 0, y: 10, scale: 0.95 },
      enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 200, ease: 'easeOut' }
      },
    })
  }

  // Start self-destruct timer if applicable
  if (props.message.selfDestructAt) {
    const updateTimer = () => {
      const now = new Date().getTime()
      const destruct = new Date(props.message.selfDestructAt!).getTime()
      const diff = Math.max(0, Math.floor((destruct - now) / 1000))
      timeLeft.value = diff

      if (diff <= 0) {
        if (destructInterval) clearInterval(destructInterval)
        props.onDelete(props.message.id)
      }
    }

    updateTimer()
    destructInterval = setInterval(updateTimer, 1000)
  }
})

onUnmounted(() => {
  if (destructInterval) clearInterval(destructInterval)
})

// Add reaction
const addReaction = (emoji: string) => {
  emit('react', props.message.id, emoji)
  showReactions.value = false
}

// Check if user reacted
const hasReacted = (reaction: MessageReaction) => {
  // In real app, check against current user
  return reaction.users.includes('currentUser')
}
</script>

<template>
  <div
    ref="messageRef"
    class="group relative"
    :class="isOwn ? 'flex justify-end' : 'flex justify-start'"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false; showReactions = false"
  >
    <div class="max-w-[80%] space-y-1">
      <!-- Header -->
      <div class="flex items-center gap-1.5" :class="isOwn ? 'justify-end' : 'justify-start'">
        <span class="text-xs font-medium">{{ message.username }}</span>
        <span class="text-xs text-muted-foreground">{{ formatTime(message.timestamp) }}</span>

        <!-- View once indicator -->
        <span v-if="message.viewOnce" class="text-xs text-warning">
          <UIcon name="i-heroicons-eye" class="w-3 h-3" />
        </span>

        <!-- Self destruct timer -->
        <span v-if="timeLeft !== null" class="text-xs text-destructive flex items-center gap-0.5">
          <UIcon name="i-heroicons-clock" class="w-3 h-3" />
          {{ timeLeft }}s
        </span>
      </div>

      <!-- Message content -->
      <div
        class="relative rounded-lg px-3 py-2 text-sm"
        :class="[
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted',
          message.isDeleted ? 'opacity-50 italic' : '',
          message.viewOnce && !isViewed && !isOwn ? 'blur-sm cursor-pointer' : ''
        ]"
        @click="handleView"
      >
        <!-- Deleted message -->
        <template v-if="message.isDeleted">
          <span class="flex items-center gap-1">
            <UIcon name="i-heroicons-trash" class="w-3 h-3" />
            Message deleted
          </span>
        </template>

        <!-- View once overlay -->
        <template v-else-if="message.viewOnce && !isViewed && !isOwn">
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xs bg-background/80 px-2 py-1 rounded">Click to view once</span>
          </div>
          <span class="invisible">{{ message.content }}</span>
        </template>

        <!-- File message -->
        <template v-else-if="message.type === 'file' || message.type === 'image'">
          <div class="flex items-center gap-2">
            <UIcon
              :name="message.type === 'image' ? 'i-heroicons-photo' : 'i-heroicons-document'"
              class="w-5 h-5"
            />
            <div class="flex-1 min-w-0">
              <p class="truncate font-medium">{{ message.fileName }}</p>
              <p class="text-xs opacity-70">{{ formatSize(message.fileSize) }}</p>
            </div>
            <a
              v-if="message.fileUrl"
              :href="message.fileUrl"
              download
              class="p-1 hover:bg-black/10 rounded"
              @click.stop
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
            </a>
          </div>
        </template>

        <!-- Text message -->
        <template v-else>
          {{ message.content }}
        </template>
      </div>

      <!-- Reactions -->
      <div v-if="message.reactions?.length" class="flex flex-wrap gap-1" :class="isOwn ? 'justify-end' : 'justify-start'">
        <button
          v-for="reaction in message.reactions"
          :key="reaction.emoji"
          class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all"
          :class="hasReacted(reaction) ? 'bg-primary/20 text-primary' : 'bg-muted hover:bg-muted/80'"
          @click="addReaction(reaction.emoji)"
        >
          <span>{{ reaction.emoji }}</span>
          <span>{{ reaction.count }}</span>
        </button>
      </div>
    </div>

    <!-- Action buttons -->
    <Transition
      enter-active-class="transition-all duration-150"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showActions && !message.isDeleted"
        class="absolute top-0 flex items-center gap-0.5 bg-card border border-border rounded-lg shadow-lg p-0.5"
        :class="isOwn ? 'right-full mr-2' : 'left-full ml-2'"
      >
        <!-- Add reaction -->
        <UTooltip text="Add reaction">
          <button
            class="p-1.5 hover:bg-muted rounded transition-colors"
            @click="showReactions = !showReactions"
          >
            <UIcon name="i-heroicons-face-smile" class="w-4 h-4" />
          </button>
        </UTooltip>

        <!-- Reply -->
        <UTooltip text="Reply">
          <button
            class="p-1.5 hover:bg-muted rounded transition-colors"
            @click="emit('reply', message.id)"
          >
            <UIcon name="i-heroicons-arrow-uturn-left" class="w-4 h-4" />
          </button>
        </UTooltip>
      </div>
    </Transition>

    <!-- Reaction picker -->
    <Transition
      enter-active-class="transition-all duration-150"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showReactions"
        class="absolute bottom-full mb-2 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg p-2"
        :class="isOwn ? 'right-0' : 'left-0'"
      >
        <button
          v-for="emoji in quickReactions"
          :key="emoji"
          class="text-lg hover:scale-125 transition-transform"
          @click="addReaction(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </Transition>
  </div>
</template>
