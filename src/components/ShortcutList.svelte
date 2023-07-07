<script lang="ts">
  import { sendQuery } from "../lib/functions/chat";
  import type { ChatState } from "../lib/store/main.dt";

  export let currentState: ChatState;
</script>

<ul class="text-white overflow-y-auto p-2.5">
  {#each currentState.shortcuts as shortcut (shortcut.id)}
    <li class="mb-2">
      <div
        class="flex items-center justify-between p-2 bg-gray-800 rounded-md shadow hover:bg-gray-700 cursor-pointer"
        on:click={() => sendQuery(currentState, shortcut.type)}
        on:keydown={(event) => {
          if (event.key === "Enter") {
            sendQuery(currentState, shortcut.type);
          }
        }}
      >
        <span class="font-bold text-gray-200 mr-4">{shortcut.name}</span>
        <span class="text-gray-400 font-bold">{shortcut.keystroke}</span>
      </div>
    </li>
  {/each}
</ul>
