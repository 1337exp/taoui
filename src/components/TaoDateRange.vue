<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { formFieldKey } from '../formField';
import { listenFocusLoss } from '../focusLoss';
import {
    buildTaoDateGrid,
    formatTaoDateLabel,
    formatTaoDateRangeLabel,
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
import '../styles/date-popup.css';

defineOptions({ name: 'TaoDateRange' });

const props = withDefaults(
    defineProps<{
        modelValue?: TaoDateRangeValue | null;
        placeholder?: string;
        disabled?: boolean;
        error?: boolean;
        min?: string;
        max?: string;
        locale?: string;
    }>(),
    {
        modelValue: null,
        placeholder: 'Период',
        disabled: false,
        error: false,
        min: undefined,
        max: undefined,
        locale: 'ru-RU',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: TaoDateRangeValue | null];
    change: [value: TaoDateRangeValue | null];
}>();

const field = inject(formFieldKey, null);
const localId = useId();
const gridId = `${localId}-grid`;
const controlId = computed(() => field?.id ?? localId);
const invalid = computed(() => props.error || Boolean(field?.invalid.value));
const describedBy = computed(() => field?.describedBy.value);

const open = ref(false);
const viewYear = ref(2026);
const viewMonth = ref(1);
const cursorIso = ref(todayTaoDate());
const draftStart = ref<string | null>(null);
const hoverIso = ref<string | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const panelStyle = ref({ top: '0px', left: '0px' });

const committed = computed(() => parseTaoDateRange(props.modelValue));
const highlight = computed(() => {
    if (draftStart.value) {
        return sortTaoDateRange(draftStart.value, hoverIso.value ?? cursorIso.value ?? draftStart.value);
    }

    return committed.value;
});
const displayLabel = computed(() =>
    committed.value ? formatTaoDateRangeLabel(committed.value.start, committed.value.end, props.locale) : '',
);
const weekdays = computed(() => taoWeekdayLabels(props.locale));
const monthLabel = computed(() => formatTaoMonthLabel(viewYear.value, viewMonth.value, props.locale));
const cells = computed(() => buildTaoDateGrid(viewYear.value, viewMonth.value));
const todayIso = computed(() => todayTaoDate());
const todayEnabled = computed(() => isTaoDateInRange(todayIso.value, props.min, props.max));

function daySelected(iso: string) {
    return Boolean(highlight.value && (iso === highlight.value.start || iso === highlight.value.end));
}

function dayInRange(iso: string) {
    return Boolean(highlight.value && iso > highlight.value.start && iso < highlight.value.end);
}

function syncViewFrom(iso: string) {
    const parts = parseTaoDate(iso);
    if (!parts) {
        return;
    }

    viewYear.value = parts.y;
    viewMonth.value = parts.m;
    cursorIso.value = iso;
}

function updatePosition() {
    const trigger = triggerRef.value;
    const panel = panelRef.value;
    if (!trigger || !panel) {
        return;
    }

    const rect = trigger.getBoundingClientRect();
    const height = panel.offsetHeight;
    const width = panel.offsetWidth;
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const openUp = spaceBelow < height && rect.top > spaceBelow;
    const left = Math.min(rect.left, Math.max(8, window.innerWidth - width - 8));

    panelStyle.value = {
        top: `${openUp ? rect.top - height - gap : rect.bottom + gap}px`,
        left: `${Math.max(8, left)}px`,
    };
}

async function setOpen(next: boolean) {
    if (props.disabled) {
        return;
    }

    open.value = next;
    if (!next) {
        return;
    }

    draftStart.value = null;
    hoverIso.value = null;
    syncViewFrom(committed.value?.start ?? todayIso.value);
    await nextTick();
    updatePosition();
    panelRef.value?.focus();
}

function toggle() {
    void setOpen(!open.value);
}

function close() {
    open.value = false;
}

function commitRange(range: TaoDateRangeValue) {
    emit('update:modelValue', range);
    emit('change', range);
    draftStart.value = null;
    hoverIso.value = null;
    close();
    triggerRef.value?.focus();
}

function selectDay(iso: string) {
    if (!isTaoDateInRange(iso, props.min, props.max)) {
        return;
    }

    if (!draftStart.value) {
        draftStart.value = iso;
        hoverIso.value = iso;
        cursorIso.value = iso;
        return;
    }

    commitRange(sortTaoDateRange(draftStart.value, iso));
}

function selectToday() {
    if (!todayEnabled.value) {
        return;
    }

    commitRange({ start: todayIso.value, end: todayIso.value });
}

function clear() {
    emit('update:modelValue', null);
    emit('change', null);
    draftStart.value = null;
    hoverIso.value = null;
    close();
    triggerRef.value?.focus();
}

function goMonth(delta: number) {
    hoverIso.value = null;
    const next = shiftTaoMonth(`${viewYear.value}-${String(viewMonth.value).padStart(2, '0')}-01`, delta);
    const parts = parseTaoDate(next);
    if (!parts) {
        return;
    }

    viewYear.value = parts.y;
    viewMonth.value = parts.m;
    cursorIso.value = shiftTaoMonth(cursorIso.value, delta);
    void nextTick(updatePosition);
}

function moveCursor(days: number) {
    hoverIso.value = null;
    cursorIso.value = shiftTaoDate(cursorIso.value, days);
    syncViewFrom(cursorIso.value);
    void nextTick(updatePosition);
}

function onDayEnter(iso: string) {
    if (!isTaoDateInRange(iso, props.min, props.max)) {
        return;
    }

    hoverIso.value = iso;
}

function onGridLeave() {
    hoverIso.value = null;
}

function onTriggerKeydown(event: KeyboardEvent) {
    if (props.disabled) {
        return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        void setOpen(true);
    }
}

function onPanelKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        close();
        triggerRef.value?.focus();
        return;
    }

    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveCursor(-1);
        return;
    }

    if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveCursor(1);
        return;
    }

    if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveCursor(-7);
        return;
    }

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveCursor(7);
        return;
    }

    if (event.key === 'PageUp') {
        event.preventDefault();
        goMonth(-1);
        return;
    }

    if (event.key === 'PageDown') {
        event.preventDefault();
        goMonth(1);
        return;
    }

    if (event.key === 'Home') {
        event.preventDefault();
        moveCursor(-taoDateWeekdayIndex(cursorIso.value));
        return;
    }

    if (event.key === 'End') {
        event.preventDefault();
        moveCursor(6 - taoDateWeekdayIndex(cursorIso.value));
        return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectDay(cursorIso.value);
    }
}

function onDocumentPointer(event: PointerEvent) {
    const target = event.target as Node;
    if (triggerRef.value?.contains(target) || panelRef.value?.contains(target)) {
        return;
    }

    close();
}

function onViewportChange() {
    if (open.value) {
        updatePosition();
    }
}

watch(open, (isOpen) => {
    if (isOpen) {
        document.addEventListener('pointerdown', onDocumentPointer);
        window.addEventListener('resize', onViewportChange);
        window.addEventListener('scroll', onViewportChange, true);
        return;
    }

    draftStart.value = null;
    hoverIso.value = null;
    document.removeEventListener('pointerdown', onDocumentPointer);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
});

let stopFocusLoss: (() => void) | undefined;
onMounted(() => {
    stopFocusLoss = listenFocusLoss(() => {
        hoverIso.value = null;
    });
});

onBeforeUnmount(() => {
    stopFocusLoss?.();
    document.removeEventListener('pointerdown', onDocumentPointer);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
});
</script>

<template>
    <div class="tao-date-range" :class="{ 'tao-date-range--open': open, 'tao-date-range--invalid': invalid }">
        <button
            :id="controlId"
            ref="triggerRef"
            type="button"
            class="tao-date-range__trigger"
            :class="{ 'tao-date-range__trigger--placeholder': !committed }"
            role="combobox"
            :aria-expanded="open"
            aria-haspopup="dialog"
            :aria-controls="gridId"
            :aria-invalid="invalid || undefined"
            :aria-describedby="describedBy"
            :disabled="disabled"
            @click="toggle"
            @keydown="onTriggerKeydown"
        >
            <span class="tao-date-range__value">{{ displayLabel || placeholder }}</span>
            <svg class="tao-date-range__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <rect
                    x="2"
                    y="3"
                    width="12"
                    height="11"
                    rx="1.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                />
                <path d="M5 1.5v3M11 1.5v3M2 6.5h12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
        </button>

        <Teleport to="body">
            <div
                v-if="open"
                :id="gridId"
                ref="panelRef"
                class="tao-date__panel"
                role="dialog"
                :aria-label="monthLabel"
                tabindex="-1"
                :style="panelStyle"
                @keydown="onPanelKeydown"
            >
                <div class="tao-date__header">
                    <button type="button" class="tao-date__nav" aria-label="Предыдущий месяц" @click="goMonth(-1)">
                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
                            <path
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M14.5 5 8 12l6.5 7"
                            />
                        </svg>
                    </button>
                    <p class="tao-date__month">{{ monthLabel }}</p>
                    <button type="button" class="tao-date__nav" aria-label="Следующий месяц" @click="goMonth(1)">
                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
                            <path
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M9.5 5 16 12l-6.5 7"
                            />
                        </svg>
                    </button>
                </div>

                <div class="tao-date__weekdays" aria-hidden="true">
                    <span v-for="day in weekdays" :key="day">{{ day }}</span>
                </div>

                <div class="tao-date__grid" role="grid" @mouseleave="onGridLeave">
                    <button
                        v-for="cell in cells"
                        :key="cell.iso"
                        type="button"
                        class="tao-date__day"
                        :class="{
                            'tao-date__day--outside': !cell.currentMonth,
                            'tao-date__day--today': cell.iso === todayIso,
                            'tao-date__day--selected': daySelected(cell.iso),
                            'tao-date__day--in-range': dayInRange(cell.iso),
                            'tao-date__day--range-start': highlight?.start === cell.iso,
                            'tao-date__day--range-end': highlight?.end === cell.iso,
                            'tao-date__day--cursor': cell.iso === cursorIso,
                            'tao-date__day--disabled': !isTaoDateInRange(cell.iso, min, max),
                        }"
                        role="gridcell"
                        :aria-label="formatTaoDateLabel(cell.iso, locale)"
                        :aria-selected="daySelected(cell.iso)"
                        :disabled="!isTaoDateInRange(cell.iso, min, max)"
                        @mousedown.prevent
                        @mouseenter="onDayEnter(cell.iso)"
                        @click="selectDay(cell.iso)"
                    >
                        {{ cell.day }}
                    </button>
                </div>

                <div class="tao-date__footer">
                    <button type="button" class="tao-date__link" :disabled="!todayEnabled" @click="selectToday">
                        Сегодня
                    </button>
                    <button v-if="committed" type="button" class="tao-date__link" @click="clear">Очистить</button>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.tao-date-range {
    width: 100%;
}

.tao-date-range__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--tao-space-2);
    width: 100%;
    min-height: 36px;
    padding: var(--tao-space-2) var(--tao-space-3);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    font-size: var(--tao-font-size-md);
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: var(--tao-transition-base);
}

.tao-date-range__trigger--placeholder {
    color: var(--tao-color-input-placeholder);
}

.tao-date-range__trigger:focus {
    outline: none;
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-date-range--invalid .tao-date-range__trigger {
    border-color: var(--tao-color-danger);
}

.tao-date-range--invalid .tao-date-range__trigger:focus {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-date-range__trigger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tao-date-range__value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-date-range__icon {
    flex-shrink: 0;
    opacity: 0.7;
}
</style>
