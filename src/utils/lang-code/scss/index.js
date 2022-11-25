import { StreamLanguage } from '@codemirror/language'
import { sCSS } from '@codemirror/legacy-modes/mode/css'

export default {
  language: () => StreamLanguage.define(sCSS)
}
