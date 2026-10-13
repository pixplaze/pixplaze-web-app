<script>
  import ServerList from '$lib/components/ServerList.svelte';

  let {data} = $props();
</script>

<ServerList servers={data.servers}/>
