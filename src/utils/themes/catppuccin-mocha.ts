import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const foreground = "#cdd6f4",
  background = "#1e1e2e",
  darkBackground = "#1e1e2e",
  highlightBackground = "rgba(88, 91, 112, 0.7)",
  cursor = "#A0A8CD",
  selection = "rgba(147, 153, 178, 0.4)",
  tooltipBackground = "#1A1B2A",
  invalid = "#f38ba8",
  keyword = "#f38ba8",
  controlFlowAndModuleKeywords = "#f38ba8",
  functions = "#89b4fa",
  typesAndClasses = "#fab387",
  tagNames = "#cba6f7",
  operators = "#89dceb",
  regexes = "#89dceb",
  strings = "#a6e3a1",
  names = "#fab387",
  punctuationAndSeparators = "#94e2d5",
  angleBrackets = "#7f849c",
  templateStringBraces = "#f38ba8",
  propertyNames = "#cdd6f4",
  booleansAndAtoms = "#fab387",
  numbersAndUnits = "#94e2d5",
  metaAndComments = "#6c7086";

export const catppuccinMochaTheme = EditorView.theme(
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
      backgroundColor: "#585b70",
      outline: "1px solid #cba6f7",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#fab387",
    },

    ".cm-activeLine": { backgroundColor: highlightBackground },
    ".cm-selectionMatch": { backgroundColor: "#9399b2" },

    "&.cm-editor": {
      borderRadius: "5px",
    },

    "&.cm-editor .cm-scroller": {
      fontFamily:
        'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    },

    "&.cm-editor.cm-focused": {
      outline: "5px solid transparent",
    },

    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "#9399b2",
      outline: "1px solid rgba(147, 153, 178, 0.7)",
    },

    ".cm-gutters": {
      backgroundColor: background,
      color: "#A0A8CD",
      border: "none",
      borderRadius: "5px",
    },

    ".cm-activeLineGutter": {
      backgroundColor: highlightBackground,
    },

    ".cm-foldPlaceholder": {
      backgroundColor: "#89dceb",
      border: "none",
      color: "#9399b2",
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

export const catppuccinMochaHighlightStyle = HighlightStyle.define([
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

/// Extension to enable the Tokyo Dark theme (both the editor theme and
/// the highlight style).
export const catppuccinMocha: Extension = [
  catppuccinMochaTheme,
  syntaxHighlighting(catppuccinMochaHighlightStyle),
];
