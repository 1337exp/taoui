<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useDismiss } from '../dismiss';
import { useFloating } from '../floating';
import { useField } from '../formField';
import { useLayer } from '../layers';
import { stepEnabled } from '../listNav';
import { listenFocusLoss } from '../focusLoss';
import type { TaoSelectOption } from '../select';
import { densityClass, resolveDensity, type TaoResolvedDensity } from '../density';
import { resolveSize, sizeClass, type TaoSize } from '../size';
import { formatText, useLocaleText, useTaoLocale } from '../locale';

defineOptions({ name: 'TaoCombobox' });

const appLocale = useTaoLocale();

const props = withDefaults(
    defineProps<{
        modelValue?: string | number | null;
        options?: TaoSelectOption[];
        placeholder?: string;
        disabled?: boolean;
        error?: boolean;
        emptyText?: string;
        /** Label of the clear row in the list. Slot `#clear` replaces it (icon, markup). / Подпись пункта сброса; слот `#clear` заменяет её (иконка, разметка). */
        clearText?: string;
        /** Whether the value can be cleared: shows the clear row. Turn off when null is not valid. / Можно ли очистить значение: показывает пункт сброса. Выключайте, когда null не допустим. */
        clearable?: boolean;
        /** Control size, same scale as TaoButton and TaoSelect; without it — the size of ancestors. / Размер контрола, шкала как у TaoButton и TaoSelect; без него — размер предков. */
        size?: TaoSize;
        /** Можно оставить то, чего нет в списке. */
        allowCreate?: boolean;
    }>(),
    {
        modelValue: null,
        options: () => [],
        disabled: false,
        error: false,
        clearable: true,
        allowCreate: false,
    },
);
const l10n = useLocaleText(props, 'combobox');

const emit = defineEmits<{
    'update:modelValue': [value: string | number | null];
    change: [value: string | number | null];
    /** Новое значение, которого не было в `options`. Список сам не трогаем — его дополняет родитель. */
    create: [value: string];
}>();

type ComboRow = { kind: 'option'; option: TaoSelectOption } | { kind: 'create'; text: string };

const { field, controlId, invalid, describedBy, localId } = useField(props);
const listId = `${localId}-list`;

const open = ref(false);
const focused = ref(false);
const picking = ref(false);
const skipFocusOpen = ref(false);
const query = ref('');
const activeIndex = ref(-1);
const fieldRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
/** The panel is teleported to body, so it gets the size resolved at the field. / Панель в body — размер берём у поля. */
const panelSize = ref<TaoSize>('medium');
const panelDensity = ref<TaoResolvedDensity>('default');
const listRef = ref<HTMLElement | null>(null);

const selected = computed((): TaoSelectOption | null => {
    const found = props.options.find((option) => option.value === props.modelValue);
    if (found) {
        return found;
    }
    if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
        return null;
    }
    return { value: props.modelValue, label: String(props.modelValue) };
});

const needle = computed(() => query.value.trim().toLowerCase());

const filtered = computed(() => {
    if (!needle.value) {
        return props.options;
    }
    return props.options.filter((option) => option.label.toLowerCase().includes(needle.value));
});

const canCreate = computed(() => {
    const text = query.value.trim();
    if (!props.allowCreate || !text) {
        return false;
    }
    return !props.options.some((option) => option.label.toLowerCase() === text.toLowerCase());
});

const rows = computed((): ComboRow[] => {
    const next: ComboRow[] = filtered.value.map((option) => ({ kind: 'option', option }));
    if (canCreate.value) {
        next.push({ kind: 'create', text: query.value.trim() });
    }
    return next;
});

const enabledIndexes = computed(() =>
    rows.value
        .map((row, index) => (row.kind === 'option' && row.option.disabled ? -1 : index))
        .filter((index) => index >= 0),
);

const activeId = computed(() => (activeIndex.value >= 0 ? `${listId}-row-${activeIndex.value}` : undefined));

const { style: listStyle, update: updatePosition } = useFloating(fieldRef, panelRef, open, { placement: 'bottom-start', matchWidth: true });
// a press outside commits (or reverts) the text, as leaving the field does
useDismiss(open, () => [fieldRef.value, panelRef.value], () => (props.allowCreate ? closeAndCommit() : closeAndRevert()));
useLayer(open, { onEscape: () => closeAndRevert() });

function syncQueryFromModel() {
    query.value = selected.value?.label ?? '';
}

function resetActive() {
    const selectedIndex = rows.value.findIndex(
        (row) => row.kind === 'option' && row.option.value === props.modelValue,
    );
    if (selectedIndex >= 0 && enabledIndexes.value.includes(selectedIndex)) {
        activeIndex.value = selectedIndex;
        return;
    }
    activeIndex.value = enabledIndexes.value[0] ?? -1;
}

async function setOpen(next: boolean) {
    if (props.disabled) {
        return;
    }

    open.value = next;

    if (!next) {
        return;
    }

    resetActive();
    await nextTick();
    updatePosition();
    scrollActiveIntoView();
}

function emitValue(value: string | number | null) {
    emit('update:modelValue', value);
    emit('change', value);
}

function keepFocusQuiet() {
    skipFocusOpen.value = true;
    picking.value = false;
    inputRef.value?.focus();
}

function commitCreated(value: string) {
    emitValue(value);
    emit('create', value);
    query.value = value;
    open.value = false;
    keepFocusQuiet();
}

function selectOption(option: TaoSelectOption) {
    if (option.disabled) {
        return;
    }

    emitValue(option.value);
    query.value = option.label;
    open.value = false;
    keepFocusQuiet();
}

function createFromQuery(text: string) {
    const value = text.trim();
    if (!value) {
        return;
    }

    const exact = props.options.find(
        (option) => !option.disabled && option.label.toLowerCase() === value.toLowerCase(),
    );
    if (exact) {
        selectOption(exact);
        return;
    }

    if (!props.allowCreate) {
        return;
    }

    commitCreated(value);
}

function clear() {
    emitValue(null);
    query.value = '';
    open.value = false;
    inputRef.value?.focus();
}

function revertQuery() {
    syncQueryFromModel();
}

function closeAndRevert() {
    open.value = false;
    revertQuery();
}

function closeAndCommit() {
    open.value = false;
    const text = query.value.trim();
    if (!text) {
        revertQuery();
        return;
    }

    const exact = props.options.find(
        (option) => !option.disabled && option.label.toLowerCase() === text.toLowerCase(),
    );
    if (exact) {
        emitValue(exact.value);
        query.value = exact.label;
        return;
    }

    if (props.allowCreate) {
        emitValue(text);
        emit('create', text);
        query.value = text;
        return;
    }

    revertQuery();
}

function moveActive(delta: 1 | -1) {
    // no Home / End here: in a text field they move the caret
    const next = stepEnabled(rows.value.map((row) => !(row.kind === 'option' && row.option.disabled)), activeIndex.value, delta);
    if (next >= 0) {
        activeIndex.value = next;
        scrollActiveIntoView();
    }
}

function scrollActiveIntoView() {
    const list = listRef.value;
    if (!list || activeIndex.value < 0) {
        return;
    }

    const option = list.querySelector<HTMLElement>(`[data-tao-combobox-index="${activeIndex.value}"]`);
    option?.scrollIntoView({ block: 'nearest' });
}

function onFieldMouseDown(event: MouseEvent) {
    if (props.disabled || event.button !== 0) {
        return;
    }

    const onInput = event.target === inputRef.value;
    if (onInput) {
        if (focused.value && !open.value) {
            void setOpen(true);
        }
        return;
    }

    event.preventDefault();
    if (open.value) {
        open.value = false;
        return;
    }

    inputRef.value?.focus();
    void setOpen(true);
}

function onInput() {
    if (props.disabled) {
        return;
    }

    void setOpen(true);
    resetActive();
}

function onFocus() {
    if (props.disabled) {
        return;
    }

    focused.value = true;
    if (skipFocusOpen.value) {
        skipFocusOpen.value = false;
        return;
    }
    void setOpen(true);
    nextTick(() => inputRef.value?.select());
}

function markPicking() {
    picking.value = true;
}

function onBlur() {
    focused.value = false;
    window.setTimeout(() => {
        if (picking.value) {
            picking.value = false;
            return;
        }
        if (fieldRef.value?.contains(document.activeElement) || panelRef.value?.contains(document.activeElement)) {
            return;
        }
        if (props.allowCreate) {
            closeAndCommit();
            return;
        }
        closeAndRevert();
    }, 0);
}

function activateRow(row: ComboRow) {
    if (row.kind === 'create') {
        createFromQuery(row.text);
        return;
    }
    selectOption(row.option);
}

function onInputKeydown(event: KeyboardEvent) {
    if (props.disabled) {
        return;
    }

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!open.value) {
            void setOpen(true);
            return;
        }
        moveActive(1);
        return;
    }

    if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!open.value) {
            void setOpen(true);
            return;
        }
        moveActive(-1);
        return;
    }

    if (event.key === 'Enter') {
        event.preventDefault();
        if (!open.value) {
            void setOpen(true);
            return;
        }
        const row = rows.value[activeIndex.value];
        if (row) {
            activateRow(row);
            return;
        }
        if (props.allowCreate) {
            createFromQuery(query.value);
        }
    }
}

watch(
    () => props.modelValue,
    () => {
        if (!focused.value) {
            syncQueryFromModel();
        }
    },
    { immediate: true },
);

watch(rows, () => {
    if (!open.value) {
        return;
    }
    if (!enabledIndexes.value.includes(activeIndex.value)) {
        activeIndex.value = enabledIndexes.value[0] ?? -1;
    }
});

watch(open, (isOpen) => {
    if (isOpen) {
        panelSize.value = resolveSize(fieldRef.value, props.size);
        panelDensity.value = resolveDensity(fieldRef.value);
    }
});

let stopFocusLoss: (() => void) | undefined;
onMounted(() => {
    stopFocusLoss = listenFocusLoss(() => {
        picking.value = false;
    });
});

onBeforeUnmount(() => {
    stopFocusLoss?.();
});
</script>

<template>
    <div
        class="tao-combobox"
        :class="[
            sizeClass(size),
            {
                'tao-combobox--open': open,
                'tao-combobox--invalid': invalid,
                'tao-combobox--disabled': disabled,
            },
        ]"
    >
        <div ref="fieldRef" class="tao-combobox__field" @mousedown="onFieldMouseDown">
            <input
                :id="controlId"
                ref="inputRef"
                class="tao-combobox__input"
                type="text"
                role="combobox"
                autocomplete="off"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                :aria-expanded="open"
                :aria-controls="listId"
                :aria-activedescendant="open ? activeId : undefined"
                :aria-invalid="invalid || undefined"
                :aria-describedby="describedBy"
                :disabled="disabled"
                :placeholder="l10n.placeholder"
                :value="query"
                @input="query = ($event.target as HTMLInputElement).value; onInput()"
                @focus="onFocus"
                @blur="onBlur"
                @keydown="onInputKeydown"
            />
            <span
                class="tao-combobox__chevron"
                :class="{ 'tao-combobox__chevron--custom': $slots.chevron }"
                aria-hidden="true"
            >
                <slot name="chevron" />
            </span>
        </div>

        <Teleport to="body">
            <div v-if="open" ref="panelRef" class="tao-combobox__panel" :class="[sizeClass(panelSize), densityClass(panelDensity)]" :style="listStyle">
                <ul :id="listId" ref="listRef" class="tao-combobox__list" role="listbox">
                    <li v-if="!rows.length" class="tao-combobox__empty">
                        <slot name="empty">{{ l10n.emptyText }}</slot>
                    </li>
                    <li
                        v-for="(row, index) in rows"
                        :id="`${listId}-row-${index}`"
                        :key="row.kind === 'create' ? 'create' : String(row.option.value)"
                        class="tao-combobox__option"
                        :class="{
                            'tao-combobox__option--active': index === activeIndex,
                            'tao-combobox__option--selected':
                                row.kind === 'option' && row.option.value === modelValue,
                            'tao-combobox__option--disabled': row.kind === 'option' && row.option.disabled,
                            'tao-combobox__option--create': row.kind === 'create',
                        }"
                        role="option"
                        :aria-selected="row.kind === 'option' && row.option.value === modelValue"
                        :aria-disabled="row.kind === 'option' && row.option.disabled ? true : undefined"
                        :data-tao-combobox-index="index"
                        @mousedown.prevent="markPicking"
                        @click="activateRow(row)"
                        @mouseenter="!(row.kind === 'option' && row.option.disabled) && (activeIndex = index)"
                    >
                        <template v-if="row.kind === 'create'">
                            <slot name="create" :text="row.text">{{ formatText(appLocale.combobox.createText, { text: row.text }) }}</slot>
                        </template>
                        <template v-else>{{ row.option.label }}</template>
                    </li>
                </ul>
                <button
                    v-if="clearable && selected"
                    type="button"
                    class="tao-combobox__clear"
                    @mousedown.prevent="markPicking"
                    @click="clear"
                >
                    <slot name="clear">{{ l10n.clearText }}</slot>
                </button>
            </div>
        </Teleport>
    </div>
</template>

<style>
.tao-combobox__panel {
    z-index: var(--tao-z-popup);
    position: fixed;
    overflow: hidden;
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-shadow-overlay);
}

.tao-combobox__list {
    margin: 0;
    padding: var(--tao-space-1);
    max-height: 240px;
    overflow: auto;
    list-style: none;
}

.tao-combobox__empty {
    padding: var(--tao-control-padding-y) var(--tao-control-padding-x);
    color: var(--tao-color-text-muted);
    font-size: var(--tao-control-font-size-secondary);
}

.tao-combobox__clear {
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

.tao-combobox__clear:hover {
    color: var(--tao-color-accent);
    background: var(--tao-color-surface-hover);
}

.tao-combobox__option {
    padding: var(--tao-control-padding-y) var(--tao-control-padding-x);
    /* concentric corners: the panel radius minus the list padding / концентричные углы */
    border-radius: max(0px, calc(var(--tao-radius-panel) - var(--tao-space-1)));
    font-size: var(--tao-control-font-size);
    cursor: pointer;
    user-select: none;
}

.tao-combobox__option--active,
.tao-combobox__option:hover:not(.tao-combobox__option--disabled) {
    background: var(--tao-color-surface-hover);
}

.tao-combobox__option--selected {
    color: var(--tao-color-accent);
}

.tao-combobox__option--create {
    color: var(--tao-color-accent);
}

.tao-combobox__option--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

<style scoped>
.tao-combobox {
    width: 100%;
}

.tao-combobox__field {
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    width: 100%;
    height: var(--tao-control-height);
    padding: 0 var(--tao-control-padding-x);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    transition: var(--tao-transition-base);
}

.tao-combobox__field:focus-within {
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-combobox--invalid .tao-combobox__field {
    border-color: var(--tao-color-danger);
}

.tao-combobox--invalid .tao-combobox__field:focus-within {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-combobox__input {
    flex: 1;
    min-width: 0;
    /* field height minus its 1px borders / высота поля без рамок */
    height: calc(var(--tao-control-height) - 2px);
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font-size: var(--tao-control-font-size);
    font-family: inherit;
    outline: none;
}

.tao-combobox__input::placeholder {
    color: var(--tao-color-input-placeholder);
}

.tao-combobox__input:disabled {
    cursor: not-allowed;
}

.tao-combobox--disabled .tao-combobox__field {
    opacity: 0.6;
    cursor: not-allowed;
}

.tao-combobox__chevron {
    flex-shrink: 0;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid currentColor;
    opacity: 0.6;
    pointer-events: none;
    transition: transform var(--tao-duration-fast) var(--tao-ease-base);
}

.tao-combobox--open .tao-combobox__chevron {
    transform: rotate(180deg);
}

.tao-combobox__chevron--custom {
    display: inline-flex;
    width: auto;
    height: auto;
    border: none;
}
</style>
