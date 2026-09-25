<script>
  import Button from '$lib/components/ui/buttons/Button.svelte';

  let {
    id = '',
    label = '',
    classes = '',
    value = $bindable(0),
    min,
    max,
    step = 1,
    disabled = false,
    oninput,
  } = $props();

  const labelHidden = !label || label.trim().length === 0;

  const decrement = () => {
    const next = Number(value) - step;
    if (min !== undefined && next < min) return;
    value = next;
  };

  const increment = () => {
    const next = Number(value) + step;
    if (max !== undefined && next > max) return;
    value = next;
  };
</script>

<label for={id} class:hidden={labelHidden}>{label}</label>
<div class="input-number">
  <Button classes="square" onclick={decrement} {disabled}>−</Button>
  <input {id}
         type="number"
         {min}
         {max}
         {step}
         {disabled}
         class="ui interactive input {classes}"
         bind:value
         {oninput}/>
  <Button classes="square" onclick={increment} {disabled}>+</Button>
</div>

<style>
  .input-number {
    display: flex;
  }

  input {
    flex: 1 1 auto;
    min-width: 0;
    text-align: center;
    padding-left: 0;
    padding-right: 0;
    /* collapse double borders with adjacent buttons */
    margin-left: calc(-1 * var(--ui-size-border));
    margin-right: calc(-1 * var(--ui-size-border));
    position: relative;
    z-index: 0;
  }

  input:focus {
    z-index: 1;
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
    width: 100%;
    display: block;
    padding-bottom: calc(var(--ui-spacing) / 2);
  }
</style>
