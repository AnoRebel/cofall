import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const foreground = "#a9b1d6",
  background = "#1e1e1e",
  darkBackground = "#1a1b26",
  highlightBackground = "#515c7e44",
  cursor = "#c0caf5",
  selection = "#515c7e4d",
  tooltipBackground = "#16161e",
  invalid = "#db4b4b",
  keyword = "#bb9af7",
  controlFlowAndModuleKeywords = "#c586c0",
  functions = "#7aa2f7",
  typesAndClasses = "#0db9d7",
  tagNames = "#f7768e",
  operators = "#89ddff",
  regexes = "#b4f9f8",
  strings = "#9ece6a",
  names = "#bb9af7",
  punctuationAndSeparators = "#89ddff",
  angleBrackets = "#9abdf5",
  templateStringBraces = "#89ddff",
  propertyNames = "#c0caf5",
  booleansAndAtoms = "#ff9e64",
  numbersAndUnits = "#ff9e64",
  metaAndComments = "#444b6a";

export const tokyoNightTheme = EditorView.theme(
  {
    "&": {
      color: foreground,
      backgroundColor: background,
    },

    ".cm-content": {
      caretColor: cursor,
    },

    ".cm-cursor, .cm-dropCursor": { borderLeftColor: cursor },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: selection },

    ".cm-panels": { backgroundColor: darkBackground, color: foreground },
    ".cm-panels.cm-panels-top": { borderBottom: "2px solid #101014" },
    ".cm-panels.cm-panels-bottom": { borderTop: "2px solid #101014" },

    ".cm-searchMatch": {
      backgroundColor: "#3d59a166",
      outline: "1px solid #e0af68",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#3d59a166",
    },

    ".cm-activeLine": { backgroundColor: highlightBackground },
    ".cm-selectionMatch": { backgroundColor: "#515c7e44" },

    "&.cm-editor": {
      borderRadius: "5px",
    },

    "&.cm-editor .cm-scroller": {
      fontFamily:
        'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    },

    "&.cm-editor.cm-focused": {
      outline: "5px solid #545c7e33",
    },

    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "#16161e",
      outline: "1px solid #42465d",
    },

    ".cm-gutters": {
      backgroundColor: background,
      color: "#858585",
      border: "none",
      borderRadius: "5px",
    },

    ".cm-activeLineGutter": {
      backgroundColor: highlightBackground,
    },

    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: "#ddd",
    },

    ".cm-tooltip": {
      border: "none",
      backgroundColor: tooltipBackground,
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: tooltipBackground,
      borderBottomColor: tooltipBackground,
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: highlightBackground,
        color: foreground,
      },
    },
  },
  { dark: true },
);

export const tokyoNightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: keyword },
  {
    tag: [tags.controlKeyword, tags.moduleKeyword],
    color: controlFlowAndModuleKeywords,
  },
  {
    tag: [tags.name, tags.deleted, tags.character, tags.macroName],
    color: names,
  },
  {
    tag: [tags.propertyName],
    color: propertyNames,
  },

  { tag: [tags.variableName, tags.labelName], color: names },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: booleansAndAtoms,
  },
  { tag: [tags.definition(tags.name)], color: foreground },
  {
    tag: [
      tags.typeName,
      tags.className,
      tags.number,
      tags.changed,
      tags.annotation,
      tags.modifier,
      tags.self,
      tags.namespace,
    ],
    color: typesAndClasses,
  },
  { tag: [tags.tagName], color: tagNames },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
    color: functions,
  },
  { tag: [tags.number], color: numbersAndUnits },
  {
    tag: [
      tags.operator,
      tags.operatorKeyword,
      tags.url,
      tags.escape,
      tags.regexp,
      tags.link,
      tags.special(tags.string),
    ],
    color: operators,
  },
  {
    tag: [tags.regexp],
    color: regexes,
  },
  {
    tag: [tags.special(tags.string)],
    color: strings,
  },
  { tag: [tags.meta, tags.comment], color: metaAndComments },
  { tag: [tags.punctuation, tags.separator], color: punctuationAndSeparators },
  { tag: [tags.angleBracket], color: angleBrackets },
  { tag: tags.special(tags.brace), color: templateStringBraces },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link, color: metaAndComments, textDecoration: "underline" },
  { tag: tags.heading, fontWeight: "bold", color: names },
  {
    tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
    color: booleansAndAtoms,
  },
  {
    tag: [tags.processingInstruction, tags.string, tags.inserted],
    color: strings,
  },
  { tag: tags.invalid, color: invalid },
]);

/// Extension to enable the Tokyo Night theme (both the editor theme and
/// the highlight style).
export const tokyoNight: Extension = [
  tokyoNightTheme,
  syntaxHighlighting(tokyoNightHighlightStyle),
];
