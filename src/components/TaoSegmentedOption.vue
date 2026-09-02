<script lang="ts" setup>
import { computed, inject, useId, useSlots } from 'vue';
import { type TaoRadioValue } from '../radio';
import { segmentedKey } from '../segmented';

defineOptions({ name: 'TaoSegmentedOption' });

const props = withDefaults(
    defineProps<{
        value: TaoRadioValue;
        modelValue?: TaoRadioValue;
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

const emit = defineEmits<{
    'update:modelValue': [value: TaoRadioValue];
    change: [value: TaoRadioValue];
}>();

const group = inject(segmentedKey, null);
const slots = useSlots();
const localId = useId();

const isDisabled = computed(() => props.disabled || Boolean(group?.disabled.value));
const inputName = computed(() => group?.name.value ?? props.name);
const size = computed(() => group?.size.value ?? 'medium');
const isChecked = computed(() => {
    const current = group ? group.model.value : props.modelValue;
    return current === props.value;
});

const hasLabel = computed(() => Boolean(props.label || slots.default));
const isIconOnly = computed(() => Boolean((props.icon || slots.icon) && !hasLabel.value));

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

function onChange() {
    if (isDisabled.value) {
        return;
    }

    if (group) {
        group.setValue(props.value);
        return;
    }

    emit('update:modelValue', props.value);
    emit('change', props.value);
}
</script>

<template>
    <label
        class="tao-segmented-option"
        :class="[
            `tao-segmented-option--${size}`,
            {
                'tao-segmented-option--checked': isChecked,
                'tao-segmented-option--disabled': props.disabled,
                'tao-segmented-option--icon-only': isIconOnly,
            },
        ]"
        :for="localId"
    >
        <input
            :id="localId"
            class="tao-segmented-option__input"
            type="radio"
            :name="inputName"
            :value="String(value)"
            :checked="isChecked"
            :disabled="isDisabled"
            :aria-label="ariaLabel"
            @change="onChange"
        />
        <span class="tao-segmented-option__face">
            <span v-if="icon || $slots.icon" class="tao-segmented-option__icon" aria-hidden="true">
                <slot name="icon">{{ icon }}</slot>
            </span>
            <span v-if="hasLabel" class="tao-segmented-option__label">
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
    flex: 0 0 auto;
    align-items: center;
    min-width: 0;
    cursor: pointer;
    user-select: none;
    color: var(--tao-color-text-muted);
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
    white-space: nowrap;
    transition:
        color var(--tao-duration-base) var(--tao-ease-base),
        background var(--tao-duration-base) var(--tao-ease-base);
}

.tao-segmented-option--small .tao-segmented-option__face {
    min-height: 20px;
    padding: 0 var(--tao-space-2);
    font-size: var(--tao-font-size-xs);
}

.tao-segmented-option--medium .tao-segmented-option__face {
    min-height: 24px;
    padding: 0 var(--tao-space-3);
    font-size: var(--tao-font-size-sm);
}

.tao-segmented-option--large .tao-segmented-option__face {
    min-height: 32px;
    padding: 0 var(--tao-space-4);
    font-size: var(--tao-font-size-md);
}

.tao-segmented-option--icon-only.tao-segmented-option--small .tao-segmented-option__face {
    min-width: 20px;
    padding: 0;
}

.tao-segmented-option--icon-only.tao-segmented-option--medium .tao-segmented-option__face {
    min-width: 24px;
    padding: 0;
}

.tao-segmented-option--icon-only.tao-segmented-option--large .tao-segmented-option__face {
    min-width: 32px;
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
    color: var(--tao-color-accent);
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
}

.tao-segmented-option:hover:not(.tao-segmented-option--disabled):not(.tao-segmented-option--checked) {
    color: var(--tao-color-text);
}

.tao-segmented-option--checked {
    color: var(--tao-color-accent);
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
