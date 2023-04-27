<script lang="ts" setup>
import { onMounted, reactive, ref, shallowRef, onBeforeUnmount } from "vue";
import {StateField, EditorState, Compartment, type Extension, StateEffect, RangeSet} from "@codemirror/state";
import {EditorView, keymap, GutterMarker, gutter, lineNumbers, drawSelection, placeholder, scrollPastEnd,
rectangularSelection, highlightActiveLineGutter, highlightSpecialChars, tooltips, dropCursor, crosshairCursor, highlightActiveLine} from "@codemirror/view";
import {defaultKeymap, indentWithTab, history, historyKeymap} from "@codemirror/commands";
import {
  diagnosticCount as linterDagnosticCount,
  forceLinting,
  linter,
  lintGutter,
  lintKeymap,
} from "@codemirror/lint";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';

import * as Y from "yjs";
// @ts-ignore
import { getYjsValue, getYjsDoc, SyncedText } from "@syncedstore/core";
// @ts-ignore
import { yCollab } from "y-codemirror.next";
import { useSocket, useSyncedStore, useRTCProvider } from "@/utils";

enum EventKey {
  Change = 'change',
  Update = 'update',
  Focus = 'focus',
  Blur = 'blur',
  Ready = 'ready',
  ModelUpdate = 'update:modelValue'
};

const container = shallowRef<HTMLDivElement>();
const state = shallowRef<EditorState>();
const view = shallowRef<EditorView>();
const store = useSyncedStore({ data: {} });
const { provider } = useRTCProvider("cofall", getYjsDoc(store));
// const ytext = (ydoc as Y.Doc).getText("codemirror");
store.data.code = new SyncedText("");
const undoManager = new Y.UndoManager(store.data.code);

// https://codemirror.net/examples/config/
// https://github.com/uiwjs/react-codemirror/blob/22cc81971a/src/useCodeMirror.ts#L144
// https://gist.github.com/s-cork/e7104bace090702f6acbc3004228f2cb
const createEditorCompartment = (view: EditorView) => {
  const compartment = new Compartment()
  const run = (extension: Extension) => {
    compartment.get(view.state)
      ? view.dispatch({ effects: compartment.reconfigure(extension) }) // reconfigure
      : view.dispatch({ effects: StateEffect.appendConfig.of(compartment.of(extension)) }) // inject
  }
  return { compartment, run }
};

// https://codemirror.net/examples/reconfigure/
const createEditorExtensionToggler = (view: EditorView, extension: Extension) => {
  const { compartment, run } = createEditorCompartment(view)
  return (targetApply?: boolean) => {
    const exExtension = compartment.get(view.state)
    const apply = targetApply ?? exExtension !== extension
    run(apply ? extension : [])
  }
};

const breakpointEffect = StateEffect.define<{pos: number, on: boolean}>({
  map: (val, mapping) => ({pos: mapping.mapPos(val.pos), on: val.on})
});

const breakpointMarker = new class extends GutterMarker {
  toDOM() { return document.createTextNode("💔") }
};

const breakpointState = StateField.define<RangeSet<GutterMarker>>({
  create() { return RangeSet.empty },
  update(set, transaction) {
    set = set.map(transaction.changes)
    for (let e of transaction.effects) {
      if (e.is(breakpointEffect)) {
        if (e.value.on)
          set = set.update({add: [breakpointMarker.range(e.value.pos)]})
        else
          set = set.update({filter: from => from != e.value.pos})
      }
    }
    return set
  }
});

const breakpointGutter = [
  breakpointState,
  gutter({
    class: "cm-breakpoint-gutter",
    markers: v => v.state.field(breakpointState),
    initialSpacer: () => breakpointMarker,
    domEventHandlers: {
      mousedown(view, line) {
        toggleBreakpoint(view, line.from)
        return true
      }
    }
  }),
  EditorView.baseTheme({
    ".cm-breakpoint-gutter .cm-gutterElement": {
      color: "red",
      paddingLeft: "5px",
      cursor: "default"
    }
  })
];

function toggleBreakpoint(view: EditorView, pos: number) {
  let breakpoints = view.state.field(breakpointState)
  let hasBreakpoint = false
  breakpoints.between(pos, pos, () => {hasBreakpoint = true})
  view.dispatch({
    effects: breakpointEffect.of({pos, on: !hasBreakpoint})
  })
}

provider.awareness.setLocalStateField("user", {
  name: 'Anonymous ' + Math.floor(Math.random() * 100), // TODO: Added stored username
  color: "#141414",
  colorLight: "#ececec",
});

onMounted(() => {
  console.log(useSocket("http://localhost:5000"));
  state.value = EditorState.create({
        doc: store.data.code,
        // selection: config.value.selection,
        // The extensions are split into two parts, global and component prop.
        // Only the global part is initialized here.
        // The prop part is dynamically reconfigured after the component is mounted.
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          foldGutter(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          EditorState.tabSize.of(2),
          indentOnInput(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          rectangularSelection(),
          crosshairCursor(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          ...breakpointGutter,
          lintGutter(),
          scrollPastEnd(),
          tooltips(),
          placeholder("Cofall..."),
          oneDark,
          javascript(),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
            ...lintKeymap,
            indentWithTab,
            // { key: "Tab", run: indentMore, shift: indentLess },
          ]),
          yCollab(store.data.code, provider.awareness, { undoManager }),
          EditorView.updateListener.of((viewUpdate) => {
            // https://discuss.codemirror.net/t/codemirror-6-proper-way-to-listen-for-changes/2395/11
            // onUpdate(viewUpdate)
            // doc changed
            if (viewUpdate.docChanged) {
              // onChange(viewUpdate.state.doc.toString(), viewUpdate)
            }
            // focus state change
            if (viewUpdate.focusChanged) {
              viewUpdate.view.hasFocus ? onFocus(viewUpdate) : onBlur(viewUpdate)
            }
          })
        ],
        // onFocus: (viewUpdate) => context.emit(EventKey.Focus, viewUpdate),
        // onBlur: (viewUpdate) => context.emit(EventKey.Blur, viewUpdate),
        // onUpdate: (viewUpdate) => context.emit(EventKey.Update, viewUpdate),
        // onChange: (newDoc, viewUpdate) => {
        //   if (newDoc !== props.modelValue) {
        //     context.emit(EventKey.Change, newDoc, viewUpdate)
        //     context.emit(EventKey.ModelUpdate, newDoc, viewUpdate)
        //   }
        // }
      });
      view.value = new EditorView({
        state: state.value,
        parent: container.value!,
        // root: config.value.root
      });
});

const log = console.log;

onBeforeUnmount(() => {});
</script>

<template>
  <div>Test</div>
  <div class="codemirror" ref="container" style="display: 'contents';"></div>
</template>
