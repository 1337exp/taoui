<script lang="ts" setup>
import { computed, ref, useId } from 'vue';

defineOptions({ name: 'TaoSpoiler' });

const props = withDefaults(
    defineProps<{
        title?: string;
        defaultOpen?: boolean;
        modelValue?: boolean;
    }>(),
    {
        title: '',
        defaultOpen: false,
        modelValue: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
}>();

const panelId = useId();
const internal = ref(props.defaultOpen);
const isControlled = computed(() => props.modelValue !== undefined);
const isOpen = computed(() => (isControlled.value ? Boolean(props.modelValue) : internal.value));

function toggle() {
    const next = !isOpen.value;
    if (!isControlled.value) {
        internal.value = next;
    }
    emit('update:modelValue', next);
}

function onBeforeEnter(el: Element) {
    (el as HTMLElement).style.height = '0';
}

function onEnter(el: Element) {
    const element = el as HTMLElement;
    requestAnimationFrame(() => {
        element.style.height = `${element.scrollHeight}px`;
    });
}

function onAfterEnter(el: Element) {
    (el as HTMLElement).style.height = 'auto';
}

function onLeave(el: Element) {
    const element = el as HTMLElement;
    element.style.height = `${element.scrollHeight}px`;
    requestAnimationFrame(() => {
        element.style.height = '0';
    });
}
</script>

<template>
    <div class="tao-spoiler">
        <button
            type="button"
            class="tao-spoiler__header"
            :aria-expanded="isOpen"
            :aria-controls="panelId"
            @click="toggle"
        >
            <span class="tao-spoiler__icon" :class="{ 'tao-spoiler__icon--open': isOpen }">▶</span>
            <span v-if="title || $slots.title" class="tao-spoiler__title">
                <slot name="title">{{ title }}</slot>
            </span>
        </button>
        <Transition
            name="tao-spoiler-slide"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @leave="onLeave"
        >
            <div v-if="isOpen" :id="panelId" class="tao-spoiler__content">
                <div class="tao-spoiler__content-inner">
                    <slot />
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.tao-spoiler {
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    overflow: hidden;
}

.tao-spoiler__header {
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    width: 100%;
    min-height: 40px;
    padding: var(--tao-space-3) var(--tao-space-4);
    background: var(--tao-color-surface-sunken);
    border: none;
    cursor: pointer;
    text-align: left;
}

.tao-spoiler__header:hover {
    background: var(--tao-color-surface-hover);
}

.tao-spoiler__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1em;
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-accent);
    transition: transform var(--tao-duration-base) var(--tao-ease-base);
}

.tao-spoiler__icon--open {
    transform: rotate(90deg);
}

.tao-spoiler__title {
    font-weight: 500;
    color: var(--tao-color-text);
}

.tao-spoiler__content {
    overflow: hidden;
}

.tao-spoiler-slide-enter-active,
.tao-spoiler-slide-leave-active {
    transition: height var(--tao-duration-slow) var(--tao-ease-base);
    overflow: hidden;
}

.tao-spoiler__content-inner {
    padding: var(--tao-space-4);
    background: var(--tao-color-surface);
}
</style>
