<script>
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import Icon from "$lib/components/ui/Icon.svelte";
  import {ui} from "$lib/scripts/ui.svelte.js";
  import {navigation} from "$lib/scripts/navigation.js";
  import {currentUser} from "$lib/scripts/user.svelte.js";
  import {auth} from '$lib/scripts/auth.svelte.js';
  import ItemList from "$lib/components/ui/ItemList.svelte";
  import AppVersion from "$lib/components/AppVersion.svelte";

  // Реальный функционал — он уже реализован в сервисах.
  const onButtonTheme = () => ui.toggleTheme();
  const onButtonSignOut = () => {
    ui.closeAsideOnMobile();
    auth.signOut();
  }

  const onButtonProfile = () => {
    ui.closeAsideOnMobile();
    navigation.goToProfile();
  }

  const onButtonBids = () => {
    ui.closeAsideOnMobile();
    navigation.goToServersBids();
  }

  // Заглушки: функционал ещё не реализован, поэтому ничего не вызываем.
  const onButtonLanguage = () => {};
  const onButtonSettings = () => ui.closeAsideOnMobile();
  const onButtonHelp = () => ui.closeAsideOnMobile();

  const themeIcon = $derived(ui.theme === 'dark' ? 'sun' : 'moon');

  const menuItems = $derived([
    {item: currentUser.name, icon: 'profile', onClick: onButtonProfile},
    // Админ видит все заявки, остальные — свои: страница выбирает вид по роли.
    {item: 'Заявки', icon: 'plugin', onClick: onButtonBids},
    {item: 'Настройки', icon: 'settings', onClick: onButtonSettings},
    {item: 'Помощь', icon: 'question', onClick: onButtonHelp},
    {item: 'Сменить тему', icon: themeIcon, onClick: onButtonTheme},
    {item: 'Сменить язык', icon: 'translate', onClick: onButtonLanguage}
  ]);
  // Иконка темы показывает, на какую тему произойдёт переключение.
</script>

<nav class="sidebar">
  <ItemList items={menuItems} onselect={(menuItem) => menuItem.onClick()}>
    {#snippet children({item, icon})}<Icon {icon}/>{item}{/snippet}
  </ItemList>

  <AppVersion/>

  <Button classes="sidebar-button sidebar-button--danger" onclick={onButtonSignOut}>
    выйти<Icon icon="sign-out"/>
  </Button>
</nav>

<style>
  .sidebar {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 100%;
  }

  :global {
    .sidebar .item-list .icon {
      padding-right: var(--ui-padding);
    }

    .sidebar ul {
      flex: 1 1 auto;
    }

    .app-version {
      border: var(--ui-size-border) solid var(--color-ui-shadow);
      /* border-top: var(--ui-size-border) solid var(--color-ui-shadow); */
      border-top: none;
      border-bottom: none;
    }
  }
</style>
