import { defineStore } from "pinia";

export const useTerminalConfigStore = defineStore("terminalConfig", {
  state: () => ({
    // 背景
    background: "black",
  }),
  getters: {},
});
