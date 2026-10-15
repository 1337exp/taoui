<script lang="ts" setup>
import { computed } from 'vue';
import { sizeClass, type TaoSize } from '../size';
import { toCssLength, type TaoLength } from '../length';

defineOptions({ name: 'TaoList' });

const props = withDefaults(
    defineProps<{
        /** Row height; items inherit it. Without it — the size of ancestors. / Высота строк, item наследует. Без него — размер предков. */
        size?: TaoSize;
        /** Рамка, как у списка файлов. */
        bordered?: boolean;
        /** Линии между строками. */
        divided?: boolean;
        /** Скролл, если строки не влезают. Число — пиксели. */
        maxHeight?: TaoLength;
        /** Показать `#empty` вместо строк. */
        empty?: boolean;
        ariaLabel?: string;
    }>(),
    {
        bordered: true,
        divided: true,
        empty: false,
        ariaLabel: '',
    },
);

const listStyle = computed(() => {
    const value = toCssLength(props.maxHeight);
    return value ? { maxHeight: value } : undefined;
});
</script>

<template>
    <ul
        class="tao-list"
        :class="[
            sizeClass(size),
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
    font-size: var(--tao-control-font-size-secondary);
    line-height: 1.45;
    text-align: center;
}
</style>
