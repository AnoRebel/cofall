<script setup>
import { onBeforeMount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useBookingStore } from "@/stores/booking";

const { locale } = useI18n();
const booking = useBookingStore();

onBeforeMount(async () => await booking.getAndSetSplash());

onMounted(() => {
  locale.value =
    sessionStorage.getItem("language") == null ? "sw" : sessionStorage.getItem("language");
});
</script>

<template>
  <router-view v-slot="{ Component, route }" :key="$route.path">
    <!-- Use any custom transition and fallback to `fade` -->
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style lang="scss">
import "@/assets/css/style.scss";
</style>
