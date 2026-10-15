<script lang="ts" setup>
import { computed } from 'vue';
import { toCssBox, toCssLength, type TaoLength } from '../length';

defineOptions({ name: 'TaoBlock' });

interface Props {
    /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
    padding?: TaoLength | TaoLength[];
    /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
    radius?: TaoLength;
    shadow?: boolean;
    hover?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    padding: 16,
    radius: 8,
    shadow: true,
    hover: false,
});

const paddingStyle = computed(() => ({ padding: toCssBox(props.padding) }));

const radiusStyle = computed(() => ({ borderRadius: toCssLength(props.radius) }));
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
