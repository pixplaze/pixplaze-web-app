<script>

  import {HoverDropdown} from "$lib/scripts/mixins/dropdown.svelte.js";

  let {
    value = $bindable(''),
    getItems,
    children
  } = $props();

  const dropdown = new HoverDropdown(200);
  let suggestions = $derived(getSuggestions(value));
  let isVisible = $derived(suggestions.length > 0 && (dropdown.isInFocus || dropdown.isMouseInside));

  function getSuggestions(value) {
    const items = getItems(value);
    const filterSuggestions = (i) => {
      i = i.toLowerCase();
      value = value.toLowerCase();
      return value.length !== 0 && i !== value && i.startsWith(value);
    };

    return items.filter(filterSuggestions);
  }

  function selectSuggestion(suggestion) {
    value = suggestion;
  }
</script>

<div class="dropdown-container">
  {@render children({action: dropdown.trigger})}
  {#if isVisible}
    <ul use:dropdown.menu>
      {#each suggestions as suggestion}
        <li>
          <button class="dropdown-item" onclick={() => selectSuggestion(suggestion)}>
            {suggestion}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .dropdown-container {
    position: relative;
    box-sizing: border-box;
  }

  ul {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: calc(var(--ui-size-block) * 4);
    overflow-y: auto;
    box-sizing: border-box;
    background-color: white;
    border: var(--ui-size-border) solid var(--color-ui-shadow);
    border-top: none;
    box-shadow: 0 var(--ui-size-shadow) 0 0 var(--color-ui-shadow);
  }

  li:first-child > button {
    border-top: none;
  }

  button {
    box-sizing: border-box;

    display: block;
    text-align: inherit;
    align-items: center;

    width: 100%;
    height: var(--ui-size-block);
    padding: 0 0 0 var(--ui-padding);

    user-select: none;
    -webkit-user-drag: none;
    cursor: pointer;

    background-color: transparent;
    border: none;
    border-top: var(--ui-size-border) solid var(--color-ui-shadow);
    border-bottom: none;
  }

  button:active {
    background-color: var(--color-ui-shadow);
    box-shadow: inset 0 4px 0 0 var(--color-ui-shadow);
    transition: .2s ease;
  }
</style>