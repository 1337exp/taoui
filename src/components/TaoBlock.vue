<script lang="ts" setup>
import { computed } from 'vue';
import { toCssBox, toCssLength, type TaoLength } from '../length';
import { surfaceClass, type TaoSurface } from '../surface';

defineOptions({ name: 'TaoBlock' });

interface Props {
    /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
    padding?: TaoLength | TaoLength[];
    /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
    radius?: TaoLength;
    shadow?: boolean;
    hover?: boolean;
    /** `flat` fill, `grain` film grain, `glass` blurred translucent. / Из чего сделана панель. */
    surface?: TaoSurface;
}

const props = withDefaults(defineProps<Props>(), {
    padding: 16,
    radius: 8,
    shadow: true,
    hover: false,
    surface: 'flat',
});

const paddingStyle = computed(() => ({ padding: toCssBox(props.padding) }));

const radiusStyle = computed(() => ({ borderRadius: toCssLength(props.radius) }));
</script>

<template>
    <div
        class="tao-block"
        :class="[surfaceClass(surface), { 'tao-block--shadow': shadow, 'tao-block--hover': hover }]"
        :style="[paddingStyle, radiusStyle]"
    >
        <slot />
    </div>
</template>

<style scoped>
.tao-block {
    background-color: var(--tao-surface-fill, var(--tao-color-surface));
    background-image: var(--tao-surface-image, none);
    background-size: var(--tao-surface-image-size, auto);
    box-shadow: var(--tao-surface-inset, 0 0 #0000);
    -webkit-backdrop-filter: var(--tao-surface-backdrop, none);
    backdrop-filter: var(--tao-surface-backdrop, none);
    color: var(--tao-color-text);
    transition: var(--tao-transition-base);
}

.tao-block--shadow {
    box-shadow: var(--tao-surface-inset, 0 0 #0000), var(--tao-shadow-panel);
}

.tao-block--hover {
    cursor: pointer;
}

.tao-block--hover:hover {
    box-shadow: var(--tao-surface-inset, 0 0 #0000), var(--tao-shadow-md);
}
</style>
