<script>
  import {page} from '$app/state';
  import {replaceState} from "$app/navigation";
  import {currentUser} from "$lib/scripts/user.svelte.js";
  import {formatDate, parseImageBase64} from "$lib/scripts/util/utils.js";
  import {LEVEL} from "$lib/scripts/util/notice.util.js";
  import Notice from '$lib/components/ui/Notice.svelte';
  import DeviceConsent from '$lib/components/DeviceConsent.svelte';
  import BoxRow from '$lib/components/ui/BoxRow.svelte';
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";
  import OnlineIndicator from "$lib/components/ui/OnlineIndicator.svelte";
  import Delimiter from "$lib/components/ui/Delimiter.svelte";
  import ProfileForm from "$lib/components/ProfileForm.svelte";

  const userCode = page.url.searchParams.get('userCode');
  const user = $derived(currentUser.value);

  // Решение принято — убираем userCode из адреса, чтобы обновление страницы не повторяло запрос
  const onDecided = () => replaceState(page.url.pathname, {});
</script>

<div class="profile">
  <section class="profile-pane">
    <h1>Профиль</h1>
    {#if user}
      <ProfileForm {user}/>

      <label for="none">Дата регистрации</label>
      <BoxRow>
        <span>{formatDate(user.createdAt)}</span>
      </BoxRow>
    {:else}
      <Notice notice={{level: LEVEL.ERROR, message: "Не удалось загрузить данные профиля"}}/>
    {/if}
  </section>

  <section class="profile-pane">
    {#if user?.players && user?.players.length !== 0 }
      <Delimiter value="персонажи"/>
      <div class="consent-block">
        {#each user?.players as player}
          <div class="consent">
            <img src={parseImageBase64(player.skinHeadBase64)} alt="" class="consent-icon pixel-art attached">
            <p class="consent-text">
              {player.username}
            </p>
            <OnlineIndicator online={Math.random() > .8} classes="attached"/>
            <ButtonIcon title="Подробнее" icon="more" classes="consent-button attached"/>
            <ButtonIcon title="Отвязать игрока" icon="unlink" classes="consent-button attached"/>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  {#if userCode}
    <section class="profile-pane">
      <DeviceConsent {userCode} {onDecided}/>
    </section>
  {/if}
</div>

<style>
  .profile {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    padding-top: var(--ui-spacing);
  }

  .profile-pane {
    flex: 1 1 440px;
    box-sizing: border-box;
    gap: var(--ui-spacing);
  }

  :global {
    .profile-pane > h1,
    .profile-pane > div,
    .profile-pane > input {
      margin-bottom: var(--ui-spacing);
    }

    .profile-pane .ui.interactive.input.preview:disabled,
    .profile-pane .box-row {
      /*border-top-color: var(--color-ui-shadow);*/
      border-color: var(--color-ui-shadow);
    }

    .profile-pane label {
      display: block;
      /*padding-left: var(--ui-spacing);*/
      border-left: var(--ui-size-border) solid transparent;
      padding-bottom: calc(var(--ui-spacing) / 2);
    }
  }

  span {
    font-family: "Minecraft", "Arial", "sans-serif";
  }

  .consent-block {
    padding: var(--ui-padding);
    border: var(--color-text-primary) solid var(--ui-size-border);
    background-color: #444444;
    box-shadow: inset 4px 4px 0 0 var(--color-ui-shadow);
  }

  .consent-block > .consent {
    margin-bottom: var(--ui-spacing);
  }

  .consent-block > .consent:last-child {
    margin-bottom: 0;
  }

  .consent {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    color: var(--color-text-secondary);
    border: var(--ui-size-border) solid #333333;
    background-color: #666666;

    /*box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);*/
  }

  p.consent-text {
    font-family: "Minecraft", "Arial", "sans-serif";
    padding-left: var(--ui-padding);
    color: var(--color-text-secondary);
    margin-right: auto;
  }

  img.consent-icon {
    display: block;
    box-sizing: border-box;
    width: var(--ui-size-block);
    height: var(--ui-size-block);
    border: var(--ui-size-border) solid #333333;
  }

  :global {

    button.button.consent-button {
      border: var(--ui-size-border) solid #333333;
      background-color: #666666;
      box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
    }

    button.button.consent-button:hover {
      background-color: #888888;
    }

    button.button.consent-button:active {
      border-color: #666666;
      background-color: #444444;
    }
  }
</style>
