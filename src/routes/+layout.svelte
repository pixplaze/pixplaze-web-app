<script>
  import Header from "$lib/components/Header.svelte";
  import {createPageStore} from "$lib/store/store.page.js";
  import {goto} from "$app/navigation";
  import ServerRow from "$lib/components/ServerRow.svelte";
  import {onMount} from "svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";

  const pageStore = createPageStore();
  const currentTheme = $state(pageStore.currentTheme);
  const isAsideExpanded = pageStore.isAsideExpanded;

  const {children} = $props();

  let isFavoriteServersExpanded = $state(false);

  const onButtonAside = pageStore.toggleAside;
  const onButtonConsole = () => goto('/servers/console')
  const onButtonMap = () => goto('/servers/map')
  const onButtonSearch = () => goto('/servers/list')
  const onButtonChat = () => goto('/servers/chat');
  const onButtonFavorite = () => {
    isFavoriteServersExpanded = !isFavoriteServersExpanded;
    console.log(isFavoriteServersExpanded);
  };
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

<div id="layout" class={`container themed ${$currentTheme}`}>
  <header>
    <Header {onButtonAside}
            {onButtonConsole}
            {onButtonMap}
            {onButtonSearch}
            {onButtonChat}
            {onButtonFavorite}
    />
    <!--{#if isFavoriteServersExpanded}-->
    <div class="favorite-servers-menu">
      <div class="favorite-servers" class:expanded={isFavoriteServersExpanded}>
        {#each Array(40) as _, i}
          <ServerRow name={`Сервер ${i + 1}`}/>
        {/each}
      </div>
    </div>
    <!--{/if}-->
  </header>
  <aside class:expanded={$isAsideExpanded}>
    {#if $isAsideExpanded}
      <Sidebar expanded={$isAsideExpanded}/>
    {/if}
  </aside>
  <main>
    {@render children()}
  </main>
  <footer></footer>
</div>

<style>
  #layout {
    min-height: -webkit-fill-available;
    display: grid;
    grid-template-columns: auto 1fr;
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

    outline: red 1px solid;
  }

  .favorite-servers {
    /*position: fixed;*/
    /*z-index: -1;*/
    /*top: var(--ui-size-block);*/
    /*bottom: auto;*/
    width: 100%;
    max-height: calc(10 * var(--ui-size-block));

    overflow-y: scroll;
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

  aside {
    width: 0;
    background-color: darkgray;
    grid-area: aside;
    transition: width .5s ease-in-out;
  }

  aside.expanded {
    /*animation: aside-animation .2s;*/
    width: 300px;
  }

  @keyframes aside-animation {
    0% {transform: scaleX(0) }
    100% {transform: scaleX(100%) }
  }

  main {
    grid-area: main;
  }

  footer {
    min-height: 200px;
    content: "";
    background-color: #444444;
    grid-area: footer;
  }

  :global {
    html {
      height: 100%;
    }

    html, body {
      overflow-x: hidden;
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

    main {
      overflow: hidden;
    }

    aside.expanded {
      width: 100vw;
    }

    :global {
      section {
        padding-left: 10px;
        padding-right: 10px;
      }
    }
  }
</style>