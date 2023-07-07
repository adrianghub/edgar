<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { loadState, state } from "./lib/store/main";
  import type { ChatState } from "./lib/store/main.dt";

  import ChatInput from "./components/ChatInput.svelte";
  import MessageList from "./components/MessageList.svelte";
  import ShortcutList from "./components/ShortcutList.svelte";
  import { unregisterAll } from "@tauri-apps/api/globalShortcut";
  import { sendQuery } from "./lib/functions/chat";
  import {
    registerKeystroke,
    unregisterKeystroke,
  } from "./lib/functions/shortcuts";

  let currentState: ChatState;

  const sendShortcut = async (event) => {
    if (event.key === "Enter" && event.metaKey) {
      await sendQuery(currentState);
    }
  };

  const unsubscribe = state.subscribe((current) => {
    currentState = {
      ...current,
      messages: [...current.messages],
      shortcuts: [...current.shortcuts],
    };
  });

  onMount(async () => {
    await loadState(state);

    await unregisterAll();

    currentState.shortcuts.forEach((shortcut) => {
      registerKeystroke(currentState, shortcut);
    });
  });

  onDestroy(() => {
    unsubscribe();
    currentState.shortcuts.forEach((shortcut) => {
      unregisterKeystroke(shortcut);
    });
  });

  document.addEventListener("keydown", sendShortcut);
</script>

<main>
  <div class="text-center text-zinc-200 p-8">
    <div class="flex flex-col">
      <h1 class="text-zinc-200 flex font-bold justify-end mb-4 text-2xl">
        Edgar
      </h1>

      <ChatInput {currentState} />

      <MessageList bind:messages={currentState.messages} />
    </div>

    <ShortcutList {currentState} />
  </div>
</main>
