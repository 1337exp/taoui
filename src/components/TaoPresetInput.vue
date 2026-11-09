<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import TaoIcon from './TaoIcon.vue';
import { useControlAttrs } from '../controlAttrs';
import { densityClass, resolveDensity, type TaoResolvedDensity } from '../density';
import { useDismiss } from '../dismiss';
import { useFloating } from '../floating';
import { useField } from '../formField';
import { useLayer } from '../layers';
import { useLocaleText } from '../locale';
import { parsePreset, presetLine, presetList, stepPreset, type TaoPresetOption, type TaoPresetValue } from '../presetInput';
import { resolveSize, sizeClass, type TaoSize } from '../size';

defineOptions({ name: 'TaoPresetInput', inheritAttrs: false });

// the attributes go to the input, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — полю ввода, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

const props = withDefaults(
    defineProps<{
        /** The value, `v-model`: an option's value, or a number typed by hand (`custom`). / Значение, `v-model`: значение пункта или число, набранное руками (`custom`). */
        modelValue?: TaoPresetValue;
        /**
         * The presets. They are shown in this order in the pop-up, and the arrows walk them in it («up» is the next one).
         * The option with `default: true` is what an empty field means («Auto»): the pop-up shows it first, and the arrows
         * reach it after the last one.
         * Заготовки. В окне идут в этом порядке, и стрелки ходят по ним в нём («вверх» — следующая). Пункт с `default: true` —
         * то, что значит пустое поле («Авто»): окно показывает его первым, а стрелки доходят до него после последнего.
         */
        options?: TaoPresetOption[];
        /** The arrows go round: past the last one the first, before the first one the last. / Стрелки идут по кругу: после последнего первый, перед первым последний. */
        loop?: boolean;
        /** A whole number that is not in the list is a value too (between `min` and `max`). Off: only the presets. / Целое число вне списка тоже значение (между `min` и `max`). Выключено: только заготовки. */
        custom?: boolean;
        min?: number;
        max?: number;
        disabled?: boolean;
        error?: boolean;
        /** Control size, same scale as TaoButton; without it the size of the ancestors. / Размер контрола, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
        /** `filled` — a fill, the frame shows while the field is edited; `outline` — a frame. / `filled` — заливка, рамка видна, пока поле правят; `outline` — рамка. */
        variant?: 'filled' | 'outline';
        /** aria-label of the arrow that goes to the next value. / aria-label стрелки к следующему значению. */
        nextLabel?: string;
        /** aria-label of the arrow that goes to the previous value. / aria-label стрелки к предыдущему значению. */
        prevLabel?: string;
    }>(),
    {
        modelValue: null,
        options: () => [],
        loop: false,
        custom: true,
        min: 1,
        max: 999,
        disabled: false,
        error: false,
        size: undefined,
        variant: 'filled',
        nextLabel: undefined,
        prevLabel: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: TaoPresetValue];
    change: [value: TaoPresetValue];
}>();

const l10n = useLocaleText(props, 'presetInput');
const { controlId, invalid, describedBy, localId } = useField(props);
const listId = `${localId}-list`;

const open = ref(false);
const fieldRef = ref<HTMLElement | null>(null);
const stepsRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
/** The pop-up is teleported to body, so it gets the size resolved at the field. / Окно в body — размер берём у поля. */
const panelSize = ref<TaoSize>('medium');
const panelDensity = ref<TaoResolvedDensity>('default');

const list = computed(() => presetList(props.options));

function labelOf(value: TaoPresetValue): string {
    if (value === null || value === undefined) {
        return '';
    }
    return props.options.find((option) => option.value === value)?.label ?? String(value);
}

/** What the field shows. It is its own while the text is edited, and goes back to the value when it is not. / Что показывает поле: своё, пока текст правят, и значение — когда нет. */
const text = ref(labelOf(props.modelValue));
/** The person has typed since the last commit: Home and End are then the caret's. / Печатали после последнего применения: Home и End тогда у каретки. */
const typed = ref(false);

watch(
    () => [props.modelValue, props.options],
    () => {
        text.value = labelOf(props.modelValue);
        typed.value = false;
    },
    { deep: true },
);

const activeId = computed(() => {
    const index = list.value.findIndex((option) => option.value === props.modelValue);
    return open.value && index >= 0 ? `${listId}-opt-${index}` : undefined;
});

const { style: panelStyle, update: updatePosition } = useFloating(fieldRef, panelRef, open, { placement: 'bottom' });
// a press outside applies the text, as leaving the field does
useDismiss(open, () => [fieldRef.value, stepsRef.value, panelRef.value], () => closeAndCommit());
useLayer(open, { onEscape: () => closeAndRevert() });

function setValue(next: TaoPresetValue) {
    if (next !== props.modelValue) {
        emit('update:modelValue', next);
        emit('change', next);
    }
    text.value = labelOf(next);
    typed.value = false;
}

function commit() {
    const parsed = parsePreset(text.value, props.options, { custom: props.custom, min: props.min, max: props.max });
    if (parsed !== undefined) {
        setValue(parsed);
    } else {
        text.value = labelOf(props.modelValue);
        typed.value = false;
    }
}

function closeAndCommit() {
    open.value = false;
    commit();
}

function closeAndRevert() {
    open.value = false;
    text.value = labelOf(props.modelValue);
    typed.value = false;
}

async function openList() {
    if (props.disabled || open.value) {
        return;
    }
    panelSize.value = resolveSize(fieldRef.value, props.size);
    panelDensity.value = resolveDensity(fieldRef.value);
    open.value = true;
    await nextTick();
    updatePosition();
    scrollSelectedIntoView();
}

function scrollSelectedIntoView() {
    panelRef.value?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
}

function step(direction: 1 | -1) {
    if (props.disabled) {
        return;
    }
    setValue(stepPreset(props.options, props.modelValue, direction, props.loop));
    void openList();
    void nextTick(scrollSelectedIntoView);
}

function jump(end: boolean) {
    const line = presetLine(props.options);
    const to = end ? line[line.length - 1] : line[0];
    if (to) {
        setValue(to.value);
        void openList();
        void nextTick(scrollSelectedIntoView);
    }
}

function pick(option: TaoPresetOption) {
    if (option.disabled) {
        return;
    }
    setValue(option.value);
    open.value = false;
}

function onInput(event: Event) {
    text.value = (event.target as HTMLInputElement).value;
    typed.value = true;
}

function onFocus() {
    if (props.disabled) {
        return;
    }
    void openList();
    void nextTick(() => inputRef.value?.select());
}

function onBlur() {
    // a press on the pop-up or the arrows does not take the focus (mousedown is prevented), so a blur is a real leave: Tab or a click elsewhere
    // нажатие в окне или на стрелках не забирает фокус (mousedown отменён), так что уход фокуса настоящий: Tab или клик в другом месте
    closeAndCommit();
}

function onKeydown(event: KeyboardEvent) {
    if (props.disabled || event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        step(event.key === 'ArrowUp' ? 1 : -1);
    } else if ((event.key === 'Home' || event.key === 'End') && !typed.value) {
        event.preventDefault();
        jump(event.key === 'End');
    } else if (event.key === 'Enter') {
        event.preventDefault();
        closeAndCommit();
    }
}
</script>

<template>
    <div
        v-bind="rootAttrs()"
        class="tao-preset-input"
        :class="[
            sizeClass(size),
            {
                [`tao-preset-input--${variant}`]: variant !== 'filled',
                'tao-preset-input--open': open,
                'tao-preset-input--invalid': invalid,
                'tao-preset-input--disabled': disabled,
            },
        ]"
    >
        <div ref="fieldRef" class="tao-preset-input__field">
            <input
                inputmode="numeric"
                v-bind="controlAttrs()"
                :id="controlId"
                ref="inputRef"
                class="tao-preset-input__input"
                type="text"
                role="combobox"
                autocomplete="off"
                aria-autocomplete="none"
                aria-haspopup="listbox"
                :aria-expanded="open"
                :aria-controls="open ? listId : undefined"
                :aria-activedescendant="activeId"
                :aria-invalid="invalid || undefined"
                :aria-describedby="describedBy"
                :disabled="disabled"
                :value="text"
                @input="onInput"
                @focus="onFocus"
                @blur="onBlur"
                @click="openList"
                @keydown="onKeydown"
            />
        </div>
        <!-- like the arrows of a native number field: not a tab stop (the keys of the field do the same), and a press does not take the focus from it / как стрелки родного числового поля: не табуляция (то же делают клавиши поля), и нажатие не забирает у него фокус -->
        <div ref="stepsRef" class="tao-preset-input__steps">
            <button type="button" tabindex="-1" class="tao-preset-input__step" :aria-label="l10n.nextLabel" :disabled="disabled" @mousedown.prevent @click="step(1)">
                <TaoIcon name="tao-chevron-up" />
            </button>
            <button type="button" tabindex="-1" class="tao-preset-input__step" :aria-label="l10n.prevLabel" :disabled="disabled" @mousedown.prevent @click="step(-1)">
                <TaoIcon name="tao-chevron-down" />
            </button>
        </div>

        <Teleport to="body">
            <ul
                v-if="open"
                :id="listId"
                ref="panelRef"
                class="tao-preset-input__panel"
                :class="[sizeClass(panelSize), densityClass(panelDensity)]"
                role="listbox"
                :style="panelStyle"
                @mousedown.prevent
            >
                <li
                    v-for="(option, index) in list"
                    :id="`${listId}-opt-${index}`"
                    :key="String(option.value)"
                    class="tao-preset-input__option"
                    :class="{ 'tao-preset-input__option--selected': option.value === modelValue, 'tao-preset-input__option--disabled': option.disabled }"
                    role="option"
                    :aria-selected="option.value === modelValue"
                    :aria-disabled="option.disabled ? true : undefined"
                    @click="pick(option)"
                >
                    {{ option.label }}
                </li>
            </ul>
        </Teleport>
    </div>
</template>

<style>
/* the pop-up is teleported to <body>, so its rules are not scoped / окно уезжает в <body>, поэтому правила без scoped */
.tao-preset-input__panel {
    z-index: var(--tao-z-popup);
    position: fixed;
    box-sizing: border-box;
    min-width: var(--tao-preset-input-width, 4.5rem);
    max-height: calc(100vh - 16px);
    margin: 0;
    padding: var(--tao-space-1);
    overflow: auto;
    list-style: none;
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-shadow-overlay);
}

.tao-preset-input__option {
    padding: var(--tao-space-1) var(--tao-control-padding-x);
    /* concentric corners: the panel radius minus the list padding / концентричные углы */
    border-radius: max(0px, calc(var(--tao-radius-panel) - var(--tao-space-1)));
    font-size: var(--tao-control-font-size-secondary);
    line-height: 1.5;
    text-align: center;
    cursor: pointer;
    user-select: none;
}

.tao-preset-input__option:hover:not(.tao-preset-input__option--disabled) {
    background: var(--tao-color-hover);
    color: var(--tao-color-text-strong);
}

.tao-preset-input__option--selected {
    color: var(--tao-color-accent);
}

.tao-preset-input__option--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

<style scoped>
.tao-preset-input {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
}

/* the field and the block of arrows read as one piece: the same fill, and the frame only while the field is edited
   поле и блок стрелок читаются как одно целое: та же заливка, а рамка — только пока поле правят */
.tao-preset-input__field {
    display: flex;
    align-items: center;
    width: var(--tao-preset-input-width, 4.5rem);
    height: var(--tao-control-height);
    border: 1px solid transparent;
    border-radius: var(--tao-radius-control);
    border-start-end-radius: 0;
    border-end-end-radius: 0;
    background: color-mix(in srgb, var(--tao-color-text) 7%, transparent);
    color: var(--tao-color-input-text);
    transition: var(--tao-transition-base);
}

.tao-preset-input__steps {
    display: grid;
    height: var(--tao-control-height);
    background: color-mix(in srgb, var(--tao-color-text) 7%, transparent);
    border: 1px solid transparent;
    border-inline-start: 0;
    border-radius: 0 var(--tao-radius-control) var(--tao-radius-control) 0;
    box-sizing: border-box;
    overflow: hidden;
}

.tao-preset-input--outline .tao-preset-input__field {
    border-color: var(--tao-color-border-strong);
    background: var(--tao-color-input-bg);
}

.tao-preset-input--outline .tao-preset-input__steps {
    border-color: var(--tao-color-border-strong);
    background: var(--tao-color-input-bg);
}

.tao-preset-input__field:focus-within {
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-preset-input--invalid .tao-preset-input__field {
    border-color: var(--tao-color-danger);
}

.tao-preset-input--invalid .tao-preset-input__field:focus-within {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-preset-input__input {
    flex: 1;
    min-width: 0;
    height: calc(var(--tao-control-height) - 2px);
    padding: 0 var(--tao-space-1);
    border: none;
    background: transparent;
    color: inherit;
    font-size: var(--tao-control-font-size);
    font-family: inherit;
    text-align: center;
    outline: none;
}

.tao-preset-input__input:disabled {
    cursor: not-allowed;
}

.tao-preset-input--disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tao-preset-input__step {
    display: grid;
    place-items: center;
    width: calc(var(--tao-control-height) * 0.6);
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--tao-color-text-muted);
    /* the glyph is a share of the control, not of the text: each arrow is half of the height, and a 1em icon of a small
       control (26px) did not fit in 13px / значок — доля высоты контрола, а не текста: каждая стрелка — половина высоты, и
       иконка 1em в маленьком контроле (26px) не влезала в 13px */
    font-size: calc(var(--tao-control-height) * 0.42);
    line-height: 1;
    cursor: pointer;
    transition: color var(--tao-duration-fast) var(--tao-ease-base), background-color var(--tao-duration-fast) var(--tao-ease-base);
}

.tao-preset-input__step:hover:not(:disabled) {
    color: var(--tao-color-text);
    background: var(--tao-color-hover);
}

.tao-preset-input__step:active:not(:disabled) {
    color: var(--tao-color-text-strong);
}

.tao-preset-input__step:disabled {
    cursor: not-allowed;
}
</style>
