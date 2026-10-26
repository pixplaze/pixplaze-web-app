<script>
  let { loading = false } = $props();
</script>

{#if loading}
  <div class="loader-overlay">
    <div class="loader">
      <div class="block lt"></div>
      <div class="block tr"></div>
      <div class="block br"></div>
      <div class="block bl"></div>
    </div>
  </div>
{/if}

<style>
  .loader-overlay {
    /*position: absolute;*/
    /*inset: 0;*/
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    height: calc(2 * var(--ui-spacing) + var(--ui-spacing) + (var(--ui-size-block)));
  }

  .loader {
    /*position: relative;*/
    /*width: 0;*/
    /*height: 0;*/
  }

  .block {
    position: absolute;
    width: 20px;
    height: 20px;
    animation-duration: 3s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  /*.lt, .br { background-color: var(--color-ui-border); }*/
  .lt, .br { background-color: var(--color-ui-primary); }
  .tr, .bl { background-color: var(--color-ui-primary); }

  .lt { animation-name: loader-lt; }
  .tr { animation-name: loader-tr; }
  .br { animation-name: loader-br; }
  .bl { animation-name: loader-bl; }

  /*
    Цикл 3s: T=12% (360ms переход), H=4% (120ms пауза).
    7 пауз + 6 переходов = 7*4 + 6*12 = 100%.

    together -> spread -> rotate1 -> collapse -> spread -> rotate2 -> collapse -> [loop]

    После 2 поворотов (180deg) шахматный порядок восстанавливается.
    spread2 совпадает с позицией rotate1 -- блоки "отскакивают" от центра
    обратно на ту же точку, откуда только что пришли.
  */

  @keyframes loader-lt {
    0%,  4%   { transform: translate(-20px, -20px); }
    16%, 20%  { transform: translate(-30px, -30px); }
    32%, 36%  { transform: translate( 10px, -30px); }
    48%, 52%  { transform: translate(  0px, -20px); }
    64%, 68%  { transform: translate( 10px, -30px); }
    80%, 84%  { transform: translate( 10px,  10px); }
    96%, 100% { transform: translate(  0px,   0px); }
  }

  @keyframes loader-tr {
    0%,  4%   { transform: translate(  0px, -20px); }
    16%, 20%  { transform: translate( 10px, -30px); }
    32%, 36%  { transform: translate( 10px,  10px); }
    48%, 52%  { transform: translate(  0px,   0px); }
    64%, 68%  { transform: translate( 10px,  10px); }
    80%, 84%  { transform: translate(-30px,  10px); }
    96%, 100% { transform: translate(-20px,   0px); }
  }

  @keyframes loader-br {
    0%,  4%   { transform: translate(  0px,   0px); }
    16%, 20%  { transform: translate( 10px,  10px); }
    32%, 36%  { transform: translate(-30px,  10px); }
    48%, 52%  { transform: translate(-20px,   0px); }
    64%, 68%  { transform: translate(-30px,  10px); }
    80%, 84%  { transform: translate(-30px, -30px); }
    96%, 100% { transform: translate(-20px, -20px); }
  }

  @keyframes loader-bl {
    0%,  4%   { transform: translate(-20px,   0px); }
    16%, 20%  { transform: translate(-30px,  10px); }
    32%, 36%  { transform: translate(-30px, -30px); }
    48%, 52%  { transform: translate(-20px, -20px); }
    64%, 68%  { transform: translate(-30px, -30px); }
    80%, 84%  { transform: translate( 10px, -30px); }
    96%, 100% { transform: translate(  0px, -20px); }
  }
</style>
