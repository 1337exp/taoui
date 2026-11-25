<script lang="ts" setup>
import type { TaoSliderBaseProps, TaoSliderMark } from '../slider';
import TaoSliderBase from './TaoSliderBase.vue';

defineOptions({ name: 'TaoRangeSlider' });

// Слайдер с двумя ручками: значение это пара [от, до]. Вся работа в TaoSliderBase.
const props = defineProps<TaoSliderBaseProps>();
const model = defineModel<[number, number]>({ required: true });

const emit = defineEmits<{
    /** The user finished changing: drag released, key, a click on a mark. / Пользователь закончил менять: отпустил, клавиша, клик по метке. */
    commit: [value: [number, number]];
}>();

defineSlots<{
    /** Caption of a mark. / Подпись метки. */
    mark?(props: { mark: TaoSliderMark; active: boolean }): unknown;
    /** The bubble beside a thumb (with `bubble`): its text; `zone` is the zone the thumb stands in. / Плашка у ручки (с `bubble`): её текст; `zone` — зона, в которой стоит ручка. */
    bubble?(props: { value: number; zone: { from: number; to: number; color: string } | undefined }): unknown;
    'pre-value'?(): unknown;
    'post-value'?(): unknown;
}>();
</script>

<template>
    <TaoSliderBase v-model="model" v-bind="props" @commit="emit('commit', $event as [number, number])">
        <template v-if="$slots.mark" #mark="slot"><slot name="mark" v-bind="slot" /></template>
        <template v-if="$slots.bubble" #bubble="slot"><slot name="bubble" v-bind="slot" /></template>
        <template v-if="$slots['pre-value']" #pre-value><slot name="pre-value" /></template>
        <template v-if="$slots['post-value']" #post-value><slot name="post-value" /></template>
    </TaoSliderBase>
</template>
