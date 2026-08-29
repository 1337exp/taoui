<script lang="ts" setup>
import { ref, watch } from 'vue';

interface Props {
    src: string;
    alt?: string;
    pixelated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    src: '',
    alt: '',
    pixelated: false,
});

const emit = defineEmits(['load', 'error']);

const isLoaded = ref(false);

function handleLoad() {
    isLoaded.value = true;
    emit('load');
}

function handleError() {
    isLoaded.value = false;
    emit('error');
}

watch(() => props.src, () => {
    isLoaded.value = false;
});
</script>

<template>
    <div class="tao-image">
        <template v-if="src">
            <img
                :class="{ 'tao-image__img--hidden': !isLoaded, 'tao-image__img--pixelated': props.pixelated }"
                :src="src"
                :alt="alt"
                draggable="false"
                @load="handleLoad"
                @error="handleError"
            />
        </template>
        <template v-else>
            <slot>
                <div class="tao-image__placeholder">No image available</div>
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
    font-size: var(--tao-font-size-sm);
    font-family: var(--tao-font-family);
    letter-spacing: 0.01rem;
    text-align: center;
    color: var(--tao-color-text-muted);
}
</style>
