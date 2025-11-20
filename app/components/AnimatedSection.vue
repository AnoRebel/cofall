<script setup lang="ts">
const props = defineProps<{
  delay?: number
  duration?: number
  once?: boolean
}>()

const elementRef = ref<HTMLElement | null>(null)
const hasAnimated = ref(false)
const isVisible = ref(false)

onMounted(() => {
  if (!elementRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && (!props.once || !hasAnimated.value)) {
          isVisible.value = true
          hasAnimated.value = true
          if (props.once) {
            observer.disconnect()
          }
        }
      })
    },
    { threshold: 0.1 }
  )

  observer.observe(elementRef.value)

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div
    ref="elementRef"
    class="transition-all duration-500"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    :style="{
      transitionDelay: `${delay || 0}ms`,
      transitionDuration: `${duration || 500}ms`
    }"
  >
    <slot />
  </div>
</template>
