<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { reactive, shallowRef, computed } from "vue";
import Codemirror, { store } from "@/components/codemirror";
import { redo, undo } from "@codemirror/commands";
import { type Extension } from "@codemirror/state";
import { ViewUpdate, EditorView } from "@codemirror/view";
import {
  diagnosticCount as linterDagnosticCount,
  // forceLinting,
  // openLintPanel,
  // closeLintPanel,
  linter,
} from "@codemirror/lint";

import * as Y from "yjs";
import {esLint} from "@codemirror/lang-javascript";
import * as eslint from "eslint-linter-browserify";
/// @ts-ignore
import { getYjsDoc, SyncedText } from "@syncedstore/core";
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

const { provider } = useRTCProvider("cofall", getYjsDoc(store));
const undoManager = new Y.UndoManager(store.code);

provider.awareness.setLocalStateField("user", {
  name: "Anonymous " + Math.floor(Math.random() * 100), // TODO: Added stored username
  color: userColor.color,
  colorLight: userColor.light,
});

const log = console.log;
const theme = computed(() => config.theme !== 'default' ? themes[config.theme] : void 0);
const extensions = computed<Extension[]>(() => {
  const result = [
    ...exts,
    config.language === "" ? languages["javascript"]() : languages[config.language](),
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
  if(config.language === "javascript") {
    result.push(linter(esLint(new eslint.Linter(), { env: { browser: true, node: true }})))
  }
  if (theme.value) {
    result.push(theme.value);
  }
  return result;
});

const preview = shallowRef(false);
const togglePreview = () => {
  preview.value = !preview.value;
};

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
const diagnosticCount = computed(() => linterDagnosticCount(cmView.value.state));

const handleStateUpdate = (viewUpdate: ViewUpdate) => {
  // selected
  const ranges = viewUpdate.state.selection.ranges;
  state.selected = ranges.reduce((plus, range) => plus + range.to - range.from, 0);
  state.cursor = ranges[0].anchor;
  // length
  state.length = viewUpdate.state.doc.length;
  state.lines = viewUpdate.state.doc.lines;
  // log('viewUpdate', viewUpdate)
};
</script>

<template>
  <div class="editor">
    <div class="main">
      <codemirror
        :style="{
          width: preview ? '50%' : '100%',
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
      <pre
        v-if="preview"
        class="code"
        :style="{ height: config.height, width: preview ? '50%' : '0px' }"
        >
        {{ store.code.toString() }}
        </pre
      >
    </div>
    <div class="divider"></div>
    <div class="footer">
      <div class="buttons">
        <button class="item" @click="togglePreview">
          <span>Preview</span>
          <i class="iconfont" :class="preview ? 'icon-eye' : 'icon-eye-close'"></i>
        </button>
        <button class="item" @click="handleUndo">Undo</button>
        <button class="item" @click="handleRedo">Redo</button>
      </div>
      <div class="infos">
        <span class="item">Diagnostics: {{ diagnosticCount }}</span>
        <span class="item">Spaces: {{ config.tabSize }}</span>
        <span class="item">Length: {{ state.length }}</span>
        <span class="item">Lines: {{ state.lines }}</span>
        <span class="item">Cursor: {{ state.cursor }}</span>
        <span class="item">Selected: {{ state.selected }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:math";
// gaps
$gap: 1rem; // ~14px
$sm-gap: $gap * 0.618; // ~8.6px
$xs-gap: math.div($sm-gap, 2); // ~4.4px

.editor {
  .divider {
    height: 1px;
    background-color: var(--theme-border);
  }

  .main {
    display: flex;
    width: 100%;

    .code {
      width: 30%;
      height: 100px;
      margin: 0;
      padding: 0.4em;
      overflow: scroll;
      border-left: 1px solid var(--theme-border);
      font-family: monospace;
    }
  }

  .footer {
    height: 3rem;
    padding: 0 1em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 90%;

    .buttons {
      .item {
        margin-right: 1em;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        border: 1px dashed var(--theme-border);
        font-size: 12px;
        color: var(--text-secondary);
        cursor: pointer;
        .iconfont {
          margin-left: $xs-gap;
        }
        &:hover {
          color: var(--text-color);
          border-color: var(--text-color);
        }
      }
    }

    .infos {
      .item {
        margin-left: 2em;
        display: inline-block;
        font-feature-settings: "tnum";
      }
    }
  }
}
</style>
