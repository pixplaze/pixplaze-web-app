<script>
  import {copyToClipboard} from '$lib/scripts/util/utils.js';
  import {noticeService} from '$lib/scripts/service/notice.service.js';
  import {LEVEL} from '$lib/scripts/util/notice.util.js';
  import {ServerBidFormService} from '$lib/scripts/service/form/serverbid.form.service.js';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import ButtonIcon from '$lib/components/ui/buttons/ButtonIcon.svelte';
  import Checkbox from '$lib/components/ui/inputs/Checkbox.svelte';
  import {serverBidService} from '$lib/scripts/service/server.bid.service.js';

  const {
    onSubmit = () => {}
  } = $props();

  const form = new ServerBidFormService();

  let inviteCode = $state('');
  let preview = $state(null);
  /** Интеграция заявки, для которой выдан код: инструкция зависит от неё, а не от текущего флажка. */
  let codeForIntegration = $state(false);
  let integrationNotices = $derived(form.withoutIntegration ? [{
    message: 'Интеграция необходима для авторизации игроков, синхронизации чата и карты сервера. ' +
             'Без интеграции сервер в листинге будет отображаться как обычно. ' +
             'Интеграция требует установки плагина.',
    level: LEVEL.WARNING
  }] : []);

  async function submit() {
    if (!form.isValid) return;
    try {
      const request = form.toRequest();
      const bid = await serverBidService.submit(request);
      inviteCode = bid.inviteCode;
      preview = bid.preview;
      codeForIntegration = request.isIntegration;
      await onSubmit(request);
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
    <div class="server-address-fields">
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
    </div>
    <div class="server-address-notices">
      <Notice bind:notices={form.fields.host.validationNotices} onClose={() => form.fields.host.clear()}/>
      <Notice bind:notices={form.fields.port.validationNotices} onClose={() => form.fields.port.clear()}/>
      <Notice bind:notices={form.fields.port.validationNotices} onClose={() => form.fields.port.clear()}/>
    </div>
  </div>
  <Checkbox id="without-integration" bind:checked={form.withoutIntegration}>Создать без интеграции</Checkbox>
  <Notice notices={integrationNotices} closeable={false}/>
  {#if !form.withoutIntegration}
    <div class="owner-field">
      <Input id="server-owner"
             label="Ник владельца в Minecraft"
             placeholder="Steve"
             maxlength={16}
             bind:value={form.fields.ownerUsername.value}
             classes={form.fields.ownerUsername.validationClasses}
      />
      <Notice bind:notices={form.fields.ownerUsername.validationNotices} onClose={() => form.fields.ownerUsername.clear()}/>
    </div>
  {/if}
  <Notice bind:notices={form.notices} onClose={() => form.clearNotices()}/>
  {#if inviteCode}
    <div class="invite-code" style="display: flex; gap: var(--ui-spacing); width: 100%">
      <Input id="server-invite-code" bind:value={inviteCode} disabled/>
      <ButtonIcon icon="copy" onclick={() => copyToClipboard(inviteCode)}/>
    </div>
    <p class="invite-code-hint">
      {#if codeForIntegration}
        Укажите код в конфиге плагина и перезапустите сервер, затем подтвердите регистрацию по ссылке, которую выведет плагин.
      {:else}
        Добавьте код в MOTD сервера: принадлежность подтвердится автоматически при проверке сервера, после чего код можно убрать.
      {/if}
    </p>
  {/if}
  {#if preview}
    <div class="ui box bid-preview">
      {#if preview.image}
        <img src={preview.image} alt="Server Icon" class="bid-preview-icon pixel-art">
      {/if}
      <div>
        <h2>{preview.name}</h2>
        <p>{preview.host}</p>
      </div>
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
    flex: auto;
  }
  .server-address-fields {
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
  .owner-field {
    flex: 1 1 100%;
  }
  .invite-code-hint {
    flex: 1 1 100%;
  }
  .bid-preview {
    display: flex;
    flex: 1 1 100%;
    align-items: center;
    gap: var(--ui-spacing);
  }
  .bid-preview-icon {
    width: 64px;
    height: 64px;
  }
</style>