<script>
  import Button from "$ui/buttons/Button.svelte";
  import Input from "$ui/inputs/Input.svelte";
  import ButtonIcon from "$ui/buttons/ButtonIcon.svelte";
  import Icon from "$ui/Icon.svelte";
  import CommandPrompt from "$components/console/CommandPrompt.svelte";
  import ButtonLabel from "$ui/buttons/ButtonLabel.svelte";
  import Rating from "$ui/indicators/Rating.svelte"
  import ServerCard from "$components/servers/ServerCard.svelte";

  let value = $state("");
  let hearts = $state(1);
</script>

<div id="test">
  <section id="#test-icons">
  </section>
  <section id="#test-interactive">
    <ButtonLabel icon="globe">Балабол</ButtonLabel>
    <Button onclick={() => alert("Ты Пидор!")}>Кнопка</Button>
    <Button>Лэйбл<Icon icon="close"/></Button>
    <ServerCard name="Pixplaze Vanilla"
                address="vanilla.pixplaze.com"
                rating={4}
                description="Lorem ipsum dolor sit amet."
    />
    <Input id="test-input"
           placeholder="введи текст, пидор"
           bind:value/>
    <p>{value}</p>

    <ButtonIcon icon="close" onclick={() => hearts > 0 ? hearts-- : hearts}/>
    <ButtonIcon icon="heart" onclick={() => hearts < 20 ? hearts++ : hearts}/>
    <Rating value={hearts} max={10} onVoted={v => hearts = v}/>
    <ButtonIcon disabled icon="plugin"/>
    <ButtonIcon transparent icon="plugin"/>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab accusantium architecto, assumenda aut autem consequatur corporis debitis distinctio doloribus eius excepturi expedita fugit incidunt magni maiores nam nemo nobis nostrum placeat porro quam quas quod repellendus soluta velit vero voluptas? Consequatur cumque delectus dolores harum perferendis. Autem debitis enim, in magnam, natus possimus repudiandae similique tempora velit veritatis voluptate voluptatum.</p>
  </section>
  <section id="test-prompt">
    <CommandPrompt/>
  </section>
</div>
<style>
  #test * {
    color: var(--color-text-primary);
  }
</style>
