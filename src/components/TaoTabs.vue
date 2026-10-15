<script lang="ts" setup>
import { computed, nextTick, useId } from 'vue';
import { sizeClass, type TaoSize } from '../size';
import { tabValue, type TaoTabItem } from '../tabs';

defineOptions({ name: 'TaoTabs' });

const props = withDefaults(
    defineProps<{
        /** Tabs: `{ value, label, disabled? }`, same shape as Select options. / Вкладки, как опции Select. */
        items?: TaoTabItem[];
        /** @deprecated Use `items`, same as TaoBreadcrumb / TaoStages. / Используйте `items`. */
        tabs?: TaoTabItem[];
        modelValue: string;
        /** Выравнивание вкладок по горизонтали (CSS justify-content). */
        justify?: string;
        /** Size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
    }>(),
    {
        items: undefined,
        tabs: undefined,
        justify: '',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
    /** The user picked another tab. / Пользователь выбрал другую вкладку. */
    change: [value: string];
}>();
const uid = useId();

const list = computed(() => props.items ?? props.tabs ?? []);
const enabledTabs = computed(() => list.value.filter((tab) => !tab.disabled));

function tabId(key: string) {
    return `${uid}-${key}`;
}

function panelId(key: string) {
    return `${uid}-panel-${key}`;
}

function selectTab(key: string, focus = false) {
    const tab = list.value.find((item) => tabValue(item) === key);
    if (tab && !tab.disabled) {
        emit('update:modelValue', key);
        if (key !== props.modelValue) {
            emit('change', key);
        }
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
    const current = enabled.findIndex((tab) => tabValue(tab) === props.modelValue);
    const next = enabled[(current + delta + enabled.length) % enabled.length];
    selectTab(tabValue(next), true);
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
        const first = enabledTabs.value[0];
        selectTab(first ? tabValue(first) : props.modelValue, true);
        return;
    }
    if (event.key === 'End') {
        event.preventDefault();
        const last = enabledTabs.value[enabledTabs.value.length - 1];
        selectTab(last ? tabValue(last) : props.modelValue, true);
    }
}
</script>

<template>
    <div class="tao-tabs" :class="sizeClass(size)">
        <div class="tao-tabs__list" :style="{ justifyContent: justify || undefined }" role="tablist" @keydown="onKeydown">
            <button
                v-for="tab in list"
                :key="tabValue(tab)"
                type="button"
                class="tao-tabs__tab"
                role="tab"
                :id="tabId(tabValue(tab))"
                :aria-selected="tabValue(tab) === modelValue"
                :aria-controls="panelId(tabValue(tab))"
                :tabindex="tabValue(tab) === modelValue ? 0 : -1"
                :disabled="tab.disabled"
                @click="selectTab(tabValue(tab))"
            >
                <slot v-if="$slots.label" name="label" :text="tab.label" :value="tabValue(tab)" />
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
    min-height: var(--tao-control-height);
    margin-bottom: -1px;
    padding: 0 var(--tao-button-padding-x);
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--tao-color-text-subtle);
    font: inherit;
    font-size: var(--tao-control-font-size);
    font-weight: 500;
    cursor: pointer;
}

.tao-tabs__tab:hover:not(:disabled) {
    color: var(--tao-color-accent);
}

.tao-tabs__tab[aria-selected='true'] {
    color: var(--tao-color-accent);
    border-bottom-color: var(--tao-color-accent);
}

.tao-tabs__tab[aria-selected='true']:hover:not(:disabled) {
    color: var(--tao-color-accent);
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
