<script>
  import {temp} from '$scripts/mixins/temp.svelte.js';
  import {copyToClipboard} from '$util/dom.util.js';
  import ButtonIcon from '$ui/buttons/ButtonIcon.svelte';

  let {
    value,
    hidden = false,
    spaced = false,
    ...rest
  } = $props();
  let copied = temp('copy', 1500);

  $inspect(hidden);

  const onClick = () => {
    copied.value = 'arrow-ok';
    copyToClipboard(value);
  }
</script>

<div class="clipboard">
  <code class="content copyable"
        class:spaced
        onclick={onClick}
        {...rest}>
    {#if hidden}
      ********
    {:else}
      {value}
    {/if}
  </code>
  <ButtonIcon icon={copied.value} classes="transparent copyable" onclick={onClick}/>
</div>

<style>
  .clipboard {
    box-sizing: border-box;
    display: flex;
    gap: 10px;

    width: 100%;

    font-family: "Minecraft", "Montserrat", "sans-serif";

    color: inherit;

    --color-border: #C9C9C9;
    --color-background: #EFEFEF;
    --color-background-highlight: #FFFFFF;
  }

  code {
    box-sizing: border-box;
    flex: 1 0 auto;

    align-items: center;
    justify-content: center;
    text-align: center;
    align-content: center;

    padding: 10px;

    height: var(--ui-size-block);
    border: var(--ui-size-border) solid #C9C9C9;
    background-color: #EFEFEF;
  }

  code.spaced {
    letter-spacing: 0.25em;
  }

  :global {
    .copyable:hover ~ button.button.square.copyable {
      background-color: var(--color-background-highlight);
    }

    .copyable, button.button.square.copyable {
      color: inherit;
      border: var(--ui-size-border) solid #C9C9C9;
      background-color: var(--color-background);
    }

    .copyable:hover, button.button.square.copyable:hover {
      background-color: var(--color-background-highlight);
    }

    button.button.square.copyable:active {
      background-color: var(--color-border);
      border-color: var(--color-background);
    }
  }
</style>
