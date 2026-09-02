<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import { getFocusable, trapTab } from '../focusTrap';
import { isBrowser, lockBodyScroll, unlockBodyScroll } from '../bodyScroll';

defineOptions({ name: 'TaoModal' });

interface Props {
    modelValue: boolean;
    title?: string;
    closable?: boolean;
    closeLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    closable: true,
    closeLabel: 'Закрыть',
});

const emit = defineEmits(['update:modelValue', 'close']);

const panelRef = ref<HTMLElement | null>(null);
const titleId = useId();
let previousFocus: HTMLElement | null = null;
let scrollHeld = false;

function close() {
    if (!props.closable) {
        return;
    }
    emit('update:modelValue', false);
    emit('close');
}

function holdScroll() {
    if (scrollHeld || !isBrowser()) {
        return;
    }
    lockBodyScroll();
    scrollHeld = true;
}

function releaseScroll() {
    if (!scrollHeld) {
        return;
    }
    unlockBodyScroll();
    scrollHeld = false;
}

function restoreFocus() {
    previousFocus?.focus?.();
    previousFocus = null;
}

async function focusPanel() {
    await nextTick();
    const panel = panelRef.value;
    if (!panel) {
        return;
    }
    const first = getFocusable(panel)[0];
    (first ?? panel).focus();
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        if (!props.closable) {
            return;
        }
        event.preventDefault();
        close();
        return;
    }

    if (panelRef.value) {
        trapTab(event, panelRef.value);
    }
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (!isBrowser()) {
            return;
        }

        if (isOpen) {
            previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            holdScroll();
            void focusPanel();
            return;
        }
        releaseScroll();
        restoreFocus();
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    releaseScroll();
    restoreFocus();
});
</script>

<template>
    <Teleport to="body">
        <Transition name="tao-modal-fade">
            <div v-if="modelValue" class="tao-modal-overlay" @click.self="close" @keydown="onKeydown">
                <div
                    ref="panelRef"
                    class="tao-modal"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="title ? titleId : undefined"
                    tabindex="-1"
                >
                    <div v-if="title || $slots.header || closable" class="tao-modal__header">
                        <slot name="header">
                            <h2 v-if="title" :id="titleId" class="tao-modal__title">{{ title }}</h2>
                            <span v-else></span>
                        </slot>
                        <button
                            v-if="closable"
                            type="button"
                            class="tao-modal__close"
                            :aria-label="closeLabel"
                            @click="close"
                        >
                            <span aria-hidden="true">
                                <slot name="close-icon">&times;</slot>
                            </span>
                        </button>
                    </div>
                    <div class="tao-modal__content">
                        <slot />
                    </div>
                    <div v-if="$slots.footer" class="tao-modal__footer">
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.tao-modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--tao-color-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--tao-space-5);
}

.tao-modal {
    background: var(--tao-color-surface-raised);
    border-radius: var(--tao-radius-panel);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--tao-shadow-overlay);
}

.tao-modal:focus {
    outline: none;
}

.tao-modal:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

.tao-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--tao-space-4) var(--tao-space-5);
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-modal__title {
    margin: 0;
    font-size: var(--tao-font-size-xl);
    font-weight: 600;
    color: var(--tao-color-text-strong);
}

.tao-modal__close {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--tao-color-text);
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.tao-modal__close:hover {
    color: var(--tao-color-text-strong);
}

.tao-modal__close:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
    border-radius: var(--tao-radius-control);
}

.tao-modal__content {
    padding: var(--tao-space-5);
}

.tao-modal__footer {
    padding: var(--tao-space-4) var(--tao-space-5);
    border-top: 1px solid var(--tao-color-border);
    display: flex;
    gap: var(--tao-space-3);
    justify-content: flex-end;
}

.tao-modal-fade-enter-active,
.tao-modal-fade-leave-active {
    transition: opacity var(--tao-duration-base) var(--tao-ease-base);
}

.tao-modal-fade-enter-from,
.tao-modal-fade-leave-to {
    opacity: 0;
}
</style>
