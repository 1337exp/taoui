<script lang="ts" setup>
import { computed, provide } from 'vue';
import { taoListKey, type TaoListSize } from '../list';

defineOptions({ name: 'TaoList' });

const props = withDefaults(
    defineProps<{
        size?: TaoListSize;
        /** Рамка, как у списка файлов. */
        bordered?: boolean;
        /** Линии между строками. */
        divided?: boolean;
        /** Скролл, если строки не влезают. Число — пиксели. */
        maxHeight?: number | string;
        /** Показать `#empty` вместо строк. */
        empty?: boolean;
        ariaLabel?: string;
    }>(),
    {
        size: 'medium',
        bordered: true,
        divided: true,
        empty: false,
        ariaLabel: '',
    },
);

const size = computed(() => props.size);
provide(taoListKey, { size });

const listStyle = computed(() => {
    if (props.maxHeight === undefined || props.maxHeight === '') {
        return undefined;
    }
    const value = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight;
    return { maxHeight: value };
});
</script>

<template>
    <ul
        class="tao-list"
        :class="[
            `tao-list--${size}`,
            {
                'tao-list--bordered': bordered,
                'tao-list--divided': divided,
                'tao-list--plain': !bordered,
                'tao-list--empty': empty,
                'tao-list--scroll': Boolean(maxHeight),
            },
        ]"
        :style="listStyle"
        :aria-label="ariaLabel || undefined"
    >
        <li v-if="empty" class="tao-list__empty">
            <slot name="empty">Ничего нет</slot>
        </li>
        <slot v-else />
    </ul>
</template>

<style scoped>
.tao-list {
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text);
}

.tao-list--bordered {
    overflow: hidden;
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-control);
}

.tao-list--plain {
    padding: var(--tao-space-1);
    background: transparent;
}

.tao-list--scroll {
    overflow: auto;
}

.tao-list--divided :deep(.tao-list-item:not(:last-child)) {
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-list--plain :deep(.tao-list-item) {
    border-radius: var(--tao-radius-sm);
}

.tao-list__empty {
    margin: 0;
    padding: var(--tao-space-3);
    color: var(--tao-color-text-muted);
    font-size: var(--tao-font-size-sm);
    line-height: 1.45;
    text-align: center;
}
</style>
