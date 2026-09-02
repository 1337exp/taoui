<script lang="ts" setup>
import { computed, provide, ref } from 'vue';
import { spoilerGroupKey, type TaoSpoilerName } from '../spoiler';

defineOptions({ name: 'TaoSpoilerGroup' });

const props = defineProps<{
    modelValue?: TaoSpoilerName | null;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: TaoSpoilerName | null];
    change: [value: TaoSpoilerName | null];
}>();

const isControlled = computed(() => props.modelValue !== undefined);
const internal = ref<TaoSpoilerName | null>(null);
const model = computed(() => (isControlled.value ? props.modelValue : internal.value));

function setOpen(name: TaoSpoilerName | null) {
    if (!isControlled.value) {
        internal.value = name;
    }
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
