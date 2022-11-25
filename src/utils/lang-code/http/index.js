import { StreamLanguage } from '@codemirror/language'
import { http } from '@codemirror/legacy-modes/mode/http'

export default {
  language: () => StreamLanguage.define(http)
}
