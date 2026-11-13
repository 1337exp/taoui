<script lang="ts" setup>
import { computed, nextTick, ref, useId, watch } from 'vue';
import { moveTarget, type TaoDocTab } from '../docTabs';
import { useLocaleText } from '../locale';
import { sizeClass, type TaoSize } from '../size';

defineOptions({ name: 'TaoDocTabs' });

const props = defineProps<{
    /** The value of the active tab (`v-model`); it may be none of them (no document open). / Значение активной вкладки. */
    modelValue: string;
    items: readonly TaoDocTab[];
    /** The id of the element the active tab controls (the document view), for `aria-controls`. / id вида документа. */
    controls?: string;
    /** The name of the row for a screen reader. / Имя ряда для скринридера. */
    label?: string;
    /** The label of a close button (the tab name follows it). / Подпись кнопки закрытия (за ней имя вкладки). */
    closeLabel?: string;
    /** The text read for the unsaved dot. / Текст, который читают вместо точки «не сохранено». */
    dirtyLabel?: string;
    /** Size, same scale as TaoButton; without it the size of ancestors. / Размер, шкала как у TaoButton. */
    size?: TaoSize;
}>();

const l10n = useLocaleText(props, 'docTabs');

const emit = defineEmits<{
    'update:modelValue': [value: string];
    /** The user picked another tab. / Пользователь выбрал другую вкладку. */
    change: [value: string];
    /** The user asked to close a tab (the cross, the middle button, Delete); the app closes it. / Просят закрыть вкладку. */
    close: [value: string];
    /** A preview tab was pinned (a double click, Enter on it). / Вкладку-предпросмотр закрепили. */
    pin: [value: string];
    /** A tab was moved: its place now and the place it should take (`moveItem` of your list). / Вкладку переставили. */
    reorder: [from: number, to: number];
    /** A right click or the menu key on a tab; the app shows its own menu. / Правый клик или клавиша меню. */
    menu: [value: string, event: MouseEvent | KeyboardEvent];
}>();

const uid = useId();
const tabId = (value: string) => `${uid}-${value}`;
const listRef = ref<HTMLElement | null>(null);

const list = computed(() => props.items);
const closable = (tab: TaoDocTab) => tab.closable !== false;

function select(value: string, focus = false) {
    emit('update:modelValue', value);
    if (value !== props.modelValue) emit('change', value);
    if (focus) void nextTick(() => document.getElementById(tabId(value))?.focus());
}

function indexOf(value: string) {
    return list.value.findIndex((t) => t.value === value);
}

function move(delta: number, from: string) {
    const n = list.value.length;
    if (!n) return;
    const here = indexOf(from);
    select(list.value[(here + delta + n) % n]!.value, true);
}

function onKeydown(event: KeyboardEvent, tab: TaoDocTab) {
    const key = event.key;
    const index = indexOf(tab.value);
    // Alt + arrows moves the tab itself: the keyboard way to what the pointer does by dragging
    if (event.altKey && (key === 'ArrowLeft' || key === 'ArrowRight')) {
        event.preventDefault();
        const to = moveTarget(index, key === 'ArrowLeft' ? index - 1 : index + 1, key === 'ArrowRight', list.value.length);
        if (to !== null) {
            emit('reorder', index, to);
            void nextTick(() => document.getElementById(tabId(tab.value))?.focus());
        }
        return;
    }
    if (key === 'ArrowRight') {
        event.preventDefault();
        move(1, tab.value);
    } else if (key === 'ArrowLeft') {
        event.preventDefault();
        move(-1, tab.value);
    } else if (key === 'Home') {
        event.preventDefault();
        select(list.value[0]!.value, true);
    } else if (key === 'End') {
        event.preventDefault();
        select(list.value[list.value.length - 1]!.value, true);
    } else if (key === 'Delete' && closable(tab)) {
        event.preventDefault();
        emit('close', tab.value);
    } else if (key === 'Enter' && tab.preview) {
        event.preventDefault();
        emit('pin', tab.value);
    } else if (key === 'ContextMenu' || (key === 'F10' && event.shiftKey)) {
        event.preventDefault();
        emit('menu', tab.value, event);
    }
}

function onAuxClick(event: MouseEvent, tab: TaoDocTab) {
    if (event.button === 1 && closable(tab)) {
        event.preventDefault();
        emit('close', tab.value);
    }
}

function onContextMenu(event: MouseEvent, tab: TaoDocTab) {
    event.preventDefault();
    emit('menu', tab.value, event);
}

// ---- dragging a tab / перетаскивание вкладки
const dragFrom = ref(-1);
const dropMark = ref<{ index: number; after: boolean } | null>(null);

function onDragStart(event: DragEvent, tab: TaoDocTab) {
    dragFrom.value = indexOf(tab.value);
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', tab.value);
    }
}

function onDragOver(event: DragEvent, tab: TaoDocTab) {
    if (dragFrom.value < 0) return;
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    dropMark.value = { index: indexOf(tab.value), after: event.clientX > rect.left + rect.width / 2 };
}

function onDrop(event: DragEvent) {
    if (!dropMark.value) return; // a mark exists only while one of our own tabs is dragged
    event.preventDefault();
    const to = moveTarget(dragFrom.value, dropMark.value.index, dropMark.value.after, list.value.length);
    if (to !== null) emit('reorder', dragFrom.value, to);
    onDragEnd();
}

function onDragEnd() {
    dragFrom.value = -1;
    dropMark.value = null;
}

/** The wheel scrolls the row sideways: a mouse has no other way to reach the tabs that did not fit. */
function onWheel(event: WheelEvent) {
    const el = listRef.value;
    if (!el || el.scrollWidth <= el.clientWidth || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    el.scrollLeft += event.deltaY;
    event.preventDefault();
}

// the active tab is always in view, also when it was opened off the edge / активная вкладка всегда на виду
watch(
    () => [props.modelValue, list.value.length],
    async () => {
        await nextTick();
        document.getElementById(tabId(props.modelValue))?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    },
);
</script>

<template>
    <div class="tao-doc-tabs" :class="sizeClass(size)">
        <div ref="listRef" class="tao-doc-tabs__list" role="tablist" :aria-label="label ?? l10n.label" @wheel="onWheel" @drop="onDrop">
            <div
                v-for="(tab, index) in list"
                :id="tabId(tab.value)"
                :key="tab.value"
                class="tao-doc-tabs__tab"
                :class="{
                    'is-active': tab.value === modelValue,
                    'is-preview': tab.preview,
                    'is-dirty': tab.dirty,
                    'is-dragging': dragFrom === index,
                    'drop-before': dropMark && dropMark.index === index && !dropMark.after && dragFrom !== index,
                    'drop-after': dropMark && dropMark.index === index && dropMark.after && dragFrom !== index,
                }"
                role="tab"
                :aria-selected="tab.value === modelValue"
                :aria-controls="tab.value === modelValue ? controls : undefined"
                :tabindex="tab.value === modelValue || (!list.some((t) => t.value === modelValue) && index === 0) ? 0 : -1"
                :title="tab.title"
                draggable="true"
                @click="select(tab.value)"
                @dblclick="tab.preview && emit('pin', tab.value)"
                @auxclick="onAuxClick($event, tab)"
                @contextmenu="onContextMenu($event, tab)"
                @keydown="onKeydown($event, tab)"
                @dragstart="onDragStart($event, tab)"
                @dragover="onDragOver($event, tab)"
                @dragend="onDragEnd"
            >
                <slot name="label" :tab="tab"
                    ><span class="tao-doc-tabs__label">{{ tab.label }}</span></slot
                >
                <template v-if="tab.dirty"
                    ><span class="tao-doc-tabs__dot" aria-hidden="true">●</span><span class="tao-doc-tabs__sr">{{ dirtyLabel ?? l10n.dirtyLabel }}</span></template
                >
                <button v-if="closable(tab)" type="button" class="tao-doc-tabs__close" tabindex="-1" aria-hidden="true" :aria-label="`${closeLabel ?? l10n.closeLabel} ${tab.label}`" @click.stop="emit('close', tab.value)">
                    ×
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tao-doc-tabs {
    min-width: 0;
}

.tao-doc-tabs__list {
    display: flex;
    gap: var(--tao-space-1);
    min-width: 0;
    overflow-x: auto;
    border-bottom: 1px solid var(--tao-color-border);
    scrollbar-width: none;
}

.tao-doc-tabs__list::-webkit-scrollbar {
    display: none;
}

.tao-doc-tabs__tab {
    display: flex;
    flex: none;
    align-items: center;
    gap: var(--tao-space-2);
    max-width: 240px;
    min-height: var(--tao-control-height);
    padding: 0 var(--tao-space-2) 0 var(--tao-button-padding-x);
    color: var(--tao-color-text-subtle);
    font-size: var(--tao-control-font-size);
    font-weight: 500;
    cursor: pointer;
    user-select: none;
}

.tao-doc-tabs__tab:hover {
    color: var(--tao-color-text);
}

.tao-doc-tabs__tab.is-active {
    box-shadow: inset 0 -2px 0 var(--tao-color-accent);
    color: var(--tao-color-accent);
}

.tao-doc-tabs__tab.is-preview .tao-doc-tabs__label {
    font-style: italic;
}

.tao-doc-tabs__tab.is-dragging {
    opacity: 0.5;
}

.tao-doc-tabs__tab.drop-before {
    box-shadow: inset 2px 0 0 var(--tao-color-accent);
}

.tao-doc-tabs__tab.drop-after {
    box-shadow: inset -2px 0 0 var(--tao-color-accent);
}

.tao-doc-tabs__tab:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
    border-radius: var(--tao-radius-control) var(--tao-radius-control) 0 0;
}

.tao-doc-tabs__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-doc-tabs__dot {
    flex: none;
    color: var(--tao-color-warning);
    font-size: 0.7em;
}

.tao-doc-tabs__close {
    display: grid;
    flex: none;
    place-items: center;
    width: 1.5em;
    height: 1.5em;
    padding: 0;
    border: 0;
    border-radius: var(--tao-radius-control);
    background: transparent;
    color: var(--tao-color-text-muted);
    font: inherit;
    line-height: 1;
    cursor: pointer;
    /* hidden until the tab is looked at, so a row of tabs is quiet / скрыт, пока на вкладку не смотрят: ряд вкладок тихий */
    opacity: 0;
}

.tao-doc-tabs__tab:hover .tao-doc-tabs__close,
.tao-doc-tabs__tab:focus-within .tao-doc-tabs__close,
.tao-doc-tabs__tab.is-active .tao-doc-tabs__close {
    opacity: 1;
}

.tao-doc-tabs__close:hover {
    background: var(--tao-color-surface-hover);
    color: var(--tao-color-text);
}

.tao-doc-tabs__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
}
</style>
