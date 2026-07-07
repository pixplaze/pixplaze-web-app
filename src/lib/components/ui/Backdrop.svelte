<script>
  let { classes = '' } = $props();
</script>

<svg class="backdrop {classes}"
     xmlns="http://www.w3.org/2000/svg"
     width="100%"
     height="160"
     overflow="visible"
     aria-hidden="true">
  <defs>
    <pattern id="backdrop-tile" x="0" y="0" width="960" height="164" patternUnits="userSpaceOnUse">
      <!-- shadow: same paths shifted 4px down, rendered behind the fill -->
      <g fill="rgba(0,0,0,0.15)" transform="translate(4, 4)">
        <path d="M40 160H0V120H40V160Z"/>
        <path d="M480 0V40H440V80H400V120H360V80H320V120H240V80H280V40H240V80H200V120H160V160H120V120H40V80H80V40H40V80H0V0H480Z"/>
        <path d="M240 160H200V120H240V160Z"/>
        <path d="M440 160H400V120H440V160Z"/>
        <path d="M480 120H440V80H480V120Z"/>
      </g>
      <g fill="rgba(0,0,0,0.15)" transform="translate(964, 4) scale(-1, 1)">
        <path d="M40 160H0V120H40V160Z"/>
        <path d="M480 0V40H440V80H400V120H360V80H320V120H240V80H280V40H240V80H200V120H160V160H120V120H40V80H80V40H40V80H0V0H480Z"/>
        <path d="M240 160H200V120H240V160Z"/>
        <path d="M440 160H400V120H440V160Z"/>
        <path d="M480 120H440V80H480V120Z"/>
      </g>
      <!-- fill -->
      <g fill="currentColor">
        <path d="M40 160H0V120H40V160Z"/>
        <path d="M480 0V40H440V80H400V120H360V80H320V120H240V80H280V40H240V80H200V120H160V160H120V120H40V80H80V40H40V80H0V0H480Z"/>
        <path d="M240 160H200V120H240V160Z"/>
        <path d="M440 160H400V120H440V160Z"/>
        <path d="M480 120H440V80H480V120Z"/>
      </g>
      <g fill="currentColor" transform="translate(960, 0) scale(-1, 1)">
        <path d="M40 160H0V120H40V160Z"/>
        <path d="M480 0V40H440V80H400V120H360V80H320V120H240V80H280V40H240V80H200V120H160V160H120V120H40V80H80V40H40V80H0V0H480Z"/>
        <path d="M240 160H200V120H240V160Z"/>
        <path d="M440 160H400V120H440V160Z"/>
        <path d="M480 120H440V80H480V120Z"/>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="164" fill="url(#backdrop-tile)"/>
</svg>

<style>
  .backdrop {
    display: block;
    color: var(--backdrop-color, var(--color-ui-foreground));
  }
</style>
