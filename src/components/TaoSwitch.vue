<script lang="ts" setup>
import {  } from 'vue';
import { useField } from '../formField';
import { sizeClass, type TaoSize } from '../size';

defineOptions({ name: 'TaoSwitch' });

const props = withDefaults(
    defineProps<{
        modelValue?: boolean;
        label?: string;
        disabled?: boolean;
        /** Red frame. The message goes to TaoFormField `error`. / Красная рамка. Текст ошибки — в `error` у TaoFormField. */
        error?: boolean;
        /** Size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
        /**
         * The change is being applied (a request is on its way): a spinner on the thumb, a click does nothing, and it is
         * not greyed out like a disabled switch. A screen reader hears it busy.
         * Изменение применяется (запрос в пути): на бегунке крутится кольцо, щелчок ничего не делает, и переключатель не
         * гаснет, как недоступный. Скринридер слышит «занят».
         */
        loading?: boolean;
    }>(),
    {
        modelValue: false,
        label: '',
        disabled: false,
        error: false,
        loading: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    change: [value: boolean];
}>();

const { field, controlId, invalid, describedBy } = useField(props);

function toggle(event?: Event) {
    if (props.disabled || props.loading) {
        // the native checkbox already flipped: put it back / нативный чекбокс уже переключился: возвращаем
        if (event?.target instanceof HTMLInputElement) {
            event.target.checked = props.modelValue;
        }
        return;
    }

    const next = !props.modelValue;
    emit('update:modelValue', next);
    emit('change', next);
}
</script>

<template>
    <label class="tao-switch" :class="[sizeClass(size), { 'tao-switch--disabled': disabled, 'tao-switch--on': modelValue, 'tao-switch--invalid': invalid, 'tao-switch--loading': loading }]" :for="controlId">
        <input
            :id="controlId"
            class="tao-switch__input"
            type="checkbox"
            role="switch"
            :checked="modelValue"
            :disabled="disabled"
            :aria-checked="modelValue"
            :aria-invalid="invalid || undefined"
            :aria-describedby="describedBy"
            :aria-busy="loading || undefined"
            @change="toggle"
        />
        <span class="tao-switch__track" aria-hidden="true">
            <span class="tao-switch__thumb"></span>
        </span>
        <span v-if="label" class="tao-switch__label">{{ label }}</span>
        <span v-else-if="$slots.default" class="tao-switch__label"><slot /></span>
    </label>
</template>

<style scoped>
.tao-switch {
    /* track: 36 × 20 at medium / дорожка 36 × 20 в medium */
    --tao-switch-height: calc(var(--tao-indicator-size) + 2px);
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-2);
    cursor: pointer;
    user-select: none;
    color: var(--tao-color-text);
}

.tao-switch__input {
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

.tao-switch__track {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    width: calc(var(--tao-switch-height) * 2 - 4px);
    height: var(--tao-switch-height);
    padding: 2px;
    pointer-events: none;
    background: var(--tao-color-surface-sunken);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-full);
    transition: var(--tao-transition-base);
}

.tao-switch__thumb {
    /* track minus padding and border / дорожка без padding и рамки */
    width: calc(var(--tao-switch-height) - 6px);
    height: calc(var(--tao-switch-height) - 6px);
    background: var(--tao-color-text-muted);
    border-radius: var(--tao-radius-full);
    transform: translateX(0);
    transition: var(--tao-transition-base);
}

.tao-switch--on .tao-switch__track {
    background: var(--tao-color-accent);
    border-color: var(--tao-color-accent);
}

.tao-switch--on .tao-switch__thumb {
    background: var(--tao-color-on-accent);
    /* track width − padding − border − thumb / ширина дорожки − padding − рамка − бегунок */
    transform: translateX(calc(var(--tao-switch-height) - 4px));
}

.tao-switch__input:focus-visible + .tao-switch__track {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

.tao-switch__label {
    font-size: var(--tao-control-font-size-secondary);
    color: var(--tao-color-text);
}

.tao-switch--disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.tao-switch--loading {
    cursor: progress;
}

/* the spinner: a ring on the thumb in the track's colour, one bright quarter running round
   кольцо на бегунке цветом дорожки, одна яркая четверть бежит по кругу */
.tao-switch__thumb {
    position: relative;
}

.tao-switch--loading .tao-switch__thumb::after {
    content: '';
    position: absolute;
    inset: 18%;
    border: 2px solid color-mix(in srgb, var(--tao-color-accent) 30%, transparent);
    border-top-color: var(--tao-color-accent);
    border-radius: var(--tao-radius-full);
    animation: tao-switch-spin 0.8s linear infinite;
}

/* off, the thumb is grey: a dark ring melts into it, a light one (the strong text colour) is seen in both themes
   выключен: бегунок серый, тёмное кольцо в нём тонет, светлое (цвет яркого текста) видно в обеих темах */
.tao-switch--loading:not(.tao-switch--on) .tao-switch__thumb::after {
    border-color: color-mix(in srgb, var(--tao-color-text-strong) 30%, transparent);
    border-top-color: var(--tao-color-text-strong);
}

@keyframes tao-switch-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .tao-switch--loading .tao-switch__thumb::after {
        animation-duration: 2.4s;
    }
}

.tao-switch--invalid .tao-switch__track {
    border-color: var(--tao-color-danger);
}
</style>
