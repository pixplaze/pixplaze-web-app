<script>
  let {
    items = $bindable([]),
    listItem,
    classes
  } = $props();
</script>

<ul>
  {#each items as item}
    <li>
      <button class={`${classes}`} onclick={item.onClick}>
        <!--{item}-->
        {@render listItem(item, onClick)}
      </button>
    </li>
  {/each}
</ul>

<style>
  ul {
    background-color: white;
    border: var(--ui-size-border) solid var(--color-ui-shadow);
    /*border-top: var(--ui-size-border) solid var(--color-ui-shadow);*/
    border-top: none;
    border-bottom: none;
  }

  li {
    box-sizing: border-box;
  }

  li:first-child > button {
    border-top-color: transparent;
  }

  li:first-child > button {
    border-bottom: transparent;
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