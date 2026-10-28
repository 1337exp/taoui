<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { nextTick, ref, useId, watch } from 'vue';
import { getFocusable, trapTab } from '../focusTrap';
import { useLayer } from '../layers';
import { useLocaleText } from '../locale';

defineOptions({ name: 'TaoDrawer' });

const props = withDefaults(
    defineProps<{
        modelValue: boolean;
        title?: string;
        /**
         * `bottom` is a sheet: it rises from the bottom edge, as wide as the screen up to 640px, as tall as its content up
         * to 90% of the screen, above the safe area. The phone's own way to show options and a form.
         * `bottom` — нижний лист: поднимается от нижнего края, во всю ширину до 640px, по высоте содержимого до 90%
         * экрана, над безопасной зоной. Телефонный способ показать параметры и форму.
         */
        side?: 'left' | 'right' | 'bottom';
        closable?: boolean;
        closeLabel?: string;
    }>(),
    {
        title: '',
        side: 'right',
        closable: true,
    },
);
const l10n = useLocaleText(props, 'drawer');

const emit = defineEmits(['update:modelValue', 'close']);

const panelRef = ref<HTMLElement | null>(null);
const titleId = useId();

function close() {
    if (!props.closable) {
        return;
    }
    emit('update:modelValue', false);
    emit('close');
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
    if (panelRef.value) {
        trapTab(event, panelRef.value);
    }
}

// Escape, the page scroll lock and the focus return belong to the layer stack (see layers.ts)
useLayer(() => props.modelValue, { lockScroll: true, restoreFocus: true, onEscape: close });

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen) {
            void focusPanel();
        }
    },
    { immediate: true },
);
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
                    <!-- the sheet's grip: only a sign that it is a sheet / ручка листа: только знак, что это лист -->
                    <span v-if="side === 'bottom'" class="tao-drawer__grip" aria-hidden="true" />
                    <div v-if="title || closable" class="tao-drawer__header">
                        <h2 v-if="title" :id="titleId" class="tao-drawer__title">{{ title }}</h2>
                        <span v-else></span>
                        <button
                            v-if="closable"
                            type="button"
                            class="tao-drawer__close"
                            :aria-label="l10n.closeLabel"
                            @click="close"
                        >
                            <span aria-hidden="true">
                                <slot name="close-icon"><TaoIcon name="tao-close" /></slot>
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
    z-index: var(--tao-z-modal);
    display: flex;
}

.tao-drawer--right {
    justify-content: flex-end;
}

.tao-drawer--left {
    justify-content: flex-start;
}

.tao-drawer--bottom {
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
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

/* the sheet: rounded top corners, its content's height up to 90% of the screen, the last line above the home indicator
   лист: скруглённый верх, высота по содержимому до 90% экрана, последняя строка над индикатором «домой» */
.tao-drawer--bottom .tao-drawer__panel {
    width: min(640px, 100%);
    height: auto;
    max-height: 90dvh;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    border-radius: var(--tao-radius-panel) var(--tao-radius-panel) 0 0;
}

.tao-drawer__grip {
    flex: none;
    width: 36px;
    height: 4px;
    margin: var(--tao-space-2) auto 0;
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-border-strong);
}

.tao-drawer--bottom .tao-drawer__header {
    padding-top: var(--tao-space-2);
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
.tao-drawer-left-leave-active,
.tao-drawer-bottom-enter-active,
.tao-drawer-bottom-leave-active {
    transition: opacity var(--tao-duration-base) var(--tao-ease-base);
}

.tao-drawer-right-enter-active .tao-drawer__panel,
.tao-drawer-right-leave-active .tao-drawer__panel,
.tao-drawer-left-enter-active .tao-drawer__panel,
.tao-drawer-left-leave-active .tao-drawer__panel,
.tao-drawer-bottom-enter-active .tao-drawer__panel,
.tao-drawer-bottom-leave-active .tao-drawer__panel {
    transition: transform var(--tao-duration-slow) var(--tao-ease-base);
}

.tao-drawer-right-enter-from,
.tao-drawer-right-leave-to,
.tao-drawer-left-enter-from,
.tao-drawer-left-leave-to,
.tao-drawer-bottom-enter-from,
.tao-drawer-bottom-leave-to {
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

.tao-drawer-bottom-enter-from .tao-drawer__panel,
.tao-drawer-bottom-leave-to .tao-drawer__panel {
    transform: translateY(100%);
}
</style>
