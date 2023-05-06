<script lang="ts" setup>
import { onMounted, shallowRef, computed, onBeforeUnmount } from "vue";
import { EditorState, type Extension} from "@codemirror/state";
import {EditorView} from "@codemirror/view";
import {
  diagnosticCount as linterDagnosticCount,
  forceLinting,
  linter,
} from "@codemirror/lint";

import * as Y from "yjs";
// @ts-ignore
import { getYjsDoc } from "@syncedstore/core";
// @ts-ignore
import { yCollab } from "y-codemirror.next";
import { useRTCProvider } from "@/utils";
import Codemirror, { store } from "@/components/codemirror";
import exts from "@/utils/extensions";

const { provider } = useRTCProvider("cofall", getYjsDoc(store));
const undoManager = new Y.UndoManager(store.code);

provider.awareness.setLocalStateField("user", {
  name: 'Anonymous ' + Math.floor(Math.random() * 100), // TODO: Added stored username
  color: "#141414",
  colorLight: "#ececec",
});

onMounted(() => {});

const log = console.log;
const extensions = computed<Extension[]>(() => {
  const result = [
    ...exts,
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
    yCollab(store.code, provider.awareness, { undoManager }),
  ];
  // if (props.language) {
  //   result.push(props.language());
  // }
  // if (props.theme) {
  //   result.push(props.theme);
  // }
  return result;
});
// TODO: // searchKeymap.of({ search: searchKeymap.defaultConfig({ search: searchKeymap.asYouType }) }),
// TODO: // linter.of({ linter: linter.defaultConfig({ linter: linter.asYouType }) }),
// TODO: // forceLinting.of({ forceLinting: forceLinting.defaultConfig({ forceLinting: forceLinting.asYouType }) }),
// Codemirror EditorView instance ref
const view = shallowRef<EditorView>()
const handleReady = (payload: { view: EditorView; state: EditorState; container: HTMLDivElement }) => {
  view.value = payload.view
}

// Status is available at all times via Codemirror EditorView
const getCodemirrorStates = () => {
  const state = view.value.state
  const ranges = state.selection.ranges
  return {
    selected: ranges.reduce((r, range) => r + range.to - range.from, 0),
    cursor: ranges[0].anchor,
    length: state.doc.length,
    lines: state.doc.lines,
  }
}

onBeforeUnmount(() => {});
</script>

<template>
  <div>Test</div>
  <codemirror
    placeholder="Code goes here..."
    :style="{ height: '400px' }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @ready="handleReady"
    @change="log('change', $event)"
    @focus="log('focus', $event)"
    @blur="log('blur', $event)"
  />
</template>
