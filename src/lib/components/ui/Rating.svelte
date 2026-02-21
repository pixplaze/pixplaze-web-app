<script>
  import Icon from "$lib/components/ui/Icon.svelte";

  let {
    max = 5,
    rating,
    onVoted = () => {}
  } = $props();

  let vote = rating;
  let isRatingHovered = $state(false);
  let abortController;

  const getScore = (e) => {
    const child = e.currentTarget;
    const parent = child.parentNode;
    return Array.prototype.indexOf.call(parent.children, child) + 1;
  }

  const onMouseEnterRating = e => {
    isRatingHovered = true;
    // abortController = new AbortController();
    for (const child of e.currentTarget.childNodes) {
      if (child.classList && child.classList.contains('score')) {
        child.addEventListener('mouseenter', onMouseEnterScore);
        // child.addEventListener('mouseenter', onMouseEnterScore, {signal: abortController.signal});
      }
    }
  }

  const onMouseLeaveRating = e => {
    isRatingHovered = false;
    rating = vote;
    // abortController.abort();
    console.log('leave')
    for (const child of e.currentTarget.childNodes) {
      if (child.classList && child.classList.contains('score')) {
        child.removeEventListener('mouseenter', onMouseEnterScore);
      }
    }
  }

  const onMouseEnterScore = e => {
    rating = getScore(e);
  }

  const onMouseClickScore = e => {
    vote = getScore(e);
    onVoted(vote);
  }
</script>

<div class="rating"
     class:hovered={isRatingHovered}
     role="none"
     tabindex="-1"
     onmouseenter={onMouseEnterRating}
     onmouseleave={onMouseLeaveRating}
>
<!--  Из-за того, что динамически перерисовывает, на вновь добавленных элементах нет лиснеров -->
<!--  Использовать локлаьные переменные для предотвращения реактивности -->
  {#each Array(rating) as _}
    <button class="score" onclick={onMouseClickScore}>
      <Icon icon={"heart-filled"}/>
    </button>
  {/each}
  {#each Array(max - rating) as _}
    <button class="score" onclick={onMouseClickScore}>
      <Icon icon={"heart"}/>
    </button>
  {/each}
  </div>

  <style>
    .rating {
      display: flex;
      width: min-content;
    }

    .score {
      padding: 0;
      width: 40px;
      height: 40px;
      outline: none;
      cursor: pointer;
      border: none;
      background: transparent;
    }

    :global(.rating [class^="icon-heart-filled"]) {
      color: var(--color-red-main);
    }

    :global(.rating.hovered [class^="icon-heart-filled"]) {
      color: #EFC500;
    }
  </style>