<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import {
    formatTaoDateIso,
    formatTaoDateLabel,
    formatTaoDateShort,
    isTaoDateInRange,
    parseTaoDate,
    parseTaoDateInput,
    todayTaoDate,
} from '../date';
import { localeEn } from '../locale/en';
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
        /**
         * A text field you can type into: `5`, `5.3`, `05.03.26`, in the locale's order of day and month; the calendar
         * opens from the button next to it or with ↓. Enter or leaving the field applies the text; one that is not a date
         * or is outside min / max puts the value back; Esc drops the typing.
         * Текстовое поле, в которое можно набрать дату: `5`, `5.3`, `05.03.26`, в порядке дня и месяца языка; календарь
         * открывается кнопкой рядом или ↓. Enter или уход из поля применяют текст; не дата или дата вне min / max
         * возвращает значение; Esc отменяет набор.
         */
        editable?: boolean;
        /** Your own reading of the typed text → ISO or null. / Своё чтение набранного текста → ISO или null. */
        parse?: (text: string, context: { locale: string; reference: string }) => string | null;
        /** Your own text of a value in the field. / Свой текст значения в поле. */
        format?: (iso: string, locale: string) => string;
        calendarLabel?: string;
    }>(),
    {
        modelValue: null,
        disabled: false,
        error: false,
        min: undefined,
        max: undefined,
        editable: false,
        parse: undefined,
        format: undefined,
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
// what the panel hangs from: the button, or the whole field when it is editable / от чего висит панель
const fieldRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const anchorRef = computed(() => (props.editable ? fieldRef.value : triggerRef.value));
const panelRef = ref<HTMLElement | null>(null);
const calendarRef = ref<InstanceType<typeof TaoCalendar> | null>(null);

const valueIso = computed(() => {
    const parsed = parseTaoDate(props.modelValue);
    return parsed ? formatTaoDateIso(parsed) : null;
});
const displayLabel = computed(() => (valueIso.value ? formatTaoDateLabel(valueIso.value, dateLocale.value) : ''));

const { style: panelStyle, update: updatePosition } = useFloating(anchorRef, panelRef, open, { placement: 'bottom-start' });
useDismiss(open, () => [anchorRef.value, panelRef.value], close);
useLayer(open, {
    onEscape: () => {
        close();
        focusBack();
    },
});

function focusBack() {
    (props.editable ? inputRef.value : triggerRef.value)?.focus();
}

//---]>
// the editable field / редактируемое поле

function shortText(iso: string | null): string {
    if (!iso) return '';
    return props.format ? props.format(iso, dateLocale.value) : formatTaoDateShort(iso, dateLocale.value);
}

const text = ref(shortText(valueIso.value));
// the value or the locale changed from outside: the field shows it, unless the user is typing
// значение или язык поменялись снаружи: поле их показывает, если пользователь не набирает
let typing = false;
watch([valueIso, dateLocale], () => {
    if (!typing) text.value = shortText(valueIso.value);
});

function emitValue(next: string | null) {
    if (next === valueIso.value) return;
    emit('update:modelValue', next);
    emit('change', next);
}

function commitText() {
    typing = false;
    const raw = text.value.trim();
    if (!raw) {
        emitValue(null);
        text.value = '';
        return;
    }
    const context = { locale: dateLocale.value, reference: valueIso.value ?? todayTaoDate() };
    const parsed = props.parse ? props.parse(raw, context) : parseTaoDateInput(raw, context);
    if (parsed && isTaoDateInRange(parsed, props.min, props.max)) {
        emitValue(parsed);
        text.value = shortText(parsed);
    } else {
        // not a date, or out of range: the value stays / не дата или вне диапазона: значение остаётся
        text.value = shortText(valueIso.value);
    }
}

function onInput(event: Event) {
    typing = true;
    text.value = (event.target as HTMLInputElement).value;
}

function onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        // applied before a form around it submits / применяем раньше, чем форма вокруг отправится
        commitText();
    } else if (event.key === 'Escape' && typing) {
        // Esc drops the typing first; the next one goes to the layer above / сначала Esc отменяет набор
        event.stopPropagation();
        typing = false;
        text.value = shortText(valueIso.value);
    } else if (event.key === 'ArrowDown' && !event.shiftKey) {
        event.preventDefault();
        commitText();
        void setOpen(true);
    }
}

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
    if (props.editable) {
        typing = false;
        emitValue(next);
        text.value = shortText(next);
    } else {
        emit('update:modelValue', next);
        emit('change', next);
    }
    close();
    focusBack();
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
    <div class="tao-date" :class="[sizeClass(size), { 'tao-date--open': open, 'tao-date--invalid': invalid, 'tao-date--editable': editable }]">
        <div v-if="editable" ref="fieldRef" class="tao-date__field" :class="{ 'tao-date__field--disabled': disabled }">
            <input
                :id="controlId"
                ref="inputRef"
                class="tao-date__input"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                :value="text"
                :placeholder="l10n.placeholder"
                :disabled="disabled"
                :aria-invalid="invalid || undefined"
                :aria-describedby="describedBy"
                @input="onInput"
                @keydown="onInputKeydown"
                @blur="commitText"
            />
            <button
                type="button"
                class="tao-date__toggle"
                :aria-label="l10n.calendarLabel ?? localeEn.date.calendarLabel"
                aria-haspopup="dialog"
                :aria-expanded="open"
                :aria-controls="gridId"
                :disabled="disabled"
                @click="toggle"
            >
                <slot name="icon">
                    <TaoIcon name="tao-calendar" :size="16" />
                </slot>
            </button>
        </div>
        <button
            v-else
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

.tao-date__field {
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--tao-control-height);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-input-bg);
    transition: var(--tao-transition-base);
}

.tao-date__field:focus-within {
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-date--invalid .tao-date__field {
    border-color: var(--tao-color-danger);
}

.tao-date__field--disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tao-date__input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 0 0 var(--tao-control-padding-x);
    border: 0;
    background: transparent;
    color: var(--tao-color-input-text);
    font-size: var(--tao-control-font-size);
    font-family: inherit;
    font-variant-numeric: tabular-nums;
    outline: none;
}

.tao-date__input::placeholder {
    color: var(--tao-color-input-placeholder);
}

.tao-date__input:disabled {
    cursor: not-allowed;
}

.tao-date__toggle {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 var(--tao-control-padding-x);
    border: 0;
    border-radius: 0 var(--tao-radius-control) var(--tao-radius-control) 0;
    background: transparent;
    color: var(--tao-color-input-text);
    opacity: 0.7;
    cursor: pointer;
}

.tao-date__toggle:hover:not(:disabled) {
    opacity: 1;
}

.tao-date__toggle:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
    opacity: 1;
}

.tao-date__toggle:disabled {
    cursor: not-allowed;
}

.tao-date__icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    opacity: 0.7;
}
</style>
