<script lang="ts" setup>
import { ref } from 'vue';
import { useField } from '../formField';
import { sizeClass, type TaoSize } from '../size';

defineOptions({ name: 'TaoInput' });

interface Props {
    modelValue?: string | number;
    type?: 'text' | 'password' | 'email' | 'number' | 'tel';
    placeholder?: string;
    disabled?: boolean;
    /** Control size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
    size?: TaoSize;
    /** Red frame. The message goes to TaoFormField `error`. / Красная рамка. Текст ошибки — в `error` у TaoFormField. */
    error?: boolean;
    id?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    error: false,
});

const { field, controlId, invalid, describedBy } = useField(props);
const focused = ref(false);

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
}

function handleBlur(event: FocusEvent) {
    focused.value = false;
    emit('blur', event);
}

function handleFocus(event: FocusEvent) {
    focused.value = true;
    emit('focus', event);
}
</script>

<template>
    <div class="tao-input-wrapper" :class="sizeClass(size)">
        <div
            class="tao-input-shell"
            :class="{
                'tao-input-shell--focused': focused,
                'tao-input-shell--invalid': invalid,
                'tao-input-shell--disabled': disabled,
                'tao-input-shell--prefix': $slots.prefix,
                'tao-input-shell--suffix': $slots.suffix,
            }"
        >
            <span v-if="$slots.prefix" class="tao-input__affix tao-input__affix--prefix">
                <slot name="prefix" />
            </span>
            <input
                :id="controlId"
                class="tao-input"
                :class="{ 'tao-input--error': invalid }"
                :type="type"
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :aria-invalid="invalid || undefined"
                :aria-describedby="describedBy"
                @input="handleInput"
                @blur="handleBlur"
                @focus="handleFocus"
            />
            <span v-if="$slots.suffix" class="tao-input__affix tao-input__affix--suffix">
                <slot name="suffix" />
            </span>
        </div>
    </div>
</template>

<style scoped>
.tao-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-1);
    width: 100%;
}

.tao-input__label {
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text);
    font-weight: 500;
}

.tao-input-shell {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    min-height: var(--tao-control-height);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    transition: var(--tao-transition-base);
}

.tao-input {
    flex: 1 1 auto;
    min-width: 0;
    width: 100%;
    margin: 0;
    /* shell height minus its 1px borders / высота оболочки без рамок */
    min-height: calc(var(--tao-control-height) - 2px);
    padding: 0 var(--tao-control-padding-x);
    border: none;
    border-radius: inherit;
    background: transparent;
    color: inherit;
    font-size: var(--tao-control-font-size);
    font-family: inherit;
    line-height: 1.25;
}

.tao-input-shell--prefix .tao-input {
    padding-left: 0;
}

.tao-input-shell--suffix .tao-input {
    padding-right: 0;
}

.tao-input::placeholder {
    color: var(--tao-color-input-placeholder);
}

.tao-input:focus {
    outline: none;
}

.tao-input-shell--focused {
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-input-shell--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    color: var(--tao-color-input-disabled-text);
    background: var(--tao-color-input-disabled-bg);
}

.tao-input:disabled {
    cursor: not-allowed;
}

.tao-input-shell--invalid {
    border-color: var(--tao-color-danger);
}

.tao-input-shell--invalid.tao-input-shell--focused {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-input__affix {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--tao-space-1);
    color: var(--tao-color-text-muted);
    font-size: var(--tao-control-font-size-secondary);
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
}

.tao-input__affix--prefix {
    padding-left: var(--tao-control-padding-x);
    padding-right: var(--tao-space-2);
}

.tao-input__affix--suffix {
    padding-right: var(--tao-control-padding-x);
    padding-left: var(--tao-space-2);
}

.tao-input__affix :deep(svg) {
    display: block;
    width: 16px;
    height: 16px;
}

.tao-input__affix :deep(button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    line-height: 1;
    cursor: pointer;
}

.tao-input__affix :deep(button:hover) {
    color: var(--tao-color-text-strong);
}

.tao-input__affix :deep(button:focus-visible) {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

.tao-input__error {
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-danger-text);
}
</style>
