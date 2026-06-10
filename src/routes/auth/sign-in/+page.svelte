<script>
  import {page} from "$app/state";
  import {userService} from "$lib/scripts/service/user.service.js";

  function onSubmit(signUpData) {
    console.log(JSON.parse(JSON.stringify(signUpData)));
    const result = userService.signIn(signUpData);
    console.log(`Signing in with data: ${JSON.stringify(signUpData)}`)
    console.log(signUpData);
    console.log(result);
  }
  const inviteCode = page.url.searchParams.get('inviteCode');
</script>

<SignInForm {onSubmit}/>
