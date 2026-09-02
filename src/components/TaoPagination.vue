<script lang="ts" setup>
import { computed, watch } from 'vue';
import { buildPaginationItems } from '../pagination';

defineOptions({ name: 'TaoPagination' });

const props = withDefaults(
    defineProps<{
        page?: number;
        total?: number;
        pageSize?: number;
        siblingCount?: number;
        disabled?: boolean;
        showTotal?: boolean;
        size?: 'small' | 'medium';
        ariaLabel?: string;
    }>(),
    {
        page: 1,
        total: 0,
        pageSize: 10,
        siblingCount: 1,
        disabled: false,
        showTotal: true,
        size: 'medium',
        ariaLabel: 'Пагинация',
    },
);

const emit = defineEmits<{
    'update:page': [value: number];
    change: [value: number];
}>();

const pageCount = computed(() => Math.max(1, Math.ceil(Math.max(props.total, 0) / Math.max(props.pageSize, 1))));
const current = computed(() => Math.min(Math.max(props.page, 1), pageCount.value));
const items = computed(() => buildPaginationItems(current.value, pageCount.value, props.siblingCount));

const from = computed(() => (props.total === 0 ? 0 : (current.value - 1) * props.pageSize + 1));
const to = computed(() => Math.min(current.value * props.pageSize, props.total));

watch(pageCount, (count) => {
    if (props.page > count) {
        goTo(count);
    }
});

function goTo(next: number) {
    if (props.disabled) {
        return;
    }

    const page = Math.min(Math.max(next, 1), pageCount.value);
    if (page === props.page) {
        return;
    }

    emit('update:page', page);
    emit('change', page);
}
</script>

<template>
    <nav class="tao-pagination" :class="`tao-pagination--${size}`" :aria-label="ariaLabel">
        <p v-if="showTotal" class="tao-pagination__total">
            <template v-if="total === 0">0 из 0</template>
            <template v-else>{{ from }}–{{ to }} из {{ total }}</template>
        </p>

        <div class="tao-pagination__pages">
            <button
                type="button"
                class="tao-pagination__btn"
                aria-label="Назад"
                :disabled="disabled || current <= 1"
                @click="goTo(current - 1)"
            >
                ‹
            </button>

            <template v-for="item in items" :key="item.type === 'page' ? item.page : item.id">
                <span v-if="item.type === 'ellipsis'" class="tao-pagination__ellipsis" aria-hidden="true">…</span>
                <button
                    v-else
                    type="button"
                    class="tao-pagination__btn"
                    :class="{ 'tao-pagination__btn--current': item.page === current }"
                    :aria-current="item.page === current ? 'page' : undefined"
                    :aria-label="`Страница ${item.page}`"
                    :disabled="disabled"
                    @click="goTo(item.page)"
                >
                    {{ item.page }}
                </button>
            </template>

            <button
                type="button"
                class="tao-pagination__btn"
                aria-label="Вперёд"
                :disabled="disabled || current >= pageCount"
                @click="goTo(current + 1)"
            >
                ›
            </button>
        </div>
    </nav>
</template>

<style scoped>
.tao-pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--tao-space-3);
    width: 100%;
}

.tao-pagination__total {
    margin: 0;
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text-muted);
}

.tao-pagination__pages {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--tao-space-1);
}

.tao-pagination__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 var(--tao-space-2);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-surface-sunken);
    color: var(--tao-color-text);
    font-family: inherit;
    font-size: var(--tao-font-size-md);
    line-height: 1;
    cursor: pointer;
    transition: var(--tao-transition-base);
}

.tao-pagination--small .tao-pagination__btn {
    min-width: 28px;
    height: 28px;
    font-size: var(--tao-font-size-xs);
}

.tao-pagination__btn:hover:not(:disabled) {
    background: var(--tao-color-surface-hover);
    color: var(--tao-color-text-strong);
}

.tao-pagination__btn:focus-visible {
    outline: none;
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-pagination__btn--current {
    background: var(--tao-color-accent);
    border-color: var(--tao-color-accent);
    color: var(--tao-color-on-accent);
}

.tao-pagination__btn--current:hover:not(:disabled) {
    background: var(--tao-color-accent-hover);
    color: var(--tao-color-on-accent);
}

.tao-pagination__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.tao-pagination__ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    color: var(--tao-color-text-muted);
    user-select: none;
}
</style>
