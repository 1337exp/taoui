<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import TaoSelect from './TaoSelect.vue';
import { localeEn } from '../locale/en';
import { computed, ref, watch } from 'vue';
import { buildPaginationItems } from '../pagination';
import { sizeClass, type TaoSize } from '../size';
import { formatText, useLocaleText, useTaoLocale } from '../locale';

defineOptions({ name: 'TaoPagination' });

const appLocale = useTaoLocale();

const props = withDefaults(
    defineProps<{
        page?: number;
        total?: number;
        pageSize?: number;
        siblingCount?: number;
        disabled?: boolean;
        showTotal?: boolean;
        /** Size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
        /** Click ellipsis to skip this many pages. 0 keeps … decorative. */
        jump?: number;
        /**
         * A field to type a page in: `true` always, a number — from this many pages on (hundreds of pages are not
         * walked by clicks), `false` never.
         * Поле для ввода страницы: `true` всегда, число — начиная с такого числа страниц (сотни страниц кликами
         * не пролистать), `false` никогда.
         */
        pageInput?: boolean | number;
        ariaLabel?: string;
        prevLabel?: string;
        nextLabel?: string;
        /** `{page}` — номер страницы. */
        pageLabel?: string;
        /** `{n}` — сколько страниц перескакивает «…». */
        jumpPrevLabel?: string;
        jumpNextLabel?: string;
        goToText?: string;
        goToLabel?: string;
        /**
         * The page sizes to choose from (`[10, 20, 50]`): a «Per page» choice next to the total, `v-model:page-size`.
         * On a change the page moves so the first row on screen stays on screen.
         * Размеры страницы на выбор: выбор «На странице» рядом с итогом, `v-model:page-size`. При смене страница
         * сдвигается так, чтобы первая видимая строка осталась на экране.
         */
        pageSizes?: number[];
        perPageText?: string;
    }>(),
    {
        page: 1,
        total: 0,
        pageSize: 10,
        siblingCount: 1,
        disabled: false,
        showTotal: true,
        jump: 5,
        pageInput: false,
    },
);
const l10n = useLocaleText(props, 'pagination');

const emit = defineEmits<{
    'update:page': [value: number];
    change: [value: number];
    'update:pageSize': [value: number];
}>();

const sizeOptions = computed(() => (props.pageSizes ?? []).map((n) => ({ value: n, label: String(n) })));

function onPageSize(value: unknown) {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0 || size === props.pageSize || props.disabled) {
        return;
    }
    // keep the first row on screen: the page that holds it at the new size / первая строка остаётся на экране
    const page = Math.floor((Math.max(from.value, 1) - 1) / size) + 1;
    emit('update:pageSize', size);
    if (page !== props.page) {
        emit('update:page', page);
        emit('change', page);
    }
}

const pageCount = computed(() => Math.max(1, Math.ceil(Math.max(props.total, 0) / Math.max(props.pageSize, 1))));
const current = computed(() => Math.min(Math.max(props.page, 1), pageCount.value));
const items = computed(() => buildPaginationItems(current.value, pageCount.value, props.siblingCount));

const from = computed(() => (props.total === 0 ? 0 : (current.value - 1) * props.pageSize + 1));
const to = computed(() => Math.min(current.value * props.pageSize, props.total));

watch(
    () => [props.page, pageCount.value] as const,
    ([page, count]) => {
        if (page > count || page < 1) {
            goTo(page);
        }
    },
    { immediate: true },
);

const showInput = computed(() =>
    typeof props.pageInput === 'number' ? pageCount.value >= props.pageInput : props.pageInput,
);
const typed = ref('');
// as wide as the longest page number / шириной в самый длинный номер
const inputWidth = computed(() => `${String(pageCount.value).length + 1}ch`);

/**
 * Enter (or leaving the field) goes to the typed page, clamped to 1…count; anything that is not a number is dropped.
 * Enter (или уход из поля) переходит на набранную страницу в пределах 1…count; не число просто сбрасывается.
 */
function submitTyped() {
    const value = Number.parseInt(typed.value.trim(), 10);
    typed.value = '';
    if (Number.isFinite(value)) {
        goTo(value);
    }
}

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
    <nav class="tao-pagination" :class="sizeClass(size)" :aria-label="l10n.ariaLabel">
        <div v-if="showTotal || sizeOptions.length" class="tao-pagination__info">
            <p v-if="showTotal" class="tao-pagination__total">
                <slot name="total" :from="from" :to="to" :total="total">
                    <template v-if="total === 0">{{ appLocale.pagination.emptyTotalText }}</template>
                    <template v-else>{{ formatText(appLocale.pagination.totalText, { from, to, total }) }}</template>
                </slot>
            </p>
            <!-- the label names the list button: a screen reader hears «Per page, 20» / подпись — имя кнопки списка -->
            <label v-if="sizeOptions.length" class="tao-pagination__sizes">
                <span class="tao-pagination__sizes-text">{{ l10n.perPageText ?? localeEn.pagination.perPageText }}</span>
                <TaoSelect
                    class="tao-pagination__sizes-select"
                    :model-value="pageSize"
                    :options="sizeOptions"
                    :disabled="disabled"
                    @update:model-value="onPageSize"
                />
            </label>
        </div>

        <div class="tao-pagination__pages">
            <button
                type="button"
                class="tao-pagination__btn"
                :aria-label="l10n.prevLabel"
                :disabled="disabled || current <= 1"
                @click="goTo(current - 1)"
            >
                <span aria-hidden="true">
                    <slot name="prev-icon"><TaoIcon name="tao-chevron-left" /></slot>
                </span>
            </button>

            <template v-for="item in items" :key="item.type === 'page' ? item.page : item.id">
                <button
                    v-if="item.type === 'ellipsis' && jump > 0"
                    type="button"
                    class="tao-pagination__btn tao-pagination__btn--jump"
                    :aria-label="item.id === 'left' ? l10n.jumpPrevLabel.replace('{n}', String(jump)) : l10n.jumpNextLabel.replace('{n}', String(jump))"
                    :disabled="disabled"
                    @click="goTo(item.id === 'left' ? current - jump : current + jump)"
                >
                    …
                </button>
                <span v-else-if="item.type === 'ellipsis'" class="tao-pagination__ellipsis" aria-hidden="true">…</span>
                <button
                    v-else
                    type="button"
                    class="tao-pagination__btn"
                    :class="{ 'tao-pagination__btn--current': item.page === current }"
                    :aria-current="item.page === current ? 'page' : undefined"
                    :aria-label="l10n.pageLabel.replace('{page}', String(item.page))"
                    :disabled="disabled"
                    @click="goTo(item.page)"
                >
                    {{ item.page }}
                </button>
            </template>

            <button
                type="button"
                class="tao-pagination__btn"
                :aria-label="l10n.nextLabel"
                :disabled="disabled || current >= pageCount"
                @click="goTo(current + 1)"
            >
                <span aria-hidden="true">
                    <slot name="next-icon"><TaoIcon name="tao-chevron-right" /></slot>
                </span>
            </button>

            <label v-if="showInput" class="tao-pagination__goto">
                <span class="tao-pagination__goto-text" aria-hidden="true">{{ l10n.goToText }}</span>
                <input
                    v-model="typed"
                    class="tao-pagination__input"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    enterkeyhint="go"
                    :placeholder="String(current)"
                    :aria-label="formatText(l10n.goToLabel, { count: pageCount })"
                    :disabled="disabled"
                    :style="{ width: inputWidth }"
                    @keydown.enter.prevent="submitTyped"
                    @keydown.esc="typed = ''"
                    @blur="submitTyped"
                />
            </label>
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

.tao-pagination__info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--tao-space-2) var(--tao-space-4);
}

.tao-pagination__sizes {
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-2);
    font-size: var(--tao-control-font-size-secondary);
    color: var(--tao-color-text-muted);
}

/* as wide as «100» and the chevron / шириной в «100» и шеврон */
.tao-pagination__sizes-select {
    width: calc(4ch + var(--tao-control-padding-x) * 2 + 20px);
}

.tao-pagination__total {
    margin: 0;
    font-size: var(--tao-control-font-size-secondary);
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
    /* square at least / как минимум квадрат */
    min-width: var(--tao-control-height);
    height: var(--tao-control-height);
    padding: 0 var(--tao-space-2);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-surface-sunken);
    color: var(--tao-color-text);
    font-family: inherit;
    font-size: var(--tao-control-font-size);
    line-height: 1;
    cursor: pointer;
    transition: var(--tao-transition-base);
}

.tao-pagination__btn:hover:not(:disabled) {
    background: var(--tao-color-hover);
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

.tao-pagination__btn--jump {
    color: var(--tao-color-text-muted);
}

.tao-pagination__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.tao-pagination__goto {
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-2);
    margin-inline-start: var(--tao-space-2);
    font-size: var(--tao-control-font-size-secondary);
    color: var(--tao-color-text-muted);
}

.tao-pagination__input {
    box-sizing: content-box;
    min-width: 2ch;
    height: calc(var(--tao-control-height) - 2px);
    padding: 0 var(--tao-space-2);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-surface-sunken);
    color: var(--tao-color-text);
    font-family: inherit;
    font-size: var(--tao-control-font-size);
    font-variant-numeric: tabular-nums;
    text-align: center;
    transition: var(--tao-transition-base);
}

.tao-pagination__input::placeholder {
    color: var(--tao-color-text-muted);
}

.tao-pagination__input:focus-visible {
    outline: none;
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-pagination__input:disabled {
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
