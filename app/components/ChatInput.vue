<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', message: { content: string; selfDestruct?: number; viewOnce?: boolean }): void
  (e: 'typing'): void
  (e: 'attachFile'): void
}>()

const content = ref('')
const showOptions = ref(false)
const selfDestruct = ref<number | null>(null)
const viewOnce = ref(false)

// Self-destruct options (in seconds)
const selfDestructOptions = [
  { label: 'Off', value: null },
  { label: '5s', value: 5 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '5m', value: 300 },
  { label: '1h', value: 3600 },
]

// Handle send
const handleSend = () => {
  if (!content.value.trim()) return

  emit('send', {
    content: content.value.trim(),
    selfDestruct: selfDestruct.value || undefined,
    viewOnce: viewOnce.value || undefined,
  })

  content.value = ''
  // Reset options after sending
  selfDestruct.value = null
  viewOnce.value = false
  showOptions.value = false
}

// Handle typing
const handleInput = () => {
  emit('typing')
}

// Handle keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// Active options indicator
const hasActiveOptions = computed(() => selfDestruct.value !== null || viewOnce.value)
</script>

<template>
  <div class="border-t border-border bg-card/50">
    <!-- Options panel -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="showOptions" class="px-3 py-2 border-b border-border bg-muted/30">
        <div class="flex items-center gap-4 text-sm">
          <!-- Self destruct -->
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-destructive" />
            <span class="text-muted-foreground">Self-destruct:</span>
            <div class="flex gap-1">
              <button
                v-for="option in selfDestructOptions"
                :key="option.value ?? 'off'"
                class="px-2 py-0.5 rounded text-xs transition-colors"
                :class="selfDestruct === option.value
                  ? 'bg-destructive/20 text-destructive'
                  : 'hover:bg-muted'"
                @click="selfDestruct = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- View once -->
          <label class="flex items-center gap-2 cursor-pointer">
            <UCheckbox v-model="viewOnce" />
            <UIcon name="i-heroicons-eye" class="w-4 h-4 text-warning" />
            <span class="text-muted-foreground">View once</span>
          </label>
        </div>
      </div>
    </Transition>

    <!-- Input area -->
    <div class="p-3">
      <div class="flex items-end gap-2">
        <!-- Options toggle -->
        <UTooltip text="Message options">
          <UButton
            variant="ghost"
            size="sm"
            @click="showOptions = !showOptions"
            :class="hasActiveOptions ? 'text-primary' : ''"
          >
            <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
            <span v-if="hasActiveOptions" class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full"></span>
          </UButton>
        </UTooltip>

        <!-- Attach file -->
        <UTooltip text="Attach file">
          <UButton variant="ghost" size="sm" @click="emit('attachFile')">
            <UIcon name="i-heroicons-paper-clip" class="w-4 h-4" />
          </UButton>
        </UTooltip>

        <!-- Text input -->
        <div class="flex-1 relative">
          <UTextarea
            v-model="content"
            placeholder="Type a message..."
            :disabled="disabled"
            :rows="1"
            autoresize
            class="max-h-32"
            @input="handleInput"
            @keydown="handleKeydown"
          />

          <!-- Active options indicator -->
          <div v-if="hasActiveOptions" class="absolute top-1 right-1 flex items-center gap-1">
            <span v-if="selfDestruct" class="px-1.5 py-0.5 text-xs bg-destructive/20 text-destructive rounded">
              {{ selfDestructOptions.find(o => o.value === selfDestruct)?.label }}
            </span>
            <span v-if="viewOnce" class="px-1.5 py-0.5 text-xs bg-warning/20 text-warning rounded">
              <UIcon name="i-heroicons-eye" class="w-3 h-3" />
            </span>
          </div>
        </div>

        <!-- Send button -->
        <UButton
          size="sm"
          :disabled="!content.trim() || disabled"
          @click="handleSend"
        >
          <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
        </UButton>
      </div>
    </div>
  </div>
</template>
