<script lang="ts" setup>
defineOptions({ name: 'TaoToolbarGroup' });

withDefaults(
    defineProps<{
        /** Accessible name of the group: «Text style», «Alignment». / Доступное имя группы. */
        label?: string;
        /** A sunken pill behind the group: its buttons read as one set. / Утопленная подложка: кнопки читаются как набор. */
        inset?: boolean;
    }>(),
    {
        label: undefined,
        inset: false,
    },
);
</script>

<template>
    <div class="tao-toolbar-group" :class="{ 'tao-toolbar-group--inset': inset }" role="group" :aria-label="label">
        <slot />
    </div>
</template>

<style scoped>
.tao-toolbar-group {
    display: flex;
    flex-direction: inherit;
    align-items: center;
    gap: 2px;
}

.tao-toolbar-group--inset {
    padding: 2px;
    background: var(--tao-color-surface-sunken);
    border-radius: calc(var(--tao-radius-control) + 2px);
}
</style>
