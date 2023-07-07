import { readText } from "@tauri-apps/api/clipboard";
import {
  isRegistered,
  register,
  unregister,
} from "@tauri-apps/api/globalShortcut";
import { state } from "../store/main";
import type { ChatState, Shortcut } from "../store/main.dt";

const createAction = async (currentState: ChatState, shortcut: Shortcut) => {
  return async () => {
    const clipboardText = (await readText())?.toString()?.trim();
    const updatedState = {
      ...currentState,
      query: clipboardText ?? "",
      type: shortcut.type,
      group: shortcut.group,
    };
    state.update(() => updatedState);
  };
};

export const registerKeystroke = async (
  currentState: ChatState,
  shortcut: Shortcut
) => {
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
