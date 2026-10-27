<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({ name: 'TaoSpace' });

interface Props {
    block?: boolean;
    expand?: boolean;
    /** Same as TaoFlex / TaoRadioGroup. / Как у TaoFlex / TaoRadioGroup. */
    direction?: 'row' | 'column';
}

const props = withDefaults(defineProps<Props>(), {
    block: false,
    expand: false,
    direction: 'row',
});

const isColumn = computed(() => props.direction === 'column');
</script>

<template>
    <div
        class="tao-space"
        :class="{ 'tao-space--vertical': isColumn }"
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
