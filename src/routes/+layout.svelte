<script>
  import {ui} from "$scripts/ui.svelte.js";
  import {navigation} from "$scripts/navigation.js";
  import {auth} from '$scripts/auth.svelte.js';
  import {onMount} from "svelte";
  import {page} from "$app/state";
  import {ROUTES} from "$scripts/routes.js";
  import Header from "$components/layout/Header.svelte";
  import FavoriteServerList from "$components/servers/FavoriteServerList.svelte";
  import Sidebar from "$components/layout/Sidebar.svelte";
  import Backdrop from "$ui/Backdrop.svelte";
  import AppNotifications from "$components/layout/AppNotifications.svelte";
  import '$lib/style/global.css';

  const {children} = $props();

  /** Страницы на весь экран без хедера (чат, карта): без подложки и футера, иначе под ними остаётся прокрутка. */
  const FULLSCREEN_ROUTES = [ROUTES.serversChat, ROUTES.serversMap];
  const fullscreen = $derived(FULLSCREEN_ROUTES.includes(page.url.pathname));

  const onButtonAside = () => ui.toggleAside();
  const onButtonConsole = () => {
    ui.minimize();
    navigation.goToServersConsole()
  };
  const onButtonMap = () => {
    ui.minimize();
    navigation.goToServersMap();
  }
  const onButtonSearch = () => {
    ui.minimize();
    navigation.goToServersList();
  }
  const onButtonChat = () => {
    ui.minimize();
    navigation.goToServersChat();
  }
  const onButtonFavorite = () => ui.toggleFavorites();

  const onButtonProfile = () => {}
  const onButtonLanguage = () => {}
  const onButtonSettings = () => {}
  const onButtonHelp = () => {}

  /*
    Реактивный guard: один на всё приложение. Срабатывает только когда нет валидного
    токена (accessToken пуст) и мы не на странице авторизации. Успешный refresh меняет
    токен old → new, не обнуляя его, поэтому ротация редирект не вызывает.
  */
  $effect(() => {
    navigation.enforceAuth(page.url.pathname, page.url.search);
  });

  onMount(() => {
    // fetch(`${env.PUBLIC_PIXPLAZE_WEB_API_URL}/servers`)
    //     .then(res => res.json())
    //     .then(res => console.log(res))
    //     .catch(err => {
    //       if (err) {
    //         throw error(500, err);
    //       }
    //     });
  });
</script>

<div id="layout" class={`container themed ${ui.theme}`} class:fullscreen>
  <header>
    <Header {onButtonAside}
            {onButtonConsole}
            {onButtonMap}
            {onButtonSearch}
            {onButtonChat}
            {onButtonFavorite}
            showFavorite={auth.isAuthenticated}
    />
    {#if auth.isAuthenticated}
      <div class="favorite-servers-menu debug">
        <div class="favorite-servers" class:expanded={ui.isFavoritesExpanded}>
          <FavoriteServerList expanded={ui.isFavoritesExpanded}/>
        </div>
      </div>
    {/if}
    <AppNotifications/>
  </header>
  <aside class:expanded={ui.isAsideExpanded} class="debug">
    <div class="aside-host">
      <Sidebar {onButtonProfile}
               {onButtonLanguage}
               {onButtonSettings}
               {onButtonHelp}/>
    </div>
  </aside>
  <main>
    {@render children()}
    {#if !fullscreen}
      <Backdrop classes="page-backdrop"/>
    {/if}
  </main>
  {#if !fullscreen}
    <footer></footer>
  {/if}
</div>

<style>
  /*
    Прокручивается окно (а не внутренний контейнер): так SvelteKit сам восстанавливает
    позицию при навигации, а на iOS работают сворачивание адресной строки и тап по статус-бару.
    Header и aside не прокручиваются за счёт sticky.
  */
  #layout {
    min-height: 100dvh;
    display: grid;
    /* minmax(0, 1fr), а не 1fr (= minmax(auto, 1fr)): колонка main не растягивается
       по ширине содержимого и не выталкивает страницу за окно при открытой панели */
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: auto 1fr auto;

    grid-template-areas: 'header header'
                         'aside  main'
                         'footer footer';

    background-color: var(--color-ui-foreground);
  }

  /* sticky, а не fixed: header остаётся в гриде и сам занимает место — без компенсирующих padding */
  header {
    position: sticky;
    top: 0;

    z-index: 2;

    min-height: var(--ui-size-block);
    background-color: #42A021;
    grid-area: header;
  }

  .favorite-servers-menu {
    overflow: hidden;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: calc(10 * var(--ui-size-block));

    padding: 0 0 var(--ui-size-shadow);
    margin: 0 0 calc(-1 * var(--ui-size-shadow));
  }

  .favorite-servers {
    /*position: fixed;*/
    /*z-index: -1;*/
    /*top: var(--ui-size-block);*/
    /*bottom: auto;*/
    width: 100%;
    max-height: calc(10 * var(--ui-size-block));

    overflow-y: auto;
    background-color: var(--color-ui-secondary);
    box-shadow: 0 var(--ui-size-shadow) 0 0 var(--color-ui-shadow);

    will-change: transform;
  }

  .favorite-servers {
    display: none;
  }

  .favorite-servers.expanded {
    animation: favorite-servers-animation .2s;
    display: block;
  }

  @keyframes favorite-servers-animation {
    0% {opacity: 0; transform: translateY(-100%) }
    0% {opacity: 0 }
    100% {opacity: 100%; transform: translateY(0) }
  }

  /*
    Десктоп — «push»: aside делит грид с main. Анимируем ширину 0 → 300px,
    что сдвигает и сжимает main вправо. Сам контент (.aside-host) фиксированной
    ширины и выезжает через transform (композитор) — не сжимается и не искажается.

    sticky + height: панель ровно в высоту экрана минус хедер и НЕ скроллится со
    страницей. sticky оставляет aside в потоке грид-колонкой, поэтому push сохраняется
    (в отличие от position: fixed, который бы схлопнул колонку).
  */
  aside {
    grid-area: aside;
    position: sticky;
    top: var(--ui-size-block);
    align-self: start;
    height: calc(100dvh - var(--ui-size-block));

    overflow: hidden;
    width: 0;
    will-change: width;
    transition: width .3s ease;
  }

  aside.expanded {
    width: 300px;
  }

  .aside-host {
    width: 300px;
    height: 100%;
    overflow-y: auto;
    /* прокрутка панели не перетекает на страницу */
    overscroll-behavior: contain;

    background-color: var(--color-ui-foreground);

    transform: translateX(-100%);
    will-change: transform;
    transition: transform .3s ease;
  }

  aside.expanded .aside-host {
    transform: translateX(0);
  }

  main {
    grid-area: main;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow-x: clip;
    /*touch-action: pan-y;*/
  }

  :global(.page-backdrop) {
    margin-top: auto;
    position: relative;
    z-index: 1;
    margin-bottom: -160px;
    transform: translateY(-1px);
  }

  footer {
    min-height: 200px;
    content: "";
    background-color: #444444;
    grid-area: footer;
    padding-top: 160px;
  }

  :global {
    /*
      overflow-x только на html и clip, а не hidden: hidden на body сделал бы body
      отдельным контейнером прокрутки, и window.scrollY (а с ним восстановление
      прокрутки SvelteKit) перестал бы работать.
      scrollbar-gutter: место под полосу прокрутки зарезервировано — контент не прыгает.
    */
    html {
      overflow-x: clip;
      overscroll-behavior-x: none;
      scrollbar-gutter: stable;
    }

    /* Полноэкранные страницы ровно в высоту экрана: прокрутка и пустой жёлоб под неё не нужны */
    html:has(#layout.fullscreen) {
      overflow: hidden;
      scrollbar-gutter: auto;
    }

    section {
      padding-left: 30px;
      padding-right: 30px;
    }
  }

  @media screen and (max-width: 440px) {
    /* aside здесь fixed и в грид не входит; header — последней строкой, залипает снизу */
    #layout {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: 1fr auto auto;
      grid-template-areas: 'main'
                           'footer'
                           'header';
    }

    header {
      top: auto;
      bottom: 0;
    }

    .favorite-servers-menu {
      top: auto;
      bottom: 100%;

      padding: var(--ui-size-shadow) 0 0;
      margin: calc(-1 * var(--ui-size-shadow)) 0 0;
    }

    .favorite-servers {
      box-shadow: 0 calc(-1 *var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
    }

    @keyframes favorite-servers-animation {
      0% {opacity: 0; transform: translateY(100%) }
      0% {opacity: 0 }
      100% {opacity: 100%; transform: translateY(0) }
    }

    aside {
      position: fixed;
      top: 0;
      bottom: var(--ui-size-block);
      left: 0;
      z-index: 3;

      width: 0;
    }

    aside.expanded {
      width: 100vw;
    }

    .aside-host {
      width: 100vw;
    }

    :global {
      /* Overlay-панель открыта — страница под ней не прокручивается (scrollbar-gutter не даст прыгнуть) */
      html:has(#layout > aside.expanded) {
        overflow: hidden;
      }

      section {
        padding-left: 10px;
        padding-right: 10px;
        /*width: 100%;*/
      }
    }
  }
</style>