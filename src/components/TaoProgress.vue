<script lang="ts" setup>
import { computed, useSlots } from 'vue';

defineOptions({ name: 'TaoProgress' });

const props = withDefaults(
    defineProps<{
        minWidth?: number;
        maxWidth?: number;
        /** @deprecated используйте minWidth */
        min?: number;
        /** @deprecated используйте maxWidth */
        max?: number;
        progress?: number;
        height?: number;
        /** `true` / `top` — по центру над полосой, `right` — справа. Если есть `#right`, процент справа в скобках. `false` — скрыть. */
        showPercentage?: boolean | 'top' | 'right';
        animated?: boolean;
    }>(),
    {
        minWidth: undefined,
        maxWidth: undefined,
        min: undefined,
        max: undefined,
        progress: 0,
        height: 8,
        showPercentage: true,
        animated: true,
    },
);

const slots = useSlots();
const minW = computed(() => props.minWidth ?? props.min ?? 200);
const maxW = computed(() => props.maxWidth ?? props.max ?? 400);
const hasRight = computed(() => Boolean(slots.right));
const percentPlace = computed((): 'top' | 'right' | null => {
    if (!props.showPercentage) {
        return null;
    }
    return props.showPercentage === 'right' ? 'right' : 'top';
});
const showOverPercent = computed(() => percentPlace.value === 'top');
const showEndPercent = computed(() => percentPlace.value === 'right');
const endPercentLabel = computed(() =>
    hasRight.value ? `(${props.progress}%)` : `${props.progress}%`,
);
</script>

<template>
    <div class="tao-progress">
        <div
            class="tao-progress__container"
            :class="{ 'tao-progress__container--over': showOverPercent }"
            :style="{ minWidth: `${minW}px`, maxWidth: `${maxW}px` }"
        >
            <div v-if="$slots.left" class="tao-progress__side">
                <slot name="left" />
            </div>

            <div class="tao-progress__main">
                <span v-if="showOverPercent" class="tao-progress__percentage">{{ progress }}%</span>
                <div class="tao-progress__track" :style="{ height: `${height}px` }">
                    <div
                        class="tao-progress__fill"
                        :class="{ 'tao-progress__fill--animated': animated }"
                        :style="{ width: `${progress}%` }"
                    ></div>
                </div>
            </div>

            <div v-if="$slots.right || showEndPercent" class="tao-progress__side">
                <slot name="right" />
                <span v-if="showEndPercent" class="tao-progress__percentage">{{ endPercentLabel }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tao-progress {
    width: 100%;
}

.tao-progress__container {
    display: flex;
    align-items: center;
    gap: var(--tao-space-3);
    width: 100%;
}

.tao-progress__container--over {
    align-items: flex-end;
}

.tao-progress__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-1);
}

.tao-progress__track {
    width: 100%;
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-sm);
    background-color: var(--tao-color-surface-sunken);
    overflow: hidden;
    position: relative;
}

.tao-progress__fill {
    height: 100%;
    border-radius: var(--tao-radius-sm);
    transition: width var(--tao-duration-slow) var(--tao-ease-base);
    background: var(--tao-color-accent);
}

.tao-progress__side {
    display: inline-flex;
    flex-shrink: 0;
    align-items: baseline;
    gap: var(--tao-space-1);
    font-size: var(--tao-font-size-xs);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
    color: var(--tao-color-text-muted);
}

.tao-progress__percentage {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    font-size: var(--tao-font-size-xs);
    line-height: 1;
    color: var(--tao-color-text-muted);
}

.tao-progress__main > .tao-progress__percentage {
    width: 100%;
    text-align: center;
}

.tao-progress__fill--animated {
    background: linear-gradient(
        90deg,
        var(--tao-color-accent) 0%,
        var(--tao-color-accent-hover) 50%,
        var(--tao-color-accent) 100%
    );
    background-size: 200% 100%;
    animation: tao-progress-shimmer 2s infinite;
}

@keyframes tao-progress-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
</style>
