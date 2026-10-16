<script lang="ts" setup>
import type { TaoSliderBaseProps, TaoSliderMark } from '../slider';
import TaoSliderBase from './TaoSliderBase.vue';

defineOptions({ name: 'TaoRangeSlider' });

// Слайдер с двумя ручками: значение это пара [от, до]. Вся работа в TaoSliderBase.
const props = defineProps<TaoSliderBaseProps & { modelValue: [number, number] }>();

const emit = defineEmits<{
    'update:modelValue': [value: [number, number]];
    /** The user finished changing: drag released, key, a click on a mark. / Пользователь закончил менять: отпустил, клавиша, клик по метке. */
    change: [value: [number, number]];
}>();

defineSlots<{
    /** Caption of a mark. / Подпись метки. */
    mark?(props: { mark: TaoSliderMark; active: boolean }): unknown;
    'pre-value'?(): unknown;
    'post-value'?(): unknown;
}>();
</script>

<template>
    <TaoSliderBase v-bind="props" @update:model-value="emit('update:modelValue', $event as [number, number])" @change="emit('change', $event as [number, number])">
        <template v-if="$slots.mark" #mark="slot"><slot name="mark" v-bind="slot" /></template>
        <template v-if="$slots['pre-value']" #pre-value><slot name="pre-value" /></template>
        <template v-if="$slots['post-value']" #post-value><slot name="post-value" /></template>
    </TaoSliderBase>
</template>
