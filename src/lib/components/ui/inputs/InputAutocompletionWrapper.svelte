<script>

  import {HoverDropdown} from "$lib/scripts/mixins/dropdown.svelte.js";
  import ItemList from "$lib/components/ui/ItemList.svelte";

  let {
    value = $bindable(''),
    getSuggestions,
    children
  } = $props();

  const dropdown = new HoverDropdown(0);
  let suggestions = $derived(
    getSuggestions(value).map(suggestion => ({
      item: suggestion,
      onClick: () => selectSuggestion(suggestion)
    }))
  );
  let isVisible = $derived(suggestions.length > 0 && (dropdown.isInFocus || dropdown.isMouseInside));

  function selectSuggestion(suggestion) {
    value = suggestion;
  }
</script>

<div class="dropdown-container">
  {@render children({action: dropdown.trigger})}
  {#if isVisible}
    <div use:dropdown.menu class="dropdown-inner">
      <ItemList items={suggestions} classes="dropdown-item" onClick={(menuItem) => menuItem.onClick()}>
        {#snippet listItem({item: suggestion, onClick})}
          {suggestion}
        {/snippet}
      </ItemList>
    </div>
  {/if}
</div>

<style>
  .dropdown-container {
    position: relative;
    box-sizing: border-box;
  }

  .dropdown-inner {
    position: absolute;
    z-index: 2;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: calc(var(--ui-size-block) * 4);
    overflow-y: auto;
    box-sizing: border-box;
    background-color: white;
    box-shadow: 0 var(--ui-size-shadow) 0 0 var(--color-ui-shadow);
  }
</style>