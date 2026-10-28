<script lang="ts" setup>
import { computed, inject } from 'vue';
import { toolbarKey } from '../toolbar';

defineOptions({ name: 'TaoToolbarSeparator' });

const toolbar = inject(toolbarKey, null);
// a line across the toolbar: vertical in a horizontal bar / линия поперёк панели: в горизонтальной — вертикальная
const orientation = computed(() => (toolbar?.orientation.value === 'vertical' ? 'horizontal' : 'vertical'));
</script>

<template>
    <div class="tao-toolbar-separator" :class="`tao-toolbar-separator--${orientation}`" role="separator" :aria-orientation="orientation" />
</template>

<style scoped>
.tao-toolbar-separator {
    flex: none;
    background: var(--tao-color-border-strong);
}

.tao-toolbar-separator--vertical {
    align-self: center;
    width: 1px;
    height: calc(var(--tao-control-height) * 0.6);
    margin: 0 var(--tao-space-1);
}

.tao-toolbar-separator--horizontal {
    align-self: stretch;
    height: 1px;
    margin: var(--tao-space-1) 0;
}
</style>
