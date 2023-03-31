import { StreamLanguage } from "@codemirror/language";
import { less } from "@codemirror/legacy-modes/mode/css";

export default {
  language: () => StreamLanguage.define(less),
};
