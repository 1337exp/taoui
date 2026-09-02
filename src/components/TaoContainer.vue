<script lang="ts" setup>
defineOptions({ name: 'TaoContainer' });

interface Props {
    size?: 'wide' | 'slim' | 'ultra-slim';
    /** "свободно" болтается в разметке, без авто-центровки по горизонтали */
    free?: boolean;
}

withDefaults(defineProps<Props>(), {
    size: 'wide',
    free: false,
});
</script>

<template>
    <div class="tao-container" :class="[`tao-container--${size}`, { 'tao-container--center': !free }]">
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
