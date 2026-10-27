<script>
  import {page} from '$app/state';
  import {replaceState} from "$app/navigation";
  import {currentUser} from "$scripts/user.svelte.js";
  import {formatDate} from "$util/format.util.js";
  import {LEVEL} from "$util/notice.util.js";
  import Notice from '$ui/Notice.svelte';
  import DeviceConsent from '$components/auth/DeviceConsent.svelte';
  import BoxRow from '$ui/lists/BoxRow.svelte';
  import ProfileForm from "$components/profile/ProfileForm.svelte";
  import ProfilePlayers from "$components/profile/ProfilePlayers.svelte";
  import FriendsPanel from "$components/friends/FriendsPanel.svelte";
  import Checkbox from "$ui/inputs/Checkbox.svelte";
  import {profilesApi} from "$api/profiles.api.js";
  import {notifications} from "$scripts/notifications.svelte.js";

  const userCode = page.url.searchParams.get('userCode');
  const user = $derived(currentUser.value);

  // Решение принято — убираем userCode из адреса, чтобы обновление страницы не повторяло запрос
  const onDecided = () => replaceState(page.url.pathname, {});

  /** Настройка «скрывать мой онлайн»: сохраняется сразу при переключении. */
  let onlineHidden = $state(false);
  $effect(() => {
    onlineHidden = !!user?.isOnlineHidden;
  });

  async function setOnlineHidden(hidden) {
    try {
      await profilesApi.update(user.id, {isOnlineHidden: hidden});
      notifications.info(hidden ? 'Друзья не видят ваш онлайн' : 'Друзья видят ваш онлайн');
    } catch (error) {
      onlineHidden = !hidden;
      notifications.error(`Не удалось сохранить настройку: ${error.message}`);
    }
  }
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

      <Checkbox id="online-hidden" bind:checked={() => onlineHidden, (hidden) => {
        onlineHidden = hidden;
        setOnlineHidden(hidden);
      }}>
        <span>Скрывать мой онлайн от друзей</span>
      </Checkbox>
    {:else}
      <Notice notice={{level: LEVEL.ERROR, message: "Не удалось загрузить данные профиля"}}/>
    {/if}
  </section>

  <section class="profile-pane">
    {#if user?.id}
      {#key user.id}
        <ProfilePlayers profileId={user.id}/>
        <FriendsPanel profileId={user.id}/>
      {/key}
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
</style>
