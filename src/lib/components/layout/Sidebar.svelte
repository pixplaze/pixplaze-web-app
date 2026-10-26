<script>
  import Button from "$ui/buttons/Button.svelte";
  import Icon from "$ui/Icon.svelte";
  import {ui} from "$scripts/ui.svelte.js";
  import {navigation} from "$scripts/navigation.js";
  import {currentUser} from "$scripts/user.svelte.js";
  import {auth} from '$scripts/auth.svelte.js';
  import ItemList from "$ui/lists/ItemList.svelte";
  import ItemListRow from "$ui/lists/ItemListRow.svelte";
  import AppVersion from "$components/layout/AppVersion.svelte";

  // Реальный функционал — он уже реализован в сервисах.
  const onButtonTheme = () => ui.toggleTheme();
  const onButtonSignOut = () => {
    ui.minimize();
    auth.signOut();
  }

  const onButtonProfile = () => {
    ui.minimize();
    navigation.goToProfile();
  }

  const onButtonBids = () => {
    ui.minimize();
    navigation.goToServersBids();
  }

  const onButtonLanguage = () => ui.minimize();
  const onButtonSettings = () => ui.minimize();
  const onButtonHelp = () => ui.minimize();

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
  <ItemList>
    {#each menuItems as {item, icon, onClick}}
      <ItemListRow onselect={onClick} classes=''><Icon {icon}/>{item}</ItemListRow>
    {/each}
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
      padding: 0 var(--ui-padding) 0 var(--ui-padding);
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
