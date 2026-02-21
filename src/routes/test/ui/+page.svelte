<script>
  import Button from '$lib/components/ui/buttons/Button.svelte'
  import ButtonLabel from "$lib/components/ui/buttons/ButtonLabel.svelte";
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";
</script>

<section id="buttons">
  <Button>Кнопка</Button>
  <Button>Попка</Button>
  <ButtonIcon icon="translate"/>
  <ButtonLabel icon="globe">Лэйбл</ButtonLabel>
</section>