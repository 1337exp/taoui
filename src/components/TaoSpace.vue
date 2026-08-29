<script lang="ts" setup>
interface Props {
    block?: boolean;
    expand?: boolean;
    vertical?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    block: false,
    expand: false,
    vertical: false,
});
</script>

<template>
    <div
        class="tao-space"
        :class="{ 'tao-space--vertical': props.vertical }"
        :style="[props.block ? 'display: flex; flex-wrap: initial;' : '', props.expand ? 'width: 100%' : '']"
    >
        <slot />
    </div>
</template>

<style scoped>
.tao-space {
    display: inline-flex;
    flex-wrap: wrap;
    column-gap: var(--tao-space-2);
    row-gap: var(--tao-space-2);
}

.tao-space--vertical {
    flex-direction: column;
}
</style>
