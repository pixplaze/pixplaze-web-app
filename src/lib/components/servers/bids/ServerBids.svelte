<script>
  import ServerBidList from '$components/servers/bids/ServerBidList.svelte';
  import ServerBidForm from '$components/servers/bids/ServerBidForm.svelte';
  import Notice from '$ui/Notice.svelte';
  import Loader from '$ui/indicators/Loader.svelte';
  import Radio from '$ui/inputs/Radio.svelte';
  import Button from '$ui/buttons/Button.svelte';
  import {currentUser} from '$scripts/user.svelte.js';
  import {permissions} from '$scripts/permissions.svelte.js';
  import {ServerBids} from '$components/servers/bids/ServerBids.svelte.js';

  // Вид выбирается по праву: кто одобряет заявки — все заявки с решениями, остальные — свои.
  const user = $derived(currentUser.value);
  const isAdmin = $derived(permissions.can(permissions.catalog.SYS_SERVERS_BIDS_APPROVE));

  const bids = new ServerBids();

  // Профиль и каталог прав приходят асинхронно — вид задаём, когда они появились.
  $effect(() => {
    if (user) bids.setAdmin(isAdmin);
  });
</script>

<section class="bids-pane">
  <h1>{isAdmin ? 'Заявки серверов' : 'Мои заявки'}</h1>
  <Button onclick={() => bids.toggleForm()}>{bids.formOpen ? 'Скрыть форму' : 'Подать заявку'}</Button>
  {#if bids.formOpen}
    <ServerBidForm onSubmit={() => bids.load()}/>
  {/if}
  {#if isAdmin}
    <div class="bids-filter">
      <Radio id="bids-pending" bind:group={bids.filter} value="PENDING">Открытые</Radio>
      <Radio id="bids-all" bind:group={bids.filter} value="ALL">Все</Radio>
    </div>
  {/if}
  <Notice bind:notices={bids.notices} onClose={() => bids.notices = []}/>
  {#if bids.loading}
    <Loader loading={true}/>
  {:else}
    <ServerBidList bids={bids.bids} admin={isAdmin} busyId={bids.busyId}
                   onApprove={bid => bids.approve(bid)} onReject={bid => bids.reject(bid)}/>
  {/if}
</section>

<style>
  section {
    padding-top: var(--ui-spacing);
  }
  section > * {
    margin-bottom: var(--ui-spacing);
  }
  .bids-filter {
    display: flex;
    gap: var(--ui-spacing);
  }
</style>
