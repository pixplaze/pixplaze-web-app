<script>
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import Icon from "$lib/components/ui/Icon.svelte";
  import {pageService} from "$lib/scripts/service/page.service.js";
  import {userService} from "$lib/scripts/service/user.service.js";
  import ItemList from "$lib/components/ui/ItemList.svelte";

  // Реальный функционал — он уже реализован в сервисах.
  const onButtonTheme = () => pageService.toggleTheme();
  const onButtonSignOut = () => userService.signOut();

  // Заглушки: функционал ещё не реализован, поэтому ничего не вызываем.
  const onButtonProfile = () => {};
  const onButtonLanguage = () => {};
  const onButtonSettings = () => {};
  const onButtonHelp = () => {};

  const themeIcon = $derived(pageService.currentTheme === 'dark' ? 'sun' : 'moon');

  const menuItems = $derived([
    {item: userService.username, icon: 'profile', oœnClick: onButtonProfile},
    {item: 'Настройки', icon: 'settings', onClick: onButtonSettings},
    {item: 'Помощь', icon: 'question', onClick: onButtonHelp},
    {item: 'Сменить тему', icon: themeIcon, onClick: onButtonTheme},
    {item: 'Сменить язык', icon: 'translate', onClick: onButtonLanguage}
  ]);
  // Иконка темы показывает, на какую тему произойдёт переключение.
</script>

<nav class="sidebar">
<!--  <Button onclick={onButtonProfile}>-->
<!--    <Icon icon="profile"/><span>Профиль</span>-->
<!--  </Button>-->

<!--  <Button classes="sidebar-button" onclick={onButtonTheme}>-->
<!--    <Icon icon={themeIcon}/><span>Сменить тему</span>-->
<!--  </Button>-->

<!--  <Button classes="sidebar-button" onclick={onButtonLanguage}>-->
<!--    <Icon icon="translate"/><span>Язык</span>-->
<!--  </Button>-->

<!--  <Button classes="sidebar-button" onclick={onButtonSettings}>-->
<!--    <Icon icon="settings"/><span>Настройки</span>-->
<!--  </Button>-->

<!--  <Button classes="sidebar-button" onclick={onButtonHelp}>-->
<!--    <Icon icon="question"/><span>Помощь</span>-->
<!--  </Button>-->

  <ItemList items={menuItems} onClick={(menuItem) => menuItem.onClick()}>
    {#snippet listItem({item, icon, onClick})}
      <Icon {icon}/>{item}
    {/snippet}
  </ItemList>

<!--  <div class="sidebar-spacer"></div>-->

  <Button classes="sidebar-button sidebar-button--danger" onclick={onButtonSignOut}>
    <Icon icon="close"/>Выйти
  </Button>
</nav>

<style>
  .sidebar {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--ui-spacing);

    width: 100%;
    height: 100%;
  }

  :global {
    .sidebar .icon {
      padding-right: var(--ui-padding);
    }
  }

  /* Кнопка-разделитель прижимает «Выйти» к низу панели. */
  .sidebar-spacer {
    flex: 1 1 auto;
  }

  :global {
  }
</style>
