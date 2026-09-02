<script lang="ts" setup>
defineOptions({ name: 'TaoIcon' });

interface Props {
    name: string;
    margin?: string;
    size?: number;
    invert?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    margin: '0px',
});
</script>

<template>
    <span class="tao-icon">
        <slot name="prefix" />
        <i
            class="tao-icon__value"
            :class="[`icon-${props.name}`, { 'tao-icon__value--invert': props.invert }]"
            :style="props.size ? `font-size: ${props.size}px` : ''"
        />
        <slot name="postfix" />
    </span>
</template>

<style scoped>
/**
 * TaoIcon рендерит класс icon-<name> и полагается на внешний icon-шрифт,
 * который нужно подключить в проекте самостоятельно — библиотека Tao
 * его не поставляет. Это осознанное соглашение (см. README).
 */
.tao-icon {
    display: inline-flex;
}

.tao-icon__value {
    margin: v-bind('props.margin');
}

.tao-icon__value--invert {
    filter: invert();
}
</style>
