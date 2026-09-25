<script>
  import {required} from "$lib/scripts/util/utils.js";

  let {
    id = required('id'),
    label = '',
    placeholder = '',
    type = 'text',
    maxlength,
    preview,
    disabled = preview,
    classes = '',
    value = $bindable(''),
    action,
    oninput,
    onEnter = () => {},
    onFocus = () => {},
    onBlur = () => {},
    ...rest
  } = $props();

  let inputElement;
  let hidden = $state(!label || label.trim().length === 0);

  const onkeydown = (e) => {
    const code = e.code;
    if (code === 'Enter') {
      onEnter('enter event');
      inputElement.blur();
      console.log('blurred');
      return;
    }

    if (code === 'Escape') {

    }
  }
</script>

<label id={`${id}-label`}
       for={id}
       class:hidden>
  {label}
</label>
<input {id}
       {placeholder}
       {type}
       {maxlength}
       {disabled}
       {...rest}
       class="ui interactive input {classes}"
       class:preview
       bind:value
       bind:this={inputElement}
       use:action
       {oninput}
       {onkeydown}
       onfocus={onFocus}
       onblur={onBlur}
/>

<!--suppress CssUnusedSymbol -->
<style>
  .ui.interactive.input {
    border-color: var(--color-ui-border);
    box-shadow: inset var(--ui-size-shadow) var(--ui-size-shadow) 0 0 var(--color-ui-shadow);
  }

  .ui.interactive.input,
  .ui.interactive.input::placeholder {
    color: var(--color-text-primary);
    background-color: transparent;
  }

  .ui.interactive.input::placeholder {
    color: var(--color-main-text-placeholder);
    opacity: .25;
  }

  .ui.interactive.input:disabled:not(.preview) {
    /*color: var(--color-ui-shadow);*/
    color: #A0A0A0;
    /*background-color: var(--color-gray-silver);*/
    background-color: var(--color-gray-shadow);
    /*border: var(--ui-size-border) solid var(--color-gray-shadow);*/
    border: var(--ui-size-border) solid #A0A0A0;
    box-shadow: none;
    user-select: none;
    cursor: not-allowed;
  }

  .ui.interactive.input.preview:disabled {
    border-color: transparent;
    box-shadow: none;
    opacity: 1;
    -webkit-text-fill-color: var(--color-text-primary);
  }

  /* hide native browser spinner */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  label {
    /*width: 100%;*/
    order: -1;
    display: block;
    padding-bottom: calc(var(--ui-spacing) / 2);
    text-wrap: nowrap;
  }

  .ui.interactive.input.warning {
    border: var(--ui-size-border) solid #EFC500;
  }

  .ui.interactive.input.error {
    border: var(--ui-size-border) solid var(--color-red-main);
  }
</style>