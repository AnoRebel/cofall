<script setup>
defineProps({
  to: {
    type: String || Object,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <app-link :to="to" class="side-link">
    <slot />
    <span class="hidden sm:block">{{ name }}</span>
    <span class="tooltip">{{ name }}</span>
  </app-link>
</template>

<style lang="scss" scoped>
.side-link {
  @apply relative h-12 flex space-x-2 rounded-lg sm:hover:rounded-lg hover:rounded-full transition-all items-center justify-center sm:justify-start bg-green-100;
}
.tooltip {
  @apply invisible absolute group-hover:visible rounded shadow-lg p-1 bg-gray-100 top-[20%] left-12 w-max z-50 sm:hidden;
}
</style>
