<script>
  // import {createEventDispatcher} from "svelte";

  let {
    id = "",
    label = "",
    value = "",
    placeholder = "",
    oninput,
    onenter
  } = $props();

  let hidden = $derived(!label || label.trim().length === 0);

  const onkeydown = (e) => {
    const code = e.code;
    if (code === 'Enter') {
      onenter('enter event');
    }
  }
</script>

<label id={`${id}-label`}
       for={id}
       {hidden}>
  {label}
</label>
<input {id}
       {placeholder}
       type="text"
       class="ui interactive input"
       bind:value
       {oninput}
       {onkeydown}>

<style>
  .ui.interactive.input {
    box-shadow: inset var(--ui-size-shadow) var(--ui-size-shadow) 0 0 var(--color-ui-shadow);
  }

  .ui.interactive.input,
  .ui.interactive.input::placeholder {
    color: var(--color-text-primary);
    background-color: transparent;
  }
</style>