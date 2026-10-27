<script>
  import {copyToClipboard} from '$util/dom.util.js';
  import {createNotice, LEVEL} from '$util/notice.util.js';
  import {ServerBidForm} from '$components/servers/bids/ServerBidForm.svelte.js';
  import Input from '$ui/inputs/Input.svelte';
  import Notice from '$ui/Notice.svelte';
  import Button from '$ui/buttons/Button.svelte';
  import ButtonIcon from '$ui/buttons/ButtonIcon.svelte';
  import ServerIcon from '$components/servers/ServerIcon.svelte';
  import {bidsApi} from '$api/bids.api.js';

  const {
    onSubmit = () => {}
  } = $props();

  const form = new ServerBidForm();

  let inviteCode = $state('');
  let preview = $state(null);

  async function submit() {
    if (!form.isValid) return;
    try {
      const request = form.toRequest();
      const bid = await bidsApi.submit(request);
      inviteCode = bid.inviteCode;
      preview = bid.preview;
      await onSubmit(request);
    } catch (e) {
      form.pushNotice(createNotice(e.message, LEVEL.ERROR));
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
    </div>
  </div>
  <Notice bind:notices={form.notices} onClose={() => form.clearNotices()}/>
  {#if inviteCode}
    <div class="invite-code" style="display: flex; gap: var(--ui-spacing); width: 100%">
      <Input id="server-invite-code" bind:value={inviteCode} disabled/>
      <ButtonIcon icon="copy" onclick={() => copyToClipboard(inviteCode)}/>
    </div>
    <p class="invite-code-hint">Добавьте код в MOTD сервера. Без плагина регистрация подтвердится при ближайшей проверке сервера; с плагином перезапустите сервер и подтвердите регистрацию по ссылке, которую он выведет. После регистрации код можно убрать.</p>
  {/if}
  {#if preview}
    <div class="ui box bid-preview">
      <ServerIcon src={preview.image} alt="Server Icon"/>
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
  .invite-code-hint {
    flex: 1 1 100%;
  }
  .bid-preview {
    display: flex;
    flex: 1 1 100%;
    align-items: center;
    gap: var(--ui-spacing);
    --server-icon-size: 64px;
  }
</style>