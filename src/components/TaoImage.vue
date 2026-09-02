<script lang="ts" setup>
import { ref, watch } from 'vue';

defineOptions({ name: 'TaoImage' });

interface Props {
    src: string;
    alt?: string;
    pixelated?: boolean;
    /** Нативный `loading="lazy"`. По умолчанию выкл — как обычный `<img>`. */
    lazy?: boolean;
    placeholderText?: string;
}

const props = withDefaults(defineProps<Props>(), {
    src: '',
    alt: '',
    pixelated: false,
    lazy: false,
    placeholderText: 'No image available',
});

const emit = defineEmits(['load', 'error']);

const isLoaded = ref(false);
const hasError = ref(false);

function handleLoad() {
    isLoaded.value = true;
    hasError.value = false;
    emit('load');
}

function handleError() {
    isLoaded.value = false;
    hasError.value = true;
    emit('error');
}

watch(() => props.src, () => {
    isLoaded.value = false;
    hasError.value = false;
});
</script>

<template>
    <div class="tao-image">
        <img
            v-if="src && !hasError"
            :class="{ 'tao-image__img--hidden': !isLoaded, 'tao-image__img--pixelated': props.pixelated }"
            :src="src"
            :alt="alt"
            :loading="lazy ? 'lazy' : 'eager'"
            decoding="async"
            draggable="false"
            @load="handleLoad"
            @error="handleError"
        />
        <template v-if="!src || hasError">
            <slot>
                <div class="tao-image__placeholder">{{ placeholderText }}</div>
            </slot>
        </template>
    </div>
</template>

<style scoped>
.tao-image {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    user-select: none;
}

.tao-image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: opacity var(--tao-duration-slow) var(--tao-ease-base);
}

.tao-image__img--hidden {
    opacity: 0;
}

.tao-image__img--pixelated {
    image-rendering: optimizeSpeed;
    image-rendering: -moz-crisp-edges;
    image-rendering: -o-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: pixelated;
    image-rendering: optimize-contrast;
    -ms-interpolation-mode: nearest-neighbor;
}

.tao-image__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: var(--tao-font-size-sm);
    font-family: var(--tao-font-family);
    letter-spacing: 0.01rem;
    text-align: center;
    color: var(--tao-color-text-muted);
}
</style>
