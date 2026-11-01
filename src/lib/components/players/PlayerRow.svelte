<script>
  import {parseImageBase64} from '$util/image.util.js';
  import OnlineIndicator from '$ui/indicators/OnlineIndicator.svelte';
  import AlternatingText from '$ui/text/AlternatingText.svelte';
  import OperatorIndicator from '$ui/indicators/OperatorIndicator.svelte';
  import SvgSprite from "$ui/SvgSprite.svelte";

  /**
   * Строка игрока или профиля: голова скина, имя с подписью, индикатор онлайна и действия справа.
   * Рамку и фон задаёт родитель — строка бывает и отдельным блоком, и шапкой карточки.
   *
   * skinHeadBase64 — голова скина; нет — пустая рамка того же размера (иконку друзьям добавим позже),
 *                  чтобы строки выглядели одинаково;
   * name — имя; subtitle — снипет сведений (где в сети, когда был): сменяет имя на его месте
   *        раз в 4 с; нет — только имя;
   * online — в сети ли; undefined — без индикатора (заявки в друзья);
   * isOperator — оператор ли игрок на сервере из subtitle: иконка рядом со сведениями;
   * actions — кнопки справа (ButtonIcon с `classes="attached"` — вплотную к краю строки).
   */
  let {
    skinHeadBase64 = null,
    name,
    subtitle,
    online = undefined,
    isOperator = false,
    actions,
    classes = ''
  } = $props();
</script>

<div class={`${classes} player-row`}>
  {#if skinHeadBase64}
    <img src={parseImageBase64(skinHeadBase64)} alt="" class="player-icon pixel-art">
  {:else}
    <SvgSprite path="/images/sprite.svg"
               name="head"
               size="40px"
               classes="player-icon"
    />
  {/if}
  <p class="player-name">
    {#snippet details()}
      {#if isOperator}
        <OperatorIndicator/>
      {/if}
      {@render subtitle()}
    {/snippet}
    <AlternatingText alternate={subtitle ? details : undefined}>
      {#snippet primary()}
        {name}
      {/snippet}
    </AlternatingText>
  </p>

  <div class="player-actions transparent square">
    {#if online !== undefined}
      <OnlineIndicator {online}/>
    {/if}
    {@render actions?.()}
  </div>
</div>

<style>
  /* Шрифт и цвет — от родителя-карточки (.player, .friend), как было до выделения строки */
  .player-row {
    box-sizing: border-box;
    display: flex;
    flex: 1 1 auto;
    align-items: center;

    /*border: var(--ui-size-border) solid #333333;*/
    background-color: #666666;
    color: var(--color-text-secondary);
    font-family: "Minecraft", "Arial", "sans-serif";

    outline: var(--ui-size-border) solid #333333;
    outline-offset: calc(-1 * var(--ui-size-border));
  }

  .player-row :global(.player-icon) {
    box-sizing: border-box;
    min-width: var(--ui-size-block);
    min-height: var(--ui-size-block);
    width: var(--ui-size-block);
    height: var(--ui-size-block);

    border: var(--ui-size-border) solid #333333;
    color: var(--color-ui-shadow);
  }

  /* Занимает оставшееся место и не шире его: длинное прокручивается внутри (AlternatingText) */
  .player-name {
    flex: 1;
    min-width: 0;
    padding-left: var(--ui-padding);
    color: var(--color-text-secondary);
    font-family: "Minecraft", "Arial", "sans-serif";
  }
  .player-actions {
    display: flex;
    box-sizing: border-box;

    /*--color-ui-button-border: #333333;*/
    /*--color-ui-button-background: #666666;*/
    /*--color-ui-button-hover-background: #888888;*/
    /*--color-ui-button-active-border: #666666;*/
    /*--color-ui-button-active-background: #444444;*/
  }

  .player-actions.transparent.square {
    display: flex;

    --color-ui-button-border: #333333;
    --color-ui-button-background: #666666;
    --color-ui-button-hover-background: #888888;
    --color-ui-button-active-border: #666666;
    --color-ui-button-active-background: #444444;
  }

  :global {
    .player-row {
      /* Имя и сведения AlternatingText — только в строке игрока, не во всех на сайте */
      .slot.primary {
        color: var(--color-text-secondary);
        font-family: "Minecraft", "Arial", "sans-serif";
      }

      .slot.alternate {
        color: var(--color-text-primary);
      }
    }
  }
</style>
