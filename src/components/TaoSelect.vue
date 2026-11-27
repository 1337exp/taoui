<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useControlAttrs } from '../controlAttrs';
import { usePopup } from '../primitives/usePopup';
import { useRoving } from '../primitives/useRoving';
import { useField } from '../formField';
import type { TaoSelectItem } from '../select';
import { densityClass } from '../density';
import { sizeClass, type TaoSize } from '../size';
import { useLocaleText } from '../locale';
import TaoFormValue from './TaoFormValue.vue';
import { warnRemoved } from '../deprecate';

defineOptions({ name: 'TaoSelect', inheritAttrs: false });
// 5.x names the parent may still pass: said once in dev, since an untyped template shows no error / имена из 5.x, которые родитель мог оставить: один раз в dev, шаблон без типов ошибки не покажет
warnRemoved('TaoSelect', { options: 'use `items` of `{ id, label }`', onChange: 'use `v-model` (`update:modelValue`): `change` is not emitted', error: 'use `invalid` for the red frame (`error` is only the text of `TaoFormField`)' });

// the attributes go to the control, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — элементу управления, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

const props = withDefaults(
    defineProps<{
        items?: TaoSelectItem[];
        placeholder?: string;
        disabled?: boolean;
        invalid?: boolean;
        /** The id of the trigger, which the label of a `TaoFormField` points at. / id кнопки, на который указывает подпись `TaoFormField`. */
        id?: string;
        /** The name in a form: the picked id goes into `FormData` (through a hidden input). / Имя в форме: выбранный id попадает в `FormData` (через скрытый input). */
        name?: string;
        /** A value is required: a form does not submit the field empty. / Значение обязательно: форма не отправит поле пустым. */
        required?: boolean;
        /** Takes the focus when it appears. / Берёт фокус, когда появляется. */
        autofocus?: boolean;
        /** The value can be seen and sent, not changed: the list does not open. / Значение видно и уходит с формой, но не меняется: список не открывается. */
        readOnly?: boolean;
        /** Label of the clear row in the list. Slot `#clear` replaces it (icon, markup). / Подпись пункта сброса; слот `#clear` заменяет её (иконка, разметка). */
        clearText?: string;
        /**
         * Whether the value can be cleared: shows the clear row and enables Delete / Backspace.
         * Turn off when null is not a valid value (grid step, sort order).
         * Можно ли очистить значение: показывает пункт сброса и включает Delete / Backspace.
         * Выключайте, когда null не допустим (шаг сетки, порядок сортировки).
         */
        clearable?: boolean;
        /** Control size, same scale as TaoButton; without it — the size of ancestors. Also scales the open list. / Размер контрола, шкала как у TaoButton; без него — размер предков. Масштабирует и список. */
        size?: TaoSize;
    }>(),
    {
        items: () => [],
        disabled: false,
        invalid: false,
        clearable: true,
    },
);

const model = defineModel<string | number | null>({ default: null });
const l10n = useLocaleText(props, 'select');


const { field, controlId, isInvalid, describedBy, localId } = useField(props);
const listId = `${localId}-list`;
// the list is named like the field: the aria-label the caller gave, otherwise the caption of the TaoFormField / TaoProp, otherwise the placeholder
// список называется так же, как поле: данный aria-label, иначе подпись TaoFormField / TaoProp, иначе подсказка
// read in the template, not cached: `useAttrs()` is not reactive, and a later `aria-label` must reach the open list too
// читается в шаблоне, без кэша: `useAttrs()` не реактивен, и позднее `aria-label` должно дойти и до открытого списка
function listLabel() {
    const own = controlAttrs()['aria-label'] as string | undefined;
    return own ?? (field?.labelId?.value ? undefined : l10n.value.placeholder);
}

const open = ref(false);
const activeIndex = ref(-1);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);

const selected = computed(() => props.items.find((option) => option.id === model.value) ?? null);
const enabled = computed(() => props.items.map((option) => !option.disabled));
const enabledIndexes = computed(() => enabled.value.flatMap((on, index) => (on ? [index] : [])));

const {
    style: listStyle,
    update: updatePosition,
    panelSize,
    panelDensity,
} = usePopup({
    open,
    anchor: triggerRef,
    panel: panelRef,
    matchWidth: true,
    scale: () => props.size,
    onDismiss: close,
    onEscape: () => {
        close();
        triggerRef.value?.focus();
    },
});
const nav = useRoving({
    enabled: () => enabled.value,
    active: activeIndex,
    labels: () => props.items.map((option) => option.label),
    onMove: () => scrollActiveIntoView(),
});

async function setOpen(next: boolean) {
    if (props.disabled || props.readOnly) {
        return;
    }

    open.value = next;

    if (!next) {
        return;
    }

    const selectedIndex = props.items.findIndex((option) => option.id === model.value);
    activeIndex.value =
        selectedIndex >= 0 && enabledIndexes.value.includes(selectedIndex)
            ? selectedIndex
            : (enabledIndexes.value[0] ?? -1);
    await nextTick();
    updatePosition();
    // the focus stays on the trigger (the select-only combobox of the APG): the options are reached by `aria-activedescendant`
    // фокус остаётся на кнопке (select-only combobox из APG): до пунктов добираются через `aria-activedescendant`
    scrollActiveIntoView();
}

// a field that becomes read-only or disabled while its list is open lets the list go: it could still be clicked and would commit
// поле, которое стало только для чтения или недоступным при открытом списке, отпускает список: по нему ещё можно нажать, и он зафиксирует
watch(
    () => props.disabled || props.readOnly,
    (off) => {
        if (off) {
            close();
        }
    },
);

// the items shrink while the list is open: the active option must still be one of them (`aria-activedescendant` names it)
// пункты сократились при открытом списке: активный должен остаться одним из них (его называет `aria-activedescendant`)
watch(
    () => props.items.length,
    (count) => {
        if (activeIndex.value >= count) {
            activeIndex.value = enabledIndexes.value.at(-1) ?? -1;
        }
    },
);

// the focus stays on the trigger while a press inside the list is held (the scrollbar, the padding): that press is not a leave
// фокус остаётся на кнопке, пока держат нажатие внутри списка (полоса прокрутки, поля): это нажатие не уход
function onTriggerBlur(event: FocusEvent) {
    if (panelRef.value?.contains(event.relatedTarget as Node | null)) {
        return;
    }
    close();
}

function toggle() {
    void setOpen(!open.value);
}

function close() {
    open.value = false;
}

function selectOption(option: TaoSelectItem) {
    if (option.disabled || props.disabled || props.readOnly) {
        return;
    }

    model.value = option.id;
    close();
    triggerRef.value?.focus();
}

function clear() {
    if (props.disabled || props.readOnly) {
        return;
    }
    model.value = null;
    close();
    triggerRef.value?.focus();
}

function scrollActiveIntoView() {
    const list = listRef.value;

    if (!list || activeIndex.value < 0) {
        return;
    }

    const option = list.querySelector<HTMLElement>(`[data-tao-select-index="${activeIndex.value}"]`);
    option?.scrollIntoView({ block: 'nearest' });
}

function onTriggerKeydown(event: KeyboardEvent) {
    if (props.disabled || props.readOnly) {
        return;
    }

    // open: the keys of the list, from the trigger that keeps the focus
    // открыт: клавиши списка, с кнопки, которая держит фокус
    if (open.value) {
        onListKeydown(event);
        return;
    }

    if ((event.key === 'Backspace' || event.key === 'Delete') && selected.value && props.clearable) {
        event.preventDefault();
        clear();
        return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        void setOpen(true);
    }
}

function onListKeydown(event: KeyboardEvent) {
    // the select-only combobox of the APG: Alt+ArrowUp picks the active option and closes, PageUp / PageDown jump ten options
    // select-only combobox из APG: Alt+ArrowUp выбирает активный пункт и закрывает, PageUp / PageDown прыгают на десять пунктов
    if (event.key === 'ArrowUp' && event.altKey) {
        event.preventDefault();
        const option = props.items[activeIndex.value];
        if (option) {
            selectOption(option);
        } else {
            close();
        }
        return;
    }
    if (event.key === 'PageDown' || event.key === 'PageUp') {
        event.preventDefault();
        const list = enabledIndexes.value;
        const at = list.indexOf(activeIndex.value);
        const to = event.key === 'PageDown' ? Math.min(list.length - 1, (at < 0 ? 0 : at) + 10) : Math.max(0, (at < 0 ? 0 : at) - 10);
        activeIndex.value = list[to] ?? -1;
        scrollActiveIntoView();
        return;
    }
    if (nav.onKeydown(event)) {
        return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
        if (selected.value && props.clearable) {
            event.preventDefault();
            clear();
        }
        return;
    }

    if (event.key === 'Tab') {
        // leaves the field: the list closes, nothing is picked, the focus goes on
        // уходит из поля: список закрывается, ничего не выбрано, фокус идёт дальше
        close();
        return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const option = props.items[activeIndex.value];

        if (option) {
            selectOption(option);
        }
    }
}
</script>

<template>
    <div v-bind="rootAttrs()" class="tao-select" :class="[sizeClass(size), { 'tao-select--open': open, 'tao-select--invalid': isInvalid }]">
        <button
            v-bind="controlAttrs()"
            :id="controlId"
            ref="triggerRef"
            type="button"
            class="tao-select__trigger"
            :class="{ 'tao-select__trigger--placeholder': !selected }"
            role="combobox"
            :aria-expanded="open"
            aria-haspopup="listbox"
            aria-autocomplete="none"
            :aria-controls="open ? listId : undefined"
            :aria-activedescendant="open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined"
            :aria-invalid="isInvalid || undefined"
            :aria-required="required || undefined"
            :aria-readonly="readOnly || undefined"
            :aria-describedby="describedBy"
            :disabled="disabled"
            @click="toggle"
            @keydown="onTriggerKeydown"
            @blur="onTriggerBlur"
        >
            <span class="tao-select__value">{{ selected?.label ?? l10n.placeholder }}</span>
            <span
                class="tao-select__chevron"
                :class="{ 'tao-select__chevron--custom': $slots.chevron }"
                aria-hidden="true"
            >
                <slot name="chevron" />
            </span>
        </button>
        <TaoFormValue :name="name" :value="model" :required="required" :disabled="disabled" @focus="triggerRef?.focus()" />

        <Teleport to="body">
            <div
                v-if="open"
                ref="panelRef"
                class="tao-select__panel"
                :class="[sizeClass(panelSize), densityClass(panelDensity)]"
                :style="listStyle"
                @mousedown.prevent
            >
                <ul
                    :id="listId"
                    ref="listRef"
                    class="tao-select__list"
                    role="listbox"
                    :aria-label="listLabel()"
                    :aria-labelledby="listLabel() ? undefined : field?.labelId.value"
                >
                    <li
                        v-for="(option, index) in items"
                        :id="`${listId}-opt-${index}`"
                        :key="String(option.id)"
                        class="tao-select__option"
                        :class="{
                            'tao-select__option--active': index === activeIndex,
                            'tao-select__option--selected': option.id === model,
                            'tao-select__option--disabled': option.disabled,
                        }"
                        role="option"
                        :aria-selected="option.id === model"
                        :aria-disabled="option.disabled || undefined"
                        :data-tao-select-index="index"
                        @mousedown.prevent
                        @click="selectOption(option)"
                        @mouseenter="!option.disabled && (activeIndex = index)"
                    >
                        {{ option.label }}
                    </li>
                </ul>
                <button
                    v-if="clearable && selected"
                    type="button"
                    class="tao-select__clear"
                    @mousedown.prevent
                    @click="clear"
                >
                    <slot name="clear">{{ l10n.clearText }}</slot>
                </button>
            </div>
        </Teleport>
    </div>
</template>

<style>
.tao-select__panel {
    z-index: var(--tao-z-popup);
    position: fixed;
    overflow: hidden;
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-shadow-overlay);
}

.tao-select__list {
    margin: 0;
    padding: var(--tao-space-1);
    max-height: 240px;
    overflow: auto;
    /* the wheel at the end does not go on to scroll the page behind / колесо в конце не листает страницу за окном */
    overscroll-behavior: contain;
    list-style: none;
}


.tao-select__clear {
    display: block;
    width: 100%;
    margin: 0;
    padding: var(--tao-control-padding-y) var(--tao-control-padding-x);
    border: none;
    border-top: 1px solid var(--tao-color-border);
    background: none;
    color: var(--tao-color-text-muted);
    font: inherit;
    font-size: var(--tao-control-font-size-secondary);
    text-align: left;
    cursor: pointer;
}

.tao-select__clear:hover {
    color: var(--tao-color-text-strong);
    background: var(--tao-color-hover);
}

.tao-select__option {
    padding: var(--tao-control-padding-y) var(--tao-control-padding-x);
    /* concentric corners: the panel radius minus the list padding / концентричные углы */
    border-radius: max(0px, calc(var(--tao-radius-panel) - var(--tao-space-1)));
    font-size: var(--tao-control-font-size);
    cursor: pointer;
    user-select: none;
}

.tao-select__option--active,
.tao-select__option:hover:not(.tao-select__option--disabled) {
    background: var(--tao-color-hover);
}

.tao-select__option--selected {
    color: var(--tao-color-accent-text);
}

.tao-select__option--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

<style scoped>
.tao-select {
    width: 100%;
    /* the root box is the silhouette of the field: a surface, a shadow or an outline put on it follows the corners
       коробка корня это силуэт поля: поверхность, тень или контур на нём идут за углами */
    border-radius: var(--tao-radius-control);
}

.tao-select__trigger {
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

.tao-select__trigger--placeholder {
    color: var(--tao-color-input-placeholder);
}

/* open: the field stays lit while its list is open (the focus stays on the trigger, and the frame follows the open state too)
   открыт: поле горит, пока открыт его список (фокус остаётся на кнопке, и рамка следует и за состоянием «открыт») */
.tao-select__trigger:focus,
.tao-select--open .tao-select__trigger {
    outline: none;
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-select--invalid .tao-select__trigger {
    border-color: var(--tao-color-danger);
}

.tao-select--invalid .tao-select__trigger:focus,
.tao-select--invalid.tao-select--open .tao-select__trigger {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-select__trigger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tao-select__value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-select__chevron {
    flex-shrink: 0;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid currentColor;
    opacity: 0.6;
    transition: transform var(--tao-duration-fast) var(--tao-ease-base);
}

.tao-select--open .tao-select__chevron {
    transform: rotate(180deg);
}

.tao-select__chevron--custom {
    display: inline-flex;
    width: auto;
    height: auto;
    border: none;
}
</style>
