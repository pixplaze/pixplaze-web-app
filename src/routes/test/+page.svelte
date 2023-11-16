<script>
  import Button from "$lib/ui/Button.svelte";
  import Input from "$lib/ui/Input.svelte";
  import SquareButton from "$lib/ui/SquareButton.svelte";
  import Icon from "$lib/ui/Icon.svelte";
  import CommandPrompt from "$lib/components/CommandPrompt.svelte";

  let value = "";
  let parText = "";
  let hearts = 0;
  const themes = {
    dark: 'theme-dark',
    bright: 'theme-light'
  }

</script>

<div id="test">
  <section id="#test-interactive">
    <Button on:click={() => alert("Ты Пидор!")}>Кнопка</Button>
    <Button>
      Лэйбл<Icon icon="close"/>
    </Button>
    <Input id="test-input"
           placeholder="введи текст, пидор"
           bind:value
           on:input={(e) => parText = `[${e.target.value}]`}
           on:enter={(e) => console.log(e.detail)}/>
    <p>{parText}</p>

    <SquareButton icon="close" on:click={() => hearts > 0 ? hearts-- : hearts}/>
    <SquareButton icon="heart" on:click={() => hearts < 20 ? hearts++ : hearts}/>
    <p style="display: flex; flex-wrap: wrap;">
      {#each Array(hearts) as ignore}
        <Icon icon={"heart-filled"}/>
      {/each}
      {#each Array(20 - hearts) as ignore}
        <Icon icon={"heart"}/>
      {/each}
    </p>
    <SquareButton disabled icon="plugin"/>
    <SquareButton transparent icon="plugin"/>
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

  #test {

  }

  #test * {
    color: var(--color-text-primary);
  }

  #test > section {
    margin-right: var(--ui-interactive-spacing);
  }
</style>