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
  @apply relative flex h-12 items-center justify-center space-x-2 rounded-lg bg-green-100 transition-all hover:rounded-full sm:justify-start sm:hover:rounded-lg;
}
.tooltip {
  @apply invisible absolute top-[20%] left-12 z-50 w-max rounded bg-gray-100 p-1 shadow-lg group-hover:visible sm:hidden;
}
</style>
