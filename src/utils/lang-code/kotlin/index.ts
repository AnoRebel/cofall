import { StreamLanguage } from "@codemirror/language";
import { kotlin } from "@codemirror/legacy-modes/mode/clike";

export default {
  language: () => StreamLanguage.define(kotlin),
};
