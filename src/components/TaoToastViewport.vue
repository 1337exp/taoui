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
                <div v-for="item in toastsByPosition[position]" :key="item.id" class="tao-toast-slot">
                    <div class="tao-toast-slot__inner">
                        <TaoToastItem :toast="item" />
                    </div>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
.tao-toast-viewport {
    position: fixed;
    z-index: var(--tao-z-toast);
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

.tao-toast-slot {
    display: grid;
    grid-template-rows: 1fr;
}

.tao-toast-slot__inner {
    min-height: 0;
    overflow: hidden;
}

/* The centred viewports span the whole width, so a 100%-wide stack leaves nothing to centre and the toast sticks to
   the left edge: the stack shrinks to its widest toast and `justify-content: center` does the rest.
   Центрированные контейнеры растянуты на всю ширину, и стопка в 100% оставляла бы тосту прижаться к левому краю:
   стопка сжимается до самого широкого тоста, а центрирует `justify-content: center`. */
.tao-toast-viewport--topCenter .tao-toast-viewport__stack,
.tao-toast-viewport--bottomCenter .tao-toast-viewport__stack,
.tao-toast-viewport--center .tao-toast-viewport__stack {
    width: auto;
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

/* The fade runs on the toast itself, not on a wrapper: an ancestor below opacity 1 cuts a glass toast off from what
   is behind it (Chrome: a backdrop root), so the blur waited for the fade to end and then popped in at once.
   Its own opacity fades the blur along with it.
   Прозрачность меняется у самого тоста, а не у обёртки: предок с прозрачностью меньше 1 отрезает стеклянный тост от
   того, что за ним (Chrome: backdrop root), и размытие ждало конца появления, а потом включалось разом. Собственная
   прозрачность гасит размытие вместе с ним. */
.tao-toast-top-enter-active :deep(.tao-toast),
.tao-toast-bottom-enter-active :deep(.tao-toast),
.tao-toast-center-enter-active :deep(.tao-toast) {
    animation: tao-toast-bounce-in var(--tao-duration-slow) var(--tao-ease-base);
}

/* Vue reads the length of the transition off the slot itself: an empty animation as long, or it would end the enter
   at once and the toast's own animation would never start
   Vue берёт длительность перехода с самой обёртки: пустая анимация той же длины, иначе он сразу закончил бы
   появление, и анимация тоста не началась бы */
.tao-toast-top-enter-active,
.tao-toast-bottom-enter-active,
.tao-toast-center-enter-active {
    animation: tao-toast-hold var(--tao-duration-slow) linear;
}

@keyframes tao-toast-hold {
    to {
        visibility: visible;
    }
}

.tao-toast-top-leave-active,
.tao-toast-bottom-leave-active,
.tao-toast-center-leave-active {
    pointer-events: none;
    overflow: hidden;
    transition: grid-template-rows var(--tao-duration-slow) var(--tao-ease-base);
}

.tao-toast-top-leave-from,
.tao-toast-bottom-leave-from,
.tao-toast-center-leave-from {
    grid-template-rows: 1fr;
}

.tao-toast-top-leave-to,
.tao-toast-bottom-leave-to,
.tao-toast-center-leave-to {
    grid-template-rows: 0fr;
}

.tao-toast-top-leave-active :deep(.tao-toast),
.tao-toast-center-leave-active :deep(.tao-toast) {
    animation: tao-toast-fade-out-up var(--tao-duration-slow) var(--tao-ease-base) forwards;
}

.tao-toast-bottom-leave-active :deep(.tao-toast) {
    animation: tao-toast-fade-out-down var(--tao-duration-slow) var(--tao-ease-base) forwards;
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

@keyframes tao-toast-fade-out-up {
    to {
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
    }
}

@keyframes tao-toast-fade-out-down {
    to {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
    }
}
</style>
