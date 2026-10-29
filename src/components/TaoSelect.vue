<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useControlAttrs } from '../controlAttrs';
import { useDismiss } from '../dismiss';
import { useFloating } from '../floating';
import { useLayer } from '../layers';
import { useListNav } from '../listNav';
import { useField } from '../formField';
import type { TaoSelectOption } from '../select';
import { densityClass, resolveDensity, type TaoResolvedDensity } from '../density';
import { resolveSize, sizeClass, type TaoSize } from '../size';
import { useLocaleText } from '../locale';

defineOptions({ name: 'TaoSelect', inheritAttrs: false });

// the attributes go to the control, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — элементу управления, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

const props = withDefaults(
    defineProps<{
        modelValue?: string | number | null;
        options?: TaoSelectOption[];
        placeholder?: string;
        disabled?: boolean;
        error?: boolean;
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
        modelValue: null,
        options: () => [],
        disabled: false,
        error: false,
        clearable: true,
    },
);
const l10n = useLocaleText(props, 'select');

const emit = defineEmits<{
    'update:modelValue': [value: string | number | null];
    change: [value: string | number | null];
}>();

const { field, controlId, invalid, describedBy, localId } = useField(props);
const listId = `${localId}-list`;

const open = ref(false);
const activeIndex = ref(-1);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
/** The panel is teleported to body, so it gets the size resolved at the trigger. / Панель в body — размер берём у триггера. */
const panelSize = ref<TaoSize>('medium');
const panelDensity = ref<TaoResolvedDensity>('default');

const selected = computed(() => props.options.find((option) => option.value === props.modelValue) ?? null);
const enabled = computed(() => props.options.map((option) => !option.disabled));
const enabledIndexes = computed(() => enabled.value.flatMap((on, index) => (on ? [index] : [])));

const { style: listStyle, update: updatePosition } = useFloating(triggerRef, panelRef, open, { placement: 'bottom-start', matchWidth: true });
useDismiss(open, () => [triggerRef.value, panelRef.value], close);
useLayer(open, {
    onEscape: () => {
        close();
        triggerRef.value?.focus();
    },
});
const nav = useListNav({
    enabled: () => enabled.value,
    active: activeIndex,
    labels: () => props.options.map((option) => option.label),
    onMove: () => scrollActiveIntoView(),
});

async function setOpen(next: boolean) {
    if (props.disabled) {
        return;
    }

    open.value = next;

    if (!next) {
        return;
    }

    const selectedIndex = props.options.findIndex((option) => option.value === props.modelValue);
    activeIndex.value =
        selectedIndex >= 0 && enabledIndexes.value.includes(selectedIndex)
            ? selectedIndex
            : (enabledIndexes.value[0] ?? -1);
    await nextTick();
    updatePosition();
    listRef.value?.focus({ preventScroll: true });
    scrollActiveIntoView();
}

function toggle() {
    void setOpen(!open.value);
}

function close() {
    open.value = false;
}

function selectOption(option: TaoSelectOption) {
    if (option.disabled) {
        return;
    }

    emit('update:modelValue', option.value);
    emit('change', option.value);
    close();
    triggerRef.value?.focus();
}

function clear() {
    emit('update:modelValue', null);
    emit('change', null);
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
    if (props.disabled) {
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

    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const option = props.options[activeIndex.value];

        if (option) {
            selectOption(option);
        }
    }
}

watch(open, (isOpen) => {
    if (isOpen) {
        panelSize.value = resolveSize(triggerRef.value, props.size);
        panelDensity.value = resolveDensity(triggerRef.value);
    }
});
</script>

<template>
    <div v-bind="rootAttrs()" class="tao-select" :class="[sizeClass(size), { 'tao-select--open': open, 'tao-select--invalid': invalid }]">
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
            :aria-controls="listId"
            :aria-invalid="invalid || undefined"
            :aria-describedby="describedBy"
            :disabled="disabled"
            @click="toggle"
            @keydown="onTriggerKeydown"
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

        <Teleport to="body">
            <div
                v-if="open"
                ref="panelRef"
                class="tao-select__panel"
                :class="[sizeClass(panelSize), densityClass(panelDensity)]"
                :style="listStyle"
            >
                <ul
                    :id="listId"
                    ref="listRef"
                    class="tao-select__list"
                    role="listbox"
                    tabindex="-1"
                    :aria-activedescendant="activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined"
                    @keydown="onListKeydown"
                >
                    <li
                        v-for="(option, index) in options"
                        :id="`${listId}-opt-${index}`"
                        :key="String(option.value)"
                        class="tao-select__option"
                        :class="{
                            'tao-select__option--active': index === activeIndex,
                            'tao-select__option--selected': option.value === modelValue,
                            'tao-select__option--disabled': option.disabled,
                        }"
                        role="option"
                        :aria-selected="option.value === modelValue"
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
    list-style: none;
}

.tao-select__list:focus {
    outline: none;
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
    color: var(--tao-color-accent);
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
    color: var(--tao-color-accent);
}

.tao-select__option--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

<style scoped>
.tao-select {
    width: 100%;
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

/* open: the field stays lit while its list is open. The press focuses it (lit), opening moves the focus into the list:
   without this the frame lit up and went out at once, a flash
   открыт: поле горит, пока открыт его список. Нажатие даёт фокус (горит), открытие уводит фокус в список: без этого
   рамка вспыхивала и сразу гасла */
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
