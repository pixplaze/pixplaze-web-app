<script>
import Header from "$lib/components/Header.svelte";
import {createPageStore} from "$lib/store/store.page.js";
export const ssr = false;
export const csr = false;

const pageStore = createPageStore();
const currentTheme = pageStore.currentTheme;
const isAsideExpanded = pageStore.isAsideExpanded;
console.log(currentTheme)
// pageStore.currentTheme.subscribe((value)=> console.log(value))
</script>

<div id="layout" class={`container themed ${$currentTheme}`}>
  <header>
    <Header on:aside={pageStore.toggleAside} on:map={() => console.log("map event")} on:settings={pageStore.toggleTheme}/>
  </header>
  <aside class:expanded={$isAsideExpanded}></aside>
  <main>
    <slot/>
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
    gap: 10px;
  }

  header {
    min-height: 40px;
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

  @media screen and (max-width: 400px) {
    aside.expanded {
      width: 100vw;
    }
  }
</style>