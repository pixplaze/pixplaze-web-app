<!--<svelte:head>-->
<!--  <script>-->
<!--    document.addEventListener('DOMContentLoaded', () => {-->
<!--      document.getElementById('retry-button')-->
<!--              ?.addEventListener('click', () => {-->
<!--                window.location.reload();-->
<!--              });-->
<!--    });-->
<!--  </script>-->
<!--</svelte:head>-->

<script>
  import Button from '#ui/buttons/Button.svelte';

  function retry() {
    const returnTo = new URLSearchParams(location.search).get('returnTo');

    if (!returnTo) {
      location.assign('/');
      return;
    }

    // Не позволяем перенаправлять пользователя на чужой домен.
    const target = new URL(returnTo, location.origin);

    if (target.origin !== location.origin) {
      location.assign('/');
      return;
    }

    location.assign(target.href);
  }
</script>

<section class="art-container">
  <img src="/arts/anim-art-nitwit-villager.svg" alt="" style="
      shape-rendering: crispedges;
      transform-origin: top;
      min-width: 512px;
      min-height: 320px;">
  <h1>Нет подключения к интернету</h1>
  <p>Проверьте соединение и попробуйте открыть страницу ещё раз.</p>
  <Button id="retry-button" title="Обновить" onclick={() => retry()}>Повторить</Button>
</section>

<style>
  section {
    box-sizing: border-box;
    text-align: center;
    min-height: 100vh;
    margin: 0;
    place-items: center;
  }

  .art-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  }

  h1 {
    margin-bottom: 0.5rem;
  }

  p { color: #b7c2d0; line-height: 1.6; }
</style>