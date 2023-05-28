import { writable } from "svelte/store";
import { Store } from "tauri-plugin-store-api";
import type { ChatState } from "./main.dt";

let store = new Store("edgarai.dat");

export const defaultSystemPrompt = "You're a helpful assistant named Edgar";

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
    const savedState: ChatState = await store.get("state");
    state.update((state) => {
      state.apikey = savedState.apikey;
      return state;
    });
    return state;
  } catch (error) {
    console.error("An error occurred while loading the state", error);
    // TODO: Handle the error, such as displaying an error message to the user
  }
};

export const state = writable<ChatState>({
  apikey: "",
  model: "gpt-3.5-turbo",
  max_tokens: 1500,
  temperature: 0.8,
  stream: true,
  answer: "",
  query: "",
  messages: [
    {
      role: "system",
      content: defaultSystemPrompt,
    },
  ],
  typing: false,
  shortcuts: [
    {
      id: 1,
      system: "Answer yes or no.",
      name: "Yes or no",
      keystroke: "CommandOrControl+Shift+K",
    },
  ],
});