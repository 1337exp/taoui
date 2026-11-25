<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { computed, inject, ref, useId, useSlots } from 'vue';
import { type TaoRadioValue } from '../radio';
import { segmentedKey } from '../segmented';
import { slotHas } from '../slots';

defineOptions({ name: 'TaoSegmentedOption' });

const props = withDefaults(
    defineProps<{
        value: TaoRadioValue;
        name?: string;
        label?: string;
        icon?: string;
        count?: number | string;
        disabled?: boolean;
        ariaLabel?: string;
    }>(),
    {
        label: '',
        icon: '',
        disabled: false,
    },
);

const model = defineModel<TaoRadioValue>();


const group = inject(segmentedKey, null);
const slots = useSlots();
// a slot counts when it draws something, not when it merely exists (see src/slots.ts)
const has = (name: string) => slotHas(slots, name);
const localId = useId();

const isDisabled = computed(() => props.disabled || Boolean(group?.disabled.value));
const inputName = computed(() => group?.name.value ?? props.name);
const isChecked = computed(() => {
    const current = group ? group.model.value : model.value;
    return current === props.value;
});

const hasLabel = computed(() => Boolean(props.label || has('default')));
const isIconOnly = computed(() => Boolean((props.icon || has('icon')) && !hasLabel.value));

const countLabel = computed(() => {
    if (props.count === undefined || props.count === null || props.count === '') {
        return '';
    }

    if (typeof props.count === 'number') {
        if (props.count > 99) {
            return '99+';
        }

        return String(props.count);
    }

    return String(props.count);
});

const labelRef = ref<HTMLElement | null>(null);
/** The full caption, only while the label is cut (wrapped past two lines): the native tooltip is the way to read the rest. / Полная подпись, только пока подпись обрезана: остаток читают во всплывающей подсказке. */
const clippedTitle = ref<string | undefined>(undefined);

function syncTitle() {
    const el = labelRef.value;
    const cut = Boolean(el) && (el!.scrollHeight > el!.clientHeight + 1 || el!.scrollWidth > el!.clientWidth + 1);
    clippedTitle.value = cut ? (el!.textContent ?? '').trim() || undefined : undefined;
}

function onChange() {
    if (isDisabled.value) {
        return;
    }

    if (group) {
        group.setValue(props.value);
        return;
    }

    model.value = props.value;
}
</script>

<template>
    <label
        class="tao-segmented-option"
        :class="{
            'tao-segmented-option--checked': isChecked,
            'tao-segmented-option--disabled': props.disabled,
            'tao-segmented-option--icon-only': isIconOnly,
        }"
        :for="localId"
        :title="clippedTitle"
        @mouseenter="syncTitle"
    >
        <input
            :id="localId"
            class="tao-segmented-option__input"
            type="radio"
            :name="inputName"
            :required="group?.required?.value || undefined"
            :value="String(value)"
            :checked="isChecked"
            :disabled="isDisabled"
            :aria-label="ariaLabel"
            @change="onChange"
        />
        <span class="tao-segmented-option__face">
            <span v-if="icon || has('icon')" class="tao-segmented-option__icon" aria-hidden="true">
                <slot name="icon"><TaoIcon :name="icon" /></slot>
            </span>
            <span v-if="hasLabel" ref="labelRef" class="tao-segmented-option__label">
                <slot>{{ label }}</slot>
            </span>
            <span v-else-if="ariaLabel" class="tao-segmented-option__sr">{{ ariaLabel }}</span>
            <span v-if="countLabel" class="tao-segmented-option__count">{{ countLabel }}</span>
        </span>
    </label>
</template>

<style scoped>
.tao-segmented-option {
    position: relative;
    z-index: 1;
    display: inline-flex;
    /* an option keeps its width while the track has room, and gives way only when the track is at its `max-width: 100%`: the label
       then wraps and clamps (below) instead of being cut off by the track
       вариант держит ширину, пока у дорожки есть место, и уступает, только когда дорожка упёрлась в `max-width: 100%`: подпись
       тогда переносится и обрезается многоточием (ниже), а не срезается дорожкой */
    flex: 0 1 auto;
    /* the face fills the option, so a focus ring and the hit area are as tall as a two-line neighbour / грань заполняет вариант: кольцо фокуса и зона нажатия той же высоты, что у двухстрочного соседа */
    align-items: stretch;
    min-width: var(--tao-segmented-option-min-width, 0);
    cursor: pointer;
    user-select: none;
    color: var(--tao-color-text-subtle);
}

.tao-segmented-option__face {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--tao-space-1);
    width: 100%;
    border-radius: calc(var(--tao-radius-control) - 1px);
    font-family: inherit;
    font-weight: 500;
    line-height: 1.25;
    /* the track adds 6px: padding 2 + border 1 on each side / дорожка добавляет 6px */
    min-height: calc(var(--tao-control-height) - 6px);
    min-width: 0;
    padding: 0 var(--tao-control-padding-x);
    font-size: var(--tao-control-font-size-secondary);
    transition:
        color var(--tao-duration-base) var(--tao-ease-base),
        background var(--tao-duration-base) var(--tao-ease-base);
}

.tao-segmented-option--icon-only .tao-segmented-option__face {
    /* square / квадрат */
    min-width: calc(var(--tao-control-height) - 6px);
    padding: 0;
}

.tao-segmented-option__icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.tao-segmented-option__label {
    min-width: 0;
    line-height: 1.25;
    /* A caption that does not fit wraps to a second line, then ends in an ellipsis (the full text is the `title`, see the script).
       When it fits, it is one line as before: the natural width of a wrapping text is its width on one line.
       Подпись, которая не влезла, переносится на вторую строку и кончается многоточием (полный текст — в `title`, см. скрипт).
       Если влезает — одна строка, как раньше: естественная ширина переносимого текста — его ширина в одну строку. */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    overflow-wrap: break-word;
    text-align: center;
}

.tao-segmented-option__count {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    min-width: 1.15em;
    height: 1.15em;
    padding: 0 4px;
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-accent-subtle);
    color: var(--tao-color-accent-text);
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
}

.tao-segmented-option:hover:not(.tao-segmented-option--disabled):not(.tao-segmented-option--checked) {
    color: var(--tao-color-text);
}

.tao-segmented-option--checked {
    color: var(--tao-color-accent-text);
}

.tao-segmented-option--checked .tao-segmented-option__count {
    background: color-mix(in srgb, var(--tao-color-accent) 22%, transparent);
}

.tao-segmented-option--disabled {
    cursor: not-allowed;
    opacity: 0.55;
}

.tao-segmented-option__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.tao-segmented-option__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.tao-segmented-option__input:focus-visible + .tao-segmented-option__face {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}
</style>
