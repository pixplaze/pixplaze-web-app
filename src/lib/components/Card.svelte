<script>
  import Rating from "$lib/components/ui/Rating.svelte";
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";

  let {
    name,
    address,
    description,
    rating
  } = $props();
</script>

<div class="ui box card">
  <div class="server-image"></div>
  <div class="server-info">
    <div class="description">
      <h2>{name}</h2>
      <p>{address}</p>
      <Rating value={rating}/>
    </div>
<!--    <div class="buttons">-->
<!--      <ButtonIcon icon="more"/>-->
<!--      <ButtonIcon icon="copy"/>-->
<!--    </div>-->
  </div>
</div>

<style>
  .ui.box {
    box-sizing: border-box;
    overflow: hidden;
    /*display: block;*/
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
    height: 100%;
    padding: 5px 0 10px 10px;
    border: var(--ui-size-border) solid var(--color-ui-border1);
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
  }

  .server-info > * {
    line-height: 24px;
  }
</style>