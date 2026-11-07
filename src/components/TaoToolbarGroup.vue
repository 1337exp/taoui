<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, toRef } from 'vue';
import { toolbarKey, type ToolbarUnit } from '../toolbar';

defineOptions({ name: 'TaoToolbarGroup', inheritAttrs: false });

const props = withDefaults(
    defineProps<{
        /** Accessible name of the group: «Text style», «Alignment». / Доступное имя группы. */
        label?: string;
        /** A sunken pill behind the group: its buttons read as one set. / Утопленная подложка: кнопки читаются как набор. */
        inset?: boolean;
        /** In a toolbar with `overflow`: this group never goes to the «⋮» menu. / В панели с `overflow`: эта группа не уходит в меню «⋮». */
        pinned?: boolean;
    }>(),
    {
        label: undefined,
        inset: false,
        pinned: false,
    },
);

const toolbar = inject(toolbarKey, null);
// in a toolbar with overflow the group sits in a host that stays in the row; the group itself can be teleported into the menu
// (the same element, so its state and its focus-able buttons are the ones the app made, not copies)
// в панели с overflow группа сидит в хосте, который остаётся в строке; саму группу можно телепортировать в меню
// (тот же элемент, поэтому состояние и кнопки — те, что сделало приложение, а не копии)
const managed = computed(() => Boolean(toolbar?.overflow.value));

const host = ref<HTMLElement | null>(null);
const unit: ToolbarUnit = {
    kind: 'group',
    el: host,
    pinned: toRef(props, 'pinned'),
    away: ref(false),
    order: ref(0),
    first: ref(false),
    width: 0,
};
let unregister: (() => void) | undefined;

onMounted(() => {
    unregister = toolbar?.register(unit);
});
onBeforeUnmount(() => unregister?.());

const inMenu = computed(() => unit.away.value && Boolean(toolbar?.menuEl.value));
const target = computed(() => toolbar?.menuEl.value ?? 'body');
</script>

<template>
    <div
        v-if="!managed"
        class="tao-toolbar-group"
        :class="{ 'tao-toolbar-group--inset': inset }"
        role="group"
        :aria-label="label"
        v-bind="$attrs"
    >
        <slot />
    </div>
    <div
        v-else
        ref="host"
        class="tao-toolbar-host"
        :data-tao-away="unit.away.value ? '' : undefined"
        :hidden="unit.away.value && !inMenu ? true : undefined"
    >
        <Teleport :to="target" :disabled="!inMenu">
            <div
                class="tao-toolbar-group"
                :class="{ 'tao-toolbar-group--inset': inset, 'tao-toolbar-group--menu': inMenu, 'tao-toolbar-group--menu-first': inMenu && unit.first.value }"
                :style="inMenu ? { order: unit.order.value } : undefined"
                role="group"
                :aria-label="label"
                v-bind="$attrs"
            >
                <slot />
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.tao-toolbar-group {
    display: flex;
    flex-direction: inherit;
    align-items: center;
    gap: 2px;
}

.tao-toolbar-group--inset {
    padding: 2px;
    background: var(--tao-color-surface-sunken);
    border-radius: calc(var(--tao-radius-control) + 2px);
}

/* the host takes no box of its own: the group is a child of the row, as without overflow / хост без своего бокса */
.tao-toolbar-host {
    display: contents;
    flex-direction: inherit;
}

.tao-toolbar-host[data-tao-away] {
    display: none;
}

/* in the menu the groups stand one under another, split by a line / в меню группы друг под другом, разделены чертой */
.tao-toolbar-group--menu {
    flex-wrap: wrap;
    flex-direction: row;
}

.tao-toolbar-group--menu:not(.tao-toolbar-group--menu-first) {
    padding-top: var(--tao-space-2);
    border-top: 1px solid var(--tao-color-border);
}
</style>
