<script>
  import SquareButton from "$lib/ui/SquareButton.svelte";
  import {createEventDispatcher} from "svelte";

  const dispatch = createEventDispatcher();
</script>

<div class="header">
  <SquareButton icon="menu" transparent on:click={() => dispatch('aside')}/>
  <nav>
    <SquareButton icon="profile" on:click={() => dispatch('profile')}/>
    <SquareButton icon="map" on:click={() => dispatch('map')}/>
    <SquareButton icon="globe" on:click={() => dispatch('globe')}/>
    <SquareButton icon="settings" on:click={() => dispatch('settings')}/>
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