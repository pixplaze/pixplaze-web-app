<script>
  import ServerList from '$components/servers/ServerList.svelte';

  let {data} = $props();
</script>

<ServerList servers={data.servers}/>
