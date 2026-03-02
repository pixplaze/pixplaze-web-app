<script>
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";
  import {createEventDispatcher} from "svelte";
  
  const {
    onButtonAside,
    onButtonConsole,
    onButtonMap,
    onButtonSearch,
    onButtonChat
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