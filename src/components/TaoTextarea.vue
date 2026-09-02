<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, ref, useId, watch } from 'vue';
import { formFieldKey } from '../formField';

defineOptions({ name: 'TaoTextarea' });

const props = withDefaults(
    defineProps<{
        placeholder?: string;
        spellcheck?: boolean;
        autocomplete?: string;
        minlength?: number;
        maxlength?: number;
        disabled?: boolean;
        noSpace?: boolean;
        dummy?: boolean;
        rows?: number;
        resize?: boolean;
        modelValue?: string;
        noBorder?: boolean;
        noBackground?: boolean;
        autoFocus?: boolean;
        borderInverse?: boolean;
        textCenter?: boolean;
        submitOnEnter?: boolean;
        error?: boolean;
        id?: string;
    }>(),
    {
        placeholder: '',
        spellcheck: true,
        autocomplete: '',
        minlength: 0,
        maxlength: undefined,
        disabled: false,
        noSpace: false,
        dummy: false,
        rows: 3,
        resize: true,
        modelValue: '',
        noBorder: false,
        noBackground: false,
        autoFocus: false,
        borderInverse: false,
        textCenter: false,
        submitOnEnter: false,
        error: false,
    },
);

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'keydown']);

const field = inject(formFieldKey, null);
const localId = useId();
const controlId = computed(() => props.id || field?.id || localId);
const invalid = computed(() => props.error || Boolean(field?.invalid.value));
const describedBy = computed(() => field?.describedBy.value);

const textareaRef = ref<HTMLTextAreaElement | null>(null);

function onInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    emit('update:modelValue', target.value);
    autoResize();
}

function onChange(e: Event) {
    emit('change', (e.target as HTMLTextAreaElement).value);
}

function onFocus(e: FocusEvent) {
    emit('focus', e);
}

function onBlur(e: FocusEvent) {
    emit('blur', e);
}

function onKeydown(event: KeyboardEvent) {
    emit('keydown', event);

    if (props.submitOnEnter && event.key === 'Enter' && !event.shiftKey) {
        textareaRef.value?.blur();
        event.preventDefault();
        return;
    }

    if (props.noSpace && event.key === ' ') {
        event.preventDefault();
    }
}

function autoResize() {
    const textarea = textareaRef.value;
    if (!textarea) {
        return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 500)}px`;
}

watch(
    () => props.modelValue,
    () => {
        nextTick(autoResize);
    },
);

onMounted(() => {
    if (props.autoFocus) {
        textareaRef.value?.focus();
    }
    nextTick(autoResize);
});
</script>

<template>
    <span v-if="dummy" class="tao-textarea tao-textarea--dummy">{{ modelValue }}</span>
    <textarea
        v-else
        :id="controlId"
        ref="textareaRef"
        class="tao-textarea"
        :class="{
            'tao-textarea--inverse': borderInverse,
            'tao-textarea--center': textCenter,
            'tao-textarea--no-border': noBorder,
            'tao-textarea--no-background': noBackground,
            'tao-textarea--no-resize': !resize,
            'tao-textarea--invalid': invalid,
        }"
        :placeholder="placeholder"
        :spellcheck="spellcheck"
        :autocomplete="autocomplete"
        :minlength="minlength"
        :maxlength="maxlength"
        :disabled="disabled"
        :rows="rows"
        :value="modelValue"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
        draggable="false"
        @input="onInput"
        @change="onChange"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
    ></textarea>
</template>

<style scoped>
.tao-textarea {
    width: 100%;
    min-height: 31px;
    height: auto;
    padding: var(--tao-space-2);
    font-size: var(--tao-font-size-sm);
    font-family: var(--tao-font-family);
    letter-spacing: 0.01rem;
    line-height: 1.4;
    border: none;
    border-left: 4px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-sm);
    background-color: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    outline: none;
    resize: vertical;
    transition: var(--tao-transition-base);
}

.tao-textarea::placeholder {
    color: var(--tao-color-input-placeholder);
}

.tao-textarea:focus {
    border-color: var(--tao-color-accent);
}

.tao-textarea--invalid {
    border-color: var(--tao-color-danger);
}

.tao-textarea--inverse {
    border-left: none;
    border-right: 4px solid var(--tao-color-border-strong);
}

.tao-textarea--center {
    text-align: center;
}

.tao-textarea--no-border {
    border: none;
}

.tao-textarea--no-background {
    background-color: transparent;
}

.tao-textarea--no-resize {
    resize: none;
}

.tao-textarea--dummy {
    display: block;
    min-height: 31px;
    height: auto;
    border-color: var(--tao-color-danger);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}
</style>
