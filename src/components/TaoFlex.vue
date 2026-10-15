<script lang="ts" setup>
import { toCssLength, type TaoLength } from '../length';

defineOptions({ name: 'TaoFlex' });

interface Props {
    tag?: string;
    justify?: 'flex-start' | 'flex-end' | 'center' | 'normal' | 'space-between' | 'space-around' | 'space-evenly';
    align?: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
    gap?: TaoLength;
}

withDefaults(defineProps<Props>(), {
    tag: 'div',
    justify: 'flex-start',
    align: 'stretch',
    direction: 'row',
    wrap: 'nowrap',
    gap: '0px',
});
</script>

<template>
    <component
        :is="tag"
        :style="{
            display: 'flex',
            justifyContent: justify,
            alignItems: align,
            flexDirection: direction,
            flexWrap: wrap,
            gap: toCssLength(gap),
        }"
    >
        <slot />
    </component>
</template>
