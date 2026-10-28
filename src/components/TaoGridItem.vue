<script lang="ts" setup>
import { computed } from 'vue';
import { perSize, spanNumber, type TaoGridSpan, type TaoResponsive } from '../grid';

defineOptions({ name: 'TaoGridItem' });

// A tile of a bento TaoGrid: how many columns and rows it takes and where it goes, per width class of the grid.
// A span never runs past the columns there are, so `'full'` (or a big number) is simply the whole row.
// Плитка bento TaoGrid: сколько колонок и рядов она занимает и где стоит, по классам ширины сетки. Охват никогда не
// вылезает за колонки, поэтому `'full'` (или большое число) — просто весь ряд.
const props = withDefaults(
    defineProps<{
        /**
         * Columns to take: a number or `'full'`, or one per width class, `{ compact: 'full', expanded: 4 }`.
         * Сколько колонок: число или `'full'`, или по классам ширины.
         */
        col?: TaoResponsive<TaoGridSpan>;
        /**
         * Rows to take. A plain number is one row on compact (a phone column), the number from medium on.
         * Сколько рядов. Простое число — один ряд в compact, это число начиная с medium.
         */
        row?: TaoResponsive<number>;
        /**
         * The place in the flow (CSS order), per width class: `{ compact: 9 }` moves a side block to the end on a phone.
         * Место в потоке (CSS order) по классам ширины: `{ compact: 9 }` уводит боковой блок вниз на телефоне.
         */
        order?: TaoResponsive<number>;
    }>(),
    {
        col: 1,
        row: 1,
        order: 0,
    },
);

const itemStyle = computed(() => {
    const col = perSize(props.col, 1);
    const row = perSize(props.row, 1, 1);
    const order = perSize(props.order, 0);
    return {
        '--_tao-col-compact': String(spanNumber(col.compact)),
        '--_tao-col-medium': String(spanNumber(col.medium)),
        '--_tao-col-expanded': String(spanNumber(col.expanded)),
        '--_tao-row-compact': String(Math.max(1, row.compact)),
        '--_tao-row-medium': String(Math.max(1, row.medium)),
        '--_tao-row-expanded': String(Math.max(1, row.expanded)),
        '--_tao-order-compact': String(order.compact),
        '--_tao-order-medium': String(order.medium),
        '--_tao-order-expanded': String(order.expanded),
    };
});
</script>

<template>
    <div class="tao-grid-item" :style="itemStyle">
        <slot />
    </div>
</template>

<style scoped>
.tao-grid-item {
    --_tao-col: var(--_tao-col-compact);
    --_tao-row: var(--_tao-row-compact);
    --_tao-order: var(--_tao-order-compact);
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    /* never past the columns of the grid; in a catalog (no --_tao-cols) the span is 1
       не дальше колонок сетки; в каталоге (без --_tao-cols) охват 1 */
    grid-column: span min(var(--_tao-col), var(--_tao-cols, 1));
    grid-row: span var(--_tao-row);
    order: var(--_tao-order);
}

@container tao-grid (width >= 600px) {
    .tao-grid-item {
        --_tao-col: var(--_tao-col-medium);
        --_tao-row: var(--_tao-row-medium);
        --_tao-order: var(--_tao-order-medium);
    }
}

@container tao-grid (width >= 840px) {
    .tao-grid-item {
        --_tao-col: var(--_tao-col-expanded);
        --_tao-row: var(--_tao-row-expanded);
        --_tao-order: var(--_tao-order-expanded);
    }
}

.tao-grid-item > * {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
}
</style>
