<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import {
    buildTaoDateGrid,
    clampTaoDateCursor,
    formatTaoDateIso,
    formatTaoDateLabel,
    formatTaoMonthLabel,
    isTaoDateInRange,
    parseTaoDate,
    parseTaoDateRange,
    shiftTaoDate,
    shiftTaoMonth,
    sortTaoDateRange,
    taoDateWeekdayIndex,
    taoWeekdayLabels,
    todayTaoDate,
    type TaoDateRangeValue,
} from '../date';
import { listenFocusLoss } from '../focusLoss';
import { useLocaleText, useTaoLocale } from '../locale';
import '../styles/date-popup.css';
import TaoIcon from './TaoIcon.vue';

defineOptions({ name: 'TaoCalendar' });

const appLocale = useTaoLocale();

// An inline month calendar: one date or a range. TaoDate and TaoDateRange are a field + a popup around it.
// Календарь на месяц: одна дата или диапазон. TaoDate и TaoDateRange — поле и всплывающее окно вокруг него.
const props = withDefaults(
    defineProps<{
        /** `single`: `v-model` is `YYYY-MM-DD`; `range`: `{ start, end }`. / `single` — строка `YYYY-MM-DD`; `range` — `{ start, end }`. */
        mode?: 'single' | 'range';
        modelValue?: string | TaoDateRangeValue | null;
        min?: string;
        max?: string;
        locale?: string;
        todayText?: string;
        clearText?: string;
        prevMonthLabel?: string;
        nextMonthLabel?: string;
    }>(),
    {
        mode: 'single',
        modelValue: null,
        min: undefined,
        max: undefined,
    },
);
const l10n = useLocaleText(props, 'date');
const dateLocale = computed(() => props.locale ?? appLocale.value.code);

const emit = defineEmits<{
    'update:modelValue': [value: string | TaoDateRangeValue | null];
    /** The user finished a choice: a date, a complete range, or a clear. / Выбор завершён: дата, полный диапазон или сброс. */
    change: [value: string | TaoDateRangeValue | null];
    /** The visible month changed, so the calendar may have changed its height. / Сменился месяц, высота могла измениться. */
    view: [];
}>();

defineSlots<{
    'prev-icon'?(): unknown;
    'next-icon'?(): unknown;
    today?(): unknown;
    clear?(): unknown;
}>();

const isRange = computed(() => props.mode === 'range');
const rootRef = ref<HTMLElement | null>(null);
const viewYear = ref(2026);
const viewMonth = ref(1);
const cursorIso = ref(todayTaoDate());
const draftStart = ref<string | null>(null);
const hoverIso = ref<string | null>(null);

// the chosen value as a range (a single date is a range of one day)
const committed = computed((): TaoDateRangeValue | null => {
    if (isRange.value) {
        return parseTaoDateRange(props.modelValue as TaoDateRangeValue | null);
    }
    const parsed = parseTaoDate(typeof props.modelValue === 'string' ? props.modelValue : null);
    const iso = parsed ? formatTaoDateIso(parsed) : null;
    return iso ? { start: iso, end: iso } : null;
});
// while a range is being drawn, the highlight follows the pointer / cursor
const highlight = computed(() => {
    if (isRange.value && draftStart.value) {
        return sortTaoDateRange(draftStart.value, hoverIso.value ?? cursorIso.value ?? draftStart.value);
    }
    return committed.value;
});

const weekdays = computed(() => taoWeekdayLabels(dateLocale.value));
const monthLabel = computed(() => formatTaoMonthLabel(viewYear.value, viewMonth.value, dateLocale.value));
const cells = computed(() => buildTaoDateGrid(viewYear.value, viewMonth.value));
const todayIso = computed(() => todayTaoDate());
const todayEnabled = computed(() => isTaoDateInRange(todayIso.value, props.min, props.max));

const inRange = (iso: string) => isTaoDateInRange(iso, props.min, props.max);
const daySelected = (iso: string) => Boolean(highlight.value && (iso === highlight.value.start || iso === highlight.value.end));
const dayInside = (iso: string) => Boolean(isRange.value && highlight.value && iso > highlight.value.start && iso < highlight.value.end);

function syncViewFrom(iso: string) {
    const parts = parseTaoDate(iso);
    if (!parts) {
        return;
    }
    viewYear.value = parts.y;
    viewMonth.value = parts.m;
    cursorIso.value = iso;
}

syncViewFrom(clampTaoDateCursor(committed.value?.start ?? todayIso.value, props.min, props.max));

function commit(value: string | TaoDateRangeValue | null) {
    draftStart.value = null;
    hoverIso.value = null;
    emit('update:modelValue', value);
    emit('change', value);
}

function selectDay(iso: string) {
    if (!inRange(iso)) {
        return;
    }
    if (!isRange.value) {
        commit(iso);
        return;
    }
    if (!draftStart.value) {
        draftStart.value = iso;
        hoverIso.value = iso;
        cursorIso.value = iso;
        return;
    }
    commit(sortTaoDateRange(draftStart.value, iso));
}

function selectToday() {
    if (!todayEnabled.value) {
        return;
    }
    commit(isRange.value ? { start: todayIso.value, end: todayIso.value } : todayIso.value);
}

function clear() {
    commit(null);
}

function goMonth(delta: number) {
    hoverIso.value = null;
    cursorIso.value = clampTaoDateCursor(shiftTaoMonth(cursorIso.value, delta), props.min, props.max);
    syncViewFrom(cursorIso.value);
    emit('view');
}

function moveCursor(days: number) {
    hoverIso.value = null;
    const next = shiftTaoDate(cursorIso.value, days);
    cursorIso.value = inRange(next) ? next : clampTaoDateCursor(next, props.min, props.max);
    syncViewFrom(cursorIso.value);
    emit('view');
}

function onDayEnter(iso: string) {
    if (isRange.value && inRange(iso)) {
        hoverIso.value = iso;
    }
}

const moves: Record<string, () => void> = {
    ArrowLeft: () => moveCursor(-1),
    ArrowRight: () => moveCursor(1),
    ArrowUp: () => moveCursor(-7),
    ArrowDown: () => moveCursor(7),
    PageUp: () => goMonth(-1),
    PageDown: () => goMonth(1),
    Home: () => moveCursor(-taoDateWeekdayIndex(cursorIso.value)),
    End: () => moveCursor(6 - taoDateWeekdayIndex(cursorIso.value)),
};

function onKeydown(event: KeyboardEvent) {
    const move = moves[event.key];
    if (move) {
        event.preventDefault();
        move();
        return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectDay(cursorIso.value);
    }
}

// a screenshot or Alt-Tab swallows mouseleave: do not leave the range stretched to a stale hover
let stopFocusLoss: (() => void) | undefined;
onMounted(() => {
    stopFocusLoss = listenFocusLoss(() => {
        hoverIso.value = null;
    });
});
onBeforeUnmount(() => stopFocusLoss?.());

defineExpose({
    focus: async () => {
        await nextTick();
        rootRef.value?.focus();
    },
});
</script>

<template>
    <div ref="rootRef" class="tao-calendar" role="group" :aria-label="monthLabel" tabindex="-1" @keydown="onKeydown">
        <div class="tao-date__header">
            <button type="button" class="tao-date__nav" :aria-label="l10n.prevMonthLabel" @click="goMonth(-1)">
                <span aria-hidden="true">
                    <slot name="prev-icon">
                        <TaoIcon name="tao-chevron-left" :size="14" />
                    </slot>
                </span>
            </button>
            <p class="tao-date__month">{{ monthLabel }}</p>
            <button type="button" class="tao-date__nav" :aria-label="l10n.nextMonthLabel" @click="goMonth(1)">
                <span aria-hidden="true">
                    <slot name="next-icon">
                        <TaoIcon name="tao-chevron-right" :size="14" />
                    </slot>
                </span>
            </button>
        </div>

        <div class="tao-date__weekdays" aria-hidden="true">
            <span v-for="day in weekdays" :key="day">{{ day }}</span>
        </div>

        <div class="tao-date__grid" role="grid" @mouseleave="hoverIso = null">
            <button
                v-for="cell in cells"
                :key="cell.iso"
                type="button"
                class="tao-date__day"
                :class="{
                    'tao-date__day--outside': !cell.currentMonth,
                    'tao-date__day--today': cell.iso === todayIso,
                    'tao-date__day--selected': daySelected(cell.iso),
                    'tao-date__day--in-range': dayInside(cell.iso),
                    'tao-date__day--range-start': isRange && highlight?.start === cell.iso,
                    'tao-date__day--range-end': isRange && highlight?.end === cell.iso,
                    'tao-date__day--cursor': cell.iso === cursorIso,
                    'tao-date__day--disabled': !inRange(cell.iso),
                }"
                role="gridcell"
                :aria-label="formatTaoDateLabel(cell.iso, dateLocale)"
                :aria-selected="daySelected(cell.iso)"
                :disabled="!inRange(cell.iso)"
                @mousedown.prevent
                @mouseenter="onDayEnter(cell.iso)"
                @click="selectDay(cell.iso)"
            >
                {{ cell.day }}
            </button>
        </div>

        <div class="tao-date__footer">
            <button type="button" class="tao-date__link" :disabled="!todayEnabled" @click="selectToday">
                <slot name="today">{{ l10n.todayText }}</slot>
            </button>
            <button v-if="committed" type="button" class="tao-date__link" @click="clear">
                <slot name="clear">{{ l10n.clearText }}</slot>
            </button>
        </div>
    </div>
</template>

<style>
.tao-calendar {
    box-sizing: border-box;
    width: 280px;
    max-width: 100%;
    color: var(--tao-color-text);
}

.tao-calendar:focus {
    outline: none;
}

/* inside a popup the panel sets the width / внутри окна ширину задаёт панель */
.tao-date__panel .tao-calendar {
    width: 100%;
}
</style>
