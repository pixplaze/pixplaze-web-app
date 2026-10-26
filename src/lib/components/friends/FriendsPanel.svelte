<script>
  import {onMount} from 'svelte';
  import {FriendsPanel, SEARCH_MIN_LENGTH} from './FriendsPanel.svelte.js';
  import {formatDate} from '$lib/scripts/util/utils.js';
  import {formatServerWhere} from '$lib/scripts/util/server.mapper.js';
  import Delimiter from '$lib/components/ui/Delimiter.svelte';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import ButtonIcon from '$lib/components/ui/buttons/ButtonIcon.svelte';
  import PlayerRow from '$lib/components/PlayerRow.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import OnlineIndicator from '$lib/components/ui/OnlineIndicator.svelte';
  import ItemList from '$lib/components/ui/ItemList.svelte';
  import ItemListRow from '$lib/components/ui/ItemListRow.svelte';

  /** Друзья профиля и их онлайн. */
  const {profileId} = $props();

  // svelte-ignore state_referenced_locally
  const panel = new FriendsPanel(profileId);

  onMount(() => panel.load());

  /** Где друг: игроки в сети с серверами, иначе когда был в сети. */
  const friendStatus = (friend) => {
    if (friend.players.length) {
      return friend.players.map(p => `${p.username} на ${formatServerWhere(p.server)}`).join(', ');
    }
    return friend.lastSeenAt ? `был в сети ${formatDate(friend.lastSeenAt)}` : 'не в сети';
  };

  /** Добавить по точному имени профиля из поля поиска. */
  const add = async () => {
    if (panel.query.trim() && await panel.add(panel.query)) panel.query = '';
  };

  /** Подпись найденного профиля; у не связанного — без подписи. */
  const FOUND_STATUS = {MUTUAL: 'уже в друзьях', OUTGOING: 'заявка отправлена', INCOMING: 'хочет дружить'};

  /** Действие с найденным профилем: добавить или принять заявку; друзьям и ждущим ответа — ничего. */
  const FOUND_ACTION = {NONE: 'Добавить', INCOMING: 'Принять'};
</script>

<Delimiter value="друзья"/>

<div class="friends-add">
  <Input id="friend-name" placeholder="Имя профиля или ник игрока" bind:value={panel.query} onEnter={add}/>
</div>

{#if panel.found.length}
  <div class="friends-found">
    <ItemList>
      {#each panel.found as profile (profile.profileId)}
        {#snippet foundStatus()}{FOUND_STATUS[profile.status]}{/snippet}
        <!-- Без onselect строка — блок, поэтому кнопки лежат в PlayerRow и берут его цвета -->
        <ItemListRow>
          <PlayerRow skinHeadBase64={profile.skinHeadBase64}
                     name={profile.name}
                     subtitle={FOUND_STATUS[profile.status] ? foundStatus : undefined}>
            {#snippet actions()}
              {#if FOUND_ACTION[profile.status]}
                <ButtonIcon title="Добавить в друзья"
                            icon="plus"
                            disabled={!panel.query.trim()}
                            onclick={add}/>
                <ButtonIcon title={FOUND_ACTION[profile.status]} icon="people" onclick={() => panel.add(profile.name)}/>
              {/if}
            {/snippet}
          </PlayerRow>
        </ItemListRow>
      {/each}
    </ItemList>
  </div>
{:else if panel.query.trim().length >= SEARCH_MIN_LENGTH && !panel.searching}
  <p class="friends-caption">Никого не нашлось</p>
{/if}

{#if panel.failed}
  <Notice notices={[{level: 'error', message: 'Не удалось загрузить друзей'}]} closeable={false}/>
{/if}

{#if panel.incoming.length}
  <p class="friends-caption">Хотят дружить</p>
  {#each panel.incoming as friend (friend.profileId)}
    <div class="friend">
      <PlayerRow name={friend.name}>
        {#snippet actions()}
          <ButtonIcon title="Добавить в ответ" icon="arrow-ok" onclick={() => panel.add(friend.name)}/>
          <ButtonIcon title="Отказать в ответ" icon="close" onclick={() => panel.remove(friend.name)}/>
<!--          <Button title="Добавить в ответ" onclick={() => panel.add(friend.name)}>Принять</Button>-->
        {/snippet}
      </PlayerRow>
    </div>
  {/each}
{/if}

{#if panel.online.length}
  <p class="friends-caption">Друзья</p>
  {#each panel.online as friend (friend.profileId)}
    <div class="friend">
      <PlayerRow name={friend.name} classes={['tight']}>
        {#snippet subtitle()}{friendStatus(friend)}{/snippet}
        {#snippet actions()}
          <OnlineIndicator online={friend.players.length > 0}/>
          <ButtonIcon title="Убрать из друзей"
                      icon="minus"
                      onclick={() => panel.remove(friend)}/>
        {/snippet}
      </PlayerRow>
    </div>
  {/each}
{/if}

{#if panel.outgoing.length}
  <p class="friends-caption">Ждут ответа</p>
  {#each panel.outgoing as friend (friend.profileId)}
    <div class="friend">
      <PlayerRow name={friend.name}>
        {#snippet actions()}
          <ButtonIcon title="Отменить заявку"
                      icon="minus"
                      onclick={() => panel.remove(friend)}/>
        {/snippet}
      </PlayerRow>
    </div>
  {/each}
{/if}

<style>
  .friends-add {
    display: flex;
    align-items: center;
    gap: var(--ui-padding);
    margin-bottom: var(--ui-spacing);
  }

  /* Найденные — в цвет строк друзей */
  .friends-found {
    --item-list-background: #666666;
    /*margin-bottom: var(--ui-spacing);*/
    /*border-bottom: var(--ui-size-border) solid var(--color-ui-shadow);*/
    color: var(--color-text-secondary);
    font-family: "Minecraft", "Arial", "sans-serif";
  }

  /* Строка игрока — на всю строку списка, кнопки у правого края */
  .friends-found :global(.player-row) {
    flex: 1 1 auto;
    min-width: 0;
  }

  .friend {
    margin-bottom: var(--ui-spacing);
    /*border: var(--ui-size-border) solid #333333;*/
    background-color: #666666;
    color: var(--color-text-secondary);
    font-family: "Minecraft", "Arial", "sans-serif";
  }

  .friends-caption {
    margin: 0 0 calc(var(--ui-spacing) / 2);
    color: var(--color-text-primary);
  }
</style>
