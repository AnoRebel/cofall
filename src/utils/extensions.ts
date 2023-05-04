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
  rectangularSelection,
  scrollPastEnd,
  tooltips,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
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
// @ts-ignore
import { breakpointGutter } from "@/utils";

export default [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  ...breakpointGutter,
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  lintGutter(),
  scrollPastEnd(),
  tooltips(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...yUndoManagerKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
    { key: "Ctrl+u", run: undoSelection },
    { key: "Ctrl+Shift+u", run: redoSelection },
  ]),
];
