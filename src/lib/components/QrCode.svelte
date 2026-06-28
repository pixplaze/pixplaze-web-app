<script>
  import QRious from 'qrious';

  let { url } = $props();
  let canvasElement = $state(null);

  $effect(() => {
    if (canvasElement) {
      new QRious({
        element: canvasElement,
        value: url,
        size: 256,
        level: 'M'
      });
    }
  });
</script>

<canvas bind:this={canvasElement}></canvas>

<style>
  canvas {
    image-rendering: pixelated;
  }
</style>
