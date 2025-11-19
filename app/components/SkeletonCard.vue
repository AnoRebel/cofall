<script setup lang="ts">
defineProps<{
  lines?: number
  avatar?: boolean
  action?: boolean
}>()
</script>

<template>
  <div class="animate-pulse space-y-3">
    <!-- Avatar and header -->
    <div v-if="avatar" class="flex items-center gap-3">
      <div class="w-10 h-10 bg-muted rounded-full"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-muted rounded w-1/3"></div>
        <div class="h-3 bg-muted rounded w-1/4"></div>
      </div>
    </div>

    <!-- Content lines -->
    <div class="space-y-2">
      <div
        v-for="i in (lines || 3)"
        :key="i"
        class="h-4 bg-muted rounded"
        :class="{
          'w-full': i % 3 === 1,
          'w-5/6': i % 3 === 2,
          'w-4/6': i % 3 === 0,
        }"
      ></div>
    </div>

    <!-- Action button -->
    <div v-if="action" class="flex justify-end pt-2">
      <div class="h-8 w-24 bg-muted rounded"></div>
    </div>
  </div>
</template>
