<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import { formFieldKey } from '../formField';
import {
    buildTaoDateGrid,
    formatTaoDateIso,
    formatTaoDateLabel,
    formatTaoMonthLabel,
    isTaoDateInRange,
    parseTaoDate,
    shiftTaoDate,
    shiftTaoMonth,
    clampTaoDateCursor,
    taoDateWeekdayIndex,
    taoWeekdayLabels,
    todayTaoDate,
} from '../date';
import '../styles/date-popup.css';

defineOptions({ name: 'TaoDate' });

const props = withDefaults(
    defineProps<{
        modelValue?: string | null;
        placeholder?: string;
        disabled?: boolean;
        error?: boolean;
        min?: string;
        max?: string;
        locale?: string;
        todayText?: string;
        clearText?: string;
        prevMonthLabel?: string;
        nextMonthLabel?: string;
    }>(),
    {
        modelValue: null,
        placeholder: 'Дата',
        disabled: false,
        error: false,
        min: undefined,
        max: undefined,
        locale: 'ru-RU',
        todayText: 'Сегодня',
        clearText: 'Очистить',
        prevMonthLabel: 'Предыдущий месяц',
        nextMonthLabel: 'Следующий месяц',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string | null];
    change: [value: string | null];
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
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const panelStyle = ref({ top: '0px', left: '0px' });

const valueIso = computed(() => {
    const parsed = parseTaoDate(props.modelValue);
    return parsed ? formatTaoDateIso(parsed) : null;
});
const displayLabel = computed(() => (valueIso.value ? formatTaoDateLabel(valueIso.value, props.locale) : ''));
const weekdays = computed(() => taoWeekdayLabels(props.locale));
const monthLabel = computed(() => formatTaoMonthLabel(viewYear.value, viewMonth.value, props.locale));
const cells = computed(() => buildTaoDateGrid(viewYear.value, viewMonth.value));
const todayIso = computed(() => todayTaoDate());
const todayEnabled = computed(() => isTaoDateInRange(todayIso.value, props.min, props.max));

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

    syncViewFrom(clampTaoDateCursor(valueIso.value ?? todayIso.value, props.min, props.max));
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

function selectDay(iso: string) {
    if (!isTaoDateInRange(iso, props.min, props.max)) {
        return;
    }

    emit('update:modelValue', iso);
    emit('change', iso);
    close();
    triggerRef.value?.focus();
}

function clear() {
    emit('update:modelValue', null);
    emit('change', null);
    close();
    triggerRef.value?.focus();
}

function goMonth(delta: number) {
    cursorIso.value = clampTaoDateCursor(shiftTaoMonth(cursorIso.value, delta), props.min, props.max);
    syncViewFrom(cursorIso.value);
    void nextTick(updatePosition);
}

function moveCursor(days: number) {
    const next = shiftTaoDate(cursorIso.value, days);
    cursorIso.value = isTaoDateInRange(next, props.min, props.max)
        ? next
        : clampTaoDateCursor(next, props.min, props.max);
    syncViewFrom(cursorIso.value);
    void nextTick(updatePosition);
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

    document.removeEventListener('pointerdown', onDocumentPointer);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
});

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocumentPointer);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
});
</script>

<template>
    <div class="tao-date" :class="{ 'tao-date--open': open, 'tao-date--invalid': invalid }">
        <button
            :id="controlId"
            ref="triggerRef"
            type="button"
            class="tao-date__trigger"
            :class="{ 'tao-date__trigger--placeholder': !valueIso }"
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
            <span class="tao-date__value">{{ displayLabel || placeholder }}</span>
            <span class="tao-date__icon" aria-hidden="true">
                <slot name="icon">
                    <svg viewBox="0 0 16 16" width="16" height="16" focusable="false">
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
                </slot>
            </span>
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
                    <button type="button" class="tao-date__nav" :aria-label="prevMonthLabel" @click="goMonth(-1)">
                        <span aria-hidden="true">
                            <slot name="prev-icon">
                                <svg viewBox="0 0 24 24" width="14" height="14" focusable="false">
                                    <path
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2.2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M14.5 5 8 12l6.5 7"
                                    />
                                </svg>
                            </slot>
                        </span>
                    </button>
                    <p class="tao-date__month">{{ monthLabel }}</p>
                    <button type="button" class="tao-date__nav" :aria-label="nextMonthLabel" @click="goMonth(1)">
                        <span aria-hidden="true">
                            <slot name="next-icon">
                                <svg viewBox="0 0 24 24" width="14" height="14" focusable="false">
                                    <path
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2.2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M9.5 5 16 12l-6.5 7"
                                    />
                                </svg>
                            </slot>
                        </span>
                    </button>
                </div>

                <div class="tao-date__weekdays" aria-hidden="true">
                    <span v-for="day in weekdays" :key="day">{{ day }}</span>
                </div>

                <div class="tao-date__grid" role="grid">
                    <button
                        v-for="cell in cells"
                        :key="cell.iso"
                        type="button"
                        class="tao-date__day"
                        :class="{
                            'tao-date__day--outside': !cell.currentMonth,
                            'tao-date__day--today': cell.iso === todayIso,
                            'tao-date__day--selected': cell.iso === valueIso,
                            'tao-date__day--cursor': cell.iso === cursorIso,
                            'tao-date__day--disabled': !isTaoDateInRange(cell.iso, min, max),
                        }"
                        role="gridcell"
                        :aria-label="formatTaoDateLabel(cell.iso, locale)"
                        :aria-selected="cell.iso === valueIso"
                        :disabled="!isTaoDateInRange(cell.iso, min, max)"
                        @mousedown.prevent
                        @click="selectDay(cell.iso)"
                    >
                        {{ cell.day }}
                    </button>
                </div>

                <div class="tao-date__footer">
                    <button type="button" class="tao-date__link" :disabled="!todayEnabled" @click="selectDay(todayIso)">
                        <slot name="today">{{ todayText }}</slot>
                    </button>
                    <button v-if="valueIso" type="button" class="tao-date__link" @click="clear">
                        <slot name="clear">{{ clearText }}</slot>
                    </button>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.tao-date {
    width: 100%;
}

.tao-date__trigger {
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

.tao-date__trigger--placeholder {
    color: var(--tao-color-input-placeholder);
}

.tao-date__trigger:focus {
    outline: none;
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-date--invalid .tao-date__trigger {
    border-color: var(--tao-color-danger);
}

.tao-date--invalid .tao-date__trigger:focus {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-date__trigger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tao-date__value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-date__icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    opacity: 0.7;
}
</style>
