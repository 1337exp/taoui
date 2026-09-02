<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue';
import TaoToastItem from './TaoToastItem.vue';
import { registerToastViewport, toastsByPosition, TOAST_POSITIONS, unregisterToastViewport } from '../toast/store';
import type { TaoToastPosition } from '../toast/types';

defineOptions({ name: 'TaoToastViewport' });

onMounted(() => {
    registerToastViewport();
});

onBeforeUnmount(() => {
    unregisterToastViewport();
});

function enterName(position: TaoToastPosition) {
    if (position === 'center') {
        return 'tao-toast-center';
    }

    if (position.startsWith('top')) {
        return 'tao-toast-top';
    }

    return 'tao-toast-bottom';
}
</script>

<template>
    <Teleport to="body">
        <div
            v-for="position in TOAST_POSITIONS"
            :key="position"
            class="tao-toast-viewport"
            :class="`tao-toast-viewport--${position}`"
            data-tao-toast-viewport
        >
            <TransitionGroup :name="enterName(position)" tag="div" class="tao-toast-viewport__stack">
                <TaoToastItem v-for="item in toastsByPosition[position]" :key="item.id" :toast="item" />
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
.tao-toast-viewport {
    position: fixed;
    z-index: 1100;
    display: flex;
    pointer-events: none;
    padding: var(--tao-space-4);
}

.tao-toast-viewport__stack {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-2);
    width: 100%;
}

.tao-toast-viewport--topRight {
    top: 0;
    right: 0;
    align-items: flex-end;
}

.tao-toast-viewport--topLeft {
    top: 0;
    left: 0;
    align-items: flex-start;
}

.tao-toast-viewport--topCenter {
    top: 0;
    left: 0;
    right: 0;
    justify-content: center;
}

.tao-toast-viewport--bottomRight {
    right: 0;
    bottom: 0;
    align-items: flex-end;
}

.tao-toast-viewport--bottomRight .tao-toast-viewport__stack,
.tao-toast-viewport--bottomLeft .tao-toast-viewport__stack,
.tao-toast-viewport--bottomCenter .tao-toast-viewport__stack {
    flex-direction: column-reverse;
}

.tao-toast-viewport--bottomLeft {
    left: 0;
    bottom: 0;
    align-items: flex-start;
}

.tao-toast-viewport--bottomCenter {
    bottom: 0;
    left: 0;
    right: 0;
    justify-content: center;
}

.tao-toast-viewport--center {
    inset: 0;
    justify-content: center;
    align-items: center;
}

.tao-toast-top-enter-active,
.tao-toast-bottom-enter-active,
.tao-toast-center-enter-active {
    animation: tao-toast-bounce-in var(--tao-duration-slow) var(--tao-ease-base);
}

.tao-toast-top-leave-active,
.tao-toast-bottom-leave-active,
.tao-toast-center-leave-active {
    animation: tao-toast-fade-out var(--tao-duration-base) var(--tao-ease-base);
}

.tao-toast-top-move,
.tao-toast-bottom-move,
.tao-toast-center-move {
    transition: transform var(--tao-duration-base) var(--tao-ease-base);
}

@keyframes tao-toast-bounce-in {
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

@keyframes tao-toast-fade-out {
    to {
        opacity: 0;
        transform: translateY(10px);
    }
}
</style>
