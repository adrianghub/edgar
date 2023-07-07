import { writable } from "svelte/store";
import { Store } from "tauri-plugin-store-api";
import type { ChatState } from "./main.dt";

let store = new Store("edgarai.dat");

export const saveState = async (newState: Partial<ChatState>) => {
  try {
    await store.set("state", newState);
  } catch (error) {
    console.error("An error occurred while saving the state", error);
    // Handle the error, such as displaying an error message to the user
  }
  return newState;
};

export const loadState = async (state): Promise<ChatState | null> => {
  try {
    state.update((state) => {
      return state;
    });
    return state;
  } catch (error) {
    console.error("An error occurred while loading the state", error);
    // TODO: Handle the error, such as displaying an error message to the user
  }
};

export const state = writable<ChatState>({
  answer: "",
  query: "",
  messages: [],
  typing: false,
  shortcuts: [
    {
      id: 1,
      name: "Ask a question",
      keystroke: "CommandOrControl+Shift+K",
      type: "query",
    },
    {
      id: 2,
      name: "Save to memory",
      keystroke: "CommandOrControl+Shift+S",
      type: "save",
      group: "memories",
    },
  ],
});
