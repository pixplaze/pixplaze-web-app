<script>
  import {MediaQuery} from 'svelte/reactivity';
  import EyePlayerList from '$components/eye/EyePlayerList.svelte';
  import EyeDossier from '$components/eye/EyeDossier.svelte';
  import {eyeFor} from '$scripts/eye/eye.svelte.js';
  import {currentUser} from '$scripts/user.svelte.js';

  /**
   * «Око Саурона»: досье игроков сервера слева, выбранное досье с журналом — справа.
   * На телефоне — по одному экрану: список, затем досье с кнопкой «назад».
   * Состояние общее с вкладкой «Жалобы» панели (eyeFor); источник пока демонстрационный — см. eye.source.js.
   */
  let {serverId} = $props();

  // svelte-ignore state_referenced_locally
  const eye = eyeFor(serverId, currentUser.value?.name ?? 'модератор');
  const narrow = new MediaQuery('max-width: 800px');

  $effect(() => {
    eye.ensureLoaded();
  });
</script>

<div class="eye" class:narrow={narrow.current}>
  <div class="eye-grid">
    {#if !narrow.current || !eye.showDossier}
      <aside class="eye-players">
        <EyePlayerList {eye} onSelect={(uuid) => eye.openPlayer(uuid)}/>
      </aside>
    {/if}
    {#if !narrow.current || eye.showDossier}
      <div class="eye-dossier">
        <EyeDossier {eye} onBack={narrow.current ? () => eye.showDossier = false : null}/>
      </div>
    {/if}
  </div>
</div>
<style>
  .eye {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-family: var(--font-ui);
  }


  .eye-grid {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }

  /* Список прилипает к верху экрана, пока прокручивается длинный журнал */
  .eye-players {
    position: sticky;
    top: calc(var(--ui-header-height) + 12px);
    display: flex;
    max-height: calc(100dvh - var(--ui-header-height) - 160px);
    min-height: 0;

    :global(.player-list) {
      flex: 1;
    }
  }

  .narrow .eye-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .narrow .eye-players {
    position: static;
    max-height: none;
  }
</style>
