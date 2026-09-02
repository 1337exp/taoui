<script lang="ts" setup>
import { computed, provide } from 'vue';
import { spoilerGroupKey, type TaoSpoilerName } from '../spoiler';

defineOptions({ name: 'TaoSpoilerGroup' });

const props = withDefaults(
    defineProps<{
        modelValue?: TaoSpoilerName | null;
    }>(),
    {
        modelValue: null,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: TaoSpoilerName | null];
    change: [value: TaoSpoilerName | null];
}>();

const model = computed(() => props.modelValue);

function setOpen(name: TaoSpoilerName | null) {
    emit('update:modelValue', name);
    emit('change', name);
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
