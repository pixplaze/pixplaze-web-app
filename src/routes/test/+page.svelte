<script>
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import Input from "$lib/components/ui/inputs/Input.svelte";
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";
  import Icon from "$lib/components/ui/Icon.svelte";
  import CommandPrompt from "$lib/components/CommandPrompt.svelte";
  import Counter from "$lib/components/Counter.svelte";
  import ButtonLabel from "$lib/components/ui/buttons/ButtonLabel.svelte";
  import Rating from "$lib/components/ui/Rating.svelte"
  import Card from "$lib/components/Card.svelte";

  let value = $state("");
  let hearts = $state(1);
</script>

<div id="test">
  <section id="#test-icons">
  </section>
  <section id="#test-interactive">
    <Counter/>
    <ButtonLabel icon="globe">Балабол</ButtonLabel>
    <Button onclick={() => alert("Ты Пидор!")}>Кнопка</Button>
    <Button>Лэйбл<Icon icon="close"/></Button>
    <Card name="Pixplaze Vanilla"
          address="vanilla.pixplaze.com"
          rating={4}
          description="Lorem ipsum dolor sit amet."
    />
    <Input id="test-input"
           placeholder="введи текст, пидор"
           bind:value
           onenter={(e) => console.log(e)}/>
    <p>{value}</p>

    <ButtonIcon icon="close" onclick={() => hearts > 0 ? hearts-- : hearts}/>
    <ButtonIcon icon="heart" onclick={() => hearts < 20 ? hearts++ : hearts}/>
    <Rating value={hearts} max={20} onVoted={v => hearts = v}/>
    <ButtonIcon disabled icon="plugin"/>
    <ButtonIcon transparent icon="plugin"/>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab accusantium architecto, assumenda aut autem consequatur corporis debitis distinctio doloribus eius excepturi expedita fugit incidunt magni maiores nam nemo nobis nostrum placeat porro quam quas quod repellendus soluta velit vero voluptas? Consequatur cumque delectus dolores harum perferendis. Autem debitis enim, in magnam, natus possimus repudiandae similique tempora velit veritatis voluptate voluptatum.</p>
  </section>
  <section id="test-prompt">
    <CommandPrompt/>
  </section>
</div>
<style>
  #test {
    display: grid;
    padding: 30px;
  }

  #test * {
    color: var(--color-text-primary);
  }

  #test > section {
    margin-right: var(--ui-spacing);
  }
</style>
