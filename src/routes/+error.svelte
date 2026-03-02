<script>
  import {page} from '$app/state';
  import ArtEnderman404 from "$lib/components/arts/ArtEnderman404.svelte";
  import ArtAlex500 from '../lib/components/arts/ArtAlex500.svelte';

  let errorImage
  const getMessageByCode = c => {
    switch (c) {
      case 404:
        return 'То, что вы пытаетесь найти, унёс Эндермен...';
      case 500:
        return 'Кажется, что-то отвалилось...';
      default:
        return 'Что-то пошло не так...'
    }
  }
</script>

<div class="error">
  <section id="art">
    {#if page.status === 404}
      <ArtEnderman404/>
    {:else if page.status === 500}
      <ArtAlex500/>
    {:else}
      <p>Неизвестная ошибка!</p>
    {/if}
  </section>
  <section id="error">
    <div class="desctiption">
      <h1>{page.status}</h1>
      <p>{getMessageByCode(page.status)}</p>
    </div>
  </section>
</div>

<style>
  section:last-child {
    padding-bottom: 80px;
  }
  section {
    display: flex;
    text-align: center;
    justify-content: center;
  }

  h1 {
    font-size: 64px;
  }

  p {
    padding-top: var(--ui-padding);
  }
</style>