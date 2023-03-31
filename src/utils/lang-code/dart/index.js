import { StreamLanguage } from "@codemirror/language";
import { dart } from "@codemirror/legacy-modes/mode/clike";

export default {
  language: () => StreamLanguage.define(dart),
};
