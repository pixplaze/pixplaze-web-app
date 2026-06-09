<script>
import ButtonLabel from "$lib/components/ui/buttons/ButtonLabel.svelte";
import {createPageStore} from "$lib/store/store.page.js";

const pageStore = createPageStore();
const currentTheme = $state(pageStore.currentTheme);
// const isAsideExpanded = pageStore.isAsideExpanded;

let {
  expanded
} = $props();

const onButtonToggleTheme = () => {
  pageStore.toggleTheme();
  console.log('after theme toggle: ', $currentTheme);
};
</script>

<div class="sidebar" class:expanded>
  <ButtonLabel icon="sun" onclick={onButtonToggleTheme}>Переключить тему</ButtonLabel>
</div>

<style>
  .sidebar {
    /*width: 0;*/
    width: 300px;
    transform-origin: left;
  }

  .sidebar.expanded {
    animation: aside-animation .5s ease-in-out;
    width: 300px;
  }

  @keyframes aside-animation {
    0% {transform: scaleX(0) }
    100% {transform: scaleX(100%) }
  }
</style>
