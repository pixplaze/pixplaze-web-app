<script>
  import {page} from '$app/state';
  import ButtonIcon from '$ui/buttons/ButtonIcon.svelte';
  import ButtonSwitcher from '$ui/buttons/ButtonSwitcher.svelte';
  import Clipboard from '$ui/Clipboard.svelte';
  import {goto} from "$app/navigation";

  const serverId = page.params.id;
  const mode = $derived(page.url.searchParams.get('mode') || 'players');

  function nextMode(mode) {
    page.url.searchParams.set('mode', mode);
    return goto(page.url, {
      replaceState: true,
      noScroll: true,
      keepFocus: true
    });
  }
</script>

<section>
  <h1>Управление сервером #{serverId}</h1>
  <ButtonSwitcher {mode} onSwitch={nextMode}>
    <ButtonIcon title="Игроки"
                data-id="players"
                icon="people">Игроки</ButtonIcon>
    <ButtonIcon title="Игроки"
                icon="flag"
                data-id="reports"
    >Жалобы</ButtonIcon>
    <ButtonIcon title="Консоль"
                icon="console"
                data-id="console"
    >Консоль</ButtonIcon>
  </ButtonSwitcher>

  <Clipboard value="TESTCODE" hidden={true}/>

  {#if (mode === 'players')}
    <h2>PLAYERS</h2>
  {:else if (mode === 'reports')}
    <h2>REPORTS</h2>
  {:else}
    <h2>CONSOLE</h2>
  {/if}
</section>