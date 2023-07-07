<script lang="ts">
  export let text: string;
  export let disabled = false;
  export let onClick: () => void;
</script>

<button
  class="rounded-md px-3 bg-violet-600 hover:bg-violet-800 active:bg-violet-900 text-zinc-100 py-2 uppercase text-sm font-bold flex ml-auto cursor-pointer disabled:bg-slate-700 disabled:text-slate-400"
  on:click={onClick}
  disabled={disabled}
>
  {text}
</button>
