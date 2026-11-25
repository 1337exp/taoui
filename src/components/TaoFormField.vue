<script lang="ts" setup>
import { computed, provide, useId, useSlots } from 'vue';
import { formFieldKey } from '../formField';
import { sizeClass, type TaoSize } from '../size';
import { slotHas } from '../slots';

defineOptions({ name: 'TaoFormField' });

const props = defineProps<{
    label?: string;
    hint?: string;
    error?: string;
    /** Size of the control inside. / Размер контрола внутри. */
    size?: TaoSize;
}>();

const slots = useSlots();
// what stands after the label (a help hint, a link): a slot counts when it draws something, not when it merely exists
// то, что стоит после подписи (подсказка «?», ссылка): слот считается, когда он что-то рисует, а не когда он просто есть
const hasLabelEnd = () => slotHas(slots, 'label-end');

const id = useId();
const hintId = `${id}-hint`;
const errorId = `${id}-error`;
const labelId = `${id}-label`;
const invalid = computed(() => Boolean(props.error));
const describedBy = computed(() => {
    if (props.error) {
        return errorId;
    }

    if (props.hint) {
        return hintId;
    }

    return undefined;
});

const labelledBy = computed(() => (props.label ? labelId : undefined));

provide(formFieldKey, {
    id,
    invalid,
    describedBy,
    labelId: labelledBy,
});

function onLabelClick() {
    const target = document.getElementById(id);
    if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLButtonElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
    ) {
        return;
    }

    const scope = target ?? document.getElementById(labelId)?.parentElement;
    scope
        ?.querySelector<HTMLElement>(
            'input:not([disabled]), button:not([disabled]), textarea:not([disabled]), select:not([disabled])',
        )
        ?.focus();
}
</script>

<template>
    <div class="tao-form-field" :class="[sizeClass(size), { 'tao-form-field--invalid': invalid }]">
        <!-- the extra content is a sibling of the label, not inside it: a button in a label would take the label's clicks and read as part of its name -->
        <!-- добавочное содержимое рядом с подписью, а не внутри неё: кнопка в label забирала бы её клики и читалась как часть имени -->
        <div v-if="hasLabelEnd()" class="tao-form-field__head">
            <label v-if="label" :id="labelId" class="tao-form-field__label" :for="id" @click="onLabelClick">{{ label }}</label>
            <slot name="label-end" />
        </div>
        <label v-else-if="label" :id="labelId" class="tao-form-field__label" :for="id" @click="onLabelClick">{{ label }}</label>
        <slot />
        <p v-if="error" :id="errorId" class="tao-form-field__error">{{ error }}</p>
        <p v-else-if="hint" :id="hintId" class="tao-form-field__hint">{{ hint }}</p>
    </div>
</template>

<style scoped>
.tao-form-field {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-1);
    width: 100%;
}

.tao-form-field__label {
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text);
    font-weight: 500;
}

.tao-form-field__head {
    display: flex;
    align-items: center;
    gap: var(--tao-space-1);
}

.tao-form-field__hint {
    margin: 0;
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-text-muted);
}

.tao-form-field__error {
    margin: 0;
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-danger-text);
}
</style>
