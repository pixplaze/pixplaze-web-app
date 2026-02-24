<script>
  import Rating from "$lib/components/ui/Rating.svelte";
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";

  let {
    name,
    address,
    description,
    rating
  } = $props();

  const copyAddressToClipboard = async () => {
      await navigator.clipboard.writeText(address);
  };
</script>

<div class="ui box card">
  <div class="server-image"></div>
  <div class="server-info">
    <div class="description">
      <h2>{name}</h2>
      <p>{address}</p>
      <p>{description}</p>
      <Rating value={rating}/>
    </div>
    <div class="buttons">
      <ButtonIcon icon="more"/>
      <ButtonIcon icon="copy" onclick={copyAddressToClipboard}/>
      <ButtonIcon icon="star-filled"/>
    </div>
  </div>
</div>

<style>
  .ui.box {
    box-sizing: border-box;
    overflow: hidden;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .card {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    width: 345px;
    height: 128px;

    box-shadow: 0 4px 0 0 var(--color-ui-shadow);
  }

  .server-image {
    flex: 0 0 128px;
    box-sizing: border-box;
    border: var(--ui-size-border) solid var(--color-ui-primary);
    box-shadow: inset 0 -4px 0 0 var(--color-ui-shadow);
  }

  .server-info {
    flex: 1 1 auto;
    box-sizing: border-box;
    display: flex;
    height: 100%;
    padding-bottom: var(--ui-size-shadow);
    border: var(--ui-size-border) solid var(--color-ui-border1);
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
  }

  .server-info > * {
    line-height: 24px;
  }

  .description {
    position: relative;
    padding: 10px 10px 0 10px;
    flex: 1 0;
  }

  :global(.card .rating) {
    position: absolute;
    bottom: 0;
    height: var(--ui-size-block);
    align-items: center;
  }

  :global(.card .rating>svg) {
    justify-content: space-between;
  }

  :global(.card .buttons > button.ui.interactive) {
    background-color: transparent;
    color: var(--color-text-primary);
    border-color: transparent;
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 transparent;
  }

  :global(.card .buttons > button.ui.interactive:hover) {
    border-color: #E5E5E5;
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 transparent;
  }

  :global(.card .buttons > button.ui.interactive:active) {
    background-color: var(--color-ui-border1);
  }

  :global(.card .button:hover svg>[href$="icon-star-filled"]) {
    fill: url("#myGradient");
  }
</style>