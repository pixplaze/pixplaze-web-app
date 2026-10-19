<script>
  import {onMount} from 'svelte';
  import {FriendsPanel} from './FriendsPanel.svelte.js';
  import {formatDate} from '$lib/scripts/util/utils.js';
  import {formatServerWhere} from '$lib/scripts/util/server.mapper.js';
  import Delimiter from '$lib/components/ui/Delimiter.svelte';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import ButtonIcon from '$lib/components/ui/buttons/ButtonIcon.svelte';
  import OnlineIndicator from '$lib/components/ui/OnlineIndicator.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';

  /** Друзья профиля и их онлайн. */
  const {profileId} = $props();

  // svelte-ignore state_referenced_locally
  const panel = new FriendsPanel(profileId);
  let name = $state('');

  onMount(() => panel.load());

  const add = async () => {
    if (name.trim() && await panel.add(name)) name = '';
  };
</script>

<Delimiter value="друзья"/>

<div class="friends-add">
  <Input id="friend-name" placeholder="Имя профиля" bind:value={name} onEnter={add}/>
  <Button title="Добавить в друзья" disabled={!name.trim()} onclick={add}>Добавить</Button>
</div>

{#if panel.failed}
  <Notice notices={[{level: 'error', message: 'Не удалось загрузить друзей'}]} closeable={false}/>
{/if}

{#if panel.incoming.length}
  <p class="friends-caption">Хотят дружить</p>
  {#each panel.incoming as friend (friend.profileId)}
    <div class="friend">
      <span class="friend-name">{friend.name}</span>
      <Button title="Добавить в ответ" onclick={() => panel.add(friend.name)}>Принять</Button>
    </div>
  {/each}
{/if}

{#if panel.online.length}
  <p class="friends-caption">Друзья</p>
  {#each panel.online as friend (friend.profileId)}
    <div class="friend">
      <OnlineIndicator online={friend.players.length > 0}/>
      <span class="friend-name">
        {friend.name}
        <span class="friend-status">
          {#if friend.players.length}
            {friend.players.map(p => `${p.username} на ${formatServerWhere(p.server)}`).join(', ')}
          {:else if friend.lastSeenAt}
            был в сети {formatDate(friend.lastSeenAt)}
          {:else}
            не в сети
          {/if}
        </span>
      </span>
      <ButtonIcon title="Убрать из друзей" icon="unlink"
                  onclick={() => panel.remove(friend)}/>
    </div>
  {/each}
{/if}

{#if panel.outgoing.length}
  <p class="friends-caption">Ждут ответа</p>
  {#each panel.outgoing as friend (friend.profileId)}
    <div class="friend">
      <span class="friend-name">{friend.name}</span>
      <ButtonIcon title="Отменить заявку" icon="unlink" onclick={() => panel.remove(friend)}/>
    </div>
  {/each}
{/if}

<style>
  .friends-add,
  .friend {
    display: flex;
    align-items: center;
    gap: var(--ui-padding);
    margin-bottom: var(--ui-spacing);
  }

  .friend {
    padding-left: var(--ui-padding);
    border: var(--ui-size-border) solid #333333;
    background-color: #666666;
    color: var(--color-text-secondary);
    font-family: "Minecraft", "Arial", "sans-serif";
  }

  .friend-name {
    margin-right: auto;
  }

  .friend-status {
    display: block;
    font-size: .8em;
    opacity: .8;
  }

  .friends-caption {
    margin: 0 0 calc(var(--ui-spacing) / 2);
    color: var(--color-text-primary);
  }
</style>
