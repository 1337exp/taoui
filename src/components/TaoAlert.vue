<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { computed } from 'vue';
import { toneClass, type TaoTone } from '../tone';
import { useLocaleText } from '../locale';
defineOptions({ name: 'TaoAlert' });

const props = withDefaults(
    defineProps<{
        /** Status color. / Цвет статуса. */
        tone?: TaoTone;
        title?: string;
        closable?: boolean;
        closeLabel?: string;
    }>(),
    {
        tone: 'info',
        title: '',
        closable: false,
    },
);
const l10n = useLocaleText(props, 'alert');

const emit = defineEmits<{
    close: [];
}>();

const isUrgent = computed(() => props.tone === 'danger' || props.tone === 'warning');
</script>

<template>
    <div
        class="tao-alert"
        :class="toneClass(tone)"
        :role="tone === 'danger' ? 'alert' : 'status'"
        :aria-live="isUrgent ? 'assertive' : 'polite'"
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
                <slot name="close-icon"><TaoIcon name="tao-close" /></slot>
            </span>
        </button>
    </div>
</template>

<style scoped>
.tao-alert {
    --tao-alert-tone: var(--tao-tone);

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
