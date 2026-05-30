<script>
  import {flatten, safeParse} from "valibot";
  import notice from "$lib/scripts/service/notice.js";
  import Notice from "$lib/components/ui/Notice.svelte";
  import {createDebounce} from "$lib/scripts/util/utils.js";

  let {
    children,
    value = $bindable(""),
    isValid = $bindable(false),
    schema,
    classes
  } = $props();

  let debounce = createDebounce(getValidityIssues, 1000);
  let validityNotices = $state([]);
  let validityClass = $derived(getValidityClass());

  $effect(async () => {
    if (!value) {
      debounce.cancel();
      validityNotices = [];
      return;
    }
    validityNotices = await debounce.run();
  });

  function getValidityIssues() {
    const validation = safeParse(schema, value);

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

{@render children()}
<Notice bind:notices={validityNotices} {classes}/>

<style>
  :global {
    .notice.warning + input {
      border-color: var(--color-ui-warning-border);
    }
  }
</style>