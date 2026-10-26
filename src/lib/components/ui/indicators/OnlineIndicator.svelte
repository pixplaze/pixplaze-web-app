<script>
  import Icon from '$lib/components/ui/Icon.svelte';
  import {classIf} from '$lib/scripts/util/utils.js';

  let {
    online,
    classes
  } = $props();
</script>

<Icon icon="indicator" classes={`online-indicator ${classIf('online', online)} ${classes}`}/>

<style>
  :global {
    .online-indicator {
      box-sizing: content-box;
      padding: calc((var(--ui-size-block) - var(--ui-size-icon)) / 2);
      color: #333333;
    }

    .online-indicator.online {
      animation: indicator-glow 2s linear infinite;
    }
  }

  @keyframes indicator-glow {
    0%   { color: #68C94A; filter: drop-shadow(0 0 5px #68C94A); }
    20%  { color: #4AC9A0; filter: drop-shadow(0 0 5px #4AC9A0); }
    40%  { color: #C9C24A; filter: drop-shadow(0 0 5px #C9C24A); }
    60%  { color: #4AA4C9; filter: drop-shadow(0 0 5px #4AA4C9); }
    80%  { color: #A04AC9; filter: drop-shadow(0 0 5px #A04AC9); }
    100% { color: #68C94A; filter: drop-shadow(0 0 5px #68C94A); }
  }
</style>