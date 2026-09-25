<script>
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";
  import Icon from "$lib/components/ui/Icon.svelte";
  import {createIdEnricher} from "$lib/scripts/util/utils.js";
  import {blockDrop} from "$lib/scripts/util/animation.js";
  import {flip} from 'svelte/animate';

  let {
    notice,
    notices = $bindable(notice ? [notice] : []),
    closeable = true,
    autoCloseAfter,
    classes = '',
    onClose = () => {}
  } = $props();

  const enrichWithId = createIdEnricher();
  let _notices = $derived(notices.map(enrichWithId));

  $effect(() => {
    if (autoCloseAfter) {
      _notices.forEach(n => {
        setTimeout(() => close(n.id), autoCloseAfter);
      });
    }
  });

  const close = (id) => {
    onClose(id);
    _notices = [..._notices.filter(n => n.id !== id)];
  }

</script>

{#each _notices as notice, i (notice.id)}
  <div in:blockDrop={{ delay: i * 50, duration: 300 }}
       animate:flip={{duration: 300}}
       data-id="{notice.id}"
       class="notice {notice.level} {classes}">
    <p class="notice-content">
      <Icon icon={notice.level}/>
      {notice.message}
    </p>
    {#if closeable}
      <ButtonIcon icon="close" classes="transparent tiny" onclick={() => close(notice.id)}/>
    {/if}
  </div>
{/each}

<style>
  .notice {
    display: flex;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
  }

  .notice.info {
    border: var(--ui-size-border) solid var(--color-ui-border);
    background-color: var(--color-ui-primary);
  }

  .notice.warning {
    border: var(--ui-size-border) solid #EFC500;
    background-color: #E8CE57;
  }

  .notice.error {
    border: var(--ui-size-border) solid var(--color-red-main);
    background-color: #ED0808;
  }

  .notice-content {
    text-align: justify;
    padding: 5px 10px;
    color: white;
  }

  :global {
    .notice-content>svg {
      margin-right: 5px;
    }

    .notice.warning > button.button.tiny {
      &:hover {
        background-color: #FFDF4E;
      }

      &:active {
        border: var(--ui-size-border) solid #FFDF4E;
        background-color: #EFC500;
      }
    }

    .notice.error > button.button.tiny {
      &:hover {
        background-color: #FF0000;
      }

      &:active {
        border: var(--ui-size-border) solid #FF0000;
        background-color: var(--color-red-main);
      }
    }
  }
</style>