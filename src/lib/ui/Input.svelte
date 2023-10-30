<script>
  import {createEventDispatcher} from "svelte";

  export let id = "";
  export let label = "";
  export let value = "";
  export let placeholder = "";

  const dispatch = createEventDispatcher();

  const onKeyDown = (e) => {
    const code = e.code;
    if (code === 'Enter') {
      dispatch('enter', value);
    }
  }
  const isLabelHidden = () => !label || label.trim().length === 0;
</script>

<label id={`${id}-label`}
       for={id}
       hidden={isLabelHidden()}>
  {label}
</label>
<input {id}
       {placeholder}
       type="text"
       class="ui interactive input"
       bind:value
       on:input
       on:keydown={onKeyDown}>
