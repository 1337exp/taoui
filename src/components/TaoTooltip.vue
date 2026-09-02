<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { listenFocusLoss } from '../focusLoss';

defineOptions({ name: 'TaoTooltip' });

type TaoTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

const props = withDefaults(
    defineProps<{
        content: string;
        position?: TaoTooltipPosition;
    }>(),
    {
        position: 'top',
    },
);

const wrapperRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const showTooltip = ref(false);
const placed = ref<TaoTooltipPosition>(props.position);
const panelStyle = ref<Record<string, string>>({ visibility: 'hidden' });
const arrowStyle = ref<Record<string, string>>({});

const opposite: Record<TaoTooltipPosition, TaoTooltipPosition> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
};

function hide() {
    showTooltip.value = false;
}

function show() {
    showTooltip.value = true;
}

function updatePosition() {
    const trigger = wrapperRef.value;
    const tip = tooltipRef.value;
    if (!trigger || !tip) {
        return;
    }

    const rect = trigger.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    const gap = 8;
    const pad = 8;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const space = {
        bottom: viewH - rect.bottom - gap - pad,
        top: rect.top - gap - pad,
        right: viewW - rect.right - gap - pad,
        left: rect.left - gap - pad,
    };

    let side = props.position;
    const need = side === 'top' || side === 'bottom' ? height : width;
    if (space[side] < need && space[opposite[side]] > space[side]) {
        side = opposite[side];
    }

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let top = 0;
    let left = 0;

    if (side === 'bottom') {
        top = rect.bottom + gap;
        left = cx - width / 2;
    } else if (side === 'top') {
        top = rect.top - height - gap;
        left = cx - width / 2;
    } else if (side === 'right') {
        top = cy - height / 2;
        left = rect.right + gap;
    } else {
        top = cy - height / 2;
        left = rect.left - width - gap;
    }

    if (left + width > viewW - pad) {
        left = viewW - pad - width;
    }
    if (left < pad) {
        left = pad;
    }
    if (top + height > viewH - pad) {
        top = viewH - pad - height;
    }
    if (top < pad) {
        top = pad;
    }

    const arrowPad = 10;
    if (side === 'top' || side === 'bottom') {
        const x = Math.min(width - arrowPad, Math.max(arrowPad, cx - left));
        arrowStyle.value = { left: `${x}px`, top: '' };
    } else {
        const y = Math.min(height - arrowPad, Math.max(arrowPad, cy - top));
        arrowStyle.value = { top: `${y}px`, left: '' };
    }

    placed.value = side;
    panelStyle.value = { top: `${top}px`, left: `${left}px`, visibility: 'visible' };
}

function onViewportChange() {
    if (showTooltip.value) {
        updatePosition();
    }
}

watch(showTooltip, async (isOpen) => {
    if (isOpen) {
        await nextTick();
        updatePosition();
        requestAnimationFrame(() => updatePosition());
        window.addEventListener('resize', onViewportChange);
        window.addEventListener('scroll', onViewportChange, true);
        return;
    }

    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
});

watch(
    () => props.position,
    () => {
        if (showTooltip.value) {
            updatePosition();
        }
    },
);

let stopFocusLoss: (() => void) | undefined;
onMounted(() => {
    stopFocusLoss = listenFocusLoss(hide);
});

onBeforeUnmount(() => {
    stopFocusLoss?.();
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
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
                    :class="`tao-tooltip--${placed}`"
                    role="tooltip"
                    :style="panelStyle"
                >
                    {{ content }}
                    <span class="tao-tooltip__arrow" :style="arrowStyle" aria-hidden="true"></span>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style>
.tao-tooltip {
    z-index: 1060;
    position: fixed;
    box-sizing: border-box;
    width: max-content;
    max-width: min(280px, calc(100vw - 16px));
    padding: var(--tao-space-2) var(--tao-space-3);
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text-strong);
    font-size: var(--tao-font-size-xs);
    font-family: var(--tao-font-family);
    line-height: 1.3;
    border-radius: var(--tao-radius-control);
    box-shadow: var(--tao-shadow-lg);
    pointer-events: none;
}

.tao-tooltip__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--tao-color-surface-raised);
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
