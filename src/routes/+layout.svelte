<script>
import Header from "$lib/components/Header.svelte";
import {createPageStore} from "$lib/store/store.page.js";
import {goto} from "$app/navigation";
import {error} from "@sveltejs/kit";

const pageStore = createPageStore();
const currentTheme = pageStore.currentTheme;
const isAsideExpanded = pageStore.isAsideExpanded;

const {children} = $props();
const onButtonAside = pageStore.toggleAside;
const onButtonConsole = () => goto('/servers/console')
const onButtonMap = () => goto('/servers/map')
const onButtonSearch = () => goto('/servers/list')
const onButtonChat = () => goto('/servers/chat');
</script>

<div id="layout" class={`container themed ${$currentTheme}`}>
  <header>
    <Header {onButtonAside}
            {onButtonConsole}
            {onButtonMap}
            {onButtonSearch}
            {onButtonChat}
    />
  </header>
  <aside class:expanded={$isAsideExpanded}></aside>
  <main>
    {@render children()}
  </main>
  <footer></footer>
</div>

<style>
  :global(html) {
    height: 100%;
  }

  :global(html, body) {
    overflow-x: hidden;
  }

  :global(body, #app) {
    height: inherit;
  }

  #layout {
    min-height: 100%;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr;

    grid-template-areas: 'header header header'
                         'aside  main   main'
                         'footer footer footer';

    background-color: var(--color-ui-foreground);
  }

  header {
    min-height: var(--ui-size-block);
    background-color: #42A021;
    grid-area: header;
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
    /*background-color: #FFFFFF;*/
    grid-area: main;
  }

  footer {
    min-height: 200px;
    content: "";
    background-color: #444444;
    grid-area: footer;
  }

  :global(section) {
    padding-left: 30px;
    padding-right: 30px;
  }

  @media screen and (max-width: 440px) {
    header {
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 2;
      width: 100%;
    }

    main {
      overflow: hidden;
      /*text-wrap: nowrap;*/
    }

    aside.expanded {
      width: 100vw;
    }

    footer {
      padding-bottom: var(--ui-size-block);
    }

    :global(section) {
      padding-left: 10px;
      padding-right: 10px;
    }
  }
</style>