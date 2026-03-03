<script>
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";

  const {
    onButtonAside,
    onButtonConsole,
    onButtonMap,
    onButtonSearch,
    onButtonChat,
    onButtonFavorite
  } = $props();
</script>

<div class="header">
  <ButtonIcon icon="menu"
              classes="transparent"
              onclick={onButtonAside}/>
  <nav>
    <ButtonIcon icon="search"
                classes={"transparent"}
                onclick={onButtonSearch}/>
    <ButtonIcon icon="map"
                classes={"transparent"}
                onclick={onButtonMap}/>
    <ButtonIcon icon="chat"
                classes={"transparent"}
                onclick={onButtonChat}/>
    <ButtonIcon icon="console"
                classes={"transparent"}
                onclick={onButtonConsole}/>
  </nav>
  <ButtonIcon icon={"star"}
              classes="transparent"
              onclick={onButtonFavorite}/>
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    height: var(--ui-size-block);
    background-color: var(--color-ui-primary);
  }

  .header>* {
    flex: 0 0 0;
  }

  nav {
    display: flex;
  }
</style>