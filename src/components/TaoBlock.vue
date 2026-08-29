<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
    padding?: number | number[];
    radius?: number;
    shadow?: boolean;
    hover?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    padding: 16,
    radius: 8,
    shadow: true,
    hover: false,
});

const paddingStyle = computed(() => {
    if (Array.isArray(props.padding)) {
        return {
            padding: `${props.padding.map(p => `${p}px`).join(' ')}`
        };
    }
    return { padding: `${props.padding}px` };
});

const radiusStyle = computed(() => ({
    borderRadius: `${props.radius}px`
}));
</script>

<template>
    <div
        class="tao-block"
        :class="{ 'tao-block--shadow': shadow, 'tao-block--hover': hover }"
        :style="[paddingStyle, radiusStyle]"
    >
        <slot />
    </div>
</template>

<style scoped>
.tao-block {
    background: var(--tao-color-surface);
    color: var(--tao-color-text);
    transition: var(--tao-transition-base);
}

.tao-block--shadow {
    box-shadow: var(--tao-shadow-panel);
}

.tao-block--hover {
    cursor: pointer;
}

.tao-block--hover:hover {
    box-shadow: var(--tao-shadow-md);
}
</style>
