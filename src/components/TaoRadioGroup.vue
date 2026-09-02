<script lang="ts" setup>
import { computed, provide, useId } from 'vue';
import { radioGroupKey, type TaoRadioValue } from '../radio';

defineOptions({ name: 'TaoRadioGroup' });

const props = withDefaults(
    defineProps<{
        modelValue?: TaoRadioValue;
        name?: string;
        legend?: string;
        disabled?: boolean;
        direction?: 'row' | 'column';
    }>(),
    {
        disabled: false,
        direction: 'row',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: TaoRadioValue];
    change: [value: TaoRadioValue];
}>();

const autoName = useId();
const groupName = computed(() => props.name || autoName);
const model = computed(() => props.modelValue);
const groupDisabled = computed(() => props.disabled);

function setValue(value: TaoRadioValue) {
    emit('update:modelValue', value);
    emit('change', value);
}

provide(radioGroupKey, {
    name: groupName,
    model,
    disabled: groupDisabled,
    setValue,
});
</script>

<template>
    <fieldset class="tao-radio-group" :class="`tao-radio-group--${direction}`" :disabled="disabled">
        <legend v-if="legend" class="tao-radio-group__legend">{{ legend }}</legend>
        <slot />
    </fieldset>
</template>

<style scoped>
.tao-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--tao-space-3) var(--tao-space-4);
    margin: 0;
    padding: 0;
    border: none;
    min-width: 0;
}

.tao-radio-group--column {
    flex-direction: column;
    align-items: flex-start;
}

.tao-radio-group__legend {
    padding: 0;
    margin-bottom: var(--tao-space-2);
    font-size: var(--tao-font-size-sm);
    font-weight: 500;
    color: var(--tao-color-text);
}
</style>
