import { type App, inject } from "vue";
// import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder,
  rectangularSelection,
  scrollPastEnd,
  tooltips,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  redoSelection,
  undoSelection,
} from "@codemirror/commands";
import { lintGutter, lintKeymap } from "@codemirror/lint";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
// @ts-ignore
import { yUndoManagerKeymap } from "y-codemirror.next";
import type { ConfigProps } from "./props";
import { breakpointGutter } from "./utils";

export const DEFAULT_CONFIG: Readonly<Partial<ConfigProps>> = Object.freeze({
  autofocus: false,
  disabled: false,
  indentWithTab: true,
  tabSize: 2,
  placeholder: "",
  autoDestroy: true,
  // extensions: [basicSetup],
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
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      // ...historyKeymap,
      ...yUndoManagerKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
      indentWithTab,
      // { key: "Ctrl+u", run: undoSelection },
      // { key: "Ctrl+Shift+u", run: redoSelection },
    ]),
  ],
});

const CONFIG_SYMBOL = Symbol("vue-codemirror-global-config");
export const injectGlobalConfig = (app: App, config?: ConfigProps) => {
  app.provide(CONFIG_SYMBOL, config);
};

export const useGlobalConfig = () => {
  return inject<ConfigProps>(CONFIG_SYMBOL, {} as ConfigProps);
};
