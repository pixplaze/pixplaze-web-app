<script>
  import {createFormService} from '$lib/scripts/service/form/form.service.js';
  import {createValidationField} from '$lib/scripts/service/validation.service.svelte.js';
  import {hostSchema} from '$lib/scripts/util/validation.util.js';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import {maxLength, maxValue, minLength, minValue, number, pipe, regex, string, trim} from 'valibot';

  const form = createFormService({
    name: createValidationField(pipe(
        string(),
        trim(),
        minLength(3, 'Имя сервера должно быть длиннее 3 символов'),
        maxLength(32, 'Имя сервера должно быть короче 32 символов')
    ), ''),
    host: createValidationField(hostSchema(), ''),
    port: createValidationField(pipe(
        number(),
        regex(/^\d+$/, 'Порт должен состоять только из цифр'),
        minValue(1, 'Минимальный порт сервера - 1'),
        maxValue(65535, 'Максимальный порт сервера - 65535')
    ), 25565)
  })
</script>

<form action="" class="server-bid-form">
  <div class="name-field">
    <Input id="server-name"
           label="Название сервера"
           bind:value={form.fields.name.value}
           classes={form.fields.name.validationClasses}
    />
    <Notice bind:notices={form.fields.name.validationNotices}/>
  </div>
  <div class="server-address">
    <div class="host-field">
      <Input id="server-host"
             label="Хост сервера"
             placeholder="mc.server.net"
             bind:value={form.fields.host.value}
             classes={form.fields.host.validationClasses}
      />
      <Notice bind:notices={form.fields.host.validationNotices}/>
    </div>
    <div class="port-field">
      <Input id="server-port"
             label="Порт сервера"
             placeholder="25565"
             type="number"
             bind:value={form.fields.port.value}
             classes={form.fields.port.validationClasses}
      />
      <Notice bind:notices={form.fields.port.validationNotices}/>
    </div>
  </div>
</form>

<style>
  .server-bid-form {
    display: flex;
    flex-wrap: wrap;
    flex: 1 1 440px;
    gap: var(--ui-spacing);
  }
  .server-address {
    display: flex;
    gap: var(--ui-spacing);
  }
  .name-field {
    flex: 1;
  }

  :global {
    input {
      margin-bottom: var(--ui-spacing);
    }
  }
</style>