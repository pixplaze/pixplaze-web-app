<script>
  import {copyToClipboard} from '$lib/scripts/util/utils.js';
  import {api} from '$lib/scripts/api/api.config.js';
  import {noticeService} from '$lib/scripts/service/notice.service.js';
  import {LEVEL} from '$lib/scripts/util/notice.util.js';
  import {ServerBidFormService} from '$lib/scripts/service/form/serverbid.form.service.js';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import ButtonIcon from '$lib/components/ui/buttons/ButtonIcon.svelte';
  import Checkbox from '$lib/components/ui/inputs/Checkbox.svelte';

  const {
    onSubmit = () => {}
  } = $props();

  const form = new ServerBidFormService();

  let inviteCode = $state('');
  let integrationNotices = $derived(form.withoutIntegration ? [{
    message: 'Интеграция необходима для авторизации игроков, синхронизации чата и карты сервера. ' +
             'Без интеграции сервер в листинге будет отображаться как обычно. ' +
             'Интеграция требует установки плагина.',
    level: LEVEL.WARNING
  }] : []);

  async function submit() {
    if (!form.isValid) return;
    try {
      const body = JSON.stringify(form.toRequest());
      console.log(body);
      const res = await api.post('/servers/bids', {body});
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      inviteCode = text;
      await onSubmit(form.toRequest());
    } catch (e) {
      form.pushNotice(noticeService.create(e.message, LEVEL.ERROR));
    }
  }
</script>

<form action="" class="server-bid-form">
  <div class="name-field">
    <Input id="server-name"
           label="Название"
           placeholder="A Minecraft Server"
           bind:value={form.fields.name.value}
           classes={form.fields.name.validationClasses}
    />
    <Notice bind:notices={form.fields.name.validationNotices} onClose={() => form.fields.name.clear()}/>
  </div>
  <div class="server-address">
    <div class="host-field">
      <Input id="server-host"
             label="Хост"
             placeholder="mc.server.net"
             bind:value={form.fields.host.value}
             classes={form.fields.host.validationClasses}
      />
    </div>
    <div class="port-field">
      <Input id="server-port"
             label="Порт"
             min={1}
             max={65535}
             type="number"
             bind:value={form.fields.port.value}
             classes={form.fields.port.validationClasses}
      />
    </div>
    <div class="server-address-notices">
      <Notice bind:notices={form.fields.host.validationNotices} onClose={() => form.fields.host.clear()}/>
      <Notice bind:notices={form.fields.port.validationNotices} onClose={() => form.fields.port.clear()}/>
    </div>
  </div>
  <Checkbox id="without-integration" bind:checked={form.withoutIntegration}>Создать без интеграции</Checkbox>
  <Notice notices={integrationNotices} closeable={false}/>
  {#if inviteCode}
    <div class="invite-code" style="display: flex; gap: var(--ui-spacing); width: 100%">
      <Input bind:value={inviteCode} disabled/>
      <ButtonIcon icon="copy" onclick={() => copyToClipboard(inviteCode)}/>
    </div>
  {/if}
  <Button onclick={async () => await submit()} disabled={!form.isValid}>Создать</Button>
</form>

<style>
  .server-bid-form {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-spacing);
  }
  .server-address {
    display: flex;
    flex: 1 1 auto;
    gap: var(--ui-spacing);
  }
  .name-field {
    flex: 1 1 auto;
  }
  .host-field {
    flex: 1 1 auto;
  }
  .port-field {
    width: 110px;
  }
</style>