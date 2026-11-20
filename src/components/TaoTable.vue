<script lang="ts" setup generic="T extends object = any">
import { computed, ref } from 'vue';
import TaoLoader from './TaoLoader.vue';
import { sizeClass, type TaoSize } from '../size';
import { toCssLength, type TaoLength } from '../length';
import { tableCellValue, tableRowId, tableRowTarget, type TaoTableColumn, type TaoTableRowKey, type TaoTableSort } from '../table';
import { useLocaleText } from '../locale';
import { frameStyle } from '../frames';

defineOptions({ name: 'TaoTable' });

const props = withDefaults(
    defineProps<{
        /** `T` is inferred from `rows`: an interface, a class or a plain object. / `T` берётся из `rows`: interface, класс или обычный объект. */
        columns: readonly TaoTableColumn<NoInfer<T>>[];
        rows?: readonly T[];
        rowKey?: TaoTableRowKey<T>;
        loading?: boolean;
        emptyText?: string;
        /** Зебра. `true` / `odd` — с первой строки, `even` — со второй. */
        striped?: boolean | 'odd' | 'even';
        /** Cell padding and text; also the size of controls inside cells. Without it — the size of ancestors. / Отступы и текст ячеек, заодно размер контролов в ячейках. Без него — размер предков. */
        size?: TaoSize;
        hover?: boolean;
        /** Подсветка шапки. */
        head?: boolean;
        /** Горизонтальные линии между рядами. */
        lines?: boolean;
        sticky?: boolean;
        /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
        maxHeight?: TaoLength;
        clickable?: boolean;
        sort?: TaoTableSort | null;
        caption?: string;
        /** The outer frame; not set, it follows the frames context (`.tao-frames-soft`). / Внешняя рамка; не задан — идёт за контекстом рамок. */
        bordered?: boolean;
        /**
         * The table is never narrower than this (a number is px, a string any CSS length); in a narrower place it scrolls sideways
         * instead of squeezing its columns into words. Not under `stack` cards.
         * Таблица не уже этого (число — px, строка — любая CSS-длина); в более узком месте она прокручивается вбок, а не сжимает колонки
         * в столбики. В карточках `stack` не действует.
         */
        minWidth?: TaoLength;
        /**
         * In a place narrower than 600px (the width of the table itself, not of the window) every row turns into a card: each cell is
         * shown under its column label. No JavaScript: a container query.
         * В месте уже 600px (ширина самой таблицы, не окна) каждая строка становится карточкой: ячейка под подписью своей колонки.
         * Без JavaScript: контейнерный запрос.
         */
        stack?: boolean;
    }>(),
    {
        rows: () => [],
        rowKey: 'id',
        loading: false,
        striped: false,
        hover: true,
        head: true,
        lines: true,
        sticky: false,
        maxHeight: '',
        clickable: false,
        sort: null,
        caption: '',
        bordered: undefined,
        minWidth: '',
        stack: false,
    },
);
const l10n = useLocaleText(props, 'table');

const emit = defineEmits<{
    'update:sort': [value: TaoTableSort | null];
    /** The user changed the sort. / Пользователь сменил сортировку. */
    change: [value: TaoTableSort | null];
    'row-click': [row: T, index: number];
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

function columnWidth(column: TaoTableColumn<T>) {
    if (column.width == null) {
        return undefined;
    }
    return typeof column.width === 'number' ? `${column.width}px` : column.width;
}

// The alignment goes in a private variable and not in `text-align` itself: the cards (`stack`) put everything at the start by a rule.
// Выравнивание идёт в приватной переменной, а не в самом `text-align`: карточки (`stack`) правилом ставят всё к началу.
function cellStyle(column: TaoTableColumn<T>, head = false) {
    return {
        '--_tao-align': column.align || 'left',
        width: head ? columnWidth(column) : undefined,
        minWidth: toCssLength(column.minWidth),
    };
}

const cellValue = (row: T, column: TaoTableColumn<T>) => tableCellValue(row, column);
const rowId = (row: T, index: number) => tableRowId(props.rowKey, row, index);

function sortDir(column: TaoTableColumn<T>) {
    if (!props.sort || props.sort.key !== column.key) {
        return null;
    }
    return props.sort.dir;
}

function toggleSort(column: TaoTableColumn<T>) {
    if (!column.sortable) {
        return;
    }

    const current = sortDir(column);
    const next: TaoTableSort | null =
        current == null ? { key: column.key, dir: 'asc' } : current === 'asc' ? { key: column.key, dir: 'desc' } : null;

    emit('update:sort', next);
    emit('change', next);
}

function onRowClick(row: T, index: number) {
    if (!props.clickable) {
        return;
    }
    emit('row-click', row, index);
}

// A clickable table is one Tab stop: the arrows walk the rows (a roving tabindex), Enter and Space do what a click does.
// Кликабельная таблица — одна остановка Tab: по строкам ходят стрелки (roving tabindex), Enter и Space делают то же, что клик.
const body = ref<HTMLElement | null>(null);
const stopRow = ref(0);
const tabStop = computed(() => Math.min(stopRow.value, Math.max(props.rows.length - 1, 0)));

function onRowKeydown(event: KeyboardEvent, row: T, index: number) {
    // a key inside a control of the row (a button, an input, a menu) stays with that control / клавиша внутри контрола строки остаётся ему
    if (!props.clickable || event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        emit('row-click', row, index);
        return;
    }
    const to = tableRowTarget(event.key, index, props.rows.length);
    if (to < 0) {
        return;
    }
    event.preventDefault();
    stopRow.value = to;
    (body.value?.children[to] as HTMLElement | undefined)?.focus();
}
</script>

<template>
    <div
        class="tao-table-wrap"
        :class="[
            sizeClass(size),
            {
                'tao-table-wrap--sticky': sticky,
                'tao-table-wrap--loading': loading,
                'tao-table-wrap--stack': stack,
            },
        ]"
        :style="[frameStyle(bordered), maxHeight ? { maxHeight: toCssLength(maxHeight) } : undefined]"
    >
        <!-- the roles: a table that turns into blocks loses its table semantics in some browsers; named, it keeps them -->
        <table
            class="tao-table"
            :class="{
                'tao-table--striped': stripeFrom === 'odd',
                'tao-table--striped-even': stripeFrom === 'even',
                'tao-table--hover': hover,
                'tao-table--head': head,
                'tao-table--lines': lines,
                'tao-table--clickable': clickable,
                'tao-table--sticky': sticky,
                'tao-table--stack': stack,
            }"
            :style="minWidth !== '' ? { '--_tao-table-min': toCssLength(minWidth) } : undefined"
            :role="stack ? 'table' : undefined"
        >
            <caption v-if="caption">{{ caption }}</caption>
            <thead>
                <tr :role="stack ? 'row' : undefined">
                    <th
                        v-for="column in columns"
                        :key="column.key"
                        :class="{ 'tao-table__nowrap': column.nowrap }"
                        :style="cellStyle(column, true)"
                        scope="col"
                        :role="stack ? 'columnheader' : undefined"
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
            <tbody ref="body">
                <tr v-if="isEmpty" :role="stack ? 'row' : undefined">
                    <td class="tao-table__empty" :colspan="colCount" :role="stack ? 'cell' : undefined">
                        <slot name="empty">{{ l10n.emptyText }}</slot>
                    </td>
                </tr>
                <tr
                    v-for="(row, index) in rows"
                    :key="rowId(row, index)"
                    :role="stack ? 'row' : undefined"
                    :tabindex="clickable ? (index === tabStop ? 0 : -1) : undefined"
                    @click="onRowClick(row, index)"
                    @keydown="onRowKeydown($event, row, index)"
                    @focusin="stopRow = index"
                >
                    <td
                        v-for="column in columns"
                        :key="column.key"
                        :class="{ 'tao-table__nowrap': column.nowrap }"
                        :style="cellStyle(column)"
                        :data-label="stack ? column.label : undefined"
                        :role="stack ? 'cell' : undefined"
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
    /* sideways at the end does not turn into the back gesture of the browser / боковая прокрутка в конце не превращается в жест «назад» */
    overscroll-behavior-x: contain;
    border: 1px solid color-mix(in srgb, var(--tao-color-border) var(--tao-frame-alpha, 100%), transparent);
    border-radius: var(--tao-radius-panel);
    background: color-mix(in srgb, var(--tao-color-surface-raised) var(--tao-frame-fill, 0%), var(--tao-color-surface));
}

.tao-table-wrap--loading {
    min-height: 120px;
}

.tao-table {
    width: 100%;
    /* `minWidth`: a table narrower than this scrolls in its wrap instead of squeezing the columns / `minWidth`: уже этого таблица прокручивается в обёртке, а не сжимает колонки */
    min-width: var(--_tao-table-min, 0);
    border-collapse: collapse;
    font-size: var(--tao-control-font-size);
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
    /* 12 / 16 at medium / 12 / 16 в medium */
    padding: calc(var(--tao-control-padding-y) + var(--tao-space-1)) calc(var(--tao-control-padding-x) + var(--tao-space-1));
    vertical-align: middle;
    text-align: var(--_tao-align, left);
}

.tao-table__nowrap {
    white-space: nowrap;
}

.tao-table--lines th,
.tao-table--lines td {
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-table th {
    font-weight: 600;
    font-size: var(--tao-control-font-size-secondary);
    color: var(--tao-color-text-muted);
    white-space: nowrap;
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
    background: var(--tao-color-hover);
}

.tao-table--clickable tbody tr {
    cursor: pointer;
}

/* the focus of a row: inside its edge, so the box of the table does not cut it / фокус строки: внутри её края, чтобы рамка таблицы не обрезала */
.tao-table--clickable tbody tr:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
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

/* `stack`: under 600px of the table's own width a row is a card. The wrap is the container: a container cannot ask about its own
   width, so the table inside lays out by the width of the wrap. The header stays in the DOM, hidden by sight (the roles on the
   cells keep it for a screen reader), and every cell gets its label above it from `data-label`.
   `stack`: при ширине самой таблицы меньше 600px строка становится карточкой. Контейнер это обёртка (контейнер не спросит про
   свою ширину), таблица внутри раскладывается по ширине обёртки. Шапка остаётся в DOM, скрытая для глаз (роли на ячейках
   сохраняют её для скринридера), а у каждой ячейки над значением подпись из `data-label`. */
.tao-table-wrap--stack {
    container: tao-table / inline-size;
}

@container tao-table (width < 600px) {
    .tao-table--stack {
        min-width: 0;
    }

    .tao-table--stack,
    .tao-table--stack caption,
    .tao-table--stack tbody,
    .tao-table--stack tr,
    .tao-table--stack td {
        display: block;
    }

    .tao-table--stack thead {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
    }

    .tao-table--stack td {
        padding-block: var(--tao-space-1);
        text-align: start;
        white-space: normal;
    }

    .tao-table--stack td:first-child {
        padding-block-start: var(--tao-space-3);
    }

    .tao-table--stack td:last-child {
        padding-block-end: var(--tao-space-3);
    }

    .tao-table--stack td[data-label]::before {
        content: attr(data-label);
        /* the empty alternative takes the label out of the speech: the hidden header already says it (older browsers keep the line above) */
        content: attr(data-label) / '';
        display: block;
        font-size: var(--tao-control-font-size-secondary);
        font-weight: 600;
        color: var(--tao-color-text-muted);
    }

    /* the line stands between the cards, not under every cell */
    .tao-table--lines.tao-table--stack td {
        border-bottom: none;
    }

    .tao-table--lines.tao-table--stack tbody tr {
        border-bottom: 1px solid var(--tao-color-border);
    }

    .tao-table--lines.tao-table--stack tbody tr:last-child {
        border-bottom: none;
    }
}
</style>
