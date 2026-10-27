<script lang="ts" setup>
import { computed, provide } from 'vue';
import type { TaoChecklistItem } from '../checklist';
import { formFieldKey, useField, type TaoFormFieldContext } from '../formField';
import { formatText, useLocaleText } from '../locale';
import { sizeClass, type TaoSize } from '../size';
import TaoCheckbox from './TaoCheckbox.vue';

defineOptions({ name: 'TaoChecklist' });

// A list of checkboxes with one model: the values that are checked. «Select all» with a mixed state, a «3 of 5»
// counter, a strike-through for the done items. A fieldset, so a screen reader hears the group and its legend; the
// strike-through is a look, the checkbox still says checked.
// Список чекбоксов с одной моделью: отмеченные значения. «Выбрать всё» с промежуточным состоянием, счётчик «3 из 5»,
// зачёркивание выполненных. Это fieldset: скринридер слышит группу и её подпись; зачёркивание — только вид,
// состояние говорит сам чекбокс.
const props = withDefaults(
    defineProps<{
        items: TaoChecklistItem[];
        modelValue?: (string | number)[];
        legend?: string;
        /** A «Select all» checkbox on top, mixed when some are checked. / «Выбрать всё» сверху. */
        selectAll?: boolean;
        /** «3 of 5» next to the legend. / «3 из 5» рядом с подписью. */
        counter?: boolean;
        /** Strike the checked items through (a to-do list). / Зачёркивать отмеченные (список дел). */
        strike?: boolean;
        disabled?: boolean;
        /** Red frames; the message goes to TaoFormField `error`. / Красные рамки; текст ошибки — в `error` у TaoFormField. */
        error?: boolean;
        /** Without it the size of ancestors. / Без него — размер предков. */
        size?: TaoSize;
        selectAllLabel?: string;
        /** `{checked}`, `{total}`. */
        counterText?: string;
    }>(),
    {
        modelValue: () => [],
        legend: undefined,
        selectAll: false,
        counter: false,
        strike: false,
        disabled: false,
        error: false,
        size: undefined,
        selectAllLabel: undefined,
        counterText: undefined,
    },
);
const l10n = useLocaleText(props, 'checklist');

const emit = defineEmits<{
    'update:modelValue': [values: (string | number)[]];
    change: [values: (string | number)[]];
}>();

defineSlots<{
    /** The text of one item. / Текст пункта. */
    item?(props: { item: TaoChecklistItem; checked: boolean }): unknown;
}>();

const { field, invalid, describedBy } = useField(props);
// the group takes the id of a TaoFormField; the checkboxes inside must not all take it too
// группа берёт id поля TaoFormField; чекбоксы внутри не должны брать его все сразу
provide(formFieldKey, null as unknown as TaoFormFieldContext);

const labelledBy = computed(() => (props.legend || !field ? undefined : `${field.id}-label`));
const checked = computed(() => new Set(props.modelValue));
const enabledItems = computed(() => props.items.filter((item) => !item.disabled));
const checkedCount = computed(() => props.items.filter((item) => checked.value.has(item.value)).length);
const enabledChecked = computed(() => enabledItems.value.filter((item) => checked.value.has(item.value)).length);
const allChecked = computed(() => enabledItems.value.length > 0 && enabledChecked.value === enabledItems.value.length);
const someChecked = computed(() => enabledChecked.value > 0 && !allChecked.value);

function commit(next: Set<string | number>) {
    // keep the order of the items / сохраняем порядок пунктов
    const values = props.items.filter((item) => next.has(item.value)).map((item) => item.value);
    emit('update:modelValue', values);
    emit('change', values);
}

function setItem(item: TaoChecklistItem, on: boolean) {
    const next = new Set(checked.value);
    if (on) {
        next.add(item.value);
    } else {
        next.delete(item.value);
    }
    commit(next);
}

/** All the enabled items on, or all off; a disabled item keeps its state. / Доступные — все вкл или все выкл. */
function setAll() {
    const next = new Set(checked.value);
    const on = !allChecked.value;
    for (const item of enabledItems.value) {
        if (on) {
            next.add(item.value);
        } else {
            next.delete(item.value);
        }
    }
    commit(next);
}
</script>

<template>
    <fieldset
        :id="field?.id"
        class="tao-checklist"
        :class="[sizeClass(size), { 'tao-checklist--strike': strike }]"
        :disabled="disabled"
        :aria-describedby="describedBy"
        :aria-invalid="invalid || undefined"
        :aria-labelledby="labelledBy"
    >
        <legend v-if="legend || counter" class="tao-checklist__legend">
            <span v-if="legend">{{ legend }}</span>
            <span v-if="counter" class="tao-checklist__counter" aria-live="polite">
                {{ formatText(l10n.counterText, { checked: checkedCount, total: items.length }) }}
            </span>
        </legend>

        <TaoCheckbox
            v-if="selectAll"
            class="tao-checklist__all"
            :model-value="allChecked"
            :indeterminate="someChecked"
            :label="l10n.selectAllLabel"
            :disabled="disabled || !enabledItems.length"
            :error="invalid"
            @update:model-value="setAll"
        />

        <ul class="tao-checklist__list" :class="{ 'tao-checklist__list--nested': selectAll }">
            <li
                v-for="item in items"
                :key="item.value"
                class="tao-checklist__item"
                :class="{ 'tao-checklist__item--checked': checked.has(item.value) }"
            >
                <TaoCheckbox
                    :model-value="checked.has(item.value)"
                    :disabled="disabled || item.disabled"
                    :error="invalid"
                    @update:model-value="setItem(item, $event)"
                >
                    <span class="tao-checklist__text">
                        <slot name="item" :item="item" :checked="checked.has(item.value)">
                            <span class="tao-checklist__label">{{ item.label }}</span>
                            <span v-if="item.description" class="tao-checklist__description">{{ item.description }}</span>
                        </slot>
                    </span>
                </TaoCheckbox>
            </li>
        </ul>
    </fieldset>
</template>

<style scoped>
.tao-checklist {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-2);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: none;
}

.tao-checklist__legend {
    display: flex;
    align-items: baseline;
    gap: var(--tao-space-2);
    padding: 0;
    margin-bottom: var(--tao-space-1);
    font-size: var(--tao-font-size-sm);
    font-weight: 500;
    color: var(--tao-color-text);
}

.tao-checklist__counter {
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    color: var(--tao-color-text-muted);
}

.tao-checklist__list {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
}

/* under «Select all» the items step in, so the hierarchy reads at a glance / под «Выбрать всё» пункты с отступом */
.tao-checklist__list--nested {
    padding-inline-start: calc(var(--tao-indicator-size) + var(--tao-space-2));
}

.tao-checklist__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.tao-checklist__description {
    font-size: var(--tao-control-font-size-secondary);
    color: var(--tao-color-text-muted);
}

/* a look only: the checkbox still tells the state / только вид: состояние говорит чекбокс */
.tao-checklist__label {
    text-decoration-line: none;
    text-decoration-thickness: 1.5px;
    transition:
        color var(--tao-duration-base) var(--tao-ease-base),
        text-decoration-color var(--tao-duration-base) var(--tao-ease-base);
}

.tao-checklist--strike .tao-checklist__item--checked .tao-checklist__label {
    color: var(--tao-color-text-muted);
    text-decoration-line: line-through;
    text-decoration-color: var(--tao-color-text-muted);
}

@media (prefers-reduced-motion: reduce) {
    .tao-checklist__label {
        transition: none;
    }
}
</style>
