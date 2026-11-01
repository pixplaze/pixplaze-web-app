<script>
  import Icon from '$ui/Icon.svelte';
  import SvgSprite from "$ui/SvgSprite.svelte";

  /**
   * Иконка сервера. Без `src` — заглушка: значок picture по центру блока того же размера и с той же рамкой.
   * Размер задаёт владелец через `--server-icon-size`, `framed` — рамка с тенью, как у карточки сервера.
   * Обёртки нет: корень — сам img или svg значка, поэтому отступы и flex владелец ставит прямо на него.
   */
  let {
    src,
    framed = false,
    alt = '',
    classes = ''
  } = $props();
</script>

{#if src}
  <img {src} {alt} class="server-icon pixel-art {classes}" class:framed>
{:else}
<!--  <Icon icon="picture" classes="server-icon placeholder {framed ? 'framed' : ''} {classes}"/>-->
  <SvgSprite path="/images/sprite.svg"
             name="pack"
             size="128px"
             classes="server-icon {framed ? 'framed' : ''}"/>
{/if}

<style>
  /* :global — у заглушки корень рендерит Icon, scoped-класс на его svg не попадает */
  :global(.server-icon) {
    --server-icon-border: 0px;
    box-sizing: border-box;
    flex: 0 0 var(--server-icon-size, var(--ui-size-block));
    width: var(--server-icon-size, var(--ui-size-block));
    height: var(--server-icon-size, var(--ui-size-block));
  }

  :global(.server-icon.framed) {
    --server-icon-border: var(--ui-size-border);
    border: var(--server-icon-border) solid var(--color-ui-primary);
    box-shadow: inset 0 -4px 0 0 var(--color-ui-shadow);
  }

  /* Icon берёт размер из --icon-size; значок обычного размера центрируется отступами внутри рамки */
  :global(.server-icon.placeholder) {
    --icon-size: var(--server-icon-size, var(--ui-size-block));
    padding: calc((var(--server-icon-size, var(--ui-size-block)) - var(--ui-size-icon)) / 2 - var(--server-icon-border));
    color: var(--color-ui-shadow, #EEEEEE);
  }
</style>
