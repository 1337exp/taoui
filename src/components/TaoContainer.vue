<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({ name: 'TaoContainer' });

type TaoContainerWidth = 'wide' | 'slim' | 'ultra-slim';

interface Props {
    /** max-width: 1120 / 500 / 400px. */
    width?: TaoContainerWidth;
    /** @deprecated Use `width` — this is a width, not a size. / Используйте `width` — это ширина, не размер. */
    size?: TaoContainerWidth;
    /** "свободно" болтается в разметке, без авто-центровки по горизонтали */
    free?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    free: false,
});

const resolvedWidth = computed(() => props.width ?? props.size ?? 'wide');
</script>

<template>
    <div class="tao-container" :class="[`tao-container--${resolvedWidth}`, { 'tao-container--center': !free }]">
        <slot />
    </div>
</template>

<style scoped>
.tao-container {
    width: 100%;
}

.tao-container--center {
    margin: 0 auto;
}

.tao-container--wide {
    max-width: 1120px;
}

.tao-container--slim {
    max-width: 500px;
}

.tao-container--ultra-slim {
    max-width: 400px;
}
</style>
