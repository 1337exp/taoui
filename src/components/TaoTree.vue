<script lang="ts" setup>
import { computed, nextTick, ref, shallowReactive, useId, watch } from 'vue';
import { useListNav } from '../listNav';
import { useLocaleText } from '../locale';
import { sizeClass, type TaoSize } from '../size';
import {
    checkState,
    toggleCheck,
    visibleRows,
    type TaoTreeCheckState,
    type TaoTreeNode,
    type TaoTreeRow,
    type TaoTreeSelection,
} from '../tree';
import TaoIcon from './TaoIcon.vue';

defineOptions({ name: 'TaoTree' });

// A tree of files or objects: expand and collapse, select, check with tri-state parents, load children lazily.
// ARIA tree: one tab stop, ↑ / ↓ walk the visible rows, → opens or goes to the first child, ← closes or goes to the
// parent, Home / End, type-ahead, `*` opens the siblings, Enter / Space pick. The rows are a flat list with
// aria-level, so a large tree renders as one list.
// Дерево файлов или объектов: раскрытие, выбор, чекбоксы с промежуточным состоянием родителя, ленивая подгрузка.
// ARIA tree: одна остановка Tab, ↑ / ↓ по видимым строкам, → раскрывает или идёт к первому ребёнку, ← сворачивает
// или идёт к родителю, Home / End, поиск по буквам, `*` раскрывает соседей, Enter / Space выбирают.
const props = withDefaults(
    defineProps<{
        nodes: TaoTreeNode[];
        /** Ids of the expanded nodes (`v-model:expanded`); without it the tree keeps them itself. / id раскрытых узлов. */
        expanded?: string[];
        selection?: TaoTreeSelection;
        /** `v-model:selected`: an id (single) or a list of ids (multiple). / id или список id. */
        selected?: string | string[] | null;
        /** Checkboxes; a parent is checked, unchecked or mixed by its leaves. / Чекбоксы; родитель по своим листьям. */
        checkable?: boolean;
        /** `v-model:checked`: the ids of the checked nodes without children. / id отмеченных узлов без детей. */
        checked?: string[];
        /** Loads the children of a node with `hasChildren`. / Подгружает детей узла с `hasChildren`. */
        load?: (node: TaoTreeNode) => Promise<TaoTreeNode[]>;
        /** Without it the size of ancestors. / Без него — размер предков. */
        size?: TaoSize;
        /** Accessible name of the tree. / Имя дерева для скринридера. */
        ariaLabel?: string;
        loadingLabel?: string;
    }>(),
    {
        expanded: undefined,
        selection: 'single',
        selected: undefined,
        checkable: false,
        checked: undefined,
        load: undefined,
        size: undefined,
        ariaLabel: undefined,
        loadingLabel: undefined,
    },
);
const l10n = useLocaleText(props, 'tree');

const emit = defineEmits<{
    'update:expanded': [ids: string[]];
    'update:selected': [value: string | string[] | null];
    'update:checked': [ids: string[]];
    /** A node was picked (click, Enter, Space without checkboxes). / Узел выбран. */
    select: [node: TaoTreeNode];
    /** `load` failed; the node stays closed. / `load` упал; узел остаётся закрытым. */
    'load-error': [node: TaoTreeNode, error: unknown];
}>();

interface NodeSlot {
    node: TaoTreeNode;
    level: number;
    expanded: boolean;
    selected: boolean;
}

defineSlots<{
    /** The icon before the label. / Иконка перед подписью. */
    icon?(props: NodeSlot): unknown;
    /** The label. / Подпись. */
    label?(props: NodeSlot): unknown;
    /** Buttons at the end of the row, shown on hover and focus. / Кнопки в конце строки, видны при наведении и фокусе. */
    actions?(props: NodeSlot): unknown;
}>();

// ---------- models: controlled when the prop is given, otherwise kept here ----------

const ownExpanded = ref<string[]>([]);
const ownSelected = ref<string | string[] | null>(null);
const ownChecked = ref<string[]>([]);

const expandedSet = computed(() => new Set(props.expanded ?? ownExpanded.value));
const selectedSet = computed(() => {
    const value = props.selected !== undefined ? props.selected : ownSelected.value;
    return new Set(value === null ? [] : Array.isArray(value) ? value : [value]);
});
const checkedSet = computed(() => new Set(props.checked ?? ownChecked.value));

function setExpanded(ids: Set<string>) {
    const list = [...ids];
    ownExpanded.value = list;
    emit('update:expanded', list);
}

function setChecked(ids: Set<string>) {
    const list = [...ids];
    ownChecked.value = list;
    emit('update:checked', list);
}

function setSelected(value: string | string[] | null) {
    ownSelected.value = value;
    emit('update:selected', value);
}

// ---------- lazy children ----------

const loaded = shallowReactive(new Map<string, TaoTreeNode[]>());
const loading = shallowReactive(new Set<string>());
const children = (node: TaoTreeNode) => node.children ?? loaded.get(node.id);

const rows = computed(() => visibleRows(props.nodes, expandedSet.value, children));
const rowIndex = computed(() => new Map(rows.value.map((row, index) => [row.node.id, index])));

async function expand(row: TaoTreeRow) {
    const { node } = row;
    if (!row.branch || row.expanded || loading.has(node.id)) {
        return;
    }
    if (children(node) === undefined && node.hasChildren) {
        if (!props.load) {
            return;
        }
        loading.add(node.id);
        try {
            const list = await props.load(node);
            loaded.set(node.id, list);
            // a checked lazy node hands its check to the children it turned out to have
            // отмеченный ленивый узел передаёт отметку детям, которые у него оказались
            if (checkedSet.value.has(node.id) && list.length) {
                const next = new Set(checkedSet.value);
                next.delete(node.id);
                list.filter((child) => !child.disabled).forEach((child) => next.add(child.id));
                setChecked(next);
            }
        } catch (error) {
            emit('load-error', node, error);
            return;
        } finally {
            loading.delete(node.id);
        }
    }
    setExpanded(new Set([...expandedSet.value, node.id]));
}

function collapse(row: TaoTreeRow) {
    // read before closing: the rows are recomputed as soon as the set changes
    const focused = rows.value[current.value];
    const focusInside = Boolean(focused && isInside(focused, row.node.id));
    const next = new Set(expandedSet.value);
    next.delete(row.node.id);
    setExpanded(next);
    // the focus was inside the closed branch: it goes to the branch itself
    if (focusInside) {
        void nextTick(() => focusRow(rowIndex.value.get(row.node.id) ?? 0));
    }
}

function isInside(row: TaoTreeRow, ancestorId: string): boolean {
    let parentId = row.parentId;
    while (parentId) {
        if (parentId === ancestorId) {
            return true;
        }
        const parent = rows.value[rowIndex.value.get(parentId) ?? -1];
        parentId = parent?.parentId ?? null;
    }
    return false;
}

function toggle(row: TaoTreeRow) {
    if (row.expanded) {
        collapse(row);
    } else {
        void expand(row);
    }
}

// ---------- selection and checks ----------

function pick(row: TaoTreeRow) {
    const { node } = row;
    if (node.disabled) {
        return;
    }
    if (props.selection === 'single') {
        setSelected(node.id);
    } else if (props.selection === 'multiple') {
        const next = new Set(selectedSet.value);
        if (next.has(node.id)) {
            next.delete(node.id);
        } else {
            next.add(node.id);
        }
        setSelected([...next]);
    }
    emit('select', node);
}

function check(row: TaoTreeRow) {
    if (!row.node.disabled) {
        setChecked(toggleCheck(row.node, checkedSet.value, children));
    }
}

const stateOf = (row: TaoTreeRow): TaoTreeCheckState => checkState(row.node, checkedSet.value, children);
const ariaChecked = (row: TaoTreeRow) => {
    const state = stateOf(row);
    return state === 'mixed' ? 'mixed' : state === 'checked' ? 'true' : 'false';
};

// ---------- focus: one tab stop, roving tabindex over the rows ----------

const treeId = useId();
const rowRefs = ref<(HTMLElement | null)[]>([]);
const current = ref(0);
const rowDomId = (row: TaoTreeRow) => `${treeId}-${row.node.id}`;

// the focused row may disappear (its parent closed elsewhere, new data): keep the index inside the list
watch(
    () => rows.value.length,
    (length) => {
        if (current.value >= length) {
            current.value = Math.max(0, length - 1);
        }
    },
);

function focusRow(index: number) {
    current.value = index;
    rowRefs.value[index]?.focus();
}

const nav = useListNav({
    enabled: () => rows.value.map(() => true),
    active: current,
    labels: () => rows.value.map((row) => row.node.label),
    loop: false,
    onMove: (index) => rowRefs.value[index]?.focus(),
});

function onKeydown(event: KeyboardEvent, index: number) {
    const row = rows.value[index];
    if (!row) {
        return;
    }
    current.value = index;
    if (event.key === '*') {
        event.preventDefault();
        // every sibling of this row opens / открываются все соседи этой строки
        rows.value.filter((other) => other.parentId === row.parentId && other.branch && !other.expanded).forEach((other) => void expand(other));
        return;
    }
    if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (row.branch && !row.expanded) {
            void expand(row);
        } else if (row.expanded) {
            focusRow(index + 1);
        }
        return;
    }
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (row.expanded) {
            collapse(row);
        } else if (row.parentId) {
            focusRow(rowIndex.value.get(row.parentId) ?? index);
        }
        return;
    }
    if (event.key === 'Enter') {
        event.preventDefault();
        if (props.selection === 'none') {
            toggle(row);
        } else {
            pick(row);
        }
        return;
    }
    if (event.key === ' ' && !(event.target as HTMLElement).closest('.tao-tree__actions')) {
        event.preventDefault();
        if (props.checkable) {
            check(row);
        } else if (props.selection === 'none') {
            toggle(row);
        } else {
            pick(row);
        }
        return;
    }
    nav.onKeydown(event);
}

function onRowClick(row: TaoTreeRow, index: number) {
    current.value = index;
    if (props.selection === 'none') {
        if (row.branch) {
            toggle(row);
        }
        return;
    }
    pick(row);
}

const slotProps = (row: TaoTreeRow): NodeSlot => ({
    node: row.node,
    level: row.level,
    expanded: row.expanded,
    selected: selectedSet.value.has(row.node.id),
});
</script>

<template>
    <ul
        class="tao-tree"
        :class="sizeClass(size)"
        role="tree"
        :aria-label="l10n.ariaLabel"
        :aria-multiselectable="selection === 'multiple' || undefined"
    >
        <li
            v-for="(row, index) in rows"
            :id="rowDomId(row)"
            :key="row.node.id"
            :ref="(el) => (rowRefs[index] = el as HTMLElement | null)"
            class="tao-tree__row"
            :class="{
                'tao-tree__row--selected': selectedSet.has(row.node.id),
                'tao-tree__row--disabled': row.node.disabled,
            }"
            role="treeitem"
            :tabindex="current === index ? 0 : -1"
            :aria-level="row.level"
            :aria-setsize="row.setsize"
            :aria-posinset="row.posinset"
            :aria-expanded="row.branch ? row.expanded : undefined"
            :aria-selected="selection === 'none' ? undefined : selectedSet.has(row.node.id)"
            :aria-checked="checkable ? ariaChecked(row) : undefined"
            :aria-disabled="row.node.disabled || undefined"
            :aria-busy="loading.has(row.node.id) || undefined"
            :style="{ '--_level': row.level - 1 }"
            @keydown="onKeydown($event, index)"
            @click="onRowClick(row, index)"
            @focus="current = index"
        >
            <span v-for="n in row.level - 1" :key="n" class="tao-tree__guide" aria-hidden="true"></span>
            <span
                class="tao-tree__toggle"
                :class="{ 'tao-tree__toggle--open': row.expanded }"
                aria-hidden="true"
                @click.stop="row.branch && toggle(row)"
            >
                <span v-if="loading.has(row.node.id)" class="tao-tree__spinner" :title="l10n.loadingLabel"></span>
                <TaoIcon v-else-if="row.branch" name="tao-chevron-right" />
            </span>
            <span
                v-if="checkable"
                class="tao-tree__check"
                :class="`tao-tree__check--${stateOf(row)}`"
                aria-hidden="true"
                @click.stop="check(row)"
            ></span>
            <span v-if="$slots.icon || row.node.icon" class="tao-tree__icon" aria-hidden="true">
                <slot name="icon" v-bind="slotProps(row)">
                    <TaoIcon :name="row.node.icon!" />
                </slot>
            </span>
            <span class="tao-tree__label">
                <slot name="label" v-bind="slotProps(row)">{{ row.node.label }}</slot>
            </span>
            <span v-if="$slots.actions" class="tao-tree__actions" @click.stop @keydown.stop>
                <slot name="actions" v-bind="slotProps(row)" />
            </span>
        </li>
    </ul>
</template>

<style scoped>
.tao-tree {
    --_indent: calc(var(--tao-control-height) * 0.6);
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--tao-color-text);
    font-size: var(--tao-control-font-size);
}

.tao-tree__row {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--tao-space-1);
    min-height: calc(var(--tao-control-height) - var(--tao-space-2));
    padding: 0 var(--tao-control-padding-x) 0 var(--tao-space-1);
    border-radius: var(--tao-radius-control);
    cursor: pointer;
    user-select: none;
    transition: var(--tao-transition-base);
}

.tao-tree__row:hover {
    background: var(--tao-color-surface-hover);
}

.tao-tree__row--selected,
.tao-tree__row--selected:hover {
    background: var(--tao-color-accent-subtle);
    color: var(--tao-color-accent-text);
}

.tao-tree__row:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-tree__row--disabled {
    color: var(--tao-color-text-disabled);
    cursor: default;
}

/* one guide per level: a thin line under the toggle of the ancestor / направляющая на уровень */
.tao-tree__guide {
    flex: none;
    align-self: stretch;
    width: var(--_indent);
    background: linear-gradient(var(--tao-color-border), var(--tao-color-border)) no-repeat center / 1px 100%;
}

.tao-tree__toggle {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--_indent);
    height: var(--_indent);
    color: var(--tao-color-text-muted);
    transition: transform var(--tao-duration-base) var(--tao-ease-base);
}

.tao-tree__toggle--open {
    transform: rotate(90deg);
}

.tao-tree__spinner {
    width: 0.8em;
    height: 0.8em;
    border: 2px solid var(--tao-color-border);
    border-top-color: var(--tao-color-accent);
    border-radius: var(--tao-radius-full);
    animation: tao-tree-spin 0.8s linear infinite;
}

@keyframes tao-tree-spin {
    to {
        transform: rotate(360deg);
    }
}

/* the checkbox is drawn, not a TaoCheckbox: a control inside a treeitem would be a second tab stop */
.tao-tree__check {
    flex: none;
    position: relative;
    width: var(--tao-indicator-size);
    height: var(--tao-indicator-size);
    box-sizing: border-box;
    border: 1.5px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-sm);
    background: var(--tao-color-surface);
}

.tao-tree__check--checked,
.tao-tree__check--mixed {
    border-color: var(--tao-color-accent);
    background: var(--tao-color-accent);
}

.tao-tree__check--checked::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 45%;
    width: 30%;
    height: 55%;
    border: solid var(--tao-color-on-accent);
    border-width: 0 2px 2px 0;
    transform: translate(-50%, -50%) rotate(45deg);
}

.tao-tree__check--mixed::after {
    content: '';
    position: absolute;
    left: 22%;
    right: 22%;
    top: calc(50% - 1px);
    height: 2px;
    border-radius: 1px;
    background: var(--tao-color-on-accent);
}

.tao-tree__row--disabled .tao-tree__check {
    opacity: 0.5;
}

.tao-tree__icon {
    flex: none;
    display: inline-flex;
    color: var(--tao-color-text-muted);
}

.tao-tree__row--selected .tao-tree__icon {
    color: inherit;
}

.tao-tree__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-tree__actions {
    flex: none;
    display: inline-flex;
    gap: var(--tao-space-1);
    opacity: 0;
    transition: opacity var(--tao-duration-base) var(--tao-ease-base);
}

.tao-tree__row:hover .tao-tree__actions,
.tao-tree__row:focus-within .tao-tree__actions {
    opacity: 1;
}

/* a finger has no hover: keep the actions visible / у пальца нет наведения: действия видны всегда */
@media (hover: none) {
    .tao-tree__actions {
        opacity: 1;
    }
}

@media (prefers-reduced-motion: reduce) {
    .tao-tree__toggle {
        transition: none;
    }

    .tao-tree__spinner {
        animation-duration: 2.4s;
    }
}
</style>
