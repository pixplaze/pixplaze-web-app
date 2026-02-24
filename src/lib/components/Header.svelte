<script>
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";
  import {createEventDispatcher} from "svelte";
  
  const {
    onButtonAside,
    onButtonProfile,
    onButtonMap,
    onButtonGlobe,
    onButtonSettings
  } = $props();
</script>

<div class="header">
  <ButtonIcon icon="menu"
              classes="transparent"
              onclick={onButtonAside}/>
  <nav>
    <ButtonIcon icon="profile"
                classes={"transparent"}
                onclick={onButtonProfile}/>
    <ButtonIcon icon="map"
                classes="transparent"
                onclick={onButtonMap}/>
    <ButtonIcon icon="globe"
                classes="transparent"
                onclick={onButtonGlobe}/>
    <ButtonIcon icon="settings"
                classes="transparent"
                onclick={onButtonSettings}/>
  </nav>
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    height: 40px;
    background-color: var(--color-ui-primary);
  }

  nav {
    display: flex;
  }
</style>