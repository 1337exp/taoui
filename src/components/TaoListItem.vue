<script lang="ts" setup>
import { computed, inject, useSlots } from 'vue';
import { taoListKey, type TaoListSize } from '../list';

defineOptions({ name: 'TaoListItem' });

const props = withDefaults(
    defineProps<{
        title?: string;
        description?: string;
        selected?: boolean;
        disabled?: boolean;
        /** Подсветка без selected — курсор / клавиатура. */
        active?: boolean;
        /** Строка-кнопка: Enter/Space, курсор pointer. */
        clickable?: boolean;
        size?: TaoListSize;
        /** `#action` всегда на виду, не только по ховеру. */
        actionAlways?: boolean;
    }>(),
    {
        title: '',
        description: '',
        selected: false,
        disabled: false,
        active: false,
        clickable: false,
        actionAlways: false,
    },
);

const emit = defineEmits<{
    click: [event: MouseEvent];
}>();

const slots = useSlots();
const list = inject(taoListKey, null);

const sizeClass = computed(() => {
    const size: TaoListSize = props.size ?? list?.size.value ?? 'medium';
    if (size === 'small') {
        return 's';
    }
    if (size === 'large') {
        return 'l';
    }
    return 'm';
});

const hasAction = computed(() => Boolean(slots.action));
const hasPrefix = computed(() => Boolean(slots.prefix));
const hasSuffix = computed(() => Boolean(slots.suffix));
const hasDescription = computed(() => Boolean(props.description || slots.description));

function onHitClick(event: MouseEvent) {
    if (props.disabled || !props.clickable) {
        return;
    }
    emit('click', event);
}
</script>

<template>
    <li
        class="tao-list-item"
        :class="[
            `tao-list-item--${sizeClass}`,
            {
                'tao-list-item--selected': selected,
                'tao-list-item--disabled': disabled,
                'tao-list-item--active': active,
                'tao-list-item--clickable': clickable,
                'tao-list-item--has-action': hasAction,
                'tao-list-item--action-always': actionAlways,
            },
        ]"
        :aria-current="!clickable && selected ? 'true' : undefined"
        :aria-disabled="disabled || undefined"
    >
        <component
            :is="clickable ? 'button' : 'div'"
            class="tao-list-item__hit"
            :type="clickable ? 'button' : undefined"
            :disabled="clickable ? disabled : undefined"
            :aria-current="clickable && selected ? 'true' : undefined"
            @click="onHitClick"
        >
            <span v-if="hasPrefix" class="tao-list-item__prefix">
                <slot name="prefix" />
            </span>
            <span class="tao-list-item__text">
                <span class="tao-list-item__title">
                    <slot>{{ title }}</slot>
                </span>
                <span v-if="hasDescription" class="tao-list-item__description">
                    <slot name="description">{{ description }}</slot>
                </span>
            </span>
            <span v-if="hasSuffix" class="tao-list-item__suffix">
                <slot name="suffix" />
            </span>
        </component>
        <div
            v-if="hasAction"
            class="tao-list-item__action"
            @click.stop
            @keydown.stop
        >
            <slot name="action" />
        </div>
    </li>
</template>

<style scoped>
.tao-list-item {
    display: flex;
    align-items: center;
    gap: var(--tao-space-1);
    min-width: 0;
    color: var(--tao-color-text);
    transition: background var(--tao-duration-fast) var(--tao-ease-base);
}

.tao-list-item--s {
    min-height: 32px;
    padding: 0 var(--tao-space-1) 0 var(--tao-space-2);
}

.tao-list-item--m {
    min-height: 36px;
    padding: 0 var(--tao-space-2) 0 var(--tao-space-3);
}

.tao-list-item--l {
    min-height: 48px;
    padding: var(--tao-space-1) var(--tao-space-2) var(--tao-space-1) var(--tao-space-3);
}

.tao-list-item:hover:not(.tao-list-item--disabled),
.tao-list-item--active:not(.tao-list-item--disabled) {
    background: var(--tao-color-surface-hover);
}

.tao-list-item--selected {
    background: var(--tao-color-accent-subtle);
}

.tao-list-item--selected:hover:not(.tao-list-item--disabled),
.tao-list-item--selected.tao-list-item--active:not(.tao-list-item--disabled) {
    background: var(--tao-color-accent-subtle-hover);
}

.tao-list-item--disabled {
    opacity: 0.5;
}

.tao-list-item__hit {
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    padding: var(--tao-space-2) 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
}

.tao-list-item--s .tao-list-item__hit {
    padding: var(--tao-space-1) 0;
    gap: var(--tao-space-2);
}

.tao-list-item--l .tao-list-item__hit {
    padding: var(--tao-space-2) 0;
}

button.tao-list-item__hit {
    cursor: pointer;
}

button.tao-list-item__hit:disabled {
    cursor: not-allowed;
}

button.tao-list-item__hit:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-list-item__prefix {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    color: var(--tao-color-text-muted);
}

.tao-list-item__prefix :deep(.tao-avatar) {
    display: block;
}

.tao-list-item__text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1 1 auto;
    min-width: 0;
}

.tao-list-item__title {
    min-width: 0;
    overflow: hidden;
    font-size: var(--tao-font-size-md);
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-list-item--s .tao-list-item__title {
    font-size: var(--tao-font-size-sm);
}

.tao-list-item--selected .tao-list-item__title {
    color: var(--tao-color-accent);
}

.tao-list-item--clickable .tao-list-item__title {
    user-select: none;
}

.tao-list-item__description {
    min-width: 0;
    overflow: hidden;
    color: var(--tao-color-text-muted);
    font-size: var(--tao-font-size-xs);
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-list-item__suffix {
    flex-shrink: 0;
    color: var(--tao-color-text-muted);
    font-size: var(--tao-font-size-xs);
    white-space: nowrap;
}

.tao-list-item__action {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
}

@media (hover: hover) {
    .tao-list-item--has-action:not(.tao-list-item--action-always) .tao-list-item__action {
        opacity: 0;
    }

    .tao-list-item--has-action:not(.tao-list-item--action-always):hover .tao-list-item__action,
    .tao-list-item--has-action:not(.tao-list-item--action-always):focus-within .tao-list-item__action {
        opacity: 1;
    }
}
</style>
