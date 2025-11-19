<script setup lang="ts">
import { useMotion } from 'motion-v'

const props = defineProps<{
  show: boolean
  text?: string
}>()

const loaderRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (loaderRef.value) {
    useMotion(loaderRef.value, {
      initial: { opacity: 0, scale: 0.9 },
      enter: { opacity: 1, scale: 1 },
      leave: { opacity: 0, scale: 0.9 },
    })
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      ref="loaderRef"
      class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-4">
        <!-- Animated code brackets -->
        <div class="relative flex items-center gap-2">
          <span class="text-4xl font-mono text-primary animate-pulse">&lt;</span>
          <div class="flex gap-1">
            <div class="w-3 h-3 bg-primary rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-3 h-3 bg-accent rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-3 h-3 bg-primary rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
          <span class="text-4xl font-mono text-accent animate-pulse">/&gt;</span>
        </div>

        <!-- Loading text -->
        <p v-if="text" class="text-sm text-muted-foreground animate-pulse">
          {{ text }}
        </p>
      </div>
    </div>
  </Transition>
</template>
