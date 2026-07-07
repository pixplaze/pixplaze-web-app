<script>
  import Input from "$lib/components/ui/inputs/Input.svelte";
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";

  let {
    isEditMode = $bindable(false),
    value = $bindable(''),
    ...rest
  } = $props();
  let icon = $derived(isEditMode ? 'close' : 'pencil');
  const toggleEdit = () => isEditMode = !isEditMode;
</script>

<div class="preview-input">
  <Input bind:value preview={!isEditMode} {...rest}/>
  <ButtonIcon {icon} onclick={toggleEdit}/>
</div>

<style>
  .preview-input {
    display: flex;
    flex-wrap: wrap;
    /*margin-top: var(--ui-spacing);*/
  }

  .preview-input > :global(input) {
    flex: 1;
    min-width: 0;
    margin-right: var(--ui-spacing);
    /*padding-left: 0;*/
  }
</style>