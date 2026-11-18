<script>
  import Button from '#ui/buttons/Button.svelte';
  import ButtonIcon from '#ui/buttons/ButtonIcon.svelte';
  import Checkbox from '#ui/inputs/Checkbox.svelte';
  import Icon from '#ui/Icon.svelte';
  import {app} from '#scripts/app.svelte.js';
  import {pwa} from '#scripts/pwa.svelte.js';

</script>

{#if pwa.showInstallSuggestion}
  <div class="pwa-install-banner">
    <p>Установите приложение Pixplaze!</p>
    {#if !app.isAppleMobile}
      <ol>
        <li>
          Нажмите кнопку <strong>«Ещё»</strong>
          <Icon icon="more"/>
        </li>
        <li>
          Нажмите кнопку <strong>«Поделиться»</strong>
          <Icon icon="share"/>
          на нижней панели браузера.
        </li>
        <li>
          Выберите <strong>«На экран "Домой"»</strong>
          <Icon icon="plus"/>
        </li>
      </ol>
      <div class="deny">
        <Button onclick={pwa.deny}>Позже</Button>
        <Checkbox id="pwa-install-hide"
                  bind:checked={pwa.hideInstallSuggestionAgain}
        >Не показывать</Checkbox>
      </div>
    {:else}
      <div class="actions">
        <ButtonIcon icon="install"
                    onclick={pwa.install}
        >Установить</ButtonIcon>
        <div class="deny">
          <Button onclick={pwa.deny}>Позже</Button>
          <Checkbox id="pwa-install-hide"
                    bind:checked={pwa.hideInstallSuggestionAgain}
          >Не показывать</Checkbox>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .pwa-install-banner {
    /*color: #ffffff;*/
    padding: var(--ui-spacing);
    box-shadow: 4px 4px 0 var(--color-ui-shadow);
    background-color: #444444;
    border: var(--ui-size-border) solid #333333;
    z-index: 9999;
    box-sizing: border-box;
    font-family: var(--ui-font-headline), sans-serif;
    font-size: 14px;

    >*{
      padding-bottom: var(--ui-spacing);
    }

    >*:last-child {
      padding-bottom: 0;
    }
  }

  p {
    font-family: var(--ui-font-headline), sans-serif;
    font-size: 14px;
    line-height: 1.4;
    color: var(--color-text-secondary);
  }

  ol {
    padding-left: 20px;
    list-style: decimal;
    color: var(--color-text-secondary);
  }

  li {
    padding-left: var(--ui-padding);
  }

  .actions {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 8px;
  }

  .deny {
    display: flex;
    gap: 10px;
    color: var(--color-text-secondary);
    flex-wrap: wrap;
    flex: 1 0 auto;
  }

  :global {
    .pwa-install-banner {
      .deny {
        >:first-child {
          flex: 1 1 0;
          min-width: 100px;
        }
        >:last-child {
          flex: 1 0 100px;
        }
      }
    }
  }
</style>
