<script>
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import ButtonIcon from '$lib/components/ui/buttons/ButtonIcon.svelte';
  import {copyToClipboard} from '$lib/scripts/util/utils.js';

  /**
   * Список заявок. В режиме `admin` показывает, кто подал заявку, и кнопки решения по открытым:
   * подтвердить можно только заявку без плагина — заявку с плагином подтверждает сам плагин.
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
      <p class="bid-address">{bid.address} · {bid.plugin ? 'с плагином' : 'без плагина'}{bid.owner ? ` · владелец ${bid.owner}` : ''}</p>
      {#if admin}
        <p class="bid-meta">Подал: {bid.applicant ?? '—'}</p>
      {/if}
      <p class="bid-meta">
        Подана {formatDateTime(bid.createdAt)}{#if bid.expiresAt}, истекает {formatDateTime(bid.expiresAt)}{/if}
      </p>
      <div class="bid-code">
        <span>Код: <code>{bid.code}</code></span>
        <ButtonIcon icon="copy" classes="transparent" onclick={() => copyToClipboard(bid.code)}/>
      </div>
      {#if bid.pending && !admin}
        <p class="bid-meta">
          {bid.plugin
              ? 'Укажите код в конфиге плагина и перезапустите сервер, затем подтвердите регистрацию по ссылке, которую выведет плагин.'
              : 'Добавьте код в MOTD сервера: принадлежность подтвердится автоматически при проверке сервера.'}
        </p>
      {/if}
      {#if admin && bid.pending}
        <div class="bid-actions">
          {#if !bid.plugin}
            <Button disabled={busyId === bid.id} onclick={() => onApprove(bid)}>Подтвердить</Button>
          {/if}
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
    padding: var(--ui-padding);
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
  .bid-status--approved { color: var(--color-green-main); }
  .bid-status--rejected, .bid-status--expired { color: var(--color-text-secondary); }
</style>
