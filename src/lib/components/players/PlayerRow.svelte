<script>
  import {parseImageBase64} from '$util/image.util.js';
  import OnlineIndicator from '$ui/indicators/OnlineIndicator.svelte';
  import AlternatingText from '$ui/text/AlternatingText.svelte';
  import OperatorIndicator from '$ui/indicators/OperatorIndicator.svelte';

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
    classes = []
  } = $props();
</script>

<div class={[...classes, "player-row"]}>
  <img src={parseImageBase64(skinHeadBase64)} alt="" class="player-icon pixel-art tight">
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

  <div class="player-actions tight">
    {#if online !== undefined}
      <OnlineIndicator {online}/>
    {/if}
    {@render actions?.()}
  </div>
</div>

<style>
  /* Шрифт и цвет — от родителя-карточки (.player, .friend), как было до выделения строки */
  .player-row {
    display: flex;
    align-items: center;

    border: var(--ui-size-border) solid #333333;
    background-color: #666666;
    color: var(--color-text-secondary);
    font-family: "Minecraft", "Arial", "sans-serif";
  }

  .player-icon {
    min-width: var(--ui-size-block);
    min-height: var(--ui-size-block);
    width: var(--ui-size-block);
    height: var(--ui-size-block);

    margin-right: var(--ui-spacing);

    border: var(--ui-size-border) solid #333333;

    outline: none;
  }

  /* Занимает оставшееся место и не шире его: длинное прокручивается внутри (AlternatingText) */
  .player-name {
    flex: 1;
    min-width: 0;
    margin: 0 auto 0 var(--ui-spacing);
    color: var(--color-text-secondary);
    font-family: "Minecraft", "Arial", "sans-serif";
  }

  /* Как у картинки с .pixel-art: рамка внутри размера */
  .player-icon.empty {
    box-sizing: border-box;
    display: block;
    background-color: #444444;
    margin: calc(-1 * var(--ui-size-border))!important;
  }

  /* Кнопки действий — в цвет строки */
  .player-actions {
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
