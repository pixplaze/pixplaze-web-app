<script>
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import {authService} from '$lib/scripts/service/auth.service.js';
  import {replaceState} from "$app/navigation";
  import {userService} from "$lib/scripts/service/user.service.js";
  import {formatDate, parseImageBase64} from "$lib/scripts/util/utils.js";
  import {LEVEL} from "$lib/scripts/util/notice.util.js";
  import Notice from '$lib/components/ui/Notice.svelte';
  import DeviceConsent from '$lib/components/DeviceConsent.svelte';
  import BoxRow from '../../lib/components/ui/BoxRow.svelte';
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";
  import OnlineIndicator from "$lib/components/ui/OnlineIndicator.svelte";
  import ButtonGroup from "$lib/components/ui/buttons/ButtonGroup.svelte";
  import Delimiter from "$lib/components/ui/Delimiter.svelte";
  import Checkbox from "$lib/components/ui/inputs/Checkbox.svelte";
  import Radio from "$lib/components/ui/inputs/Radio.svelte";
  import ProfileForm from "$lib/components/ProfileForm.svelte";

  const userCode = page.url.searchParams.get('userCode');
  const consent = authService.createDeviceConsent();
  const showDeviceConsent = $derived(!!consent.info);
  const user = $derived(userService.user);

  let radioChoice = $state('email_val');

  onMount(() => consent.resolveConsent(userCode));

  const onAllow = async () => {
    await consent.decideConsent(true);
    replaceState(page.url.pathname, {});
  };
  const onDeny = async () => {
    await consent.decideConsent(false);
    replaceState(page.url.pathname, {});
  };

  // Баннер статуса подтверждения (когда панель согласия ещё/уже не показывается).
  const deviceNotices = $derived.by(() => {
    if (showDeviceConsent) {
      return [];
    }
    if (consent.failed) {
      return [{level: 'error', message: 'Не удалось подтвердить вход устройства. Попробуйте снова.'}];
    }
    if (consent.busy) {
      return [{level: 'info', message: 'Подтверждаем вход устройства…'}];
    }
    if (consent.done === 'approved') {
      return [{level: 'info', message: 'Вход устройства подтверждён — вернитесь к устройству.'}];
    }
    if (consent.done === 'denied') {
      return [{level: 'warning', message: 'Вход устройства отклонён.'}];
    }
    return [];
  });
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
<!--      <Checkbox>Чекбокс, какойта</Checkbox>-->
<!--      <form>-->
<!--        <p>Please select your preferred contact method:</p>-->

<!--        <Radio id="email" bind:group={radioChoice} value="email_val">Email</Radio>-->
<!--        <Radio id="phone" bind:group={radioChoice} value="phone_val">Телефон</Radio>-->
<!--        <Radio id="mail" bind:group={radioChoice} value="mail_val">Почта</Radio>-->
<!--      </form>-->
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
            <img src={parseImageBase64(player.skinHeadBase64)} alt="" class="consent-icon pixel-art">
            <p class="consent-text">
              {player.username}
            </p>
            <ButtonGroup classes="consent-buttons">
              <OnlineIndicator online={Math.random() > .8}/>
              <ButtonIcon title="Подробнее" icon="more" classes="consent-button"/>
              <ButtonIcon title="Отвязать игрока" icon="unlink" classes="consent-button"/>
            </ButtonGroup>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  {#if deviceNotices.length}
    <section class="profile-pane">
      <Notice notices={deviceNotices} closeable={false} classes="content-box"/>
    </section>
  {/if}

  {#if showDeviceConsent}
    <section class="profile-pane">
      <DeviceConsent info={consent.info}
                     busy={consent.busy}
                     done={consent.done}
                     failed={consent.failed}
                     {onAllow}
                     {onDeny}/>
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
      display: block;
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
  }

  img.consent-icon {
    display: block;
    box-sizing: border-box;
    width: var(--ui-size-block);
    height: var(--ui-size-block);
    border: var(--ui-size-border) solid #333333;
  }

  :global {
    .consent {
      .consent-buttons {
        /*margin: calc(-1 * var(--ui-size-border));*/
        margin-left: auto;
        right: 0;

        > button.button,
        svg.icon {
          margin-top: calc(-1 * var(--ui-size-border));
          margin-bottom: calc(-1 * var(--ui-size-border));

          user-select: none;
          -webkit-user-drag: none;
        }
      }

      .consent-icon {
        margin-left: calc(-1 * var(--ui-size-border));
        margin-top: calc(-1 * var(--ui-size-border));
        margin-bottom: calc(-1 * var(--ui-size-border));
      }
    }

    button.button.consent-button {
      border: var(--ui-size-border) solid #333333;
      background-color: #666666;
      /*background-color: transparent;*/
      box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
      /*box-shadow: var(--ui-size-shadow);*/
    }

    button.button.consent-button:first-child {
      /*margin-right: -2px;*/
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
