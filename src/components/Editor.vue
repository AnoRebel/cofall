<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onBeforeMount, reactive, shallowRef, computed, watch } from "vue";
import { redo, undo } from "@codemirror/commands";
import { type Extension } from "@codemirror/state";
import { ViewUpdate, EditorView } from "@codemirror/view";
import Codemirror, { store } from "@/components/codemirror";
import {
  diagnosticCount as linterDagnosticCount,
  // forceLinting,
  // openLintPanel,
  // closeLintPanel,
  linter,
} from "@codemirror/lint";

import * as Y from "yjs";
import { esLint } from "@codemirror/lang-javascript";
// @ts-ignore
import * as eslint from "eslint-linter-browserify";
/// @ts-ignore
import { getYjsDoc } from "@syncedstore/core";
/// @ts-ignore
import { yCollab } from "y-codemirror.next";
import { useConfigStore } from "@/stores/config";
import themes from "@/utils/themes";
import exts from "@/utils/extensions";
import languages from "@/utils/languages";
import { useRTCProvider } from "@/utils";

const userColors = [
  { color: "#30bced", light: "#30bced33" },
  { color: "#6eeb83", light: "#6eeb8333" },
  { color: "#ffbc42", light: "#ffbc4233" },
  { color: "#ecd444", light: "#ecd44433" },
  { color: "#ee6352", light: "#ee635233" },
  { color: "#9ac2c9", light: "#9ac2c933" },
  { color: "#8acb88", light: "#8acb8833" },
  { color: "#1be7ff", light: "#1be7ff33" },
];

const randomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// select a random color for this user
const userColor = userColors[randomInt(0, userColors.length - 1)];

const config = useConfigStore();

// init default language & code
onBeforeMount(() => ensureLanguageCode(config.language));

const { provider } = useRTCProvider("cofall", getYjsDoc(store));
const undoManager = new Y.UndoManager(store.code);

provider.awareness.setLocalStateField("user", {
  name: "Anonymous " + Math.floor(Math.random() * 100), // TODO: Added stored username
  color: userColor.color,
  colorLight: userColor.light,
});

const langCodeMap = reactive(new Map<string, { language: () => any }>());
const ensureLanguageCode = async (targetLanguage: string) => {
  config.language = targetLanguage
  const delayPromise = () => new Promise((resolve) => window.setTimeout(resolve, 50))
  if (langCodeMap.has(targetLanguage)) {
    await delayPromise()
  } else {
    const [result] = await Promise.all([languages[targetLanguage](), delayPromise()])
    langCodeMap.set(targetLanguage, result.default)
  }
};
watch(() => config.language, () => ensureLanguageCode(config.language));
const currentLangCode = computed(() => langCodeMap.get(config.language)!);

const log = console.log;
const theme = computed(() => config.theme !== 'default' ? themes[config.theme] : void 0);
const extensions = computed<Extension[]>(() => {
  const result = [
    ...exts,
    // config.language === "" ? languages["javascript"]() : languages[config.language](),
    // currentLangCode.value.language(),
    EditorView.updateListener.of((viewUpdate) => {
      // https://discuss.codemirror.net/t/codemirror-6-proper-way-to-listen-for-changes/2395/11
      // onUpdate(viewUpdate)
      // doc changed
      if (viewUpdate.docChanged) {
        log("OnChange", viewUpdate.state.doc.toString(), viewUpdate)
      }
      // focus state change
      if (viewUpdate.focusChanged) {
        viewUpdate.view.hasFocus ? log("onFocus", viewUpdate) : log("onBlur", viewUpdate)
      }
    }),
    yCollab(store.code, provider.awareness, { undoManager })
  ];
  if (currentLangCode.value) {
    result.push(currentLangCode.value.language())
  }
  if (["css", "javascript", "html", "json", "jsx", "markdown", "scss", "tsx", "typescript"].includes(config.language)) {
    result.push(linter(esLint(new eslint.Linter(), { env: { browser: true, node: true }})))
  }
  if (theme.value) {
    result.push(theme.value);
  }
  return result;
});

const cmView = shallowRef();
const handleReady = ({ view }: { view: EditorView }) => {
  cmView.value = view;
};

// https://github.com/codemirror/commands/blob/main/test/test-history.ts
const handleUndo = () =>
  undo({
    state: cmView.value.state,
    dispatch: cmView.value.dispatch,
  });

const handleRedo = () =>
  redo({
    state: cmView.value.state,
    dispatch: cmView.value.dispatch,
  });

const state = reactive({
  lines: null as null | number,
  cursor: null as null | number,
  selected: null as null | number,
  length: null as null | number,
});
const diagnosticCount = computed(() => {
  if(cmView.value) {
    return linterDagnosticCount(cmView.value?.state);
  } else {
    return 0;
  }
});

const handleStateUpdate = (viewUpdate: ViewUpdate) => {
  // selected
  const ranges = viewUpdate.state.selection.ranges;
  state.selected = ranges.reduce((plus, range) => plus + range.to - range.from, 0);
  state.cursor = ranges[0].anchor;
  // length
  state.length = viewUpdate.state.doc.length;
  state.lines = viewUpdate.state.doc.lines;
};
</script>

<template>
  <div class="h-full w-full">
    <div class="flex w-full h-full">
      <codemirror
        :style="{
          width: '100%',
          height: config.height,
          backgroundColor: '#fff',
          color: '#333',
        }"
        placeholder="Please enter the code."
        :extensions="extensions"
        :autofocus="config.autofocus"
        :disabled="config.disabled"
        :indent-with-tab="config.indentWithTab"
        :tab-size="config.tabSize"
        @update="handleStateUpdate"
        @ready="handleReady"
        @focus="log('focus', $event)"
        @blur="log('blur', $event)"
      />
    </div>
    <div class="w-full h-px bg-slate-500"></div>
    <div class="h-12 w-full flex justify-between items-center text-sm bg-slate-800 py-0 px-2 rounded-b">
      <div class="inline-flex space-x-2 items-center justify-center">
        <button class="inline-flex justify-center items-center text-slate-50 bg-transparent cursor-pointer border p-2
          border-slate-600 border-dashed hover:text-slate-300 hover:border-slate-700" @click="handleUndo">Undo</button>
        <button class="inline-flex justify-center items-center text-slate-50 bg-transparent cursor-pointer border p-2
          border-slate-600 border-dashed hover:text-slate-300 hover:border-slate-700" @click="handleRedo">Redo</button>
      </div>
      <div class="inline-flex space-x-2 items-center justify-center text-slate-50">
        <span class="inline-block ml-12" style="font-feature-settings: 'tnum'">Diagnostics: {{ diagnosticCount }}</span>
        <span class="inline-block ml-12" style="font-feature-settings: 'tnum'">Spaces: {{ config.tabSize }}</span>
        <span class="inline-block ml-12" style="font-feature-settings: 'tnum'">Length: {{ state.length }}</span>
        <span class="inline-block ml-12" style="font-feature-settings: 'tnum'">Lines: {{ state.lines }}</span>
        <span class="inline-block ml-12" style="font-feature-settings: 'tnum'">Cursor: {{ state.cursor }}</span>
        <span class="inline-block ml-12" style="font-feature-settings: 'tnum'">Selected: {{ state.selected }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
