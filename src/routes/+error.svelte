<script context="module">
  export function load({error}) {
    return {
      props: { message: error.message }
    }
  }
</script>

<script>
  export let message;
</script>

<div class="error">
  <h2>An error occurred...</h2>
  <p>{message}</p>
  <a href=""></a>
</div>

<style>

</style>