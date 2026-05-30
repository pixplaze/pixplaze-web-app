<script>
  import SignUpForm from "$lib/components/SignUpForm.svelte";
  import {page} from "$app/state";
  import {api} from "$lib/scripts/api/api.config.js";

  function onSubmit (signUpData) {
    console.log(JSON.parse(JSON.stringify(signUpData)));
    const result = api.signUp(signUpData);
    console.log(`Signing up with data: ${JSON.stringify(signUpData)}`)
    console.log(signUpData);
    console.log(result);
  }
  const inviteCode = page.url.searchParams.get('inviteCode');
</script>

<SignUpForm {inviteCode} {onSubmit}/>
