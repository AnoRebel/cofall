import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightSpecialChars } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } from '@codemirror/language'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { lintKeymap } from '@codemirror/lint'
import { oneDark } from '@codemirror/theme-one-dark'

// Language imports
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { rust } from '@codemirror/lang-rust'
import { sql } from '@codemirror/lang-sql'
import { xml } from '@codemirror/lang-xml'
import { php } from '@codemirror/lang-php'
import { go } from '@codemirror/lang-go'

export interface EditorOptions {
  language?: string
  theme?: 'dark' | 'light'
  readOnly?: boolean
  onChange?: (value: string) => void
}

// Language map
const languageMap: Record<string, () => any> = {
  javascript: () => javascript({ jsx: true, typescript: false }),
  typescript: () => javascript({ jsx: true, typescript: true }),
  python: () => python(),
  html: () => html(),
  css: () => css(),
  json: () => json(),
  markdown: () => markdown(),
  java: () => java(),
  cpp: () => cpp(),
  c: () => cpp(),
  rust: () => rust(),
  sql: () => sql(),
  xml: () => xml(),
  php: () => php(),
  go: () => go(),
}

// File extension map
export const fileExtensions: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  html: 'html',
  css: 'css',
  json: 'json',
  markdown: 'md',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  rust: 'rs',
  sql: 'sql',
  xml: 'xml',
  php: 'php',
  go: 'go',
}

export const useCodeEditor = () => {
  const editorRef = ref<HTMLElement | null>(null)
  const editorView = ref<EditorView | null>(null)
  const currentLanguage = ref('javascript')
  const currentTheme = ref<'dark' | 'light'>('dark')

  const getLanguageExtension = (lang: string) => {
    const langFn = languageMap[lang] || languageMap.javascript
    return langFn()
  }

  const createEditor = (container: HTMLElement, initialValue: string = '', options: EditorOptions = {}) => {
    currentLanguage.value = options.language || 'javascript'
    currentTheme.value = options.theme || 'dark'

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      indentOnInput(),
      highlightSelectionMatches(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...completionKeymap,
        ...closeBracketsKeymap,
        ...searchKeymap,
        ...lintKeymap,
      ]),
      getLanguageExtension(currentLanguage.value),
      currentTheme.value === 'dark' ? oneDark : [],
      EditorView.updateListener.of((update) => {
        if (update.docChanged && options.onChange) {
          options.onChange(update.state.doc.toString())
        }
      }),
      EditorState.readOnly.of(options.readOnly || false),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '14px',
        },
        '.cm-scroller': {
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
        },
        '.cm-gutters': {
          backgroundColor: 'var(--color-editor-gutter)',
          borderRight: '1px solid var(--color-border)',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'var(--color-editor-line)',
        },
      }),
    ]

    const state = EditorState.create({
      doc: initialValue,
      extensions,
    })

    editorView.value = new EditorView({
      state,
      parent: container,
    })

    return editorView.value
  }

  const destroyEditor = () => {
    if (editorView.value) {
      editorView.value.destroy()
      editorView.value = null
    }
  }

  const getValue = (): string => {
    return editorView.value?.state.doc.toString() || ''
  }

  const setValue = (value: string) => {
    if (editorView.value) {
      const transaction = editorView.value.state.update({
        changes: {
          from: 0,
          to: editorView.value.state.doc.length,
          insert: value,
        },
      })
      editorView.value.dispatch(transaction)
    }
  }

  const setLanguage = (lang: string) => {
    if (!editorView.value) return

    currentLanguage.value = lang
    const currentDoc = getValue()

    // Reconfigure with new language
    editorView.value.dispatch({
      effects: EditorView.reconfigure.of([
        lineNumbers(),
        highlightActiveLine(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        indentOnInput(),
        highlightSelectionMatches(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
          ...closeBracketsKeymap,
          ...searchKeymap,
          ...lintKeymap,
        ]),
        getLanguageExtension(lang),
        currentTheme.value === 'dark' ? oneDark : [],
      ]),
    })
  }

  const setTheme = (theme: 'dark' | 'light') => {
    currentTheme.value = theme
    // Theme will be applied on next language change or editor recreation
  }

  const focus = () => {
    editorView.value?.focus()
  }

  onUnmounted(() => {
    destroyEditor()
  })

  return {
    editorRef,
    editorView: readonly(editorView),
    currentLanguage: readonly(currentLanguage),
    currentTheme: readonly(currentTheme),
    createEditor,
    destroyEditor,
    getValue,
    setValue,
    setLanguage,
    setTheme,
    focus,
    fileExtensions,
  }
}
