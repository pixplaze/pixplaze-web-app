<script>
  import {parseAsync} from "valibot";
  import notice from "$lib/scripts/service/notice.js";
  import Notice from "$lib/components/ui/Notice.svelte";
  import {createDebounce} from "$lib/scripts/util/utils.js";
  import {untrack} from "svelte";

  let {
    value = $bindable(""),
    isValid = $bindable(false),
    children,
    schema,
    classes,
    onSuccess = () => {}
  } = $props();

  let validityNotices = $state([]);
  let inputClasses = $derived(getValidityClasses(validityNotices));
  let validate = createDebounce(getValidityIssues, 1000);

  $effect(async () => {
    const currentValue = value;

    await untrack(async () => {
      if (!currentValue) {
        validate.cancel();
        validityNotices = [];
        isValid = true;
        inputClasses = '';
        return;
      }

      validityNotices = await validate.run();

      inputClasses = getValidityClasses(validityNotices);
    })
  });

  async function getValidityIssues() {
    try {
      await parseAsync(schema, value);
    } catch (error) {
      isValid = false;
      return error.issues.map(i => notice.create(i.message, notice.LEVEL.WARNING));
    }

    await _onValidated(value);
    isValid = true;
    return [];
  }

  function getValidityClasses(validityNotices) {
    return validityNotices.map(n => n.level)
        .filter((v, i, s) => s.indexOf(v) === i && v !== notice.LEVEL.INFO)
        .join(' ');
  }

  async function _onValidated() {
    await onSuccess(value);
  }
</script>

{@render children({inputClasses})}
<Notice bind:notices={validityNotices} {classes}/>

<style>
  :global {
    .ui.interactive.input.warning {
      border-color: var(--color-ui-warning-border);
    }
  }
</style>