<script>
  import Button from '$lib/components/ui/buttons/Button.svelte'
  import ButtonLabel from "$lib/components/ui/buttons/ButtonLabel.svelte";
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";
  import Switch from "$lib/components/ui/inputs/Switch.svelte";
  import Checkbox from "$lib/components/ui/inputs/Checkbox.svelte";
  import Radio from "$lib/components/ui/inputs/Radio.svelte";

  let switched = $state(false);
  let checked = $state(false);
  let radio = $state('a');
</script>

<section id="buttons">
  <Button>Кнопка</Button>
  <Button>Попка</Button>
  <ButtonIcon icon="translate"/>
  <ButtonLabel icon="globe">Лэйбл</ButtonLabel>
</section>

<section id="toggles">
  <Switch id="test-switch" bind:checked={switched}>Свич: {switched ? 'вкл' : 'выкл'}</Switch>
  <Switch id="test-switch-bare" bind:checked={switched}/>
  <Checkbox id="test-checkbox" bind:checked>Чекбокс</Checkbox>
  <Radio id="test-radio-a" bind:group={radio} value="a">Радио A</Radio>
  <Radio id="test-radio-b" bind:group={radio} value="b">Радио B</Radio>
</section>
