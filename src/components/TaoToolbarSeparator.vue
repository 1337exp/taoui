<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { toolbarKey, type ToolbarUnit } from '../toolbar';

defineOptions({ name: 'TaoToolbarSeparator' });

const toolbar = inject(toolbarKey, null);
// a line across the toolbar: vertical in a horizontal bar / линия поперёк панели: в горизонтальной — вертикальная
const orientation = computed(() => (toolbar?.orientation.value === 'vertical' ? 'horizontal' : 'vertical'));

// in a toolbar with overflow the separator goes with the group after it (the toolbar sets `away`)
// в панели с overflow разделитель уходит вместе с группой после него (`away` ставит панель)
const el = ref<HTMLElement | null>(null);
const unit: ToolbarUnit = {
    kind: 'separator',
    el,
    pinned: ref(false),
    away: ref(false),
    order: ref(0),
    first: ref(false),
    width: 0,
};
let unregister: (() => void) | undefined;
onMounted(() => {
    unregister = toolbar?.register(unit);
});
onBeforeUnmount(() => unregister?.());
</script>

<template>
    <div
        ref="el"
        class="tao-toolbar-separator"
        :class="`tao-toolbar-separator--${orientation}`"
        role="separator"
        :aria-orientation="orientation"
        :data-tao-away="unit.away.value ? '' : undefined"
    />
</template>

<style scoped>
.tao-toolbar-separator {
    flex: none;
    background: var(--tao-color-border-strong);
}

.tao-toolbar-separator[data-tao-away] {
    display: none;
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
