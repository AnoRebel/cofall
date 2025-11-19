<script setup lang="ts">
import { useMotion } from 'motion-v'

const props = defineProps<{
  delay?: number
  duration?: number
  once?: boolean
}>()

const elementRef = ref<HTMLElement | null>(null)
const hasAnimated = ref(false)

onMounted(() => {
  if (elementRef.value && (!props.once || !hasAnimated.value)) {
    useMotion(elementRef.value, {
      initial: {
        opacity: 0,
        y: 20,
      },
      visibleOnce: {
        opacity: 1,
        y: 0,
        transition: {
          delay: props.delay || 0,
          duration: props.duration || 500,
          ease: 'easeOut',
        },
      },
    })
    hasAnimated.value = true
  }
})
</script>

<template>
  <div ref="elementRef">
    <slot />
  </div>
</template>
