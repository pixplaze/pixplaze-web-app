<script charset="UTF-8">
  export let disabled = false;
  export let square = false;
  export let transparent = false;
</script>

<button {disabled}
        type="button"
        class={`ui interactive button`}
        class:square
        class:transparent
        on:click>
  <slot/>
</button>

<style>
  button.square {
    padding-left: 0;
    padding-right: 0;
  }

  button.transparent {
    background-color: transparent!important;
    border-color: transparent!important;
    box-shadow: none!important;
  }

  button.transparent:hover {
    background-color: var(--color-ui-primary-lighter)!important;
  }

  button.transparent:active {
    background-color: var(--color-ui-secondary)!important;
    border-color: var(--color-ui-primary-lighter)!important;
  }
</style>
