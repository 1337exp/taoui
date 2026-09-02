<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import { getFocusable, trapTab } from '../focusTrap';

defineOptions({ name: 'TaoDrawer' });

const props = withDefaults(
    defineProps<{
        modelValue: boolean;
        title?: string;
        side?: 'left' | 'right';
        closable?: boolean;
        closeLabel?: string;
    }>(),
    {
        title: '',
        side: 'right',
        closable: true,
        closeLabel: 'Закрыть',
    },
);

const emit = defineEmits(['update:modelValue', 'close']);

const panelRef = ref<HTMLElement | null>(null);
const titleId = useId();
let previousOverflow = '';
let previousFocus: HTMLElement | null = null;
let scrollLocked = false;

function close() {
    if (!props.closable) {
        return;
    }
    emit('update:modelValue', false);
    emit('close');
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
        if (isOpen) {
            previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            lockBodyScroll();
            void focusPanel();
            return;
        }
        unlockBodyScroll();
        restoreFocus();
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    unlockBodyScroll();
});
</script>

<template>
    <Teleport to="body">
        <Transition :name="`tao-drawer-${side}`">
            <div v-if="modelValue" class="tao-drawer" :class="`tao-drawer--${side}`" @keydown="onKeydown">
                <div class="tao-drawer__overlay" @click="close"></div>
                <aside
                    ref="panelRef"
                    class="tao-drawer__panel"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="title ? titleId : undefined"
                    tabindex="-1"
                >
                    <div v-if="title || closable" class="tao-drawer__header">
                        <h2 v-if="title" :id="titleId" class="tao-drawer__title">{{ title }}</h2>
                        <span v-else></span>
                        <button
                            v-if="closable"
                            type="button"
                            class="tao-drawer__close"
                            :aria-label="closeLabel"
                            @click="close"
                        >
                            <span aria-hidden="true">
                                <slot name="close-icon">&times;</slot>
                            </span>
                        </button>
                    </div>
                    <div class="tao-drawer__content">
                        <slot />
                    </div>
                    <div v-if="$slots.footer" class="tao-drawer__footer">
                        <slot name="footer" />
                    </div>
                </aside>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.tao-drawer {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
}

.tao-drawer--right {
    justify-content: flex-end;
}

.tao-drawer--left {
    justify-content: flex-start;
}

.tao-drawer__overlay {
    position: absolute;
    inset: 0;
    background: var(--tao-color-overlay);
}

.tao-drawer__panel {
    position: relative;
    display: flex;
    flex-direction: column;
    width: min(360px, 100%);
    height: 100%;
    background: var(--tao-color-surface-raised);
    box-shadow: var(--tao-shadow-overlay);
}

.tao-drawer__panel:focus {
    outline: none;
}

.tao-drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--tao-space-3);
    padding: var(--tao-space-4);
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-drawer__title {
    margin: 0;
    font-size: var(--tao-font-size-lg);
    font-weight: 600;
    color: var(--tao-color-text-strong);
}

.tao-drawer__close {
    background: none;
    border: none;
    padding: 0;
    font-size: 24px;
    line-height: 1;
    color: var(--tao-color-text);
    cursor: pointer;
}

.tao-drawer__close:hover {
    color: var(--tao-color-text-strong);
}

.tao-drawer__close:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
    border-radius: var(--tao-radius-control);
}

.tao-drawer__content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: var(--tao-space-4);
}

.tao-drawer__footer {
    padding: var(--tao-space-4);
    border-top: 1px solid var(--tao-color-border);
    display: flex;
    gap: var(--tao-space-3);
    justify-content: flex-end;
}

.tao-drawer-right-enter-active,
.tao-drawer-right-leave-active,
.tao-drawer-left-enter-active,
.tao-drawer-left-leave-active {
    transition: opacity var(--tao-duration-base) var(--tao-ease-base);
}

.tao-drawer-right-enter-active .tao-drawer__panel,
.tao-drawer-right-leave-active .tao-drawer__panel,
.tao-drawer-left-enter-active .tao-drawer__panel,
.tao-drawer-left-leave-active .tao-drawer__panel {
    transition: transform var(--tao-duration-slow) var(--tao-ease-base);
}

.tao-drawer-right-enter-from,
.tao-drawer-right-leave-to,
.tao-drawer-left-enter-from,
.tao-drawer-left-leave-to {
    opacity: 0;
}

.tao-drawer-right-enter-from .tao-drawer__panel,
.tao-drawer-right-leave-to .tao-drawer__panel {
    transform: translateX(100%);
}

.tao-drawer-left-enter-from .tao-drawer__panel,
.tao-drawer-left-leave-to .tao-drawer__panel {
    transform: translateX(-100%);
}
</style>
