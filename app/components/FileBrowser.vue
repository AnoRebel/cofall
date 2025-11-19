<script setup lang="ts">
import type { ImportedFile } from '~/composables/useFileManager'

const emit = defineEmits<{
  (e: 'selectFile', file: ImportedFile): void
  (e: 'close'): void
}>()

const toast = useToast()

const {
  importedFiles,
  isImporting,
  error,
  openFilePicker,
  importFolder,
  removeImportedFile,
  clearImportedFiles,
  getLanguageFromExtension,
} = useFileManager()

// Handle file import
const handleImportFiles = async () => {
  await openFilePicker()
  if (error.value) {
    toast.add({
      title: 'Import error',
      description: error.value,
      color: 'error',
    })
  }
}

// Handle folder import
const handleImportFolder = async () => {
  await importFolder()
  if (error.value) {
    toast.add({
      title: 'Import error',
      description: error.value,
      color: 'error',
    })
  }
}

// Format file size
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Get language icon
const getLanguageIcon = (lang: string): string => {
  const icons: Record<string, string> = {
    javascript: 'i-simple-icons-javascript',
    typescript: 'i-simple-icons-typescript',
    python: 'i-simple-icons-python',
    java: 'i-simple-icons-java',
    cpp: 'i-simple-icons-cplusplus',
    c: 'i-simple-icons-c',
    go: 'i-simple-icons-go',
    rust: 'i-simple-icons-rust',
    html: 'i-simple-icons-html5',
    css: 'i-simple-icons-css3',
    json: 'i-heroicons-code-bracket',
    markdown: 'i-simple-icons-markdown',
    sql: 'i-heroicons-circle-stack',
    php: 'i-simple-icons-php',
  }
  return icons[lang] || 'i-heroicons-document'
}

// Group files by directory
const groupedFiles = computed(() => {
  const groups: Record<string, ImportedFile[]> = {}

  importedFiles.value.forEach(file => {
    const dir = file.path.includes('/') ? file.path.split('/').slice(0, -1).join('/') : ''
    if (!groups[dir]) groups[dir] = []
    groups[dir].push(file)
  })

  return groups
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <h3 class="font-semibold">Files</h3>
      <div class="flex items-center gap-1">
        <UTooltip text="Import files">
          <UButton variant="ghost" size="xs" @click="handleImportFiles" :loading="isImporting">
            <UIcon name="i-heroicons-document-plus" class="w-4 h-4" />
          </UButton>
        </UTooltip>
        <UTooltip text="Import folder">
          <UButton variant="ghost" size="xs" @click="handleImportFolder" :loading="isImporting">
            <UIcon name="i-heroicons-folder-plus" class="w-4 h-4" />
          </UButton>
        </UTooltip>
        <UTooltip text="Clear all">
          <UButton
            v-if="importedFiles.length > 0"
            variant="ghost"
            size="xs"
            @click="clearImportedFiles"
          >
            <UIcon name="i-heroicons-trash" class="w-4 h-4" />
          </UButton>
        </UTooltip>
      </div>
    </div>

    <!-- File list -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="importedFiles.length === 0" class="flex flex-col items-center justify-center h-full p-4 text-center">
        <UIcon name="i-heroicons-folder-open" class="w-12 h-12 text-muted-foreground/50 mb-3" />
        <p class="text-sm text-muted-foreground mb-3">
          No files imported yet
        </p>
        <div class="flex flex-col gap-2">
          <UButton size="sm" variant="outline" @click="handleImportFiles">
            <UIcon name="i-heroicons-document-plus" class="w-4 h-4 mr-1" />
            Import Files
          </UButton>
          <UButton size="sm" variant="outline" @click="handleImportFolder">
            <UIcon name="i-heroicons-folder-plus" class="w-4 h-4 mr-1" />
            Import Folder
          </UButton>
        </div>
      </div>

      <div v-else class="p-2" v-auto-animate>
        <template v-for="(files, dir) in groupedFiles" :key="dir">
          <!-- Directory header -->
          <div v-if="dir" class="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
            <UIcon name="i-heroicons-folder" class="w-3 h-3" />
            {{ dir }}
          </div>

          <!-- Files in directory -->
          <div
            v-for="file in files"
            :key="file.path"
            class="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer"
            @click="emit('selectFile', file)"
          >
            <UIcon :name="getLanguageIcon(file.type)" class="w-4 h-4 text-muted-foreground" />
            <div class="flex-1 min-w-0">
              <div class="text-sm truncate">{{ file.name }}</div>
              <div class="text-xs text-muted-foreground">{{ formatSize(file.size) }}</div>
            </div>
            <UButton
              variant="ghost"
              size="xs"
              class="opacity-0 group-hover:opacity-100"
              @click.stop="removeImportedFile(file.path)"
            >
              <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
            </UButton>
          </div>
        </template>
      </div>
    </div>

    <!-- Footer with stats -->
    <div v-if="importedFiles.length > 0" class="px-4 py-2 border-t border-border text-xs text-muted-foreground">
      {{ importedFiles.length }} files ({{ formatSize(importedFiles.reduce((sum, f) => sum + f.size, 0)) }})
    </div>
  </div>
</template>
