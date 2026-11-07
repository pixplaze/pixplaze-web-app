<script>
  import Button from '$ui/buttons/Button.svelte';
  import ButtonIcon from '$ui/buttons/ButtonIcon.svelte';
  import {copyToClipboard} from '$util/dom.util.js';
  import Clipboard from "$ui/Clipboard.svelte";

  /**
   * Список заявок. В режиме `admin` показывает, кто подал заявку, и кнопки решения по открытым.
   */
  const {
    bids = [],
    admin = false,
    busyId = null,
    onApprove = () => {},
    onReject = () => {}
  } = $props();

  // API отдаёт ISO со смещением (`…+03:00`), его разбирает Date как есть.
  const formatDateTime = iso => iso
      ? new Date(iso).toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})
      : '';
</script>

<ul class="bid-list">
  {#each bids as bid (bid.id)}
    <li class="ui box bid">
      <div class="bid-head">
        <h2>{bid.name}</h2>
        <span class="bid-status bid-status--{bid.status.toLowerCase()}">{bid.statusLabel}</span>
      </div>
      {#if bid.address}
        <p class="bid-address">{bid.address}</p>
      {/if}
      {#if admin}
        <p class="bid-meta">Подал: {bid.applicant ?? '—'}</p>
      {/if}
      <p class="bid-meta">
        Подана {formatDateTime(bid.createdAt)}{#if bid.expiresAt}, истекает {formatDateTime(bid.expiresAt)}{/if}
      </p>
      <div class="bid-code">
        <span>Код:</span>
        <Clipboard bind:value={bid.code}/>
      </div>
      {#if bid.pending && !admin}
        <p class="bid-meta">Добавьте код в MOTD сервера. Без плагина регистрация подтвердится при ближайшей проверке сервера; с плагином перезапустите сервер и подтвердите регистрацию по ссылке, которую он выведет. После регистрации код можно убрать.</p>
      {/if}
      {#if admin && bid.pending}
        <div class="bid-actions">
          <Button disabled={busyId === bid.id} onclick={() => onApprove(bid)}>Подтвердить</Button>
          <Button disabled={busyId === bid.id} onclick={() => onReject(bid)}>Отклонить</Button>
        </div>
      {/if}
    </li>
  {:else}
    <li class="bid-empty">Заявок нет</li>
  {/each}
</ul>

<style>
  .bid-list {
    display: flex;
    flex-direction: column;
    gap: var(--ui-spacing);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .bid {
    display: flex;
    flex-direction: column;
    gap: calc(var(--ui-spacing) / 2);
    /*padding: var(--ui-padding);*/
  }

  .bid-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-spacing);
  }

  .bid-code {
    display: flex;
    align-items: center;
    gap: var(--ui-spacing);
  }

  .bid-actions {
    display: flex;
    gap: var(--ui-spacing);
  }

  .bid-status--pending { color: var(--color-ui-warning-border); }
  .bid-status--active { color: var(--color-green-main); }
  .bid-status--rejected, .bid-status--expired { color: var(--color-text-secondary); }
</style>
