<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { computed, ref, onBeforeMount, onBeforeUnmount } from 'vue';
import { useLocaleText } from '../locale';

// Attributes go to the button, the root is a positioning wrapper.
// Атрибуты уходят на кнопку, корень — обёртка с позицией.
defineOptions({ name: 'TaoScrollTop', inheritAttrs: false });

interface Props {
    /**
     * `solid` — accent circle; `ghost` — light circle on a raised surface; `text` — bare uppercase caption with an arrow.
     * `solid` — круг акцентного цвета; `ghost` — лёгкий круг на приподнятой поверхности; `text` — подпись капсом со стрелкой.
     */
    variant?: 'solid' | 'ghost' | 'text';
    /** Which edge of the page the button sits on. / У какого края страницы стоит кнопка. */
    side?: 'left' | 'right';
    /** Offset from that edge; `right` is its older name. / Отступ от этого края; `right` — прежнее имя. */
    offset?: string | number;
    /**
     * Caption: beside the button on mouse hover (and keyboard focus) for `solid` / `ghost`, always visible for `text`
     * (the locale text by default there; an empty string hides it).
     * Подпись: рядом с кнопкой при наведении мыши (и фокусе с клавиатуры) у `solid` / `ghost`, у `text` видна всегда
     * (по умолчанию — текст локали; пустая строка скрывает).
     */
    label?: string;
    /**
     * Where the caption goes relative to the button. Default: opposite to `side`, so it opens towards the page.
     * С какой стороны подпись относительно кнопки. По умолчанию — противоположная `side`, то есть к странице.
     */
    labelSide?: 'left' | 'right';
    size?: number;
    /** Older name of `offset`. / Прежнее имя `offset`. */
    right?: string | number;
    bottom?: string | number;
    zIndex?: number;
    boundary?: number;
    /** Focus outline. / Обводка фокуса. */
    outline?: boolean;
    ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'solid',
    side: 'right',
    offset: undefined,
    label: undefined,
    labelSide: undefined,
    size: 40,
    right: undefined,
    bottom: 24,
    zIndex: 1000,
    boundary: 300,
    outline: undefined,
});
const l10n = useLocaleText(props, 'scrollTop');

const fmtProp = (value: number | string, unit = 'px') => (typeof value === 'number' ? value + unit : value);

let prevPos = 0;
let activeBack = false;

const isText = computed(() => props.variant === 'text');

const wrapStyle = computed(() => ({
    [props.side]: fmtProp(props.offset ?? props.right ?? 24),
    bottom: fmtProp(props.bottom),
    zIndex: props.zIndex,
}));

const mainStyle = computed(() => ({
    height: fmtProp(props.size),
    ...(isText.value ? {} : { width: fmtProp(props.size) }),
}));

const captionSide = computed(() => props.labelSide ?? (props.side === 'right' ? 'left' : 'right'));
const caption = computed(() => props.label ?? (isText.value ? l10n.value.ariaLabel : undefined));
const accessibleName = computed(() => props.ariaLabel || props.label || l10n.value.ariaLabel);

const isActive = ref(false);

function getScrollValue() {
    if (typeof window.pageYOffset !== 'undefined') {
        return window.pageYOffset;
    }
    if (typeof document.compatMode !== 'undefined' && document.compatMode !== 'BackCompat') {
        return document.documentElement.scrollTop;
    }
    return document.body.scrollTop;
}

function goToTop() {
    const c = getScrollValue();
    if (c > 0) {
        window.requestAnimationFrame(goToTop);
        // Шаги анимации делаем сами, поэтому 'instant': иначе при `scroll-behavior: smooth` на html каждый шаг
        // запускает своё плавное движение, и подъём ползёт.
        window.scrollTo({ top: c - Math.max(10, c / 8), left: 0, behavior: 'instant' });
    }
}

function onScroll() {
    const pY = getScrollValue();
    const tooFar = pY > props.boundary;
    const goBack = prevPos > pY;

    if (activeBack) {
        if (!goBack && pY - prevPos > 15) {
            activeBack = false;
        }
    } else {
        activeBack = prevPos - pY >= 20;
        if (activeBack && pY - props.boundary < 150) {
            activeBack = false;
        }
    }

    prevPos = pY;
    isActive.value = tooFar && activeBack;
}

onBeforeMount(() => {
    window.addEventListener('scroll', onScroll);
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
});
</script>

<template>
    <Transition name="tao-scroll-top-fade">
        <div v-if="isActive" class="tao-scroll-top-wrap" :style="wrapStyle">
            <button
                v-bind="$attrs"
                type="button"
                :style="mainStyle"
                class="tao-scroll-top"
                :class="[
                    `tao-scroll-top--${props.variant}`,
                    { 'tao-scroll-top--no-outline': props.outline === false },
                    isText && `tao-scroll-top--caption-${captionSide}`,
                ]"
                :aria-label="accessibleName"
                @click.prevent="goToTop"
            >
                <span class="tao-scroll-top__content">
                    <span v-if="isText && caption" class="tao-scroll-top__text" aria-hidden="true">{{ caption }}</span>
                    <slot>
                        <TaoIcon class="tao-scroll-top__icon" name="tao-chevron-up" :size="16" />
                    </slot>
                </span>
            </button>
            <span
                v-if="!isText && caption"
                class="tao-scroll-top__label"
                :class="`tao-scroll-top__label--${captionSide}`"
                aria-hidden="true"
                >{{ caption }}</span
            >
        </div>
    </Transition>
</template>

<style scoped>
.tao-scroll-top-wrap {
    position: fixed;
    display: flex;
    align-items: center;
}

.tao-scroll-top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    border: none;
    user-select: none;
}

.tao-scroll-top--solid,
.tao-scroll-top--ghost {
    border-radius: var(--tao-radius-full);
}

.tao-scroll-top--solid {
    color: var(--tao-color-on-accent);
    background-color: var(--tao-color-accent);
    box-shadow: var(--tao-shadow-md);
}

.tao-scroll-top--solid:hover {
    background-color: var(--tao-color-accent-hover);
}

/* A floating button needs a body to stay readable over content: a raised surface and a hairline border. */
/* Плавающей кнопке нужно «тело», чтобы читаться поверх контента: приподнятая поверхность и тонкая рамка. */
.tao-scroll-top--ghost {
    color: var(--tao-color-text-strong);
    background-color: var(--tao-color-surface-raised);
    border: 1px solid var(--tao-color-border);
}

.tao-scroll-top--ghost:hover {
    color: var(--tao-color-accent);
    background-color: var(--tao-color-accent-subtle);
    border-color: var(--tao-color-accent);
}

.tao-scroll-top--text {
    padding: 0 var(--tao-space-2);
    color: var(--tao-color-text-strong);
    background: transparent;
}

.tao-scroll-top--text:hover {
    color: var(--tao-color-accent);
}

/* the same tactile press as TaoButton / такое же вжатие, как у TaoButton */
.tao-scroll-top:active {
    transform: translateY(1px);
}

.tao-scroll-top--no-outline {
    outline: none;
}

.tao-scroll-top__content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--tao-space-2);
}

.tao-scroll-top--caption-right .tao-scroll-top__content {
    flex-direction: row-reverse;
}

.tao-scroll-top__icon {
    position: relative;
    z-index: 1;
    transition: transform var(--tao-duration-fast) var(--tao-ease-base);
}

.tao-scroll-top--text:hover .tao-scroll-top__icon {
    transform: translateY(-2px);
}

.tao-scroll-top__text,
.tao-scroll-top__label {
    font-size: var(--tao-font-size-xs);
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
    /* a halo in the page colour keeps the bare caption readable over content */
    /* гало цвета страницы держит подпись без фона читаемой поверх контента */
    text-shadow: 0 0 6px var(--tao-color-bg), 0 0 2px var(--tao-color-bg);
}

.tao-scroll-top__label {
    position: absolute;
    top: 50%;
    color: var(--tao-color-text-strong);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--tao-duration-fast) var(--tao-ease-base),
        transform var(--tao-duration-fast) var(--tao-ease-base);
}

.tao-scroll-top__label--left {
    right: 100%;
    margin-right: var(--tao-space-3);
    transform: translate(6px, -50%);
}

.tao-scroll-top__label--right {
    left: 100%;
    margin-left: var(--tao-space-3);
    transform: translate(-6px, -50%);
}

/* The caption is for a mouse; a touch screen has no hover. / Подпись для мыши; на тач-экране hover нет. */
@media (hover: hover) and (pointer: fine) {
    .tao-scroll-top-wrap:hover .tao-scroll-top__label {
        opacity: 1;
        transform: translate(0, -50%);
    }
}

/* Keyboard focus shows it on any device. / Фокус с клавиатуры показывает её на любом устройстве. */
.tao-scroll-top-wrap:has(.tao-scroll-top:focus-visible) .tao-scroll-top__label {
    opacity: 1;
    transform: translate(0, -50%);
}

.tao-scroll-top-fade-enter-active,
.tao-scroll-top-fade-leave-active {
    transition: opacity var(--tao-duration-base) var(--tao-ease-base),
        transform var(--tao-duration-base) var(--tao-ease-base);
}

.tao-scroll-top-fade-enter-from,
.tao-scroll-top-fade-leave-to {
    opacity: 0;
    transform: translateY(40px);
}
</style>
