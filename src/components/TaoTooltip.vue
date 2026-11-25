<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { arrowInset, useFloating, type TaoPlacement } from '../floating';
import { listenFocusLoss } from '../focusLoss';
import TaoKbd from './TaoKbd.vue';

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
        /**
         * The fade-in. Off by default: a hint that appears at once is what a hover asks for. A number is a share of the base
         * duration (`--tao-duration-base`): `0` off, `1` the base time, `2` twice as long, `0.5` half; `true` is `1`. Without
         * the prop the token `--tao-tooltip-motion` (the same number) decides, so an app sets it once.
         * Плавное появление. По умолчанию выключено: наведение просит подсказку сразу. Число — доля базового времени
         * (`--tao-duration-base`): `0` выкл., `1` базовое, `2` вдвое дольше, `0.5` вдвое быстрее; `true` это `1`. Без пропа
         * решает токен `--tao-tooltip-motion` (то же число), так что приложение задаёт его один раз.
         */
        animated?: boolean | number;
        /**
         * The text in semi-bold (600, the weight of the key cap). On by default: a hint is small and short, and at the regular weight it
         * is thin on its inverted background. `false` for the regular weight; the token `--tao-tooltip-weight` sets the weight.
         * Текст полужирным (600, как у значка клавиши). Включено по умолчанию: подсказка мелкая и короткая, и обычным весом на
         * инверсном фоне она тонкая. `false` — обычный вес; токен `--tao-tooltip-weight` задаёт вес.
         */
        bold?: boolean;
        /**
         * `inverse` (default): the opposite of the theme, dark on a light page and light on a dark one (Material 3, shadcn/ui, Atlassian).
         * `raised`: a panel of the theme itself with a thin frame, as the hovers of VS Code, JetBrains and Windows: for an IDE-like surface.
         * `inverse` (по умолчанию): обратна теме, тёмная на светлой странице и светлая на тёмной (Material 3, shadcn/ui, Atlassian).
         * `raised`: панель самой темы с тонкой рамкой, как подсказки VS Code, JetBrains и Windows: для поверхности вроде IDE.
         */
        variant?: 'inverse' | 'raised';
    }>(),
    {
        placement: 'top',
        animated: undefined,
        bold: true,
        variant: 'inverse',
    },
);

/** The share of the base duration, or undefined when the prop is not given (then the token decides). / Доля базового времени или undefined. */
const motion = computed(() => {
    if (props.animated === undefined) return undefined;
    const n = props.animated === true ? 1 : Number(props.animated);
    return Number.isFinite(n) && n > 0 ? n : 0;
});

const wrapperRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const showTooltip = ref(false);

const { style, side, anchorOffset, placed } = useFloating(wrapperRef, tooltipRef, showTooltip, {
    placement: () => props.placement,
    gap: 8,
});

// hidden until the first measurement, so it does not flash in the corner / скрыта до первого замера
const panelStyle = computed(() => ({
    ...style.value,
    visibility: (placed.value ? 'visible' : 'hidden') as 'visible' | 'hidden',
    ...(motion.value === undefined ? {} : { '--tao-tooltip-motion': String(motion.value) }),
}));

// the arrow points at the middle of the trigger, kept off the rounded corners
const arrowStyle = computed(() => {
    const arrowPad = 10;
    const el = tooltipRef.value;
    if (!el) {
        return {};
    }
    return arrowInset(el, side.value, anchorOffset.value, arrowPad);
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
        @keydown.esc="hide"
    >
        <slot />
        <Teleport to="body">
            <Transition name="tao-tooltip-fade">
                <div
                    v-if="showTooltip"
                    ref="tooltipRef"
                    class="tao-tip tao-tooltip"
                    :class="[`tao-tooltip--${side}`, { 'tao-tooltip--regular': !bold, 'tao-tooltip--raised': variant === 'raised' }]"
                    role="tooltip"
                    :style="panelStyle"
                >
                    <span class="tao-tooltip__text">{{ content }}</span>
                    <TaoKbd v-if="shortcut" class="tao-tooltip__shortcut">{{ shortcut }}</TaoKbd>
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
    /* the text and the key share one baseline in any font (centring only matched it by luck of the metrics)
       текст и клавиша на одной базовой линии в любом шрифте (центровка совпадала с ней лишь по случайности метрик) */
    align-items: baseline;
    gap: var(--tao-space-2);
    width: max-content;
    max-width: min(280px, calc(100vw - 16px));
    /* the box is symmetric, but a line of text sits a little above the middle of its line box (the room under it is for the
       descenders), so the text takes 0.06em more on top and less below: the capitals then look centred
       блок симметричен, но строка текста стоит чуть выше середины своего ящика (место под ней для хвостов), поэтому сверху текст
       получает на 0.06em больше, а снизу меньше: заглавные тогда выглядят по центру */
    padding: calc(var(--tao-space-2) + 0.06em) var(--tao-space-3) calc(var(--tao-space-2) - 0.06em);
    /* the colours, the weight, the radius and the shadow come from `.tao-tip` (contexts/tip.css): a hint is the opposite of the theme, said in one place
       цвета, вес, радиус и тень — от `.tao-tip` (contexts/tip.css): подсказка обратна теме, это сказано в одном месте */
    pointer-events: none;
}

/* a little smaller than a key elsewhere and pulled into the line: a tip with a key is as tall as one without
   чуть меньше значка в других местах и втянут в строку: подсказка с клавишей той же высоты, что и без */
.tao-tooltip.tao-tooltip--regular {
    font-weight: 400;
}

.tao-tooltip__shortcut {
    height: round(up, 1.5em, 2px);
    min-width: round(up, 1.5em, 2px);
    margin-block: -0.1em;
    background: color-mix(in srgb, currentColor 22%, transparent);
}

/* raised: the colours are the hooks of the hint (see contexts/tip.css), set here for this one; the frame follows the arrow too */
/* raised: цвета — хуки подсказки (см. contexts/tip.css), заданные здесь для неё одной; рамка идёт и по стрелке */
.tao-tooltip--raised {
    --tao-tooltip-bg: var(--tao-color-surface-raised);
    --tao-tooltip-text: var(--tao-color-text);
    border: 1px solid var(--tao-color-border-strong);
}

.tao-tooltip--raised.tao-tooltip--top .tao-tooltip__arrow {
    border-right: 1px solid var(--tao-color-border-strong);
    border-bottom: 1px solid var(--tao-color-border-strong);
}

.tao-tooltip--raised.tao-tooltip--bottom .tao-tooltip__arrow {
    border-left: 1px solid var(--tao-color-border-strong);
    border-top: 1px solid var(--tao-color-border-strong);
}

.tao-tooltip--raised.tao-tooltip--left .tao-tooltip__arrow {
    border-top: 1px solid var(--tao-color-border-strong);
    border-right: 1px solid var(--tao-color-border-strong);
}

.tao-tooltip--raised.tao-tooltip--right .tao-tooltip__arrow {
    border-bottom: 1px solid var(--tao-color-border-strong);
    border-left: 1px solid var(--tao-color-border-strong);
}

.tao-tooltip__arrow {
    position: absolute;
    /* the frame of a raised hint is inside the 8px, so the offsets below (half the box) stay true / рамка поднятой подсказки внутри 8px, поэтому смещения ниже (полблока) верны */
    box-sizing: border-box;
    width: 8px;
    height: 8px;
    background: var(--_tip-bg);
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

/* the time is the base duration times --tao-tooltip-motion (0 by default: at once) / время — базовое, умноженное на --tao-tooltip-motion (по умолчанию 0: сразу) */
.tao-tooltip-fade-enter-active,
.tao-tooltip-fade-leave-active {
    transition:
        opacity calc(var(--tao-duration-base) * var(--tao-tooltip-motion, 0)) var(--tao-ease-base),
        transform calc(var(--tao-duration-base) * var(--tao-tooltip-motion, 0)) var(--tao-ease-base);
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
