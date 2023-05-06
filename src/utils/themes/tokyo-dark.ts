import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const foreground = "#A0A8CD",
  background = "#11121D",
  darkBackground = "#06080A",
  highlightBackground = "#98C379",
  cursor = "#A0A8CD",
  selection = "#212234",
  tooltipBackground = "#1A1B2A",
  invalid = "#FE6D85",
  keyword = "#EE6D85",
  controlFlowAndModuleKeywords = "#FE6D85",
  functions = "#95C561",
  typesAndClasses = "#7199EE",
  tagNames = "#A485DD",
  operators = "#EE6D85",
  regexes = "#D7A65F",
  strings = "#D7A65F",
  names = "#F6955B", // #EE6D85
  punctuationAndSeparators = "#A0A8CD",
  angleBrackets = "#A485DD",
  templateStringBraces = "#38A89D",
  propertyNames = "#F6955B",
  booleansAndAtoms = "#A485DD",
  numbersAndUnits = "#A485DD",
  metaAndComments = "#4A5057";

export const tokyoDarkTheme = EditorView.theme(
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
      backgroundColor: "#98C379",
      outline: "1px solid #11121D",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#FE6D85",
    },

    ".cm-activeLine": { backgroundColor: highlightBackground },
    ".cm-selectionMatch": { backgroundColor: "#FE6D85" },

    "&.cm-editor": {
      borderRadius: "5px",
    },

    "&.cm-editor .cm-scroller": {
      fontFamily:
        'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    },

    "&.cm-editor.cm-focused": {
      outline: "5px solid #11121D",
    },

    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "#4A5057",
      outline: "1px solid #353945",
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
      backgroundColor: "transparent",
      border: "none",
      color: "#A0A8CD",
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

export const tokyoDarkHighlightStyle = HighlightStyle.define([
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
export const tokyoDark: Extension = [
  tokyoDarkTheme,
  syntaxHighlighting(tokyoDarkHighlightStyle),
];
