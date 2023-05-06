import { defineStore } from "pinia";
import { Theme, useTheme } from "@/composables/theme";

interface State {
  disabled: boolean;
  indentWithTab: boolean;
  tabSize: number;
  autofocus: boolean;
  height: string;
  language: string;
  theme: string;
}

export const useConfigStore = defineStore("config", {
  state: (): State => {
    return {
      disabled: false,
      indentWithTab: true,
      tabSize: 2,
      autofocus: true,
      height: "auto",
      language: "javascript",
      theme: useTheme().theme.value === Theme.Light ? "default" : "oneDark",
    };
  },
  actions: {},
  getters: {},
});
