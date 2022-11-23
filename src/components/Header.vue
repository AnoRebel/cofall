<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { useI18n } from "vue-i18n";

const { t, locale, availableLocales } = useI18n();

const toggleLocale = lang => {
  locale.value = lang;
  sessionStorage.setItem("language", lang);
};
</script>

<template>
  <header class="">Header</header>
</template>

<style lang="scss" scoped></style>
