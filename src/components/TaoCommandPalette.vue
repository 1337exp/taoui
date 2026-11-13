<script lang="ts" setup>
import { computed, nextTick, ref, useId, watch } from 'vue';
import { matchCommands, splitByRanges, type TaoCommandItem, type TaoCommandMatch } from '../commandPalette';
import { useLayer } from '../layers';
import { useLocaleText } from '../locale';
import { surfaceClass, type TaoSurface } from '../surface';
import TaoIcon from './TaoIcon.vue';

// class, style and the other attributes go to the dialog panel, not to the overlay around it
// class, style и остальные атрибуты — панели окна, а не подложке вокруг неё
defineOptions({ name: 'TaoCommandPalette', inheritAttrs: false });

interface Props {
    /** Open or closed (`v-model`). / Открыта или закрыта. */
    modelValue: boolean;
    /** The commands. The palette only searches and shows them: running one is `@select`. / Команды. */
    items: readonly TaoCommandItem[];
    /** The hint in the empty field. / Подсказка в пустом поле. */
    placeholder?: string;
    /** What is shown when nothing fits. / Что показано, когда ничего не подошло. */
    emptyText?: string;
    /** The name of the dialog for a screen reader. / Имя окна для скринридера. */
    label?: string;
    /** The most rows shown. Default 50. / Сколько строк показывать не больше. По умолчанию 50. */
    limit?: number;
    /** What the panel is made of, as on TaoModal. / Из чего сделана панель, как у TaoModal. */
    surface?: TaoSurface;
}

const props = withDefaults(defineProps<Props>(), { limit: 50, surface: 'flat' });
const l10n = useLocaleText(props, 'commandPalette');

const emit = defineEmits<{
    'update:modelValue': [open: boolean];
    /** The user picked a command (Enter or a click). The palette closes itself after it. / Выбрана команда. */
    select: [item: TaoCommandItem];
    close: [];
}>();

const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const uid = useId();
const listId = `${uid}-list`;
const optionId = (index: number) => `${uid}-opt-${index}`;

const results = computed<TaoCommandMatch[]>(() => matchCommands(props.items, query.value, props.limit));
const active = ref(-1);

/** Rows with the captions of their groups, drawn while the query is empty (a listing, not a search). */
const rows = computed(() => {
    const out: ({ kind: 'group'; title: string } | { kind: 'item'; match: TaoCommandMatch; index: number })[] = [];
    let group: string | undefined;
    results.value.forEach((match, index) => {
        if (!query.value.trim() && match.item.group !== undefined && match.item.group !== group) {
            group = match.item.group;
            out.push({ kind: 'group', title: group });
        }
        out.push({ kind: 'item', match, index });
    });
    return out;
});

/**
 * Some row has an icon: the rows without one keep an empty column for it, so every label stands in one column.
 * Какая-то строка с иконкой: у остальных остаётся пустая колонка под неё, и все подписи стоят в одном столбце.
 */
const hasIcons = computed(() => results.value.some((m) => m.item.icon));

const enabled = (index: number) => results.value[index] !== undefined && !results.value[index]!.item.disabled;
const firstEnabled = () => results.value.findIndex((m) => !m.item.disabled);

/** Moves the active row to the next one that can be picked, wrapping round. */
function step(delta: 1 | -1) {
    const n = results.value.length;
    if (!n || firstEnabled() < 0) return;
    let index = active.value;
    for (let i = 0; i < n; i++) {
        index = (index + delta + n) % n;
        if (enabled(index)) {
            active.value = index;
            return;
        }
    }
}

function edge(last: boolean) {
    const indexes = results.value.map((_, i) => i).filter(enabled);
    if (indexes.length) active.value = last ? indexes[indexes.length - 1]! : indexes[0]!;
}

function close() {
    emit('update:modelValue', false);
    emit('close');
}

function choose(index: number) {
    const match = results.value[index];
    if (!match || match.item.disabled) return;
    emit('select', match.item);
    close();
}

function onKeydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            step(1);
            break;
        case 'ArrowUp':
            event.preventDefault();
            step(-1);
            break;
        case 'Home':
            event.preventDefault();
            edge(false);
            break;
        case 'End':
            event.preventDefault();
            edge(true);
            break;
        case 'Enter':
            event.preventDefault();
            choose(active.value);
            break;
        case 'Tab':
            event.preventDefault(); // the focus stays in the field: the list is walked with the arrows / фокус остаётся в поле
            break;
    }
}

// a new query starts from the best row that can be picked / новый запрос начинается с лучшей строки, которую можно выбрать
watch(results, () => {
    active.value = firstEnabled();
});

watch(active, async (index) => {
    await nextTick();
    document.getElementById(optionId(index))?.scrollIntoView?.({ block: 'nearest' });
});

watch(
    () => props.modelValue,
    async (open) => {
        if (!open) return;
        query.value = '';
        active.value = firstEnabled();
        await nextTick();
        inputRef.value?.focus();
    },
    { immediate: true },
);

let pointerDownOnOverlay = false;
const onOverlayPointerDown = (event: PointerEvent) => (pointerDownOnOverlay = event.target === event.currentTarget);
function onOverlayPointerUp(event: PointerEvent) {
    if (pointerDownOnOverlay && event.target === event.currentTarget) close();
    pointerDownOnOverlay = false;
}

// Escape, the page scroll lock and the focus return belong to the layer stack (see layers.ts)
useLayer(() => props.modelValue, { lockScroll: true, restoreFocus: true, onEscape: close });
</script>

<template>
    <Teleport to="body">
        <Transition name="tao-command-palette-fade">
            <div v-if="modelValue" class="tao-command-palette-overlay" @pointerdown="onOverlayPointerDown" @pointerup="onOverlayPointerUp">
                <div v-bind="$attrs" class="tao-command-palette" :class="surfaceClass(surface)" role="dialog" aria-modal="true" :aria-label="label ?? l10n.label">
                    <input
                        ref="inputRef"
                        v-model="query"
                        class="tao-command-palette__input"
                        type="text"
                        role="combobox"
                        autocomplete="off"
                        spellcheck="false"
                        aria-autocomplete="list"
                        aria-expanded="true"
                        :aria-controls="listId"
                        :aria-activedescendant="active >= 0 ? optionId(active) : undefined"
                        :aria-label="label ?? l10n.label"
                        :placeholder="placeholder ?? l10n.placeholder"
                        @keydown="onKeydown"
                    />
                    <ul :id="listId" ref="listRef" class="tao-command-palette__list" :class="{ 'has-icons': hasIcons }" role="listbox" :aria-label="label ?? l10n.label">
                        <template v-for="(row, i) in rows" :key="row.kind === 'group' ? `g-${i}` : row.match.item.id">
                            <li v-if="row.kind === 'group'" class="tao-command-palette__group" role="presentation">{{ row.title }}</li>
                            <li
                                v-else
                                :id="optionId(row.index)"
                                class="tao-command-palette__option"
                                :class="{ 'is-active': row.index === active, 'is-disabled': row.match.item.disabled, 'has-icon': row.match.item.icon }"
                                role="option"
                                :aria-selected="row.index === active"
                                :aria-disabled="row.match.item.disabled || undefined"
                                @pointermove="enabled(row.index) && (active = row.index)"
                                @click="choose(row.index)"
                            >
                                <slot name="item" :item="row.match.item" :active="row.index === active" :ranges="row.match.ranges">
                                    <TaoIcon v-if="row.match.item.icon" class="tao-command-palette__icon" :name="row.match.item.icon" aria-hidden="true" />
                                    <span class="tao-command-palette__text">
                                        <span class="tao-command-palette__label"
                                            ><template v-for="(part, k) in splitByRanges(row.match.item.label, row.match.ranges)" :key="k"
                                                ><mark v-if="part.lit">{{ part.text }}</mark
                                                ><template v-else>{{ part.text }}</template></template
                                            ></span
                                        >
                                        <span v-if="row.match.item.description" class="tao-command-palette__description">{{ row.match.item.description }}</span>
                                    </span>
                                    <span v-if="query.trim() && row.match.item.group" class="tao-command-palette__where">{{ row.match.item.group }}</span>
                                    <kbd v-if="row.match.item.shortcut" class="tao-command-palette__shortcut">{{ row.match.item.shortcut }}</kbd>
                                </slot>
                            </li>
                        </template>
                        <li v-if="!results.length" class="tao-command-palette__empty" role="presentation">
                            <slot name="empty">{{ emptyText ?? l10n.emptyText }}</slot>
                        </li>
                    </ul>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.tao-command-palette-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--tao-z-modal);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 12vh var(--tao-space-5) var(--tao-space-5);
    background: var(--tao-color-overlay);
}

/*
 * One scale for the whole panel. The panel is teleported to <body>, so it must set its own text size (otherwise the rows
 * take the 16px of the page and the field stays at 14px): the field and the rows share --tao-control-font-size, the field is one
 * step taller than a row, and its text starts exactly where the labels of the rows start (--_pad-x).
 * Одна шкала на всю панель. Панель телепортирована в <body>, поэтому размер текста задаёт сама (иначе строки берут 16px
 * страницы, а поле остаётся 14px): поле и строки на одном --tao-control-font-size, поле на ступень выше строки, а его
 * текст начинается там же, где подписи строк (--_pad-x).
 */
.tao-command-palette {
    --tao-command-palette-bg: var(--tao-surface-fill, var(--tao-color-surface-raised));
    --_pad-x: var(--tao-space-3);
    --_icon: 16px;
    --_row: var(--tao-control-height);
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 560px;
    max-height: min(480px, 70vh);
    overflow: hidden;
    border-radius: var(--tao-radius-panel);
    background-color: var(--tao-command-palette-bg);
    background-image: var(--tao-surface-image, none);
    background-size: var(--tao-surface-image-size, auto);
    -webkit-backdrop-filter: var(--tao-surface-backdrop, none);
    backdrop-filter: var(--tao-surface-backdrop, none);
    box-shadow: var(--tao-surface-inset, 0 0 #0000), var(--tao-shadow-overlay);
    color: var(--tao-color-text);
    font-family: var(--tao-font-family);
    font-size: var(--tao-control-font-size);
    line-height: 1.4;
}

.tao-command-palette__input {
    flex: none;
    box-sizing: border-box;
    width: 100%;
    height: calc(var(--_row) + var(--tao-space-2));
    /* the list padding plus the row padding: the text of the field is above the labels of the rows */
    padding: 0 calc(var(--tao-space-2) + var(--_pad-x));
    border: 0;
    border-bottom: 1px solid var(--tao-color-border);
    background: transparent;
    color: var(--tao-color-text);
    font: inherit;
}

.tao-command-palette__input::placeholder {
    color: var(--tao-color-text-muted);
}

.tao-command-palette__input:focus {
    outline: none;
}

.tao-command-palette__input:focus-visible {
    box-shadow: inset 0 -2px 0 var(--tao-color-accent);
}

.tao-command-palette__list {
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: var(--tao-space-2);
    overflow-y: auto;
    list-style: none;
}

/* a caption of a group: smaller, capitals, spaced, and a hairline above every group but the first, so it cannot pass for a row */
/* подпись группы: мельче, капителью, с разрядкой, и линия над каждой группой, кроме первой: на строку она не похожа */
.tao-command-palette__group {
    padding: var(--tao-space-2) var(--_pad-x) var(--tao-space-1);
    color: var(--tao-color-text-muted);
    font-size: var(--tao-font-size-xs);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    user-select: none;
}

.tao-command-palette__group:not(:first-child) {
    margin-top: var(--tao-space-2);
    padding-top: var(--tao-space-3);
    border-top: 1px solid var(--tao-color-border);
}

.tao-command-palette__option {
    display: flex;
    align-items: center;
    gap: var(--tao-space-3);
    box-sizing: border-box;
    min-height: var(--_row);
    padding: var(--tao-space-1) var(--_pad-x);
    /* concentric corners: the panel radius minus the list padding / концентричные углы */
    border-radius: max(0px, calc(var(--tao-radius-panel) - var(--tao-space-2)));
    color: var(--tao-color-text);
    cursor: pointer;
    user-select: none;
}

/* the row under the pointer or the arrows goes one step up the text ladder / строка под указателем идёт на ступень выше */
.tao-command-palette__option[aria-selected='true'] {
    background: var(--tao-color-accent-subtle, var(--tao-color-surface-hover));
    color: var(--tao-color-text-strong);
}

.tao-command-palette__option.is-disabled {
    color: var(--tao-color-text-disabled);
    cursor: default;
}

.tao-command-palette__icon {
    flex: none;
    width: var(--_icon);
    height: var(--_icon);
    color: var(--tao-color-text-muted);
}

/* a row without an icon keeps its place: the labels of all rows stand in one column / строка без иконки хранит её место */
.tao-command-palette__list.has-icons .tao-command-palette__option:not(.has-icon) .tao-command-palette__text {
    padding-inline-start: calc(var(--_icon) + var(--tao-space-3));
}

/*
 * The description stands in the same line, after the label, and gives way first: it is cut with an ellipsis and never
 * pushes the label or makes the row taller, so every row has one height and the arrows walk in equal steps.
 * Описание стоит в той же строке, после подписи, и уступает место первым: обрезается многоточием и не двигает
 * подпись и не делает строку выше, поэтому у всех строк одна высота, а стрелки ходят равными шагами.
 */
.tao-command-palette__text {
    display: flex;
    flex: 1;
    align-items: baseline;
    gap: var(--tao-space-3);
    min-width: 0;
}

.tao-command-palette__label {
    flex: none;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-command-palette__label mark {
    background: none;
    color: var(--tao-color-accent);
    font-weight: 600;
}

.tao-command-palette__description {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    color: var(--tao-color-text-muted);
    font-size: var(--tao-control-font-size-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-command-palette__where {
    flex: none;
    color: var(--tao-color-text-muted);
    font-size: var(--tao-control-font-size-secondary);
}

.tao-command-palette__shortcut {
    flex: none;
    color: var(--tao-color-text-muted);
    font: inherit;
    font-size: var(--tao-control-font-size-secondary);
    font-variant-numeric: tabular-nums;
}

.tao-command-palette__empty {
    padding: var(--tao-space-6) var(--tao-space-4);
    color: var(--tao-color-text-muted);
    text-align: center;
}

.tao-command-palette-fade-enter-active,
.tao-command-palette-fade-leave-active {
    transition: opacity var(--tao-duration-fast, 120ms) ease;
}

.tao-command-palette-fade-enter-from,
.tao-command-palette-fade-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .tao-command-palette-fade-enter-active,
    .tao-command-palette-fade-leave-active {
        transition: none;
    }
}
</style>
