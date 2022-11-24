<script setup>
import { ScrollToTop, SideBar } from "@/components";
</script>

<template>
  <div class="h-screen w-screen flex">
    <SideBar class="h-full transition-transform sm:w-1/4 w-24 p-3" />
    <main class="h-full sm:w-3/4 w-full p-3">
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
