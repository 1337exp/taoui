<script lang="ts" setup>
import { computed } from 'vue';
import type { TaoTone } from '../tone';
import { warnDeprecated } from '../deprecate';
import { useLocaleText } from '../locale';
defineOptions({ name: 'TaoAlert' });

const props = withDefaults(
    defineProps<{
        /** Status color; `error` is an alias of `danger`. / Цвет статуса; `error` — алиас `danger`. */
        tone?: TaoTone | 'error';
        /** @deprecated Use `tone`, same as TaoButton. / Используйте `tone`, как у TaoButton. */
        type?: TaoTone | 'error';
        title?: string;
        closable?: boolean;
        closeLabel?: string;
    }>(),
    {
        tone: undefined,
        type: undefined,
        title: '',
        closable: false,
    },
);
const l10n = useLocaleText(props, 'alert');

const emit = defineEmits<{
    close: [];
}>();

const resolvedTone = computed(() => {
    const value = props.tone ?? props.type ?? 'info';
    return value === 'danger' ? 'error' : value;
});
const live = computed(() =>
    resolvedTone.value === 'error' || resolvedTone.value === 'warning' ? 'assertive' : 'polite',
);

warnDeprecated('TaoAlert', {
    type: 'use `tone`',
});
</script>

<template>
    <div
        class="tao-alert"
        :class="`tao-alert--${resolvedTone}`"
        :role="resolvedTone === 'error' ? 'alert' : 'status'"
        :aria-live="live"
    >
        <div class="tao-alert__body">
            <strong v-if="title" class="tao-alert__title">{{ title }}</strong>
            <p v-if="$slots.default" class="tao-alert__message"><slot /></p>
        </div>
        <button
            v-if="closable"
            type="button"
            class="tao-alert__close"
            :aria-label="l10n.closeLabel"
            @click="emit('close')"
        >
            <span aria-hidden="true">
                <slot name="close-icon">&times;</slot>
            </span>
        </button>
    </div>
</template>

<style scoped>
.tao-alert {
    --tao-alert-tone: var(--tao-color-info);

    display: flex;
    align-items: flex-start;
    gap: var(--tao-space-3);
    width: 100%;
    padding: var(--tao-space-3) var(--tao-space-4);
    background: color-mix(in srgb, var(--tao-alert-tone) 10%, var(--tao-color-surface-raised));
    color: var(--tao-color-text);
    border: 1px solid color-mix(in srgb, var(--tao-alert-tone) 35%, var(--tao-color-border));
    border-radius: var(--tao-radius-panel);
}

.tao-alert--success {
    --tao-alert-tone: var(--tao-color-success);
}

.tao-alert--error,
.tao-alert--danger {
    --tao-alert-tone: var(--tao-color-danger);
}

.tao-alert--warning {
    --tao-alert-tone: var(--tao-color-warning);
}

.tao-alert--info {
    --tao-alert-tone: var(--tao-color-info);
}

.tao-alert--neutral {
    --tao-alert-tone: var(--tao-color-text-muted);
}

.tao-alert__body {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-1);
    min-width: 0;
    flex: 1;
}

.tao-alert__title {
    font-size: var(--tao-font-size-md);
    font-weight: 600;
    color: var(--tao-color-text-strong);
}

.tao-alert__message {
    margin: 0;
    font-size: var(--tao-font-size-sm);
    line-height: 1.45;
    color: var(--tao-color-text);
}

.tao-alert__close {
    flex-shrink: 0;
    margin: calc(-1 * var(--tao-space-1)) calc(-1 * var(--tao-space-2)) 0 0;
    padding: 0;
    border: none;
    background: none;
    color: var(--tao-color-text-muted);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
}

.tao-alert__close:hover {
    color: var(--tao-color-text-strong);
}
</style>
