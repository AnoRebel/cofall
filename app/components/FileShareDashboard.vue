<script setup lang="ts">
// Removed motion-v import
import type { Message, MessageReaction, SharedFile, FileTransfer } from '#imports'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'download', file: SharedFile): void
  (e: 'delete', fileId: string): void
  (e: 'share', file: File): void
}>()

// State
const activeTab = ref<'received' | 'sent' | 'transfers'>('received')
const receivedFiles = ref<SharedFile[]>([])
const sentFiles = ref<SharedFile[]>([])
const activeTransfers = ref<FileTransfer[]>([])
const searchQuery = ref('')
const selectedFiles = ref<Set<string>>(new Set())

// File input
const fileInput = ref<HTMLInputElement | null>(null)

// Filtered files based on search
const filteredReceivedFiles = computed(() => {
  if (!searchQuery.value) return receivedFiles.value
  const query = searchQuery.value.toLowerCase()
  return receivedFiles.value.filter(f =>
    f.name.toLowerCase().includes(query) ||
    f.username.toLowerCase().includes(query)
  )
})

const filteredSentFiles = computed(() => {
  if (!searchQuery.value) return sentFiles.value
  const query = searchQuery.value.toLowerCase()
  return sentFiles.value.filter(f =>
    f.name.toLowerCase().includes(query)
  )
})

// Format file size
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Format date
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get file icon
const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return 'i-heroicons-photo'
  if (type.startsWith('video/')) return 'i-heroicons-video-camera'
  if (type.startsWith('audio/')) return 'i-heroicons-musical-note'
  if (type.includes('pdf')) return 'i-heroicons-document'
  if (type.includes('zip') || type.includes('rar')) return 'i-heroicons-archive-box'
  return 'i-heroicons-document-text'
}

// Toggle file selection
const toggleSelect = (fileId: string) => {
  if (selectedFiles.value.has(fileId)) {
    selectedFiles.value.delete(fileId)
  } else {
    selectedFiles.value.add(fileId)
  }
}

// Select all files
const selectAll = () => {
  const files = activeTab.value === 'received' ? filteredReceivedFiles.value : filteredSentFiles.value
  if (selectedFiles.value.size === files.length) {
    selectedFiles.value.clear()
  } else {
    files.forEach(f => selectedFiles.value.add(f.id))
  }
}

// Download selected files
const downloadSelected = () => {
  const files = activeTab.value === 'received' ? receivedFiles.value : sentFiles.value
  files
    .filter(f => selectedFiles.value.has(f.id))
    .forEach(f => emit('download', f))
  selectedFiles.value.clear()
}

// Delete selected files
const deleteSelected = () => {
  selectedFiles.value.forEach(id => emit('delete', id))
  selectedFiles.value.clear()
}

// Handle file upload
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    Array.from(input.files).forEach(file => emit('share', file))
  }
  input.value = ''
}

// Cancel transfer
const cancelTransfer = (transferId: string) => {
  activeTransfers.value = activeTransfers.value.filter(t => t.id !== transferId)
}

// Stats
const stats = computed(() => ({
  totalReceived: receivedFiles.value.length,
  totalSent: sentFiles.value.length,
  totalSize: [...receivedFiles.value, ...sentFiles.value].reduce((sum, f) => sum + f.size, 0),
  activeTransfers: activeTransfers.value.length
}))
</script>

<template>
  <USlideover v-model:open="props.open" side="right" class="w-full max-w-md">
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h2 class="font-semibold">File Sharing</h2>
          <p class="text-xs text-muted-foreground">
            {{ stats.totalReceived + stats.totalSent }} files ({{ formatSize(stats.totalSize) }})
          </p>
        </div>
        <UButton variant="ghost" size="sm" @click="emit('close')">
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </UButton>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-border">
        <button
          v-for="tab in ['received', 'sent', 'transfers'] as const"
          :key="tab"
          class="flex-1 px-4 py-2 text-sm font-medium transition-colors relative"
          :class="activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
          @click="activeTab = tab"
        >
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          <span
            v-if="tab === 'transfers' && stats.activeTransfers > 0"
            class="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full"
          >
            {{ stats.activeTransfers }}
          </span>
          <div
            v-if="activeTab === tab"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          ></div>
        </button>
      </div>

      <!-- Search and actions -->
      <div class="flex items-center gap-2 p-3 border-b border-border">
        <UInput
          v-model="searchQuery"
          placeholder="Search files..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
          size="sm"
        />
        <input
          ref="fileInput"
          type="file"
          multiple
          class="hidden"
          @change="handleFileUpload"
        />
        <UButton size="sm" @click="fileInput?.click()">
          <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4" />
        </UButton>
      </div>

      <!-- Bulk actions -->
      <div v-if="selectedFiles.size > 0" class="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <span class="text-sm">{{ selectedFiles.size }} selected</span>
        <div class="flex items-center gap-1">
          <UButton variant="ghost" size="xs" @click="downloadSelected">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
          </UButton>
          <UButton variant="ghost" size="xs" @click="deleteSelected">
            <UIcon name="i-heroicons-trash" class="w-4 h-4 text-destructive" />
          </UButton>
        </div>
      </div>

      <!-- File list -->
      <div class="flex-1 overflow-y-auto">
        <!-- Received files -->
        <div v-if="activeTab === 'received'" v-auto-animate>
          <div v-if="filteredReceivedFiles.length === 0" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <UIcon name="i-heroicons-inbox" class="w-12 h-12 mb-3 opacity-50" />
            <p class="text-sm">No received files</p>
          </div>

          <div
            v-for="file in filteredReceivedFiles"
            :key="file.id"
            class="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b border-border/50"
            @click="toggleSelect(file.id)"
          >
            <UCheckbox :model-value="selectedFiles.has(file.id)" @click.stop />
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
              <UIcon :name="getFileIcon(file.type)" class="w-5 h-5 text-muted-foreground" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ file.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ file.username }} • {{ formatSize(file.size) }} • {{ formatDate(file.timestamp) }}
              </p>
            </div>
            <UButton variant="ghost" size="xs" @click.stop="emit('download', file)">
              <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
            </UButton>
          </div>
        </div>

        <!-- Sent files -->
        <div v-else-if="activeTab === 'sent'" v-auto-animate>
          <div v-if="filteredSentFiles.length === 0" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <UIcon name="i-heroicons-paper-airplane" class="w-12 h-12 mb-3 opacity-50" />
            <p class="text-sm">No sent files</p>
          </div>

          <div
            v-for="file in filteredSentFiles"
            :key="file.id"
            class="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b border-border/50"
            @click="toggleSelect(file.id)"
          >
            <UCheckbox :model-value="selectedFiles.has(file.id)" @click.stop />
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
              <UIcon :name="getFileIcon(file.type)" class="w-5 h-5 text-muted-foreground" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ file.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ formatSize(file.size) }} • {{ formatDate(file.timestamp) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Active transfers -->
        <div v-else v-auto-animate>
          <div v-if="activeTransfers.length === 0" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 mb-3 opacity-50" />
            <p class="text-sm">No active transfers</p>
          </div>

          <div
            v-for="transfer in activeTransfers"
            :key="transfer.id"
            class="flex items-center gap-3 px-3 py-3 border-b border-border/50"
          >
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
              <UIcon name="i-heroicons-document" class="w-5 h-5 text-muted-foreground" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ transfer.fileName }}</p>
              <p class="text-xs text-muted-foreground mb-1">
                {{ formatSize(transfer.fileSize) }} • {{ transfer.status }}
              </p>
              <UProgress :value="transfer.progress" size="xs" />
            </div>
            <UButton variant="ghost" size="xs" @click="cancelTransfer(transfer.id)">
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </USlideover>
</template>
