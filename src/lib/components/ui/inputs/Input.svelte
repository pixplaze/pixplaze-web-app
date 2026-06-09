<script>
  let {
    id = '',
    label = '',
    placeholder = '',
    type = 'text',
    maxlength,
    disabled,
    classes = '',
    value = $bindable(''),
    action,
    oninput,
    onenter,
    onFocus,
    onBlur
  } = $props();

  let hidden = $derived(!label || label.trim().length === 0);

  const onkeydown = (e) => {
    const code = e.code;
    if (code === 'Enter') {
      onenter('enter event');
      return;
    }

    if (code === 'Escape') {

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
       {type}
       {maxlength}
       {disabled}
       class="ui interactive input {classes}"
       bind:value
       use:action
       {oninput}
       {onkeydown}
       onfocus={onFocus}
       onblur={onBlur}
/>

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
    opacity: 1;
  }

  .ui.interactive.input:disabled {
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

  :global {
    .warning + .ui.interactive.input {
      border: var(--ui-size-border) solid #EFC500;
    }

    .error + .ui.interactive.input {
      border: var(--ui-size-border) solid var(--color-red-main);
    }
  }
</style>