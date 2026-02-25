<script>
  import Icon from "$lib/components/ui/Icon.svelte";

  let {
    max = 5,
    value = $bindable(0),
    onVoted = () => {}
  } = $props();

  let hover = $state(0);
  let container;
  let display = $derived(hover || value);

  function calculateFromEvent(event) {
    const rect = container.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const percent = relativeX / rect.width;

    const raw = Math.ceil(percent * max);
    return Math.min(Math.max(raw, 0), max);
  }

  const onMove = e => {
    hover = calculateFromEvent(e);
  }

  function onLeave() {
    hover = 0;
  }

  function onClick(event) {
    value = calculateFromEvent(event);
    onVoted(value);
  }

  function handleKey(event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      value = Math.min(value + 1, max);
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      value = Math.max(value - 1, 0);
    }

    if (event.key === 'Home') value = 0;
    if (event.key === 'End') value = max;
  }
</script>

<div class="rating"
     bind:this={container}
     role="slider"
     aria-label="Rating"
     aria-valuemin="0"
     aria-valuemax={max}
     aria-valuenow={value}
     tabindex="0"
     onclick={onClick}
     onmousemove={onMove}
     onmouseleave={onLeave}
     onkeydown={handleKey}
>
  {#each Array(max) as _, i}
    <Icon icons={["heart", "heart-filled"]} classes={display >= i + 1 ? "filled" : ""}/>
  {/each}
</div>

<style>
  .rating {
    display: flex;
    width: min-content;
    cursor: pointer;
  }

  :global(.rating svg.filled use:last-child) {
    opacity: 1;
  }

  :global(.rating svg.filled use:first-child) {
    opacity: 0;
  }

  :global(.rating [href$="heart-filled"]) {
    color: var(--color-red-main);
  }

  :global(.rating:hover [href$="heart-filled"]) {
    color: #EFC500;
  }
</style>
