<script lang="ts" setup>
import { onBeforeUnmount, onMounted, provide, ref, toRef } from 'vue';
import { sizeClass, type TaoSize } from '../size';
import {
    applyRoving,
    isRadio,
    isTextField,
    stopTarget,
    toolbarKey,
    toolbarStops,
    type TaoToolbarOrientation,
} from '../toolbar';

defineOptions({ name: 'TaoToolbar' });

const props = withDefaults(
    defineProps<{
        /** Accessible name: «Formatting», «Tools». / Доступное имя: «Форматирование», «Инструменты». */
        label?: string;
        /** The controls inside, as for any control. / Размер контролов внутри, как у любого контрола. */
        size?: TaoSize;
        /** Which arrows walk it. / Какие стрелки по ней ходят. */
        orientation?: TaoToolbarOrientation;
        /** `panel` — a raised bar of its own; `plain` — only the layout, for a toolbar inside a header. */
        variant?: 'panel' | 'plain';
    }>(),
    {
        label: undefined,
        size: undefined,
        orientation: 'horizontal',
        variant: 'panel',
    },
);

provide(toolbarKey, { orientation: toRef(props, 'orientation') });

const root = ref<HTMLElement | null>(null);
// the stop that keeps the Tab order: the last one the focus was on / остановка в порядке Tab — последняя, где был фокус
let current = 0;
let observer: MutationObserver | undefined;

function refresh() {
    if (!root.value) {
        return;
    }
    const stops = toolbarStops(root.value);
    current = Math.min(current, Math.max(0, stops.length - 1));
    applyRoving(stops, current);
}

function onFocusin(event: FocusEvent) {
    if (!root.value) {
        return;
    }
    const stops = toolbarStops(root.value);
    const index = stops.findIndex((stop) => stop.els.includes(event.target as HTMLElement));
    if (index !== -1 && index !== current) {
        current = index;
        applyRoving(stops, current);
    }
}

function onKeydown(event: KeyboardEvent) {
    if (!root.value || event.altKey || event.ctrlKey || event.metaKey || isTextField(event.target)) {
        return;
    }
    const vertical = props.orientation === 'vertical';
    const next = vertical ? 'ArrowDown' : 'ArrowRight';
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
    if (![next, prev, 'Home', 'End'].includes(event.key)) {
        return;
    }

    const stops = toolbarStops(root.value);
    const target = event.target as HTMLElement;
    const index = stops.findIndex((stop) => stop.els.includes(target));
    if (index === -1) {
        return;
    }

    // inside a radio group the arrows pick the option natively; only past its edge do they move on
    // внутри группы радио стрелки выбирают вариант сами; дальше идём только с её края
    const stop = stops[index];
    if (isRadio(target) && (event.key === next || event.key === prev)) {
        const edge = event.key === next ? stop.els[stop.els.length - 1] : stop.els[0];
        if (target !== edge) {
            return;
        }
    }

    let to: number;
    if (event.key === 'Home') {
        to = 0;
    } else if (event.key === 'End') {
        to = stops.length - 1;
    } else {
        to = (index + (event.key === next ? 1 : -1) + stops.length) % stops.length;
    }
    event.preventDefault();
    current = to;
    applyRoving(stops, current);
    stopTarget(stops[to]).focus();
}

onMounted(() => {
    refresh();
    if (typeof MutationObserver !== 'undefined' && root.value) {
        // items come and go with the slot, and a button turns disabled / элементы приходят со слотом, кнопки выключаются
        observer = new MutationObserver(refresh);
        observer.observe(root.value, { childList: true, subtree: true, attributeFilter: ['disabled', 'aria-disabled'] });
    }
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
    <div
        ref="root"
        class="tao-toolbar"
        :class="[sizeClass(size), `tao-toolbar--${variant}`, `tao-toolbar--${orientation}`]"
        role="toolbar"
        :aria-label="label"
        :aria-orientation="orientation"
        @focusin="onFocusin"
        @keydown="onKeydown"
    >
        <slot />
    </div>
</template>

<style scoped>
.tao-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--tao-space-1);
    color: var(--tao-color-text);
}

.tao-toolbar--vertical {
    flex-direction: column;
    align-items: stretch;
}

.tao-toolbar--panel {
    padding: var(--tao-space-1);
    background: var(--tao-color-surface-raised);
    border: 1px solid var(--tao-color-border);
    /* concentric corners: the controls' radius plus the padding / концентричные углы: радиус контролов плюс отступ */
    border-radius: calc(var(--tao-radius-control) + var(--tao-space-1));
}

.tao-toolbar--horizontal.tao-toolbar--panel {
    width: fit-content;
    max-width: 100%;
}
</style>
