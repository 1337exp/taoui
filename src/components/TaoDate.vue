<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useControlAttrs } from '../controlAttrs';
import {
    formatTaoDateIso,
    formatTaoDateLabel,
    formatTaoDateShort,
    isTaoDateInRange,
    parseTaoDate,
    parseTaoDateInput,
    todayTaoDate,
} from '../date';
import { usePopup } from '../primitives/usePopup';
import { useField } from '../formField';
import { useLocaleText, useTaoLocale } from '../locale';
import { sizeClass, type TaoSize } from '../size';
import '../styles/date-popup.css';
import TaoCalendar from './TaoCalendar.vue';
import TaoFormValue from './TaoFormValue.vue';
import TaoIcon from './TaoIcon.vue';
import { warnRemoved } from '../deprecate';

defineOptions({ name: 'TaoDate', inheritAttrs: false });
// 5.x names the parent may still pass: said once in dev, since an untyped template shows no error / имена из 5.x, которые родитель мог оставить: один раз в dev, шаблон без типов ошибки не покажет
warnRemoved('TaoDate', { onChange: 'use `v-model` (`update:modelValue`): `change` is not emitted', error: 'use `invalid` for the red frame (`error` is only the text of `TaoFormField`)' });

// the attributes go to the control, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — элементу управления, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

const appLocale = useTaoLocale();

const props = withDefaults(
    defineProps<{
        placeholder?: string;
        disabled?: boolean;
        /** The id of the control, which the label of a `TaoFormField` points at. / id элемента: на него указывает подпись `TaoFormField`. */
        id?: string;
        /** The name in a form: the date as ISO (`2026-03-05`) goes into `FormData` (through a hidden input). / Имя в форме: дата в ISO уходит в `FormData` (через скрытый input). */
        name?: string;
        /** A date is required: a form does not submit the field empty. / Дата обязательна: форма не отправит поле пустым. */
        required?: boolean;
        /** Takes the focus when it appears. / Берёт фокус, когда появляется. */
        autofocus?: boolean;
        /** The date can be seen and sent, not changed: no typing, the calendar does not open. / Дату видно и она уходит с формой, но не меняется: набора нет, календарь не открывается. */
        readOnly?: boolean;
        /** Control size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
        invalid?: boolean;
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
        disabled: false,
        invalid: false,
        min: undefined,
        max: undefined,
        editable: false,
        parse: undefined,
        format: undefined,
    },
);

const model = defineModel<string | null>({ default: null });
const l10n = useLocaleText(props, 'date');
const dateLocale = computed(() => props.locale ?? appLocale.value.code);


const { controlId, isInvalid, describedBy, localId } = useField(props);
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
    const parsed = parseTaoDate(model.value);
    return parsed ? formatTaoDateIso(parsed) : null;
});
const displayLabel = computed(() => (valueIso.value ? formatTaoDateLabel(valueIso.value, dateLocale.value) : ''));

const { style: panelStyle, update: updatePosition } = usePopup({
    open,
    anchor: anchorRef,
    panel: panelRef,
    onDismiss: close,
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
    model.value = next;
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
    if (props.disabled || props.readOnly) {
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
        model.value = next;
    }
    close();
    focusBack();
}

function onTriggerKeydown(event: KeyboardEvent) {
    if (props.disabled || props.readOnly) {
        return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        void setOpen(true);
    }
}
</script>

<template>
    <div v-bind="rootAttrs()" class="tao-date" :class="[sizeClass(size), { 'tao-date--open': open, 'tao-date--invalid': isInvalid, 'tao-date--editable': editable }]">
        <div v-if="editable" ref="fieldRef" class="tao-date__field" :class="{ 'tao-date__field--disabled': disabled }">
            <input
                v-bind="controlAttrs()"
                :id="controlId"
                ref="inputRef"
                class="tao-date__input"
                type="text"
                inputmode="decimal"
                :autocomplete="(controlAttrs().autocomplete as string | undefined) ?? 'off'"
                :value="text"
                :placeholder="l10n.placeholder"
                :disabled="disabled"
                :readonly="readOnly || undefined"
                :aria-required="required || undefined"
                :aria-invalid="isInvalid || undefined"
                :aria-describedby="describedBy"
                @input="onInput"
                @keydown="onInputKeydown"
                @blur="commitText"
            />
            <button
                type="button"
                class="tao-date__toggle"
                :aria-label="l10n.calendarLabel"
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
            v-bind="controlAttrs()"
            :id="controlId"
            ref="triggerRef"
            type="button"
            class="tao-date__trigger"
            :class="{ 'tao-date__trigger--placeholder': !valueIso }"
            role="combobox"
            :aria-expanded="open"
            aria-haspopup="dialog"
            :aria-controls="gridId"
            :aria-invalid="isInvalid || undefined"
            :aria-required="required || undefined"
            :aria-readonly="readOnly || undefined"
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
        <TaoFormValue :name="name" :value="valueIso" :required="required" :disabled="disabled" @focus="(editable ? inputRef : triggerRef)?.focus()" />

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
                    @select="onChange"
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
    /* the root box is the silhouette of the field: a surface, a shadow or an outline put on it follows the corners
       коробка корня это силуэт поля: поверхность, тень или контур на нём идут за углами */
    border-radius: var(--tao-radius-control);
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

/* open: the field stays lit while its list is open. The press focuses it (lit), opening moves the focus into the list:
   without this the frame lit up and went out at once, a flash
   открыт: поле горит, пока открыт его список. Нажатие даёт фокус (горит), открытие уводит фокус в список: без этого
   рамка вспыхивала и сразу гасла */
.tao-date__trigger:focus,
.tao-date--open .tao-date__trigger {
    outline: none;
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-date--invalid .tao-date__trigger {
    border-color: var(--tao-color-danger);
}

.tao-date--invalid .tao-date__trigger:focus,
.tao-date--invalid.tao-date--open .tao-date__trigger {
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

.tao-date__field:focus-within,
.tao-date--open .tao-date__field {
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
