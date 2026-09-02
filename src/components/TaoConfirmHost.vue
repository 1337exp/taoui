<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import TaoButton from './TaoButton.vue';
import { currentConfirm, registerConfirmHost, resolveConfirm, unregisterConfirmHost } from '../confirm/store';
import { trapTab } from '../focusTrap';

defineOptions({ name: 'TaoConfirmHost' });

const panelRef = ref<HTMLElement | null>(null);
let previousOverflow = '';
let previousFocus: HTMLElement | null = null;
let scrollLocked = false;

onMounted(() => {
    registerConfirmHost();
});

onBeforeUnmount(() => {
    unlockBodyScroll();
    unregisterConfirmHost();
});

watch(
    () => currentConfirm.value?.id,
    async (id) => {
        if (!id) {
            unlockBodyScroll();
            restoreFocus();
            return;
        }

        previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        lockBodyScroll();
        await nextTick();
        queryButton(currentConfirm.value?.danger ? 'cancel' : 'ok')?.focus();
    },
);

function queryButton(which: 'ok' | 'cancel') {
    return panelRef.value?.querySelector<HTMLButtonElement>(`[data-tao-confirm-${which}]`) ?? null;
}

function lockBodyScroll() {
    if (scrollLocked) {
        return;
    }

    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    scrollLocked = true;
}

function unlockBodyScroll() {
    if (!scrollLocked) {
        return;
    }

    document.body.style.overflow = previousOverflow;
    previousOverflow = '';
    scrollLocked = false;
}

function restoreFocus() {
    previousFocus?.focus?.();
    previousFocus = null;
}

function answer(value: boolean) {
    resolveConfirm(value);
}

function onOverlayClick() {
    answer(false);
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        answer(false);
        return;
    }

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
                data-tao-confirm-host
                @keydown="onKeydown"
            >
                <div class="tao-confirm__overlay" @click="onOverlayClick"></div>

                <div
                    ref="panelRef"
                    class="tao-confirm__panel"
                    :class="{ 'tao-confirm__panel--danger': currentConfirm.danger }"
                    role="alertdialog"
                    aria-modal="true"
                    :aria-labelledby="currentConfirm.title ? 'tao-confirm-title' : undefined"
                    :aria-describedby="currentConfirm.message ? 'tao-confirm-message' : undefined"
                    tabindex="-1"
                >
                    <span class="tao-confirm__accent" aria-hidden="true"></span>

                    <span class="tao-confirm__icon" aria-hidden="true">
                        <svg v-if="currentConfirm.danger" viewBox="0 0 20 20" width="22" height="22" fill="none">
                            <circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.6" />
                            <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                        </svg>
                        <svg v-else viewBox="0 0 20 20" width="22" height="22" fill="none">
                            <circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.6" />
                            <path d="M10 9v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                            <circle cx="10" cy="6.4" r="0.8" fill="currentColor" />
                        </svg>
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
                        <TaoButton data-tao-confirm-cancel variant="secondary" @click="answer(false)">
                            {{ currentConfirm.cancelLabel }}
                        </TaoButton>
                        <TaoButton
                            data-tao-confirm-ok
                            :variant="currentConfirm.danger ? 'danger' : 'primary'"
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
    z-index: 1200;
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

.tao-confirm__panel {
    --tao-confirm-tone: var(--tao-color-warning);

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
    background: color-mix(in srgb, var(--tao-confirm-tone) 8%, var(--tao-color-surface-raised));
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-shadow-overlay);
    outline: none;
}

.tao-confirm__panel--danger {
    --tao-confirm-tone: var(--tao-color-danger);
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
