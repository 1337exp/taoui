<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import TaoButton from './TaoButton.vue';
import TaoIcon from './TaoIcon.vue';
import { currentConfirm, registerConfirmHost, resolveConfirm, unregisterConfirmHost } from '../confirm/store';
import { trapTab } from '../focusTrap';
import { toneClass } from '../tone';
import { useLayer } from '../layers';
import { surfaceClass } from '../surface';

defineOptions({ name: 'TaoConfirmHost' });

const panelRef = ref<HTMLElement | null>(null);

onMounted(() => {
    registerConfirmHost();
});

onBeforeUnmount(() => {
    unregisterConfirmHost();
});

// Escape, the page scroll lock and the focus return belong to the layer stack (see layers.ts)
useLayer(() => Boolean(currentConfirm.value), { lockScroll: true, restoreFocus: true, onEscape: () => answer(false) });

watch(
    () => currentConfirm.value?.id,
    async (id) => {
        if (!id) {
            return;
        }

        await nextTick();
        queryButton(currentConfirm.value?.danger ? 'cancel' : 'ok')?.focus();
    },
);

function queryButton(which: 'ok' | 'cancel') {
    return panelRef.value?.querySelector<HTMLButtonElement>(`[data-tao-confirm-${which}]`) ?? null;
}

function answer(value: boolean) {
    resolveConfirm(value);
}

function onOverlayClick() {
    answer(false);
}

function onKeydown(event: KeyboardEvent) {
    if (panelRef.value) {
        trapTab(event, panelRef.value);
    }
}
</script>

<template>
    <Teleport to="body">
        <Transition name="tao-confirm">
            <div
                v-if="currentConfirm"
                class="tao-confirm"
                :class="{ 'tao-confirm--glass': currentConfirm.surface === 'glass' }"
                data-tao-confirm-host
                @keydown="onKeydown"
            >
                <div class="tao-confirm__overlay" @click="onOverlayClick"></div>

                <div
                    ref="panelRef"
                    class="tao-confirm__panel"
                    :class="[surfaceClass(currentConfirm.surface), toneClass(currentConfirm.danger ? 'danger' : 'warning')]"
                    role="alertdialog"
                    aria-modal="true"
                    :aria-labelledby="currentConfirm.title ? 'tao-confirm-title' : undefined"
                    :aria-describedby="currentConfirm.message ? 'tao-confirm-message' : undefined"
                    tabindex="-1"
                >
                    <span class="tao-confirm__accent" aria-hidden="true"></span>

                    <span class="tao-confirm__icon" aria-hidden="true">
                        <TaoIcon :name="currentConfirm.danger ? 'tao-x-circle' : 'tao-info'" :size="22" />
                    </span>

                    <div class="tao-confirm__body">
                        <h2 v-if="currentConfirm.title" id="tao-confirm-title" class="tao-confirm__title">
                            {{ currentConfirm.title }}
                        </h2>
                        <p v-if="currentConfirm.message" id="tao-confirm-message" class="tao-confirm__message">
                            {{ currentConfirm.message }}
                        </p>
                    </div>

                    <div class="tao-confirm__actions">
                        <TaoButton data-tao-confirm-cancel variant="ghost" tone="neutral" @click="answer(false)">
                            {{ currentConfirm.cancelLabel }}
                        </TaoButton>
                        <TaoButton
                            data-tao-confirm-ok
                            :tone="currentConfirm.danger ? 'danger' : undefined"
                            @click="answer(true)"
                        >
                            {{ currentConfirm.okLabel }}
                        </TaoButton>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.tao-confirm {
    position: fixed;
    inset: 0;
    z-index: var(--tao-z-confirm);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--tao-space-5);
}

.tao-confirm__overlay {
    position: absolute;
    inset: 0;
    background: var(--tao-color-overlay);
}

/* Glass needs the page to show through: a lighter dim. / Стеклу нужно, чтобы страница просвечивала: затемнение слабее. */
.tao-confirm--glass .tao-confirm__overlay {
    background: color-mix(in srgb, var(--tao-color-overlay) 65%, transparent);
}

.tao-confirm__panel {
    --tao-confirm-tone: var(--tao-tone);

    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
        "icon body"
        "actions actions";
    gap: var(--tao-space-3) var(--tao-space-4);
    width: min(420px, 100%);
    padding: var(--tao-space-5);
    background-color: var(--tao-surface-fill, color-mix(in srgb, var(--tao-confirm-tone) 8%, var(--tao-color-surface-raised)));
    background-image: var(--tao-surface-image, none);
    background-size: var(--tao-surface-image-size, auto);
    -webkit-backdrop-filter: var(--tao-surface-backdrop, none);
    backdrop-filter: var(--tao-surface-backdrop, none);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-shadow-overlay);
    outline: none;
}

/* Glass keeps the tone tint; its own edge replaces the border. / Стекло сохраняет оттенок тона; край стекла вместо рамки. */
.tao-confirm__panel.tao-surface-glass {
    --tao-surface-fill: color-mix(in srgb, var(--tao-confirm-tone) 10%, var(--tao-glass-fill));
    border-color: var(--tao-glass-border);
    box-shadow: var(--tao-shadow-overlay);
}

.tao-confirm__accent {
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--tao-confirm-tone);
}

.tao-confirm__icon {
    grid-area: icon;
    display: inline-flex;
    margin-top: 2px;
    color: var(--tao-confirm-tone);
}

.tao-confirm__body {
    grid-area: body;
    min-width: 0;
}

.tao-confirm__title {
    margin: 0;
    font-size: var(--tao-font-size-lg);
    font-weight: 600;
    line-height: 1.3;
    color: var(--tao-color-text-strong);
}

.tao-confirm__message {
    margin: var(--tao-space-2) 0 0;
    font-size: var(--tao-font-size-md);
    line-height: 1.45;
    color: var(--tao-color-text);
}

.tao-confirm__actions {
    grid-area: actions;
    display: flex;
    justify-content: flex-end;
    gap: var(--tao-space-3);
    margin-top: var(--tao-space-1);
}

.tao-confirm-enter-active .tao-confirm__overlay,
.tao-confirm-leave-active .tao-confirm__overlay {
    transition: opacity var(--tao-duration-base) var(--tao-ease-base);
}

.tao-confirm-enter-from .tao-confirm__overlay,
.tao-confirm-leave-to .tao-confirm__overlay {
    opacity: 0;
}

.tao-confirm-enter-active .tao-confirm__panel {
    animation: tao-confirm-bounce-in var(--tao-duration-slow) var(--tao-ease-base);
}

.tao-confirm-leave-active .tao-confirm__panel {
    animation: tao-confirm-fade-out var(--tao-duration-base) var(--tao-ease-base);
}

@keyframes tao-confirm-bounce-in {
    0% {
        opacity: 0;
        transform: translateY(18px) scale(0.96);
    }
    60% {
        opacity: 1;
        transform: translateY(-4px) scale(1.02);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes tao-confirm-fade-out {
    to {
        opacity: 0;
        transform: translateY(10px);
    }
}
</style>
