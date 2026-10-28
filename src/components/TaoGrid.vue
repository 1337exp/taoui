<script lang="ts" setup>
import { computed } from 'vue';
import { perSize, type TaoResponsive } from '../grid';
import { toCssLength, type TaoLength } from '../length';

defineOptions({ name: 'TaoGrid' });

// Two layouts. A catalog (`min`): as many equal tiles as fit, each at least `min` wide. A bento (`cols`): a fixed
// number of columns where TaoGridItem takes several cells. The bento adapts by the width of the grid itself:
// compact below 600px, medium below 840px, expanded from 840px. The outer element measures, the inner one lays out
// (a container query cannot ask an element about its own width).
// Два режима. Каталог (`min`): столько равных плиток, сколько влезает. Bento (`cols`): фиксированные колонки, плитки
// занимают несколько клеток. Bento подстраивается под ширину самой сетки: compact до 600px, medium до 840px, expanded
// от 840px. Внешний элемент меряет, внутренний раскладывает (container query не спрашивает элемент о его же ширине).
const props = withDefaults(
    defineProps<{
        /** The smallest tile width of a catalog (auto-fill). Ignored with `cols`. / Минимальная ширина плитки каталога. */
        min?: TaoLength;
        /**
         * The columns of a bento: a number (one column below 600px, as a phone wants), or a number per width class,
         * `{ compact: 3, expanded: 6 }` (a class without a value takes the smaller one). 0 is the catalog.
         * Колонки bento: число (одна колонка уже 600px) или число по классам ширины. 0 — каталог.
         */
        cols?: TaoResponsive<number>;
        /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
        gap?: TaoLength;
        /**
         * The smallest height of a row: a tile that takes 2 rows is then visibly taller. Rows still grow with the content.
         * Минимальная высота ряда: плитка на 2 ряда тогда заметно выше. Ряды всё равно растут под содержимое.
         */
        rowHeight?: TaoLength;
    }>(),
    {
        min: '220px',
        cols: 0,
        gap: 'var(--tao-space-4)',
        rowHeight: undefined,
    },
);

const columns = computed(() => perSize(props.cols, 1, 1));
const isFixed = computed(() => (typeof props.cols === 'object' ? true : props.cols > 0));

const gridStyle = computed(() => ({
    '--tao-grid-min': toCssLength(props.min),
    '--tao-grid-gap': toCssLength(props.gap),
    '--tao-grid-row-height': toCssLength(props.rowHeight),
    ...(isFixed.value
        ? {
              '--_tao-cols-compact': String(Math.max(1, columns.value.compact)),
              '--_tao-cols-medium': String(Math.max(1, columns.value.medium)),
              '--_tao-cols-expanded': String(Math.max(1, columns.value.expanded)),
          }
        : {}),
}));
</script>

<template>
    <div class="tao-grid" :class="{ 'tao-grid--fixed': isFixed }" :style="gridStyle">
        <div class="tao-grid__cells">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.tao-grid {
    container: tao-grid / inline-size;
}

.tao-grid__cells {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--tao-grid-min, 220px)), 1fr));
    grid-auto-rows: minmax(var(--tao-grid-row-height, auto), auto);
    gap: var(--tao-grid-gap, var(--tao-space-4));
}

/* the bento: the columns of the current width class; the items read --_tao-cols to clamp their spans
   bento: колонки текущего класса ширины; плитки читают --_tao-cols, чтобы не вылезти за сетку */
.tao-grid--fixed > .tao-grid__cells {
    --_tao-cols: var(--_tao-cols-compact);
    grid-template-columns: repeat(var(--_tao-cols), minmax(0, 1fr));
}

@container tao-grid (width >= 600px) {
    .tao-grid--fixed > .tao-grid__cells {
        --_tao-cols: var(--_tao-cols-medium);
    }
}

@container tao-grid (width >= 840px) {
    .tao-grid--fixed > .tao-grid__cells {
        --_tao-cols: var(--_tao-cols-expanded);
    }
}
</style>
