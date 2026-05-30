<script>
 import Header from "$lib/components/Header.svelte";
 import {createPageStore} from "$lib/store/store.page.js";
 import {goto} from "$app/navigation";
 import {env} from "$env/dynamic/public";
 import ServerRow from "$lib/components/ServerRow.svelte";
 import ButtonLabel from "$lib/components/ui/buttons/ButtonLabel.svelte";
 import {onMount} from "svelte";
 import {error} from "@sveltejs/kit";

 const pageStore = createPageStore();
 const currentTheme = $state(pageStore.currentTheme);
 const isAsideExpanded = pageStore.isAsideExpanded;

 const {children} = $props();

 let favoriteServersElement = $state();

 const onButtonAside = pageStore.toggleAside;
 const onButtonConsole = () => goto('/servers/console')
 const onButtonMap = () => goto('/servers/map')
 const onButtonSearch = () => goto('/servers/list')
 const onButtonChat = () => goto('/servers/chat');
 const onButtonFavorite = () => {
   favoriteServersElement.classList.toggle('expanded');
 };
 const onButtonToggleTheme = () => {
   pageStore.toggleTheme();
   console.log('after theme toggle: ', $currentTheme);
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
    <div class="favorite-servers" bind:this={favoriteServersElement}>
      {#each Array(40) as _, i}
        <ServerRow name={`Сервер ${i + 1}`}/>
      {/each}
    </div>
  </header>
  <aside class:expanded={$isAsideExpanded}>
<!--    <ButtonLabel icon="sun" onclick={onButtonToggleTheme}>Переключить тему</ButtonLabel>-->
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

  .favorite-servers {
    position: fixed;
    top: var(--ui-size-block);
    bottom: auto;
    width: 100%;
    max-height: 50%;

    overflow-y: scroll;
    background-color: var(--color-ui-secondary);
    box-shadow: 0 var(--ui-size-shadow) 0 0 var(--color-ui-shadow);
  }

  aside {
    width: 0;
    background-color: darkgray;
    grid-area: aside;
    transition: width .5s ease-in-out;
  }

  aside.expanded {
    width: 300px;
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

  .favorite-servers {
    display: none;
  }

  .favorite-servers.expanded {
    display: block;
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

    .favorite-servers {
      top: auto;
      bottom: var(--ui-size-block);

      box-shadow: 0 calc(-1 *var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
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