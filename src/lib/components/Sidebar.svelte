<script>
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import Icon from "$lib/components/ui/Icon.svelte";
  import {pageService} from "$lib/scripts/service/page.service.js";
  import {userService} from "$lib/scripts/service/user.service.js";
  import ItemList from "$lib/components/ui/ItemList.svelte";

  // Реальный функционал — он уже реализован в сервисах.
  const onButtonTheme = () => pageService.toggleTheme();
  const onButtonSignOut = () => userService.signOut();

  const onButtonProfile = () => pageService.goToProfile();

  // Заглушки: функционал ещё не реализован, поэтому ничего не вызываем.
  const onButtonLanguage = () => {};
  const onButtonSettings = () => {};
  const onButtonHelp = () => {};

  const themeIcon = $derived(pageService.currentTheme === 'dark' ? 'sun' : 'moon');

  const menuItems = $derived([
    {item: userService.username, icon: 'profile', onClick: onButtonProfile},
    {item: 'Настройки', icon: 'settings', onClick: onButtonSettings},
    {item: 'Помощь', icon: 'question', onClick: onButtonHelp},
    {item: 'Сменить тему', icon: themeIcon, onClick: onButtonTheme},
    {item: 'Сменить язык', icon: 'translate', onClick: onButtonLanguage}
  ]);
  // Иконка темы показывает, на какую тему произойдёт переключение.
</script>

<nav class="sidebar">
  <ItemList items={menuItems} onClick={(menuItem) => menuItem.onClick()}>
    {#snippet listItem({item, icon, onClick})}
      <Icon {icon}/>{item}
    {/snippet}
  </ItemList>

  <Button classes="sidebar-button sidebar-button--danger" onclick={onButtonSignOut}>
    <Icon icon="close"/>Выйти
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
    .sidebar .icon {
      padding-right: var(--ui-padding);
    }

    .sidebar ul {
      flex: 1 1 auto;
    }
  }
</style>
