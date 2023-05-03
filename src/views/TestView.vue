<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from "vue";
import {StateField, EditorState, Compartment, type Extension, StateEffect, RangeSet} from "@codemirror/state";
import {EditorView, keymap, GutterMarker, gutter, lineNumbers, drawSelection, placeholder, scrollPastEnd,
rectangularSelection, highlightActiveLineGutter, highlightSpecialChars, tooltips, dropCursor, crosshairCursor, highlightActiveLine} from "@codemirror/view";
import {defaultKeymap, indentWithTab, history, historyKeymap, undoSelection, redoSelection} from "@codemirror/commands";
import {
  // diagnosticCount as linterDagnosticCount,
  // forceLinting,
  // linter,
  lintGutter,
  lintKeymap,
} from "@codemirror/lint";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
// import { html } from '@codemirror/lang-html';
// import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';

import * as Y from "yjs";
// @ts-ignore
import { getYjsDoc, SyncedText } from "@syncedstore/core";
// @ts-ignore
import { yCollab } from "y-codemirror.next";
import { useSyncedStore, useRTCProvider } from "@/utils";
import Codemirror, { store } from "@/components/codemirror";

// const store = useSyncedStore({ data: {}, code: "text" });
const { provider } = useRTCProvider("cofall", getYjsDoc(store));
const undoManager = new Y.UndoManager(store.code);

provider.awareness.setLocalStateField("user", {
  name: 'Anonymous ' + Math.floor(Math.random() * 100), // TODO: Added stored username
  color: "#141414",
  colorLight: "#ececec",
});

onMounted(() => {});

const log = console.log;
const extensions: Extension[] = [];
// TODO: // searchKeymap.of({ search: searchKeymap.defaultConfig({ search: searchKeymap.asYouType }) }),
// TODO: // linter.of({ linter: linter.defaultConfig({ linter: linter.asYouType }) }),
// TODO: // forceLinting.of({ forceLinting: forceLinting.defaultConfig({ forceLinting: forceLinting.asYouType }) }),
const handleReady = () => log("Ready");
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
