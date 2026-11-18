
<script>
    import { onMount } from 'svelte';
    import { updated } from '$app/state';
    import ButtonIcon from "#ui/buttons/ButtonIcon.svelte";

    let updateAvailable = $state(false);
    let registration = null;
    let reloading = false;

    function checkWaitingWorker() {
        if (registration?.waiting) {
            updateAvailable = true;
        }
    }

    function watchRegistration(reg) {
        reg.addEventListener('updatefound', () => {
            const worker = reg.installing;

            worker?.addEventListener('statechange', () => {
                if (
                    worker.state === 'installed' &&
                    navigator.serviceWorker.controller
                ) {
                    updateAvailable = true;
                }
            });
        });
    }

    async function checkForUpdates() {
        if (!('serviceWorker' in navigator)) return;

        try {
            registration = await navigator.serviceWorker.getRegistration();

            if (!registration) return;

            checkWaitingWorker();
            await registration.update();
            checkWaitingWorker();
        } catch (error) {
            console.error('PWA update check failed:', error);
        }
    }

    function applyUpdate() {
        if (updated.current) {
            // Новая сборка SvelteKit, но необязательно новый SW
            window.location.reload();
            return;
        }

        const waiting = registration?.waiting;

        if (waiting) {
            waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    onMount(() => {
        if ('serviceWorker' in navigator) {
            checkForUpdates();

            navigator.serviceWorker.addEventListener(
                'controllerchange',
                () => {
                    if (reloading) return;

                    reloading = true;
                    window.location.reload();
                }
            );
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState !== 'visible') return;

            // SvelteKit самостоятельно проверяет updated.current.
            // Здесь дополнительно проверяем Service Worker.
            checkForUpdates();
        };

        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange
        );

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    });

    let showUpdate = $derived(
        updated.current || updateAvailable
    );
</script>

{#if showUpdate}
    <div class="update-banner">
        <span>Доступна новая версия приложения</span>
         <ButtonIcon icon="reload"
                     onclick={applyUpdate}
                     disabled={reloading}
         >Обновить</ButtonIcon>
    </div>
{/if}
