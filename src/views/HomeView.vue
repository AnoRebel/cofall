<script setup>
import { ScrollToTop, SideBar } from "@/components";
</script>

<template>
  <div class="flex h-screen w-screen">
    <SideBar class="h-full w-24 max-w-[6rem] p-2 transition-transform sm:w-1/4 sm:max-w-full" />
    <main class="h-full w-full p-2 sm:w-3/4">
      <router-view v-slot="{ Component, route }" :key="$route.path">
        <!-- Use any custom transition and fallback to `fade` -->
        <transition :name="route.meta.transition || 'slide'" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <ScrollToTop />
  </div>
</template>

<style lang="scss"></style>
