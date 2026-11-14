<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useFloating, type TaoPlacement } from '../floating';
import { listenFocusLoss } from '../focusLoss';

defineOptions({ name: 'TaoTooltip' });

const props = withDefaults(
    defineProps<{
        content: string;
        /** Side and alignment against the trigger; flips when there is no room. / Сторона и выравнивание; при нехватке места переворачивается. */
        placement?: TaoPlacement;
        /**
         * The key that does the same, shown as a key cap after the text (`T`, `Ctrl+K`). / Клавиша, которая делает то же: значок после текста (`T`, `Ctrl+K`).
         */
        shortcut?: string;
    }>(),
    {
        placement: 'top',
    },
);

const wrapperRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const showTooltip = ref(false);

const { style, side, anchorOffset, placed } = useFloating(wrapperRef, tooltipRef, showTooltip, {
    placement: () => props.placement,
    gap: 8,
});

// hidden until the first measurement, so it does not flash in the corner / скрыта до первого замера
const panelStyle = computed(() => ({ ...style.value, visibility: (placed.value ? 'visible' : 'hidden') as 'visible' | 'hidden' }));

// the arrow points at the middle of the trigger, kept off the rounded corners
const arrowStyle = computed(() => {
    const arrowPad = 10;
    const el = tooltipRef.value;
    if (!el) {
        return {};
    }
    if (side.value === 'top' || side.value === 'bottom') {
        return { left: `${Math.min(el.offsetWidth - arrowPad, Math.max(arrowPad, anchorOffset.value.x))}px`, top: '' };
    }
    return { top: `${Math.min(el.offsetHeight - arrowPad, Math.max(arrowPad, anchorOffset.value.y))}px`, left: '' };
});

function hide() {
    showTooltip.value = false;
}

function show() {
    showTooltip.value = true;
}

let stopFocusLoss: (() => void) | undefined;
onMounted(() => {
    stopFocusLoss = listenFocusLoss(hide);
});

onBeforeUnmount(() => {
    stopFocusLoss?.();
});
</script>

<template>
    <div
        ref="wrapperRef"
        class="tao-tooltip-wrapper"
        @mouseenter="show"
        @mouseleave="hide"
        @focusin="show"
        @focusout="hide"
    >
        <slot />
        <Teleport to="body">
            <Transition name="tao-tooltip-fade">
                <div
                    v-if="showTooltip"
                    ref="tooltipRef"
                    class="tao-tooltip"
                    :class="`tao-tooltip--${side}`"
                    role="tooltip"
                    :style="panelStyle"
                >
                    <span class="tao-tooltip__text">{{ content }}</span>
                    <kbd v-if="shortcut" class="tao-tooltip__shortcut">{{ shortcut }}</kbd>
                    <span class="tao-tooltip__arrow" :style="arrowStyle" aria-hidden="true"></span>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style>
.tao-tooltip {
    z-index: var(--tao-z-tooltip);
    position: fixed;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    width: max-content;
    max-width: min(280px, calc(100vw - 16px));
    padding: var(--tao-space-2) var(--tao-space-3);
    /* the tip is the opposite of the theme (dark on light, light on dark): it floats over the interface and must not melt into the panels it hangs over; it is not a control
       подсказка обратна теме (тёмная на светлой, светлая на тёмной): она парит над интерфейсом и не должна сливаться с панелями под ней; она не контрол */
    background: var(--tao-tooltip-bg, var(--tao-color-text-strong));
    color: var(--tao-tooltip-text, var(--tao-color-bg));
    font-size: var(--tao-font-size-xs);
    font-family: var(--tao-font-family);
    line-height: 1.3;
    border-radius: var(--tao-radius-control);
    box-shadow: var(--tao-shadow-lg);
    pointer-events: none;
}

.tao-tooltip__shortcut {
    display: inline-grid;
    place-items: center;
    min-width: 1.6em;
    padding: 0.15em 0.45em;
    border-radius: max(4px, calc(var(--tao-radius-control) * 0.6));
    background: color-mix(in srgb, currentColor 22%, transparent);
    font: inherit;
    font-size: var(--tao-font-size-xs);
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
}

.tao-tooltip__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--tao-tooltip-bg, var(--tao-color-text-strong));
}

.tao-tooltip--top .tao-tooltip__arrow {
    top: 100%;
    margin-top: -4px;
    transform: translateX(-50%) rotate(45deg);
}

.tao-tooltip--bottom .tao-tooltip__arrow {
    bottom: 100%;
    margin-bottom: -4px;
    transform: translateX(-50%) rotate(45deg);
}

.tao-tooltip--left .tao-tooltip__arrow {
    left: 100%;
    margin-left: -4px;
    transform: translateY(-50%) rotate(45deg);
}

.tao-tooltip--right .tao-tooltip__arrow {
    right: 100%;
    margin-right: -4px;
    transform: translateY(-50%) rotate(45deg);
}

.tao-tooltip-fade-enter-active,
.tao-tooltip-fade-leave-active {
    transition:
        opacity var(--tao-duration-base) var(--tao-ease-base),
        transform var(--tao-duration-base) var(--tao-ease-base);
}

.tao-tooltip--top.tao-tooltip-fade-enter-from,
.tao-tooltip--top.tao-tooltip-fade-leave-to {
    opacity: 0;
    transform: translateY(4px);
}

.tao-tooltip--bottom.tao-tooltip-fade-enter-from,
.tao-tooltip--bottom.tao-tooltip-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.tao-tooltip--left.tao-tooltip-fade-enter-from,
.tao-tooltip--left.tao-tooltip-fade-leave-to {
    opacity: 0;
    transform: translateX(4px);
}

.tao-tooltip--right.tao-tooltip-fade-enter-from,
.tao-tooltip--right.tao-tooltip-fade-leave-to {
    opacity: 0;
    transform: translateX(-4px);
}
</style>

<style scoped>
.tao-tooltip-wrapper {
    display: inline-block;
}
</style>
