<script>
  import Rating from "$lib/components/ui/Rating.svelte";
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";

  let {
    image="data:image/png;base64,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",
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
<!--  style={`background-image: url("${image}"); background-size: cover; background-position: center;`}-->
  <img src={image}
       alt="Server Icon"
       class="server-image pixel-art">

<!--  </img>-->
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
      <ButtonIcon icons={["star", "star-filled"]}/>
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
    min-width: 345px;
    height: 128px;

    box-shadow: 0 var(--ui-size-shadow) 0 0 var(--color-ui-shadow);
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

  :global(.card button.ui.interactive) {
    background-color: transparent;
    color: var(--color-text-primary);
    border-color: transparent;
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 transparent;
  }

  :global(.card button.ui.interactive:hover) {
    border-color: #E5E5E5;
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 transparent;
  }

  :global(.card button.ui.interactive:active) {
    background-color: var(--color-ui-border1);
  }

  :global(.card button:hover use[class$="icon-star"]) {
    opacity: 0;
  }

  :global(.card .button:hover use[href$="icon-star-filled"]) {
    opacity: 1;
  }
</style>