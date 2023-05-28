import {
  isRegistered,
  register,
  unregister,
} from "@tauri-apps/api/globalShortcut";
import { readText } from "@tauri-apps/api/clipboard";
import { state } from "../store/main";
import type { Shortcut } from "../store/main.dt";

const createAction = async (currentState, shortcut) => {
  return async () => {
    const clipboardText = (await readText())?.toString()?.trim();
    const updatedState = {
      ...currentState,
      query: clipboardText ?? "",
      messages: [{ role: "system", content: shortcut.system }],
    };
    state.update(() => updatedState);
  };
};

export const registerKeystroke = async (currentState, shortcut: Shortcut) => {
  try {
    const action = await createAction(currentState, shortcut);
    const alreadyRegistered = await isRegistered(shortcut.keystroke);
    if (!alreadyRegistered) {
      await register(shortcut.keystroke, action);
    }
  } catch (error) {
    console.error("An error occurred while registering the keystroke", error);
    // TODO: Handle the error, such as displaying an error message to the user
  }
};

export const unregisterKeystroke = async (shortcut: Shortcut) => {
  try {
    await unregister(shortcut.keystroke);
  } catch (error) {
    console.error("An error occurred while unregistering the keystroke", error);
    // TODO: Handle the error, such as displaying an error message to the user
  }
};