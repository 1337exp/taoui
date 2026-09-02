<script lang="ts" setup>
import { ref, reactive, onBeforeMount, onBeforeUnmount } from 'vue';

defineOptions({ name: 'TaoScrollTop' });

interface Props {
    size?: number;
    right?: string | number;
    bottom?: string | number;
    zIndex?: number;
    boundary?: number;
    hasOutline?: boolean;
    tabindex?: number;
}

const props = withDefaults(defineProps<Props>(), {
    size: 40,
    right: 24,
    bottom: 24,
    zIndex: 1000,
    boundary: 300,
    hasOutline: true,
    tabindex: 0,
});

const RIPPLE_DURATION = 750;
const fmtProp = (value: number | string, unit = 'px') => (typeof value === 'number' ? value + unit : value);

let prevPos = 0;
let activeBack = false;

const mainStyle = reactive({
    width: fmtProp(props.size),
    height: fmtProp(props.size),
    right: fmtProp(props.right),
    bottom: fmtProp(props.bottom),
    zIndex: props.zIndex,
});

const rippleStyle = reactive({
    top: fmtProp(-1 * props.size),
    left: fmtProp(-1 * props.size),
    width: '200%',
    height: '200%',
});

const isActive = ref(false);
const isRippleActive = ref(false);

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
        window.scrollTo(0, c - Math.max(10, c / 8));
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

function onClick(e: MouseEvent) {
    if (!isRippleActive.value) {
        const elTarget = e.currentTarget as HTMLElement;
        if (elTarget) {
            const rect = elTarget.getBoundingClientRect();
            const top = e.clientY - rect.top;
            const left = e.clientX - rect.left;
            rippleStyle.top = fmtProp(top - props.size);
            rippleStyle.left = fmtProp(left - props.size);
        }

        isRippleActive.value = true;
        setTimeout(() => {
            isRippleActive.value = false;
        }, RIPPLE_DURATION);
    }

    goToTop();
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
        <button
            v-if="isActive"
            type="button"
            :style="mainStyle"
            :tabindex="props.tabindex"
            class="tao-scroll-top"
            :class="{ 'tao-scroll-top--no-outline': !props.hasOutline }"
            aria-label="Наверх"
            @click.prevent="onClick"
        >
            <div class="tao-scroll-top__content">
                <div :class="{ 'tao-scroll-top__ripple--active': isRippleActive }" :style="rippleStyle" class="tao-scroll-top__ripple" />
                <slot>
                    <svg class="tao-scroll-top__icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 6l-7 7 1.4 1.4L12 8.8l5.6 5.6L19 13z" />
                    </svg>
                </slot>
            </div>
        </button>
    </Transition>
</template>

<style scoped>
.tao-scroll-top {
    overflow: hidden;
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    color: var(--tao-color-on-accent);
    background-color: var(--tao-color-accent);
    border: none;
    border-radius: var(--tao-radius-full);
    box-shadow: var(--tao-shadow-md);
    user-select: none;
}

.tao-scroll-top:hover {
    background-color: var(--tao-color-accent-hover);
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
}

.tao-scroll-top__icon {
    position: relative;
    z-index: 1;
}

.tao-scroll-top__ripple {
    position: absolute;
    border-radius: var(--tao-radius-full);
    background-color: var(--tao-color-accent-subtle-hover);
    transform: scale(0);
    opacity: 0;
    pointer-events: none;
}

.tao-scroll-top__ripple--active {
    animation: tao-scroll-top-ripple 0.75s ease-out;
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

@keyframes tao-scroll-top-ripple {
    from {
        opacity: 1;
    }
    to {
        transform: scale(2);
        opacity: 0;
    }
}
</style>
