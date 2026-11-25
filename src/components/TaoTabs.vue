<script lang="ts" setup>
import { computed, nextTick, useId } from 'vue';
import type { TaoJustify } from '../layout';
import { sizeClass, type TaoSize } from '../size';
import type { TaoTabItem } from '../tabs';
import { useRoving } from '../primitives/useRoving';

defineOptions({ name: 'TaoTabs' });

const props = withDefaults(
    defineProps<{
        /** Tabs: `{ value, label, disabled? }`, same shape as Select options. / Вкладки, как опции Select. */
        items?: TaoTabItem[];
        /** Where the tabs sit along the row, as in TaoFlex; without it they start at the left. / Где вкладки стоят в ряду, как у TaoFlex; без него — слева. */
        justify?: TaoJustify;
        /** Size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
    }>(),
    {
        items: undefined,
        justify: undefined,
    },
);

const model = defineModel<string>({ required: true });

const emit = defineEmits<{
    /** The user picked another tab. / Пользователь выбрал другую вкладку. */
}>();
const uid = useId();

const list = computed(() => props.items ?? []);
const enabledTabs = computed(() => list.value.filter((tab) => !tab.disabled));

function tabId(key: string) {
    return `${uid}-${key}`;
}

function panelId(key: string) {
    return `${uid}-panel-${key}`;
}

function selectTab(key: string, focus = false) {
    const tab = list.value.find((item) => item.value === key);
    if (tab && !tab.disabled) {
        model.value = key;
        if (focus) {
            void nextTick(() => document.getElementById(tabId(key))?.focus());
        }
    }
}

// One tab stop, the arrows (all four), Home and End walk the tabs that are not disabled and select the one they land on.
// Одна точка табуляции, стрелки (все четыре), Home и End ходят по вкладкам, которые не отключены, и выбирают ту, на которую пришли.
const activeIndex = computed({
    get: () => list.value.findIndex((tab) => tab.value === model.value),
    set: (index: number) => {
        const tab = list.value[index];
        if (tab) selectTab(tab.value, true);
    },
});
const nav = useRoving({ enabled: () => list.value.map((tab) => !tab.disabled), active: activeIndex, orientation: 'both' });
const onKeydown = (event: KeyboardEvent) => void nav.onKeydown(event);
</script>

<template>
    <div class="tao-tabs" :class="sizeClass(size)">
        <div class="tao-tabs__list" :style="{ justifyContent: justify }" role="tablist" @keydown="onKeydown">
            <button
                v-for="tab in list"
                :key="tab.value"
                type="button"
                class="tao-tabs__tab"
                role="tab"
                :id="tabId(tab.value)"
                :aria-selected="tab.value === model"
                :aria-controls="panelId(tab.value)"
                :tabindex="tab.value === model ? 0 : -1"
                :disabled="tab.disabled"
                @click="selectTab(tab.value)"
            >
                <slot v-if="$slots.label" name="label" :text="tab.label" :value="tab.value" />
                <template v-else>{{ tab.label }}</template>
            </button>
        </div>
        <div
            class="tao-tabs__content"
            role="tabpanel"
            :id="panelId(model)"
            :aria-labelledby="tabId(model)"
        >
            <slot :active-tab="model" />
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
    /* selecting the text around must not catch the button label / выделение текста вокруг не захватывает подпись кнопки */
    user-select: none;
}

.tao-tabs__tab:hover:not(:disabled) {
    color: var(--tao-color-text-strong);
}

.tao-tabs__tab[aria-selected='true'] {
    color: var(--tao-color-accent-text);
    border-bottom-color: var(--tao-color-accent);
}

.tao-tabs__tab[aria-selected='true']:hover:not(:disabled) {
    color: var(--tao-color-accent-text);
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
