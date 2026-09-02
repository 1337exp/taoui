<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { listenFocusLoss } from '../focusLoss';

defineOptions({ name: 'TaoTooltip' });

interface Props {
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

withDefaults(defineProps<Props>(), {
    position: 'top',
});

const showTooltip = ref(false);

function hide() {
    showTooltip.value = false;
}

let stopFocusLoss: (() => void) | undefined;
onMounted(() => {
    stopFocusLoss = listenFocusLoss(hide);
});
onBeforeUnmount(() => stopFocusLoss?.());
</script>

<template>
    <div
        class="tao-tooltip-wrapper"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
        @focusin="showTooltip = true"
        @focusout="showTooltip = false"
    >
        <slot />
        <Transition name="tao-tooltip-fade">
            <div v-if="showTooltip" class="tao-tooltip" :class="[`tao-tooltip--${position}`]" role="tooltip">
                {{ content }}
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.tao-tooltip-wrapper {
    position: relative;
    display: inline-block;
}

.tao-tooltip {
    position: absolute;
    padding: var(--tao-space-2) var(--tao-space-3);
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text-strong);
    font-size: var(--tao-font-size-xs);
    border-radius: var(--tao-radius-control);
    white-space: nowrap;
    z-index: 1000;
    box-shadow: var(--tao-shadow-lg);
    /* Тултип — не интерактивный элемент: не должен перехватывать
       курсор и мешать mouseleave на wrapper'е (иначе при наведении
       на сам тултип он "залипает" и не скрывается). */
    pointer-events: none;
}

.tao-tooltip::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--tao-color-surface-raised);
    transform: rotate(45deg);
}

.tao-tooltip--top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: var(--tao-space-2);
}

.tao-tooltip--top::after {
    top: 100%;
    left: 50%;
    margin-top: -4px;
    margin-left: -4px;
}

.tao-tooltip--bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: var(--tao-space-2);
}

.tao-tooltip--bottom::after {
    bottom: 100%;
    left: 50%;
    margin-bottom: -4px;
    margin-left: -4px;
}

.tao-tooltip--left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: var(--tao-space-2);
}

.tao-tooltip--left::after {
    right: 0;
    top: 50%;
    margin-top: -4px;
    margin-right: -4px;
}

.tao-tooltip--right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: var(--tao-space-2);
}

.tao-tooltip--right::after {
    left: 0;
    top: 50%;
    margin-top: -4px;
    margin-left: -4px;
}

.tao-tooltip-fade-enter-active,
.tao-tooltip-fade-leave-active {
    transition: opacity var(--tao-duration-base) var(--tao-ease-base),
        transform var(--tao-duration-base) var(--tao-ease-base);
}

/* Анимация въезда/выезда сдвигается по нормали к своей стороне,
   поверх базового центрирующего transform каждой позиции — иначе
   общий translateX(-50%) конфликтует с left/right, где центрирование
   идёт по вертикали (translateY(-50%)), и блок "убегает" в сторону. */
.tao-tooltip--top.tao-tooltip-fade-enter-from,
.tao-tooltip--top.tao-tooltip-fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
}

.tao-tooltip--bottom.tao-tooltip-fade-enter-from,
.tao-tooltip--bottom.tao-tooltip-fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-4px);
}

.tao-tooltip--left.tao-tooltip-fade-enter-from,
.tao-tooltip--left.tao-tooltip-fade-leave-to {
    opacity: 0;
    transform: translateY(-50%) translateX(4px);
}

.tao-tooltip--right.tao-tooltip-fade-enter-from,
.tao-tooltip--right.tao-tooltip-fade-leave-to {
    opacity: 0;
    transform: translateY(-50%) translateX(-4px);
}
</style>
