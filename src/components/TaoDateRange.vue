<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue';
import { useControlAttrs } from '../controlAttrs';
import { formatTaoDateRangeLabel, parseTaoDateRange, type TaoDateRangeValue } from '../date';
import { usePopup } from '../primitives/usePopup';
import { useField } from '../formField';
import { useLocaleText, useTaoLocale } from '../locale';
import { sizeClass, type TaoSize } from '../size';
import '../styles/date-popup.css';
import TaoCalendar from './TaoCalendar.vue';
import TaoFormValue from './TaoFormValue.vue';
import TaoIcon from './TaoIcon.vue';
import { warnRemoved } from '../deprecate';

defineOptions({ name: 'TaoDateRange', inheritAttrs: false });
// 5.x names the parent may still pass: said once in dev, since an untyped template shows no error / имена из 5.x, которые родитель мог оставить: один раз в dev, шаблон без типов ошибки не покажет
warnRemoved('TaoDateRange', { onChange: 'use `v-model` (`update:modelValue`): `change` is not emitted', error: 'use `invalid` for the red frame (`error` is only the text of `TaoFormField`)' });

// the attributes go to the control, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — элементу управления, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

const appLocale = useTaoLocale();

const props = withDefaults(
    defineProps<{
        placeholder?: string;
        disabled?: boolean;
        /** The id of the trigger, which the label of a `TaoFormField` points at. / id кнопки, на который указывает подпись `TaoFormField`. */
        id?: string;
        /** The name in a form: the range goes into `FormData` as `<name>-start` and `<name>-end` (ISO dates, through hidden inputs). / Имя в форме: период уходит в `FormData` как `<name>-start` и `<name>-end` (даты ISO, через скрытые input). */
        name?: string;
        /** A range is required: a form does not submit the field empty. / Период обязателен: форма не отправит поле пустым. */
        required?: boolean;
        /** Takes the focus when it appears. / Берёт фокус, когда появляется. */
        autofocus?: boolean;
        /** The range can be seen and sent, not changed: the calendar does not open. / Период виден и уходит с формой, но не меняется: календарь не открывается. */
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
    }>(),
    {
        disabled: false,
        invalid: false,
        min: undefined,
        max: undefined,
    },
);

const model = defineModel<TaoDateRangeValue | null>({ default: null });
const l10n = useLocaleText(props, 'dateRange');
const dateLocale = computed(() => props.locale ?? appLocale.value.code);


const { controlId, isInvalid, describedBy, localId } = useField(props);
const gridId = `${localId}-grid`;

const open = ref(false);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const calendarRef = ref<InstanceType<typeof TaoCalendar> | null>(null);

const committed = computed(() => parseTaoDateRange(model.value));
const displayLabel = computed(() =>
    committed.value ? formatTaoDateRangeLabel(committed.value.start, committed.value.end, dateLocale.value) : '',
);

const { style: panelStyle, update: updatePosition } = usePopup({
    open,
    anchor: triggerRef,
    panel: panelRef,
    onDismiss: close,
    onEscape: () => {
        close();
        triggerRef.value?.focus();
    },
});

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
    const next = (value as TaoDateRangeValue | null) ?? null;
    model.value = next;
    close();
    triggerRef.value?.focus();
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
    <div v-bind="rootAttrs()" class="tao-date-range" :class="[sizeClass(size), { 'tao-date-range--open': open, 'tao-date-range--invalid': isInvalid }]">
        <button
            v-bind="controlAttrs()"
            :id="controlId"
            ref="triggerRef"
            type="button"
            class="tao-date-range__trigger"
            :class="{ 'tao-date-range__trigger--placeholder': !committed }"
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
            <span class="tao-date-range__value">{{ displayLabel || l10n.placeholder }}</span>
            <span class="tao-date-range__icon" aria-hidden="true">
                <slot name="icon">
                    <TaoIcon name="tao-calendar" :size="16" />
                </slot>
            </span>
        </button>
        <TaoFormValue :name="name ? `${name}-start` : undefined" :value="committed?.start" :required="required" :disabled="disabled" @focus="triggerRef?.focus()" />
        <TaoFormValue :name="name ? `${name}-end` : undefined" :value="committed?.end" :required="required" :disabled="disabled" @focus="triggerRef?.focus()" />

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
                    mode="range"
                    :model-value="committed"
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
.tao-date-range {
    width: 100%;
    /* the root box is the silhouette of the field: a surface, a shadow or an outline put on it follows the corners
       коробка корня это силуэт поля: поверхность, тень или контур на нём идут за углами */
    border-radius: var(--tao-radius-control);
}

.tao-date-range__trigger {
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

.tao-date-range__trigger--placeholder {
    color: var(--tao-color-input-placeholder);
}

/* open: the field stays lit while its list is open. The press focuses it (lit), opening moves the focus into the list:
   without this the frame lit up and went out at once, a flash
   открыт: поле горит, пока открыт его список. Нажатие даёт фокус (горит), открытие уводит фокус в список: без этого
   рамка вспыхивала и сразу гасла */
.tao-date-range__trigger:focus,
.tao-date-range--open .tao-date-range__trigger {
    outline: none;
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-date-range--invalid .tao-date-range__trigger {
    border-color: var(--tao-color-danger);
}

.tao-date-range--invalid .tao-date-range__trigger:focus,
.tao-date-range--invalid.tao-date-range--open .tao-date-range__trigger {
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
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    opacity: 0.7;
}
</style>
