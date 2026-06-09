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
    classes = "",
    onClose
  } = $props();

  const enrichWithId = createIdEnricher();
  let _notices = $derived(notices.map(enrichWithId));

  const close = (id) => {
    notices = [..._notices.filter(n => n.id !== id)];
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
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;
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

  :global {
    .notice > .button.tiny {
      margin: calc(-1*var(--ui-size-border));
      height: auto;
      align-self: stretch;
    }

    .notice.warning {
      > .button.tiny {
        &:hover {
          /*border: var(--ui-size-border) solid #EFC500;*/
          background-color: #ffdf4e;
        }

        &:active {
          border: var(--ui-size-border) solid #ffdf4e;
          background-color: #EFC500;
        }
      }
    }

    .notice.error {
      > .button.tiny {
        &:hover {
          /*border: var(--ui-size-border) solid #EFC500;*/
          background-color: #FF0000;
        }

        &:active {
          border: var(--ui-size-border) solid #FF0000;
          background-color: var(--color-red-main);
        }
      }
    }
  }

  p, svg {
    color: white;
  }

  p {
    padding-top: 5px;
    padding-bottom: 5px;
  }
</style>