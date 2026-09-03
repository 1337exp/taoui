<script lang="ts" setup>
import { computed, nextTick, useId } from 'vue';

defineOptions({ name: 'TaoTabs' });

interface Tab {
    key: string;
    label: string;
    disabled?: boolean;
}

const props = defineProps<{
    tabs: Tab[];
    modelValue: string;
}>();

const emit = defineEmits(['update:modelValue']);
const uid = useId();

const enabledTabs = computed(() => props.tabs.filter((tab) => !tab.disabled));

function tabId(key: string) {
    return `${uid}-${key}`;
}

function panelId(key: string) {
    return `${uid}-panel-${key}`;
}

function selectTab(key: string, focus = false) {
    const tab = props.tabs.find((item) => item.key === key);
    if (tab && !tab.disabled) {
        emit('update:modelValue', key);
        if (focus) {
            void nextTick(() => document.getElementById(tabId(key))?.focus());
        }
    }
}

function move(delta: number) {
    const enabled = enabledTabs.value;
    if (!enabled.length) {
        return;
    }
    const current = enabled.findIndex((tab) => tab.key === props.modelValue);
    const next = enabled[(current + delta + enabled.length) % enabled.length];
    selectTab(next.key, true);
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        move(1);
        return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        move(-1);
        return;
    }
    if (event.key === 'Home') {
        event.preventDefault();
        selectTab(enabledTabs.value[0]?.key ?? props.modelValue, true);
        return;
    }
    if (event.key === 'End') {
        event.preventDefault();
        const last = enabledTabs.value[enabledTabs.value.length - 1];
        selectTab(last?.key ?? props.modelValue, true);
    }
}
</script>

<template>
    <div class="tao-tabs">
        <div class="tao-tabs__list" role="tablist" @keydown="onKeydown">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                type="button"
                class="tao-tabs__tab"
                role="tab"
                :id="tabId(tab.key)"
                :aria-selected="tab.key === modelValue"
                :aria-controls="panelId(tab.key)"
                :tabindex="tab.key === modelValue ? 0 : -1"
                :disabled="tab.disabled"
                @click="selectTab(tab.key)"
            >
                <slot v-if="$slots.label" name="label" :text="tab.label" :value="tab.key" />
                <template v-else>{{ tab.label }}</template>
            </button>
        </div>
        <div
            class="tao-tabs__content"
            role="tabpanel"
            :id="panelId(modelValue)"
            :aria-labelledby="tabId(modelValue)"
        >
            <slot :active-tab="modelValue" />
        </div>
    </div>
</template>

<style scoped>
.tao-tabs {
    width: 100%;
}

.tao-tabs__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--tao-space-1);
    margin: 0;
    padding: 0;
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-tabs__tab {
    margin-bottom: -1px;
    padding: var(--tao-space-2) var(--tao-space-4);
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--tao-color-text-subtle);
    font: inherit;
    font-size: var(--tao-font-size-md);
    font-weight: 500;
    cursor: pointer;
}

.tao-tabs__tab:hover:not(:disabled) {
    color: var(--tao-color-text-strong);
}

.tao-tabs__tab[aria-selected='true'] {
    color: var(--tao-color-accent);
    border-bottom-color: var(--tao-color-accent);
}

.tao-tabs__tab:disabled {
    cursor: not-allowed;
    color: var(--tao-color-text-disabled);
}

.tao-tabs__tab:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
    border-radius: var(--tao-radius-control) var(--tao-radius-control) 0 0;
}

.tao-tabs__content {
    padding: var(--tao-space-4) 0 0;
    color: var(--tao-color-text);
}
</style>
