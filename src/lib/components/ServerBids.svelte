<script>
  import ServerBidList from '$lib/components/ServerBidList.svelte';
  import ServerBidForm from '$lib/components/ServerBidForm.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import Loader from '$lib/components/ui/Loader.svelte';
  import Radio from '$lib/components/ui/inputs/Radio.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import {currentUser} from '$lib/scripts/user.svelte.js';
  import {ServerBids} from './ServerBids.svelte.js';

  // Вид выбирается по роли: админ — все заявки с решениями, остальные — свои.
  const user = $derived(currentUser.value);
  const isAdmin = $derived(user?.authority?.roles?.some(role => role.name === 'ADMIN') ?? false);

  const bids = new ServerBids();

  // Профиль (и роли) приходит асинхронно — вид задаём, когда он появился.
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
