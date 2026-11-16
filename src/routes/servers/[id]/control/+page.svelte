<script>
  import {page} from '$app/state';
  import ButtonIcon from '#ui/buttons/ButtonIcon.svelte';
  import ButtonSwitcher from '#ui/buttons/ButtonSwitcher.svelte';
  import Clipboard from '#ui/Clipboard.svelte';
  import {goto} from "$app/navigation";
  import Button from "#ui/buttons/Button.svelte";
  import {pluginTokens} from "#scripts/pluginTokens.svelte.js";

  const serverId = page.params.id;
  let mode = $state(page.url.searchParams.get('mode') || 'players');
  let pluginToken = $state(null);

  $effect(() => {
    const newUrl = new URL(page.url);
    newUrl.searchParams.set('mode', mode);
    goto(newUrl, {
      shallow: true,
      replace: true,
      reset: false
    });
  })

  async function requestAndSetToken(serverId) {
    pluginToken = (await pluginTokens.get(serverId)).accessToken;
  }
</script>

<section>
  <h1>Управление сервером #{serverId}</h1>
  <ButtonSwitcher bind:mode>
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

  <h3>Токен API сервера</h3>
  <Clipboard bind:value={pluginToken} hidden={false}/>
  <Button onclick={async () => requestAndSetToken(serverId)}>Запросить</Button>

  {#if (mode === 'players')}
    <h2>PLAYERS</h2>
  {:else if (mode === 'reports')}
    <h2>REPORTS</h2>
  {:else}
    <h2>CONSOLE</h2>
  {/if}
</section>