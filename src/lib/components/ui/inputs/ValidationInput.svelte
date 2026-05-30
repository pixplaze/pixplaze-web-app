<script>
  import {flatten, safeParse, safeParseAsync} from "valibot";
  import notice from "$lib/scripts/service/notice.js";
  import Input from "$lib/components/ui/inputs/Input.svelte";
  import Notice from "$lib/components/ui/Notice.svelte";
  import {createDebounce} from "$lib/scripts/util/utils.js";

  let {
    id,
    label,
    placeholder,
    type,
    maxlength,
    disabled,
    classes,
    value = $bindable(""),
    schema,
    isValid = $bindable(false)
  } = $props();

  let validate = createDebounce(getValidityIssues, 800);
  let validityNotices = $state([]);
  let validityClass = $derived(getValidityClass());

  $effect(async () => {
    if (!value) {
      validate.cancel();
      validityNotices = [];
      return;
    }
    validityNotices = await validate.run();
  });

  async function getValidityIssues() {
    // TODO: проверить, как можно обойтись без safeParseAsync, в случае, когда нет запроса к API
    const validation = await safeParseAsync(schema, value);

    if (validation.success) {
      isValid = true;
      return [];
    }

    isValid = false;

    return flatten(validation.issues).root.map(i => notice.create(i, notice.LEVEL.WARNING));
  }

  function isValueValid() {
    return validityNotices.length === 0;
  }

  function getValidityClass() {
    return isValueValid() ? "" : " invalid";
  }
</script>

<Input {id}
       {label}
       {placeholder}
       {type}
       {maxlength}
       {disabled}
       classes={`${classes}${validityClass}`}
       bind:value
/>
<Notice bind:notices={validityNotices} {classes}/>

<style>
  :global {
    .input.invalid {
      border-color: var(--color-ui-warning-border);
    }
  }
</style>