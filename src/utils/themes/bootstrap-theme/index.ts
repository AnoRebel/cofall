import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';
import type { StyleSpec } from 'style-mod';

import {
  colors,
  border,
  radius,
  button,
  editor,
  form,
  checkbox,
} from './BootstrapStyle';

/**
 * Convert Bootstrap Theme
 * @param isDark - Darkmode
 * @returns
 */
function getComputedStyle(isDark: boolean = false): {
  [selector: string]: StyleSpec;
} {
  return {
    '&.cm-editor': editor(isDark),
    '.cm-content': {
      caretColor: isDark ? colors.black : colors.white,
    },
    '.cm-selectionBackground': {
      background: isDark ? '#222' : colors.gray[4],
    },
    '.cm-focused .cm-selectionBackground': {
      background: isDark ? '#233' : colors.gray[8],
    },
    '.cm-cursor': {
      borderLeftColor: border,
    },
    '.cm-activeLine': { backgroundColor: isDark ? '#99eeff33' : '#cceeff44' },
    '.cm-specialChar': { color: colors.red },
    '.cm-gutters': {
      backgroundColor: isDark ? colors.gray[7] : colors.gray[3],
      color: isDark ? colors.gray[4] : colors.gray[6],
      borderRight: border,
      borderTopLeftRadius: radius,
      borderBottomLeftRadius: radius,
    },
    '.cm-activeLineGutter': {
      backgroundColor: isDark ? colors.dark : colors.gray[4],
    },
    '.cm-panels': {
      backgroundColor: isDark ? colors.gray[8] : colors.gray[3],
      color: isDark ? colors.white : colors.black,
    },
    '.cm-panels-top': {
      borderBottom: border,
    },
    '.cm-panels-bottom': {
      borderTop: border,
    },

    '.cm-placeholder': {
      color: colors.gray[6],
      display: 'inline-block',
      verticalAlign: 'top',
    },
    '.cm-button': button(isDark),
    '.cm-textfield': form(isDark),
    '.cm-panel.cm-search input[type=checkbox]': checkbox,
    '.cm-panels-top .cm-panel': {
      borderTopLeftRadius: border,
      borderTopRightRadius: border,
    },
    '.cm-panels-bottom .cm-panel': {
      borderBottomLeftRadius: border,
      borderBottomRightRadius: border,
    },
  };
}
console.log(getComputedStyle());

/** Bootstrap Theme */
export const bootstrapTheme: Extension = EditorView.theme(getComputedStyle(), {
  dark: false,
});

console.log(bootstrapTheme[1].value);
/** Bootstrap Theme Dark mode */
export const bootstrapThemeDark: Extension = EditorView.theme(
  getComputedStyle(true),
  {
    dark: true,
  }
);

/** Bootstrap Hilighting Text Style */
export const bootstrapHighlightStyle: HighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: colors.purple },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: colors.pink,
  },
  { tag: [t.function(t.variableName), t.labelName], color: colors.blue },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: colors.orange,
  },
  { tag: [t.definition(t.name), t.separator], color: colors.indigo },
  {
    tag: [
      t.typeName,
      t.className,
      t.number,
      t.changed,
      t.annotation,
      t.modifier,
      t.self,
      t.namespace,
    ],
    color: colors.yellow,
  },
  {
    tag: [
      t.operator,
      t.operatorKeyword,
      t.url,
      t.escape,
      t.regexp,
      t.link,
      t.special(t.string),
    ],
    color: colors.cyan,
  },
  { tag: [t.meta, t.comment], color: colors.green },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: colors.green, textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: colors.pink },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: colors.orange },
  { tag: [t.processingInstruction, t.string, t.inserted], color: colors.teal },
  { tag: t.invalid, color: colors.red },
]);

export const bootstrap: Extension = [
  bootstrapTheme,
  syntaxHighlighting(bootstrapHighlightStyle),
];

export const bootstrapDark: Extension = [
  bootstrapThemeDark,
  syntaxHighlighting(bootstrapHighlightStyle),
];
