<script>
  import {onMount} from "svelte";

  let element = null;

  onMount(() => {
    console.log(element);
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<a href="/next">another</a>
<div class="element"
     bind:this={element}>
  <p>some text in element</p>
</div>
