<script>
  import {onMount} from 'svelte';

  const {name} = $props();
  let svgContent = $state('');

  const fetchSvg = async () => {
    const res = await fetch(`/arts/${name}.svg`);
    svgContent = await res.text();
  }

  onMount(fetchSvg);
</script>

{@html svgContent}