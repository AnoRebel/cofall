<script setup lang="ts">
import { Loading, ToolBar, Editor } from "@/components";
</script>

<template>
  <div class="mirror">
    <ToolBar />
    <div class="h-px bg-slate-500"></div>
    <Editor />
  </div>
</template>

<style lang="scss" scoped>
.mirror {
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
