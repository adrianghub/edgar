<script lang="ts">
  import type { ChatState } from "src/lib/store/main.dt";
  import { sendQuery } from "../lib/functions/chat";
  import Button from "./Button.svelte";
  import { state } from "../lib/store/main";

  export let currentState: ChatState;

  const updateQuery = (event) => {
    state.update((state) => {
      state.query = event.target.value;
      return state;
    });
  };

  const clearMessages = async () => {
    state.update((state) => {
      state.query = "";
      state.messages = [];
      return state;
    });
  };
</script>

<div class="flex flex-col gap-3.5">
  <textarea
    on:input={updateQuery}
    value={currentState.query}
    placeholder="Ask me anything..."
    class="bg-slate-900 text-zinc-200 p-3.5 rounded-md"
    name="prompt"
    rows="3"
  />

  <div class="text-left mt-3.5 overflow-y-auto output p-2.5">
    {#if currentState.typing}
      <span class="typing-dots">...</span>
    {/if}

    <div class="flex justify-end">
      <div class="flex gap-3">
        <Button
          text="Ask"
          disabled={currentState.query === ""}
          onClick={() => sendQuery(currentState)}
        />

        <Button
          text="Clear History"
          disabled={currentState.query === ""}
          onClick={() => clearMessages()}
        />
      </div>
    </div>
  </div>
</div>

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
