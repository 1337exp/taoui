<script lang="ts" setup>
// The value of a control that is not a native input (a select, a date, a colour, a slider): what a form submits and validates.
// A visually hidden text input holds it: a `hidden` one is never validated, so `required` would do nothing. Its focus goes to the
// control that owns it, so the native validation message points at something the user can see. Not exported: an inner part.
// Значение контрола, который не нативный input (select, дата, цвет, слайдер): то, что форма отправляет и проверяет. Держит его
// визуально скрытый текстовый input: `hidden` не проверяется, и `required` ничего бы не делал. Его фокус уходит контролу-хозяину,
// чтобы сообщение проверки указывало на то, что пользователь видит. Не экспортируется: внутренняя часть.
defineOptions({ name: 'TaoFormValue' });

import { ref, watch } from 'vue';

const props = defineProps<{
    name?: string;
    /** The submitted text; `null` and `undefined` submit nothing (an empty value). / Отправляемый текст; `null` и `undefined` — пустое значение. */
    value: string | number | null | undefined;
    required?: boolean;
    disabled?: boolean;
}>();

const emit = defineEmits<{ focus: [] }>();

// `form.reset()` puts the input back to its default value and tells Vue nothing, while the visible control still shows the model: the next
// submit would send the old default. After the reset the input is set to the model again (the reset itself is the parent's: it owns the model).
// `form.reset()` возвращает input к значению по умолчанию и ничего не говорит Vue, а видимый контрол всё ещё показывает модель:
// следующая отправка ушла бы со старым значением. После сброса input снова ставится по модели (сам сброс модели за родителем: она его).
const input = ref<HTMLInputElement | null>(null);
function afterReset() {
    setTimeout(() => {
        if (input.value) {
            input.value.value = String(props.value ?? '');
        }
    });
}
watch(
    input,
    (node, _old, onCleanup) => {
        const form = node?.form;
        if (!form) {
            return;
        }
        form.addEventListener('reset', afterReset);
        onCleanup(() => form.removeEventListener('reset', afterReset));
    },
    { flush: 'post' },
);
</script>

<template>
    <input
        v-if="name || required"
        ref="input"
        class="tao-sr-only"
        type="text"
        tabindex="-1"
        aria-hidden="true"
        autocomplete="off"
        :name="name"
        :value="value ?? ''"
        :required="required || undefined"
        :disabled="disabled || undefined"
        @focus="emit('focus')"
    />
</template>
