<script lang="ts" setup>
defineOptions({ name: 'TaoFlex' });

interface Props {
    tag?: string;
    justify?: 'flex-start' | 'flex-end' | 'center' | 'normal' | 'space-between' | 'space-around' | 'space-evenly';
    align?: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    gap?: string;
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
            gap: gap,
        }"
    >
        <slot />
    </component>
</template>
