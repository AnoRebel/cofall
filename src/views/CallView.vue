<script setup>
import { onMounted } from "vue";
import {
  // ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  // VideoCameraIcon,
  VideoCameraSlashIcon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/solid";
import { Icon } from "@iconify/vue";

import { useSocket, useRTC } from "@/utils";

onMounted(() => {
  const socket = useSocket();
  const rtc = useRTC();
  console.log(socket, "|---|", rtc);
});
</script>

<template>
  <div class="group relative h-4/5 w-full rounded bg-gray-500 p-2">
    <div
      class="invisible absolute left-1/2 top-4 w-fit -translate-x-1/2 transform rounded bg-slate-900/25 p-2 text-slate-100 shadow transition-all group-hover:visible"
    >
      Icon 03:45
    </div>
    Calls
    <div class="absolute bottom-4 left-0 right-0 flex w-full items-center justify-center space-x-3">
      <div class="control-btn">
        <Icon icon="fa6-solid:microphone-slash" class="m-3" />
        <!-- <Icon icon="fa6-solid:microphone" class="m-2" /> -->
      </div>
      <div class="control-btn">
        <ArrowsPointingOutIcon class="m-3 h-5 w-5" />
        <!-- <ArrowsPointingInIcon class="h-5 w-5 m-2" /> -->
      </div>
      <!-- <div class="backdrop-blur bg-slate-100/40 rounded-full"> -->
      <!--   <Icon icon="bi:soundwave" class="m-2" /> -->
      <!-- </div> -->
      <div
        class="transform cursor-pointer rounded-full bg-red-700/70 text-slate-50 shadow-lg backdrop-blur transition-all hover:scale-110 hover:text-slate-100 hover:backdrop-filter-none"
      >
        <Icon icon="ic:baseline-call-end" class="m-5 h-5 w-6" />
      </div>
      <div class="control-btn">
        <VideoCameraSlashIcon class="m-3 h-5 w-5" />
        <!-- <VideoCameraIcon class="h-5 w-5 m-2" /> -->
      </div>
      <div class="control-btn">
        <Cog6ToothIcon class="m-3 h-5 w-5" />
      </div>
    </div>
  </div>
  <div class="flex h-1/5 space-x-2 py-2">
    <div v-for="i in 5" class="h-full w-full rounded bg-gray-400" :key="i"></div>
  </div>
</template>

<style lang="scss">
.control-btn {
  @apply transform cursor-pointer rounded-full bg-slate-100/30 text-slate-50 shadow-lg backdrop-blur
  transition-all hover:scale-110 hover:text-slate-100 hover:backdrop-filter-none;
}
</style>
