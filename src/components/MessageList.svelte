<script lang="ts">
  import { marked } from "marked";
  import type { Message } from "src/lib/store/main.dt";

  export let messages: Message[];
</script>

<div class="text-left mt-3.5 overflow-y-auto output p-2.5">
  {#each messages as message}
    <div class="mb-2.5">
      <div class="font-bold opacity-50">
        {message.role === "bot" ? "Edgar" : "You"}:
      </div>
      {@html marked(message.content)}
    </div>
  {/each}
</div>
