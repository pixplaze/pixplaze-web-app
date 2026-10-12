<script>
  import ServerBidList from '$lib/components/ServerBidList.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import Loader from '$lib/components/ui/Loader.svelte';
  import Radio from '$lib/components/ui/inputs/Radio.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import {userService} from '$lib/scripts/service/user.service.js';
  import {pageService} from '$lib/scripts/service/page.service.js';
  import {serverBidService} from '$lib/scripts/service/server.bid.service.js';
  import {noticeService} from '$lib/scripts/service/notice.service.js';
  import {LEVEL} from '$lib/scripts/util/notice.util.js';
  import {mapBid} from '$lib/scripts/util/server.mapper.js';

  // Вид страницы выбирается по роли: админ — все заявки с решениями, остальные — свои.
  const user = $derived(userService.user);
  const isAdmin = $derived(user?.authority?.roles?.some(role => role.name === 'ADMIN') ?? false);

  let filter = $state('PENDING');
  let bids = $state([]);
  let loading = $state(true);
  let busyId = $state(null);
  let notices = $state([]);

  async function load() {
    loading = true;
    try {
      const raw = isAdmin
          ? await serverBidService.fetchAll(filter === 'ALL' ? null : filter)
          : await serverBidService.fetchMine();
      bids = raw.map(mapBid);
    } catch (e) {
      notices = [noticeService.create(e.message, LEVEL.ERROR)];
    } finally {
      loading = false;
    }
  }

  // Профиль (и роли) приходит асинхронно; перезагружаем при его появлении и смене фильтра.
  $effect(() => {
    if (!user) return;
    isAdmin; filter;
    load();
  });

  async function decide(bid, action, done) {
    busyId = bid.id;
    try {
      await action(bid.id);
      notices = [noticeService.create(`Заявка «${bid.name}» ${done}`, LEVEL.INFO)];
      await load();
    } catch (e) {
      notices = [noticeService.create(e.message, LEVEL.ERROR)];
    } finally {
      busyId = null;
    }
  }

  const onApprove = bid => decide(bid, id => serverBidService.approve(id), 'подтверждена');
  const onReject = bid => decide(bid, id => serverBidService.reject(id), 'отклонена');
</script>

<section class="bids-pane">
  <h1>{isAdmin ? 'Заявки серверов' : 'Мои заявки'}</h1>
  {#if isAdmin}
    <div class="bids-filter">
      <Radio id="bids-pending" bind:group={filter} value="PENDING">Открытые</Radio>
      <Radio id="bids-all" bind:group={filter} value="ALL">Все</Radio>
    </div>
  {:else}
    <Button onclick={() => pageService.goToServersList()}>Подать заявку</Button>
  {/if}
  <Notice bind:notices onClose={() => notices = []}/>
  {#if loading}
    <Loader loading={true}/>
  {:else}
    <ServerBidList {bids} admin={isAdmin} {busyId} {onApprove} {onReject}/>
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
