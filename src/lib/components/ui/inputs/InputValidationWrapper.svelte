<script>
  import {noticeService} from "$lib/scripts/service/notice.service.js";
  import {LEVEL} from "$lib/scripts/util/notice.util.js";
  import {parseAsync} from "valibot";
  import {createDebounce} from "$lib/scripts/util/utils.js";
  import {untrack} from "svelte";
  import Notice from "$lib/components/ui/Notice.svelte";

  let {
    value = $bindable(""),
    isValid = $bindable(false),
    children,
    schema,
    classes,
    onSuccess = () => {}
  } = $props();

  let validityNotices = $state([]);
  let validationClasses = $derived(getValidityClasses(validityNotices));
  let validate = createDebounce(getValidityIssues, 1000);

  $effect(async () => {
    const currentValue = value;

    await untrack(async () => {
      if (!currentValue) {
        validate.cancel();
        validityNotices = [];
        return;
      }

      validityNotices = await validate.run();
    })
  });

  async function getValidityIssues() {
    try {
      await parseAsync(schema, value);
    } catch (error) {
      isValid = false;
      return error.issues.map(i => noticeService.create(i.message, LEVEL.WARNING));
    }

    await onSuccess(value);
    isValid = true;
    return [];
  }

  function getValidityClasses(validityNotices) {
    return validityNotices.map(n => n.level)
        .filter((v, i, s) => s.indexOf(v) === i && v !== LEVEL.INFO)
        .join(' ');
  }
</script>

{@render children({validationClasses})}
<Notice bind:notices={validityNotices} {classes}/>

<style>
  :global {
    .ui.interactive.input.warning {
      border-color: var(--color-ui-warning-border);
    }
  }
</style>