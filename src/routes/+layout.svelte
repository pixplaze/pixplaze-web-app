<script>
  import {ui} from "$lib/scripts/ui.svelte.js";
  import {navigation} from "$lib/scripts/navigation.js";
  import {auth} from '$lib/scripts/auth.svelte.js';
  import {onMount} from "svelte";
  import {page} from "$app/state";
  import Header from "$lib/components/Header.svelte";
  import FavoriteServerList from "$lib/components/FavoriteServerList.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import Backdrop from "$lib/components/ui/Backdrop.svelte";
  import AppNotifications from "$lib/components/AppNotifications.svelte";
  import '$lib/style/global.css';

  const {children} = $props();

  const onButtonAside = () => ui.toggleAside();
  const onButtonConsole = () => navigation.goToServersConsole();
  const onButtonMap = () => navigation.goToServersMap();
  const onButtonSearch = () => navigation.goToServersList();
  const onButtonChat = () => navigation.goToServersChat();
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

<div id="layout" class={`container themed ${ui.theme}`}>
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
        <div class="favorite-servers" class:expanded={ui.favoritesExpanded}>
          <FavoriteServerList expanded={ui.favoritesExpanded}/>
        </div>
      </div>
    {/if}
    <AppNotifications/>
  </header>
  <aside class:expanded={ui.asideExpanded} class="debug">
    <div class="aside-host">
      <Sidebar {onButtonProfile}
               {onButtonLanguage}
               {onButtonSettings}
               {onButtonHelp}/>
    </div>
  </aside>
  <main>
    {@render children()}
    <Backdrop classes="page-backdrop"/>
  </main>
  <footer></footer>
</div>

<style>
  #layout {
    min-height: -webkit-fill-available;
    display: grid;
    /* minmax(0, 1fr), а не 1fr (= minmax(auto, 1fr)): колонка main не растягивается
       по ширине содержимого и не выталкивает страницу за окно при открытой панели */
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: auto 1fr;

    grid-template-areas: 'header header header'
                         'aside  main   main'
                         'footer footer footer';

    padding-top: var(--ui-size-block);
    padding-bottom: 0;

    background-color: var(--color-ui-foreground);
  }

  header {
    position: fixed;
    top: 0;
    bottom: auto;

    z-index: 2;

    width: 100%;
    min-height: var(--ui-size-block);
    background-color: #42A021;
    grid-area: header;
  }

  .favorite-servers-menu {
    overflow: hidden;
    position: fixed;
    top: var(--ui-size-block);
    bottom: auto;
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
    html {
      height: 100%;
    }

    html, body {
      overflow-x: hidden;
      overscroll-behavior-x: none;
    }

    body, #app {
      height: inherit;
    }

    section {
      padding-left: 30px;
      padding-right: 30px;
    }
  }

  @media screen and (max-width: 440px) {
    #layout {
      padding-top: 0;
      padding-bottom: var(--ui-size-block);
    }

    header {
      position: fixed;
      top: auto;
      bottom: 0;
      left: 0;
      right: auto;
    }

    .favorite-servers-menu {
      top: auto;
      bottom: var(--ui-size-block);

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


    /*
      Мобайл — overlay: aside выходит из грида (position: fixed), перекрывая main
      во весь экран кроме Header (он снизу), и не сдвигает main. Слайд — тем же
      transform на .aside-host. z-index ниже Header (z-index: 2).
    */
    aside {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 3;

      width: 0;
      height: calc(100% - var(--ui-size-block));
    }

    aside.expanded {
      width: 100vw;
    }

    .aside-host {
      width: 100vw;
    }

    :global {
      section {
        padding-left: 10px;
        padding-right: 10px;
        /*width: 100%;*/
      }
    }
  }
</style>