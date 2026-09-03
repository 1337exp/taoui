<script lang="ts" setup>
import { computed } from 'vue';
import TaoLoader from './TaoLoader.vue';
import type { TaoTableColumn, TaoTableSort } from '../table';

defineOptions({ name: 'TaoTable' });

const props = withDefaults(
    defineProps<{
        columns: TaoTableColumn[];
        rows?: Record<string, unknown>[];
        rowKey?: string | ((row: Record<string, unknown>, index: number) => string | number);
        loading?: boolean;
        emptyText?: string;
        /** Зебра. `true` / `odd` — с первой строки, `even` — со второй. */
        striped?: boolean | 'odd' | 'even';
        compact?: boolean;
        hover?: boolean;
        /** Подсветка шапки. */
        head?: boolean;
        /** Горизонтальные линии между рядами. */
        lines?: boolean;
        sticky?: boolean;
        maxHeight?: string;
        clickable?: boolean;
        sort?: TaoTableSort | null;
        caption?: string;
    }>(),
    {
        rows: () => [],
        rowKey: 'id',
        loading: false,
        emptyText: 'Нет данных',
        striped: false,
        compact: false,
        hover: true,
        head: true,
        lines: true,
        sticky: false,
        maxHeight: '',
        clickable: false,
        sort: null,
        caption: '',
    },
);

const emit = defineEmits<{
    'update:sort': [value: TaoTableSort | null];
    sort: [value: TaoTableSort | null];
    'row-click': [row: Record<string, unknown>, index: number];
}>();

const colCount = computed(() => Math.max(props.columns.length, 1));
const isEmpty = computed(() => !props.rows.length && !props.loading);
const stripeFrom = computed(() => {
    if (props.striped === 'even') {
        return 'even';
    }
    if (props.striped === 'odd' || props.striped === true) {
        return 'odd';
    }
    return null;
});

function columnWidth(column: TaoTableColumn) {
    if (column.width == null) {
        return undefined;
    }
    return typeof column.width === 'number' ? `${column.width}px` : column.width;
}

function cellValue(row: Record<string, unknown>, column: TaoTableColumn) {
    if (column.value) {
        return column.value(row);
    }
    return row[column.key];
}

function rowId(row: Record<string, unknown>, index: number) {
    if (typeof props.rowKey === 'function') {
        return props.rowKey(row, index);
    }
    const key = row[props.rowKey];
    return key == null ? index : String(key);
}

function sortDir(column: TaoTableColumn) {
    if (!props.sort || props.sort.key !== column.key) {
        return null;
    }
    return props.sort.dir;
}

function toggleSort(column: TaoTableColumn) {
    if (!column.sortable) {
        return;
    }

    const current = sortDir(column);
    const next: TaoTableSort | null =
        current == null ? { key: column.key, dir: 'asc' } : current === 'asc' ? { key: column.key, dir: 'desc' } : null;

    emit('update:sort', next);
    emit('sort', next);
}

function onRowClick(row: Record<string, unknown>, index: number) {
    if (!props.clickable) {
        return;
    }
    emit('row-click', row, index);
}
</script>

<template>
    <div
        class="tao-table-wrap"
        :class="{
            'tao-table-wrap--sticky': sticky,
            'tao-table-wrap--loading': loading,
        }"
        :style="maxHeight ? { maxHeight } : undefined"
    >
        <table
            class="tao-table"
            :class="{
                'tao-table--striped': stripeFrom === 'odd',
                'tao-table--striped-even': stripeFrom === 'even',
                'tao-table--compact': compact,
                'tao-table--hover': hover,
                'tao-table--head': head,
                'tao-table--lines': lines,
                'tao-table--clickable': clickable,
                'tao-table--sticky': sticky,
            }"
        >
            <caption v-if="caption">{{ caption }}</caption>
            <thead>
                <tr>
                    <th
                        v-for="column in columns"
                        :key="column.key"
                        :style="{ width: columnWidth(column), textAlign: column.align || 'left' }"
                        scope="col"
                        :aria-sort="
                            column.sortable
                                ? sortDir(column) === 'asc'
                                    ? 'ascending'
                                    : sortDir(column) === 'desc'
                                      ? 'descending'
                                      : 'none'
                                : undefined
                        "
                    >
                        <button
                            v-if="column.sortable"
                            type="button"
                            class="tao-table__sort-btn"
                            @click="toggleSort(column)"
                        >
                            <span>{{ column.label }}</span>
                            <span
                                class="tao-table__sorter"
                                :class="{
                                    'tao-table__sorter--asc': sortDir(column) === 'asc',
                                    'tao-table__sorter--desc': sortDir(column) === 'desc',
                                }"
                                aria-hidden="true"
                            />
                        </button>
                        <span v-else>{{ column.label }}</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="isEmpty">
                    <td class="tao-table__empty" :colspan="colCount">
                        <slot name="empty">{{ emptyText }}</slot>
                    </td>
                </tr>
                <tr
                    v-for="(row, index) in rows"
                    :key="rowId(row, index)"
                    @click="onRowClick(row, index)"
                >
                    <td
                        v-for="column in columns"
                        :key="column.key"
                        :style="{ textAlign: column.align || 'left' }"
                    >
                        <slot
                            :name="`cell-${column.key}`"
                            :row="row"
                            :column="column"
                            :value="cellValue(row, column)"
                            :index="index"
                        >
                            <slot name="cell" :row="row" :column="column" :value="cellValue(row, column)" :index="index">
                                {{ cellValue(row, column) }}
                            </slot>
                        </slot>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="loading" class="tao-table__loading" aria-busy="true">
            <slot name="loading">
                <TaoLoader :size="36" />
            </slot>
        </div>
    </div>
</template>

<style scoped>
.tao-table-wrap {
    position: relative;
    width: 100%;
    overflow: auto;
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    background: var(--tao-color-surface);
}

.tao-table-wrap--loading {
    min-height: 120px;
}

.tao-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--tao-font-size-md);
    color: var(--tao-color-text);
}

.tao-table caption {
    caption-side: top;
    padding: var(--tao-space-3) var(--tao-space-4);
    text-align: left;
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text-muted);
}

.tao-table th,
.tao-table td {
    padding: var(--tao-space-3) var(--tao-space-4);
    vertical-align: middle;
}

.tao-table--lines th,
.tao-table--lines td {
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-table--compact th,
.tao-table--compact td {
    padding: var(--tao-space-2) var(--tao-space-3);
    font-size: var(--tao-font-size-sm);
}

.tao-table th {
    font-weight: 600;
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text-muted);
    white-space: nowrap;
    text-align: left;
}

.tao-table--head th {
    background: var(--tao-color-surface-raised);
}

.tao-table--sticky thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--tao-color-surface);
}

.tao-table--sticky.tao-table--head thead th {
    background: var(--tao-color-surface-raised);
}

.tao-table--lines tbody tr:last-child td {
    border-bottom: none;
}

.tao-table--striped tbody tr:nth-child(odd) td {
    background: var(--tao-color-surface-sunken);
}

.tao-table--striped-even tbody tr:nth-child(even) td {
    background: var(--tao-color-surface-sunken);
}

.tao-table--hover tbody tr:hover td {
    background: var(--tao-color-surface-hover);
}

.tao-table--clickable tbody tr {
    cursor: pointer;
}

.tao-table__sort-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-2);
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.tao-table__sort-btn:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
    border-radius: var(--tao-radius-control);
}

.tao-table__sorter {
    position: relative;
    width: 8px;
    height: 12px;
    opacity: 0.35;
}

.tao-table__sorter::before,
.tao-table__sorter::after {
    content: '';
    position: absolute;
    left: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
}

.tao-table__sorter::before {
    top: 0;
    border-bottom: 4px solid currentColor;
}

.tao-table__sorter::after {
    bottom: 0;
    border-top: 4px solid currentColor;
}

.tao-table__sorter--asc,
.tao-table__sorter--desc {
    opacity: 1;
    color: var(--tao-color-accent);
}

.tao-table__sorter--asc::after,
.tao-table__sorter--desc::before {
    opacity: 0.25;
}

.tao-table__empty {
    padding: var(--tao-space-8) var(--tao-space-4);
    text-align: center;
    color: var(--tao-color-text-muted);
}

.tao-table__loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--tao-color-surface) 72%, transparent);
}
</style>
