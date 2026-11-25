<script lang="ts" setup>
// The value of a control that is not a native input (a select, a date, a colour, a slider): what a form submits and validates.
// A visually hidden text input holds it: a `hidden` one is never validated, so `required` would do nothing. Its focus goes to the
// control that owns it, so the native validation message points at something the user can see. Not exported: an inner part.
// Значение контрола, который не нативный input (select, дата, цвет, слайдер): то, что форма отправляет и проверяет. Держит его
// визуально скрытый текстовый input: `hidden` не проверяется, и `required` ничего бы не делал. Его фокус уходит контролу-хозяину,
// чтобы сообщение проверки указывало на то, что пользователь видит. Не экспортируется: внутренняя часть.
defineOptions({ name: 'TaoFormValue' });

defineProps<{
    name?: string;
    /** The submitted text; `null` and `undefined` submit nothing (an empty value). / Отправляемый текст; `null` и `undefined` — пустое значение. */
    value: string | number | null | undefined;
    required?: boolean;
    disabled?: boolean;
}>();

const emit = defineEmits<{ focus: [] }>();
</script>

<template>
    <input
        v-if="name || required"
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
