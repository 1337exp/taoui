<script lang="ts" setup>
import { computed } from 'vue';

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
        showPercentage?: boolean;
        animated?: boolean;
    }>(),
    {
        minWidth: undefined,
        maxWidth: undefined,
        min: undefined,
        max: undefined,
        progress: 0,
        height: 8,
        showPercentage: false,
        animated: true,
    },
);

const minW = computed(() => props.minWidth ?? props.min ?? 200);
const maxW = computed(() => props.maxWidth ?? props.max ?? 400);
</script>

<template>
    <div class="tao-progress">
        <div class="tao-progress__container" :style="{ minWidth: `${minW}px`, maxWidth: `${maxW}px` }">
            <div v-if="$slots.left" class="tao-progress__side">
                <slot name="left" />
            </div>

            <div class="tao-progress__track" :style="{ height: `${height}px` }">
                <div
                    class="tao-progress__fill"
                    :class="{ 'tao-progress__fill--animated': animated }"
                    :style="{ width: `${progress}%` }"
                ></div>
            </div>

            <div class="tao-progress__side">
                <span v-if="showPercentage" class="tao-progress__percentage">{{ progress }}%</span>
                <slot name="right" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.tao-progress {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.tao-progress__container {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--tao-space-3);
    width: 100%;
}

.tao-progress__track {
    flex: 1;
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
    min-width: 40px;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: var(--tao-font-size-xs);
    font-weight: bold;
    text-align: center;
    color: var(--tao-color-text);
}

.tao-progress__percentage {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--tao-color-text-muted);
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
