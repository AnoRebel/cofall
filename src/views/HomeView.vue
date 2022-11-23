<script setup>
import { useI18n } from "vue-i18n";
import { Header, Footer, ScrollToTop, SideBar } from "@/components";

const { t } = useI18n();
</script>

<template>
  <div class="h-screen w-screen flex">
    <SideBar class="h-full transition-transform sm:w-1/4 w-24 p-3" />
    <main class="h-full sm:w-3/4 w-full p-3">
      Main
      <!--Scroll to top-->
    </main>
    <ScrollToTop />
  </div>
</template>

<style lang="scss"></style>
