<script lang="ts" setup>
import { computed, inject } from 'vue';
import { useControlAttrs } from '../controlAttrs';
import { nativeFieldAttrs, useField } from '../formField';
import { sizeClass, type TaoSize } from '../size';
import { radioGroupKey, type TaoRadioValue } from '../radio';

defineOptions({ name: 'TaoRadio', inheritAttrs: false });

// the attributes go to the control, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — элементу управления, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

const props = withDefaults(
    defineProps<{
        value: TaoRadioValue;
        modelValue?: TaoRadioValue;
        name?: string;
        label?: string;
        disabled?: boolean;
        /** Red frame. The message goes to TaoFormField `error`. / Красная рамка. Текст ошибки — в `error` у TaoFormField. */
        /** The id of the control, which the label of a `TaoFormField` points at. / id элемента: на него указывает подпись `TaoFormField`. */
        id?: string;
        /** The field must be filled in (native `required`). / Поле обязательно (нативный `required`). */
        required?: boolean;
        /** Takes the focus when it appears. / Берёт фокус, когда появляется. */
        autofocus?: boolean;
        invalid?: boolean;
        /** Size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
    }>(),
    {
        label: '',
        disabled: false,
        invalid: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: TaoRadioValue];
}>();

const group = inject(radioGroupKey, null);
const { field, isInvalid, controlId: fieldId, localId } = useField(props);
// a radio in a group has an id of its own (the field's id belongs to the group), unless it is given one
const controlId = computed(() => (group ? props.id || localId : fieldId.value));
const describedBy = computed(() => (group ? undefined : field?.describedBy.value));

const isDisabled = computed(() => props.disabled || Boolean(group?.disabled.value));
const inputName = computed(() => group?.name.value ?? props.name);
const isChecked = computed(() => {
    const current = group ? group.model.value : props.modelValue;
    return current === props.value;
});

function onChange() {
    if (isDisabled.value) {
        return;
    }

    if (group) {
        group.setValue(props.value);
        return;
    }

    emit('update:modelValue', props.value);
}
</script>

<template>
    <label v-bind="rootAttrs()" class="tao-radio" :class="[sizeClass(size), { 'tao-radio--disabled': isDisabled, 'tao-radio--invalid': isInvalid && !group }]" :for="controlId">
        <input
            v-bind="{ ...controlAttrs(), ...nativeFieldAttrs(props) }"
            :id="controlId"
            class="tao-radio__input"
            type="radio"
            :name="inputName"
            :value="String(value)"
            :checked="isChecked"
            :disabled="isDisabled"
            :aria-invalid="(!group && isInvalid) || undefined"
            :aria-describedby="describedBy"
            @change="onChange"
        />
        <span class="tao-radio__dot" aria-hidden="true"></span>
        <span v-if="label" class="tao-radio__label">{{ label }}</span>
        <span v-else class="tao-radio__label"><slot /></span>
    </label>
</template>

<style scoped>
.tao-radio {
    /* holds its hidden input: an absolute one with no positioned parent lands against the page and stretches a
       scrolling container's document / держит скрытое поле: без позиционированного родителя оно встаёт от страницы
       и растягивает документ прокручиваемого контейнера */
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-2);
    cursor: pointer;
    user-select: none;
    color: var(--tao-color-text);
}

.tao-radio__input {
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

.tao-radio__dot {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--tao-indicator-size);
    height: var(--tao-indicator-size);
    pointer-events: none;
    background: var(--tao-color-surface-raised);
    border: 2px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-full);
    transition: var(--tao-transition-base);
}

.tao-radio__dot::after {
    content: '';
    width: calc(var(--tao-indicator-size) / 2 - 1px);
    height: calc(var(--tao-indicator-size) / 2 - 1px);
    background: transparent;
    border-radius: var(--tao-radius-full);
    transform: scale(0);
    transition: var(--tao-transition-base);
}

.tao-radio__input:checked + .tao-radio__dot {
    border-color: var(--tao-color-accent);
}

.tao-radio__input:checked + .tao-radio__dot::after {
    background: var(--tao-color-accent);
    transform: scale(1);
}

.tao-radio__input:focus-visible + .tao-radio__dot {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 1px;
}

.tao-radio__label {
    font-size: var(--tao-control-font-size-secondary);
    color: var(--tao-color-text);
}

.tao-radio--disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.tao-radio--invalid .tao-radio__dot {
    border-color: var(--tao-color-danger);
}
</style>
