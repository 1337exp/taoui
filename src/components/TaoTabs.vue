<script lang="ts" setup>
interface Tab {
    key: string;
    label: string;
    disabled?: boolean;
}

interface Props {
    tabs: Tab[];
    modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

function selectTab(key: string) {
    const tab = props.tabs.find((t) => t.key === key);
    if (tab && !tab.disabled) {
        emit('update:modelValue', key);
    }
}
</script>

<template>
    <div class="tao-tabs">
        <ul class="tao-tabs__list">
            <li
                v-for="tab in tabs"
                :key="tab.key"
                :class="{ active: tab.key === modelValue, disabled: tab.disabled }"
            >
                <button
                    type="button"
                    class="tao-tabs__tab"
                    :disabled="tab.disabled"
                    @click="selectTab(tab.key)"
                >
                    <slot v-if="$slots.label" name="label" :text="tab.label" :value="tab.key" />
                    <template v-else>{{ tab.label }}</template>
                </button>
            </li>
        </ul>
        <div class="tao-tabs__content">
            <slot :active-tab="modelValue" />
        </div>
    </div>
</template>

<style scoped>
.tao-tabs {
    width: 100%;
    max-width: 600px;
    border-radius: var(--tao-radius-panel);
    overflow: hidden;
    border: 1px solid var(--tao-color-border);
    border-top: 0;
    box-shadow: var(--tao-shadow-sm);
}

.tao-tabs__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    background: var(--tao-color-surface-sunken);
    user-select: none;
}

.tao-tabs__list li {
    flex: 1;
    min-width: 0;
}

.tao-tabs__tab {
    display: block;
    width: 100%;
    padding: var(--tao-space-3) 0;
    border: none;
    background: transparent;
    color: var(--tao-color-text);
    font: inherit;
    font-size: var(--tao-font-size-md);
    font-weight: 500;
    text-align: center;
    cursor: pointer;
}

.tao-tabs__list li.active .tao-tabs__tab {
    background: var(--tao-color-accent);
    color: var(--tao-color-on-accent);
}

.tao-tabs__list li.disabled .tao-tabs__tab {
    cursor: not-allowed;
    background: var(--tao-color-surface);
    color: var(--tao-color-text-disabled);
}

.tao-tabs__list li:not(.active, .disabled) .tao-tabs__tab:hover {
    background: var(--tao-color-surface-hover);
    color: var(--tao-color-text-strong);
}

.tao-tabs__content {
    min-height: 200px;
    max-height: 350px;
    padding: var(--tao-space-5);
    overflow: auto;
    background: var(--tao-color-surface);
}
</style>
