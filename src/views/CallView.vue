<script setup>
import {
  // ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  // VideoCameraIcon,
  VideoCameraSlashIcon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/solid";
import { Icon } from "@iconify/vue";
</script>

<template>
  <div class="relative group w-full h-4/5 bg-gray-500 rounded p-2">
    <div
      class="absolute w-fit transition-all invisible group-hover:visible top-4 left-1/2 transform -translate-x-1/2 p-2 rounded shadow text-slate-100 bg-slate-900/40"
    >
      Icon 03:45
    </div>
    Calls
    <div class="absolute w-full flex items-center justify-center space-x-3 left-0 right-0 bottom-4">
      <div class="control-btn">
        <Icon icon="fa6-solid:microphone-slash" class="m-3" />
        <!-- <Icon icon="fa6-solid:microphone" class="m-2" /> -->
      </div>
      <div class="control-btn">
        <ArrowsPointingOutIcon class="h-5 w-5 m-3" />
        <!-- <ArrowsPointingInIcon class="h-5 w-5 m-2" /> -->
      </div>
      <!-- <div class="backdrop-blur bg-slate-100/40 rounded-full"> -->
      <!--   <Icon icon="bi:soundwave" class="m-2" /> -->
      <!-- </div> -->
      <div
        class="backdrop-blur transition-all transform bg-red-700/70 text-slate-50 hover:text-slate-100 hover:scale-110 hover:backdrop-filter-none rounded-full shadow-lg cursor-pointer"
      >
        <Icon icon="ic:baseline-call-end" class="m-5 h-5 w-6" />
      </div>
      <div class="control-btn">
        <VideoCameraSlashIcon class="h-5 w-5 m-3" />
        <!-- <VideoCameraIcon class="h-5 w-5 m-2" /> -->
      </div>
      <div class="control-btn">
        <Cog6ToothIcon class="h-5 w-5 m-3" />
      </div>
    </div>
  </div>
  <div class="flex space-x-2 h-1/5 py-2">
    <div v-for="i in 5" class="h-full w-full bg-gray-400 rounded" :key="i"></div>
  </div>
</template>

<style lang="scss">
.control-btn {
  @apply backdrop-blur transition-all transform bg-slate-100/30 text-slate-50 hover:text-slate-100 hover:scale-110
  hover:backdrop-filter-none rounded-full shadow-lg cursor-pointer;
}
</style>
