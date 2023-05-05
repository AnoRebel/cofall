<script setup lang="ts">
import { reactive, computed, shallowRef, onBeforeMount } from "vue";
import { oneDark } from "@codemirror/theme-one-dark";
import { Theme, useTheme } from "@/composables/theme";
import { Loading, ToolBar, Editor } from "@/components";
import languages from "@/utils/languages";
import { useConfigStore } from "@/stores/config";

const config = useConfigStore();
const currentLang = computed(() => languages[config.language]);
const currentTheme = computed(() => {
  return config.theme !== "default" ? config.theme : void 0;
});
const ensureLanguageCode = (targetLanguage: string) => {
  // const delayPromise = () => new Promise(resolve => window.setTimeout(resolve, 260));
  // if (langCodeMap.has(targetLanguage)) {
  //   await delayPromise();
  // } else {
  //   const [result] = await Promise.all([languages[targetLanguage](), delayPromise()]);
  //   langCodeMap.set(targetLanguage, result.default);
  // }
};
</script>

<template>
  <div class="example">
    <ToolBar />
    <div class="divider"></div>
    <Editor :config="config" :theme="currentTheme" :language="currentLang" />
  </div>
</template>

<style lang="scss" scoped>
.example {
  .divider {
    height: 1px;
    background-color: var(--theme-border);
  }
  .loading-box {
    width: 100%;
    min-height: 20rem;
    max-height: 60rem;
    /* loading height = view-height - layout-height - page-height */
    /* navbar + banner + footer */
    $layout-height: 3rem + 25rem + 4rem;
    /* single-card-gap * 2 + card-header + editor-header */
    $page-height: 2rem * 2 + 3.2rem + 3rem;
    /* editor-border * 2 */
    height: calc(100vh - $layout-height - $page-height - 2px);
  }
}
</style>
