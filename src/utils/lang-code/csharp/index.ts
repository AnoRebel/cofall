import { StreamLanguage } from "@codemirror/language";
import { csharp } from "@codemirror/legacy-modes/mode/clike";

export default {
  language: () => StreamLanguage.define(csharp),
};
