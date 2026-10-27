<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue';
import { formatTaoDateIso, formatTaoDateLabel, parseTaoDate } from '../date';
import { useDismiss } from '../dismiss';
import { useFloating } from '../floating';
import { useField } from '../formField';
import { useLayer } from '../layers';
import { useLocaleText, useTaoLocale } from '../locale';
import { sizeClass, type TaoSize } from '../size';
import '../styles/date-popup.css';
import TaoCalendar from './TaoCalendar.vue';
import TaoIcon from './TaoIcon.vue';

defineOptions({ name: 'TaoDate' });

const appLocale = useTaoLocale();

const props = withDefaults(
    defineProps<{
        modelValue?: string | null;
        placeholder?: string;
        disabled?: boolean;
        /** Control size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
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
        disabled: false,
        error: false,
        min: undefined,
        max: undefined,
    },
);
const l10n = useLocaleText(props, 'date');
const dateLocale = computed(() => props.locale ?? appLocale.value.code);

const emit = defineEmits<{
    'update:modelValue': [value: string | null];
    change: [value: string | null];
}>();

const { controlId, invalid, describedBy, localId } = useField(props);
const gridId = `${localId}-grid`;

const open = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const calendarRef = ref<InstanceType<typeof TaoCalendar> | null>(null);

const valueIso = computed(() => {
    const parsed = parseTaoDate(props.modelValue);
    return parsed ? formatTaoDateIso(parsed) : null;
});
const displayLabel = computed(() => (valueIso.value ? formatTaoDateLabel(valueIso.value, dateLocale.value) : ''));

const { style: panelStyle, update: updatePosition } = useFloating(triggerRef, panelRef, open, { placement: 'bottom-start' });
useDismiss(open, () => [triggerRef.value, panelRef.value], close);
useLayer(open, {
    onEscape: () => {
        close();
        triggerRef.value?.focus();
    },
});

async function setOpen(next: boolean) {
    if (props.disabled) {
        return;
    }

    open.value = next;
    if (!next) {
        return;
    }

    await nextTick();
    updatePosition();
    void calendarRef.value?.focus();
}

function toggle() {
    void setOpen(!open.value);
}

function close() {
    open.value = false;
}

function onChange(value: unknown) {
    const next = (value as string | null) ?? null;
    emit('update:modelValue', next);
    emit('change', next);
    close();
    triggerRef.value?.focus();
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
</script>

<template>
    <div class="tao-date" :class="[sizeClass(size), { 'tao-date--open': open, 'tao-date--invalid': invalid }]">
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
            <span class="tao-date__value">{{ displayLabel || l10n.placeholder }}</span>
            <span class="tao-date__icon" aria-hidden="true">
                <slot name="icon">
                    <TaoIcon name="tao-calendar" :size="16" />
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
                :aria-label="displayLabel || l10n.placeholder"
                :style="panelStyle"
            >
                <TaoCalendar
                    ref="calendarRef"
                    mode="single"
                    :model-value="valueIso"
                    :min="min"
                    :max="max"
                    :locale="dateLocale"
                    :today-text="l10n.todayText"
                    :clear-text="l10n.clearText"
                    :prev-month-label="l10n.prevMonthLabel"
                    :next-month-label="l10n.nextMonthLabel"
                    @change="onChange"
                    @view="nextTick(updatePosition)"
                >
                    <template v-if="$slots['prev-icon']" #prev-icon><slot name="prev-icon" /></template>
                    <template v-if="$slots['next-icon']" #next-icon><slot name="next-icon" /></template>
                    <template v-if="$slots.today" #today><slot name="today" /></template>
                    <template v-if="$slots.clear" #clear><slot name="clear" /></template>
                </TaoCalendar>
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
    height: var(--tao-control-height);
    padding: 0 var(--tao-control-padding-x);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    font-size: var(--tao-control-font-size);
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
