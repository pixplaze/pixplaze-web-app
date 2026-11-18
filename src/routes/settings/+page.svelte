<script>
    import Delimiter from "#ui/Delimiter.svelte";
    import PushNotifications from "#components/PushNotifications.svelte";
    import Checkbox from "#ui/inputs/Checkbox.svelte";
    import {currentUser} from "#scripts/user.svelte.js";
    import {profilesApi} from "#api/profiles.api.js";
    import {notifications} from "#scripts/notifications.svelte.js";

    const user = $derived(currentUser.value);
    /** Настройка «скрывать мой онлайн»: сохраняется сразу при переключении. */
    let onlineHidden = $state(false);
    $effect(() => {
        onlineHidden = !!user?.isOnlineHidden;
    });

    async function setOnlineHidden(hidden) {
        try {
            await profilesApi.update(user.id, {isOnlineHidden: hidden});
            notifications.info(hidden ? 'Друзья не видят ваш онлайн' : 'Друзья видят ваш онлайн');
        } catch (error) {
            onlineHidden = !hidden;
            notifications.error(`Не удалось сохранить настройку: ${error.message}`);
        }
    }
</script>

<section>
    <Delimiter value="профиль"/>
    <Checkbox id="online-hidden" bind:checked={() => onlineHidden, (hidden) => {
        onlineHidden = hidden;
        setOnlineHidden(hidden);
      }}>
        <span>Скрывать мой онлайн от друзей</span>
    </Checkbox>
</section>

<PushNotifications/>