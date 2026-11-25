<script lang="ts" setup>
import { provide } from 'vue';
import { spoilerGroupKey, type TaoSpoilerName } from '../spoiler';

defineOptions({ name: 'TaoSpoilerGroup' });

const emit = defineEmits<{
}>();

// the open panel: `v-model` when the parent keeps it, a state of its own when it does not
// открытая панель: `v-model`, если её держит родитель, и собственное состояние, если нет
const model = defineModel<TaoSpoilerName | null>({ default: null });

function setOpen(name: TaoSpoilerName | null) {
    model.value = name;
}

provide(spoilerGroupKey, {
    model,
    setOpen,
});
</script>

<template>
    <div class="tao-spoiler-group">
        <slot />
    </div>
</template>

<style scoped>
.tao-spoiler-group {
    overflow: hidden;
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
}

.tao-spoiler-group :deep(.tao-spoiler) {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-spoiler-group :deep(.tao-spoiler:last-child) {
    border-bottom: none;
}
</style>
