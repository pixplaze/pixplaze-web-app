<script>
  import {onMount} from 'svelte';
  import {FriendsPanel, SEARCH_MIN_LENGTH} from '$components/friends/FriendsPanel.svelte.js';
  import {formatDate} from '$util/format.util.js';
  import {formatServerWhere} from '$util/server.mapper.js';
  import Delimiter from '$ui/Delimiter.svelte';
  import Input from '$ui/inputs/Input.svelte';
  import Button from '$ui/buttons/Button.svelte';
  import ButtonIcon from '$ui/buttons/ButtonIcon.svelte';
  import PlayerRow from '$components/players/PlayerRow.svelte';
  import Notice from '$ui/Notice.svelte';
  import OnlineIndicator from '$ui/indicators/OnlineIndicator.svelte';
  import ItemList from '$ui/lists/ItemList.svelte';
  import ItemListRow from '$ui/lists/ItemListRow.svelte';

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
  {#if panel.found.length}
    <div class="friends-found">
      <ItemList>
        {#each panel.found as profile (profile.profileId)}
          {#snippet foundStatus()}{FOUND_STATUS[profile.status]}{/snippet}
          <!-- Без onselect строка — блок, поэтому кнопки лежат в PlayerRow и берут его цвета -->
          <ItemListRow>
            <PlayerRow skinHeadBase64={profile.skinHeadBase64}
                       name={profile.name}
                       subtitle={FOUND_STATUS[profile.status] ? foundStatus : undefined}
                       classes="">
              {#snippet actions()}
                {#if FOUND_ACTION[profile.status]}
                  <ButtonIcon title="Добавить в друзья"
                              icon="plus"
                              classes="transparent"
                              disabled={!panel.query.trim()}
                              onclick={add}/>
                  <ButtonIcon title={FOUND_ACTION[profile.status]}
                              icon="people"
                              classes="transparent"
                              onclick={() => panel.add(profile.name)}/>
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
</div>

{#if panel.failed}
  <Notice notices={[{level: 'error', message: 'Не удалось загрузить друзей'}]} closeable={false}/>
{/if}

{#if panel.incoming.length}
  <h3 class="friends-caption">Хотят дружить</h3>
  {#each panel.incoming as friend (friend.profileId)}
    <div class="friend">
      <PlayerRow name={friend.name} classes="">
        {#snippet actions()}
          <ButtonIcon title="Добавить в ответ"
                      icon="arrow-ok"
                      classes="transparent"
                      onclick={() => panel.add(friend.name)}/>
          <ButtonIcon title="Отказать в ответ"
                      icon="close"
                      classes="transparent"
                      onclick={() => panel.remove(friend.name)}/>
        {/snippet}
      </PlayerRow>
    </div>
  {/each}
{/if}

{#if panel.online.length}
  <h3 class="friends-caption">Друзья</h3>
  {#each panel.online as friend (friend.profileId)}
    <div class="friend">
      <PlayerRow name={friend.name} classes="">
        {#snippet subtitle()}{friendStatus(friend)}{/snippet}
        {#snippet actions()}
          <OnlineIndicator online={friend.players.length > 0}/>
          <ButtonIcon title="Убрать из друзей"
                      icon="minus"
                      classes="transparent"
                      onclick={() => panel.remove(friend)}/>
        {/snippet}
      </PlayerRow>
    </div>
  {/each}
{/if}

{#if panel.outgoing.length}
  <h3 class="friends-caption">Ждут ответа</h3>
  {#each panel.outgoing as friend (friend.profileId)}
    <div class="friend">
      <PlayerRow name={friend.name} classes="">
        {#snippet actions()}
          <ButtonIcon title="Отменить заявку"
                      icon="minus"
                      classes="transparent"
                      onclick={() => panel.remove(friend)}/>
        {/snippet}
      </PlayerRow>
    </div>
  {/each}
{/if}

<style>
  .friends-add {
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

  :global {
    .friends-found {
      .player-row {
        outline: none;
      }
    }
  }
</style>
