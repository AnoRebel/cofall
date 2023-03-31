<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

onMounted(() => {
  locale.value =
    sessionStorage.getItem("language") == null ? "sw" : sessionStorage.getItem("language");
});
</script>

<template>
  <router-view v-slot="{ Component, route }" :key="$route.path">
    <!-- Use any custom transition and fallback to `fade` -->
    <transition :name="route.meta.transition || 'scale'" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style lang="scss">
@import "@/assets/css/style.scss";

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.5s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.75s ease-out;
}

.slide-enter-to {
  position: absolute;
  right: 0;
}

.slide-enter-from {
  position: absolute;
  right: -100%;
}

.slide-leave-to {
  position: absolute;
  left: -100%;
}

.slide-leave-from {
  position: absolute;
  left: 0;
}
</style>
