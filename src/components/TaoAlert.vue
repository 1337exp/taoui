<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { computed, ref, useId } from 'vue';
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
        /**
         * The body folds under the title; the title and the tone stay. Start folded with `v-model:collapsed="true"`.
         * Тело сворачивается под заголовок; заголовок и тон остаются. Свёрнутым с начала — `v-model:collapsed="true"`.
         */
        collapsible?: boolean;
        /** `v-model:collapsed`; without it the alert keeps the state itself. / Без него алерт хранит состояние сам. */
        collapsed?: boolean;
        /** The toggle text when there is no title. / Текст переключателя, когда нет заголовка. */
        detailsLabel?: string;
    }>(),
    {
        tone: 'info',
        title: '',
        closable: false,
        collapsible: false,
        collapsed: undefined,
        detailsLabel: undefined,
    },
);
const l10n = useLocaleText(props, 'alert');

const emit = defineEmits<{
    close: [];
    'update:collapsed': [value: boolean];
}>();

const ownCollapsed = ref(false);
const isCollapsed = computed(() => props.collapsible && (props.collapsed ?? ownCollapsed.value));
const bodyId = useId();

function setCollapsed(value: boolean) {
    ownCollapsed.value = value;
    emit('update:collapsed', value);
}

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
            <!-- collapsible: the title is the disclosure button / сворачиваемый: заголовок — кнопка раскрытия -->
            <button
                v-if="collapsible"
                type="button"
                class="tao-alert__toggle"
                :aria-expanded="!isCollapsed"
                :aria-controls="bodyId"
                @click="setCollapsed(!isCollapsed)"
            >
                <strong class="tao-alert__title">{{ title || l10n.detailsLabel }}</strong>
                <span class="tao-alert__chevron" :class="{ 'tao-alert__chevron--open': !isCollapsed }" aria-hidden="true">
                    <TaoIcon name="tao-chevron-down" />
                </span>
            </button>
            <strong v-else-if="title" class="tao-alert__title">{{ title }}</strong>
            <!-- folded text stays in the DOM and find-in-page opens it (hidden="until-found" + beforematch)
                 свёрнутый текст остаётся в DOM, поиск по странице его раскрывает -->
            <div
                v-if="$slots.default"
                :id="bodyId"
                class="tao-alert__message"
                :hidden.attr="isCollapsed ? 'until-found' : undefined"
                @beforematch="setCollapsed(false)"
            >
                <slot />
            </div>
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

/* folded: no gap under the title for a body of zero height / свёрнут: без зазора под заголовком */
.tao-alert__body:has(> .tao-alert__message[hidden]) {
    gap: 0;
}

/* the title as a button: no button look, the whole line toggles / заголовок-кнопка без вида кнопки */
.tao-alert__toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--tao-space-2);
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
}

.tao-alert__toggle:focus-visible {
    outline: 2px solid var(--tao-alert-tone);
    outline-offset: 2px;
    border-radius: var(--tao-radius-sm);
}

.tao-alert__chevron {
    display: inline-flex;
    flex: none;
    color: var(--tao-color-text-muted);
    transform: rotate(-90deg);
    transition: transform var(--tao-duration-base) var(--tao-ease-base);
}

.tao-alert__chevron--open {
    transform: none;
}

@media (prefers-reduced-motion: reduce) {
    .tao-alert__chevron {
        transition: none;
    }
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
