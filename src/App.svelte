<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { ChatState, Model } from "./lib/store/main.dt";
  import {
    defaultSystemPrompt,
    loadState,
    saveState,
    state,
  } from "./lib/store/main";
  import { ask } from "./lib/functions/chat";
  import {
    registerKeystroke,
    unregisterKeystroke,
  } from "./lib/functions/shortcuts";
  import { unregisterAll } from "@tauri-apps/api/globalShortcut";
  import { marked } from "marked";
  import { models } from "./constants";
  import { decryptKey, encryptKey } from "./lib/functions/secure-keys";

  let apikey = "";
  let currentState: ChatState;
  let selectedModel = "gpt-3.5-turbo";

  const handleModelChange = (event) => {
    selectedModel = event.target.value;
    state.update((state) => {
      state.model = selectedModel as Model;
      return state;
    });
  };

  const sendShortcut = async (event) => {
    if (event.key === "Enter" && event.metaKey) {
      await ask(currentState);
    }
  };

  const clearMessages = async () => {
    state.update((state) => {
      state.query = "";
      state.messages = [{ role: "system", content: defaultSystemPrompt }];
      return state;
    });
  };

  const unsubscribe = state.subscribe((current) => {
    currentState = {
      ...current,
      messages: [...current.messages],
      shortcuts: [...current.shortcuts],
    };
    apikey = current.apikey;
  });

  const updateQuery = (event) => {
    state.update((state) => {
      state.query = event.target.value;
      return state;
    });
  };

  const updateApiKey = async (event) => {
    const encryptedKey = encryptKey(event.target.value);
    state.update((state) => {
      state.apikey = encryptedKey;
      return state;
    });
    await saveState({ apikey: encryptedKey });
  };

  onMount(async () => {
    await loadState(state);

    await unregisterAll();

    currentState.apikey = decryptKey(currentState.apikey);

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
      <div class="text-zinc-200 flex text-lg font-bold justify-end">Edgar</div>

      <div class="flex flex-col gap-3.5">
        <div class="flex gap-3">
          <input
            placeholder="OpenAI API Key"
            class="apikey bg-slate-900 text-zinc-200 p-3.5"
            type="text"
            on:blur={updateApiKey}
            bind:value={apikey}
            autocomplete="off"
          />

          <select
            class="model-select bg-slate-900 text-zinc-200 p-3.5"
            bind:value={selectedModel}
            on:change={handleModelChange}
          >
            {#each models as model}
              <option value={model}>{model}</option>
            {/each}
          </select>
        </div>

        <textarea
          on:change={updateQuery}
          bind:value={currentState.query}
          placeholder="Ask me anything..."
          class="bg-slate-900 text-zinc-200 p-3.5"
          name="prompt"
          rows="3"
        />

        <div class="text-left mt-3.5 overflow-y-auto output p-2.5">
          {#if currentState.typing}
            <span class="typing-dots">...</span>
          {/if}

          <div class="flex justify-end">
            <div class="flex gap-3">
              <button
                on:click={() => clearMessages()}
                disabled={currentState.query === ""}
                class="rounded-md px-3 bg-violet-600 hover:bg-violet-800 active:bg-violet-900 text-zinc-100 py-2 uppercase text-sm font-bold flex ml-auto"
              >
                <span class="ml-2">Clear History</span>
              </button>

              <button
                on:click={() => ask(currentState)}
                disabled={currentState.query === ""}
                class="rounded-md px-3 bg-violet-600 hover:bg-violet-800 active:bg-violet-900 text-zinc-100 py-2 uppercase text-sm font-bold flex ml-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  fill="#fff"
                  style="width: 20px; height: 18px; margin-top: 1px"
                >
                  <path
                    d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4l-448 256zm52.1 25.5L409.7 90.6 190.1 336l1.2 1L68.2 285.7zM403.3 425.4L236.7 355.9 450.8 116.6 403.3 425.4z"
                  />
                </svg>
                <span class="ml-2">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="text-left mt-3.5 overflow-y-auto output p-2.5">
        {#each currentState.messages as message}
          <div class="mb-2.5">
            {#if message.role === "system"}
              <span class="opacity-50"
                >system ({currentState.model}): {message.content}</span
              >
            {:else}
              <div class="font-bold opacity-50">
                {message.role === "assistant" ? "Edgar" : "You"}:
              </div>
              {@html marked(message.content)}
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Display registered shortcuts -->
    <h2>Shortcuts</h2>
    <ul class="text-left mt-3.5 overflow-y-auto bg-gray-900 p-2.5 text-white">
      {#each currentState.shortcuts as shortcut (shortcut.id)}
        <li class="mb-2 text-lg">{shortcut.name} - {shortcut.keystroke}</li>
      {/each}
    </ul>
  </div>
</main>

<style>
  @keyframes typing {
    0%,
    20%,
    80%,
    100% {
      opacity: 1;
    }
    40%,
    60% {
      opacity: 0.3;
    }
  }

  .typing-dots {
    color: white;
    font-size: 32px;
    animation: typing 1.4s infinite;
  }
</style>
