<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue';
import { matchCommands, splitByRanges, type TaoCommandItem, type TaoCommandMatch } from '../commandPalette';
import { useLocaleText } from '../locale';
import TaoIcon from './TaoIcon.vue';

// The search field and the list of commands, with no window around them: lay it in a page, a panel or a TaoPopover.
// TaoCommandPalette is this inside a dialog.
// Поле поиска и список команд без окна вокруг: кладите его в страницу, панель или TaoPopover. TaoCommandPalette — это
// он же внутри диалога.
defineOptions({ name: 'TaoCommandList' });

interface Props {
    /** The commands. The list only searches and shows them: running one is `@select`. / Команды. */
    items: readonly TaoCommandItem[];
    /** The hint in the empty field. / Подсказка в пустом поле. */
    placeholder?: string;
    /** What is shown when nothing fits. / Что показано, когда ничего не подошло. */
    emptyText?: string;
    /** The name of the list for a screen reader. / Имя списка для скринридера. */
    label?: string;
    /** The most rows shown. Default 50. / Сколько строк показывать не больше. По умолчанию 50. */
    limit?: number;
    /** Put the focus in the field when the list appears. / Поставить фокус в поле при появлении. */
    autofocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), { limit: 50 });
const l10n = useLocaleText(props, 'commandPalette');

const emit = defineEmits<{
    /** The user picked a command (Enter or a click). / Выбрана команда (Enter или клик). */
    select: [item: TaoCommandItem];
    /** Escape was pressed in the field; the list closes nothing itself. / Нажат Esc в поле; сам список ничего не закрывает. */
    escape: [];
}>();

const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
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

function choose(index: number) {
    const match = results.value[index];
    if (!match || match.item.disabled) return;
    emit('select', match.item);
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
        case 'Escape':
            emit('escape');
            break;
        case 'Tab':
            event.preventDefault(); // the focus stays in the field: the list is walked with the arrows / фокус остаётся в поле
            break;
    }
}

// a new query starts from the best row that can be picked / новый запрос начинается с лучшей строки, которую можно выбрать
watch(
    results,
    () => {
        active.value = firstEnabled();
    },
    { immediate: true },
);

watch(active, async (index) => {
    await nextTick();
    document.getElementById(optionId(index))?.scrollIntoView?.({ block: 'nearest' });
});

// a tick later, so it comes after a container that focuses its own panel when it opens (TaoPopover does) / на тик позже,
// чтобы после контейнера, который сам фокусирует свою панель при открытии (TaoPopover так делает)
onMounted(async () => {
    if (!props.autofocus) return;
    await nextTick();
    inputRef.value?.focus({ preventScroll: true });
});

defineExpose({
    /** Puts the focus in the field. / Ставит фокус в поле. */
    focus: () => inputRef.value?.focus(),
    /** Clears the query. / Очищает запрос. */
    reset: () => {
        query.value = '';
    },
});
</script>

<template>
    <div class="tao-command-list">
        <input
            ref="inputRef"
            v-model="query"
            class="tao-command-list__input"
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
        <ul :id="listId" class="tao-command-list__list" :class="{ 'has-icons': hasIcons }" role="listbox" :aria-label="label ?? l10n.label">
            <template v-for="(row, i) in rows" :key="row.kind === 'group' ? `g-${i}` : row.match.item.id">
                <li v-if="row.kind === 'group'" class="tao-command-list__group" role="presentation">{{ row.title }}</li>
                <li
                    v-else
                    :id="optionId(row.index)"
                    class="tao-command-list__option"
                    :class="{ 'is-active': row.index === active, 'is-disabled': row.match.item.disabled, 'has-icon': row.match.item.icon }"
                    role="option"
                    :aria-selected="row.index === active"
                    :aria-disabled="row.match.item.disabled || undefined"
                    @pointermove="enabled(row.index) && (active = row.index)"
                    @click="choose(row.index)"
                >
                    <slot name="item" :item="row.match.item" :active="row.index === active" :ranges="row.match.ranges">
                        <TaoIcon v-if="row.match.item.icon" class="tao-command-list__icon" :name="row.match.item.icon" aria-hidden="true" />
                        <span class="tao-command-list__text">
                            <span class="tao-command-list__label"
                                ><template v-for="(part, k) in splitByRanges(row.match.item.label, row.match.ranges)" :key="k"
                                    ><mark v-if="part.lit">{{ part.text }}</mark
                                    ><template v-else>{{ part.text }}</template></template
                                ></span
                            >
                            <span v-if="row.match.item.description" class="tao-command-list__description">{{ row.match.item.description }}</span>
                        </span>
                        <span v-if="query.trim() && row.match.item.group" class="tao-command-list__where">{{ row.match.item.group }}</span>
                        <kbd v-if="row.match.item.shortcut" class="tao-command-list__shortcut">{{ row.match.item.shortcut }}</kbd>
                    </slot>
                </li>
            </template>
            <li v-if="!results.length" class="tao-command-list__empty" role="presentation">
                <slot name="empty">{{ emptyText ?? l10n.emptyText }}</slot>
            </li>
        </ul>
    </div>
</template>

<style scoped>
/*
 * One scale for the whole list. The field and the rows share --tao-control-font-size, the field is one step taller
 * than a row, and its text starts exactly where the labels of the rows start (--_pad-x). It sets its own text size
 * because it may sit in a teleported panel, where the 16px of the page would reach the rows but not the field.
 * Одна шкала на весь список. Поле и строки на одном --tao-control-font-size, поле на ступень выше строки, а его текст
 * начинается там же, где подписи строк (--_pad-x). Размер текста задан здесь: список может стоять в телепортированной
 * панели, где 16px страницы дошли бы до строк, но не до поля.
 */
.tao-command-list {
    --_pad-x: var(--tao-space-3);
    --_icon: 16px;
    --_row: var(--tao-control-height);
    display: flex;
    flex-direction: column;
    /* as tall as the parent that gives it a height (auto when it gives none), and the list scrolls inside */
    height: 100%;
    min-height: 0;
    color: var(--tao-color-text);
    font-family: var(--tao-font-family);
    font-size: var(--tao-control-font-size);
    line-height: 1.4;
}

.tao-command-list__input {
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

.tao-command-list__input::placeholder {
    color: var(--tao-color-text-muted);
}

.tao-command-list__input:focus {
    outline: none;
}

.tao-command-list__input:focus-visible {
    box-shadow: inset 0 -2px 0 var(--tao-color-accent);
}

.tao-command-list__list {
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: var(--tao-space-2);
    overflow-y: auto;
    /* the wheel at the end of the list does not go on to scroll the page behind it / колесо в конце списка не листает страницу */
    overscroll-behavior: contain;
    list-style: none;
}

/* a caption of a group: smaller, capitals, spaced, and a hairline above every group but the first, so it cannot pass for a row */
/* подпись группы: мельче, капителью, с разрядкой, и линия над каждой группой, кроме первой: на строку она не похожа */
.tao-command-list__group {
    padding: var(--tao-space-2) var(--_pad-x) var(--tao-space-1);
    color: var(--tao-color-text-muted);
    font-size: var(--tao-font-size-xs);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    user-select: none;
}

.tao-command-list__group:not(:first-child) {
    margin-top: var(--tao-space-2);
    padding-top: var(--tao-space-3);
    border-top: 1px solid var(--tao-color-border);
}

.tao-command-list__option {
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
.tao-command-list__option[aria-selected='true'] {
    background: var(--tao-color-accent-subtle, var(--tao-color-surface-hover));
    color: var(--tao-color-text-strong);
}

.tao-command-list__option.is-disabled {
    color: var(--tao-color-text-disabled);
    cursor: default;
}

.tao-command-list__icon {
    flex: none;
    width: var(--_icon);
    height: var(--_icon);
    color: var(--tao-color-text-muted);
}

/* a row without an icon keeps its place: the labels of all rows stand in one column / строка без иконки хранит её место */
.tao-command-list__list.has-icons .tao-command-list__option:not(.has-icon) .tao-command-list__text {
    padding-inline-start: calc(var(--_icon) + var(--tao-space-3));
}

/*
 * The description stands in the same line, after the label, and gives way first: it is cut with an ellipsis and never
 * pushes the label or makes the row taller, so every row has one height and the arrows walk in equal steps.
 * Описание стоит в той же строке, после подписи, и уступает место первым: обрезается многоточием и не двигает
 * подпись и не делает строку выше, поэтому у всех строк одна высота, а стрелки ходят равными шагами.
 */
.tao-command-list__text {
    display: flex;
    flex: 1;
    align-items: baseline;
    gap: var(--tao-space-3);
    min-width: 0;
}

.tao-command-list__label {
    flex: none;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-command-list__label mark {
    background: none;
    color: var(--tao-color-accent);
    font-weight: 600;
}

.tao-command-list__description {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    color: var(--tao-color-text-muted);
    font-size: var(--tao-control-font-size-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-command-list__where {
    flex: none;
    color: var(--tao-color-text-muted);
    font-size: var(--tao-control-font-size-secondary);
}

.tao-command-list__shortcut {
    flex: none;
    color: var(--tao-color-text-muted);
    font: inherit;
    font-size: var(--tao-control-font-size-secondary);
    font-variant-numeric: tabular-nums;
}

.tao-command-list__empty {
    padding: var(--tao-space-6) var(--tao-space-4);
    color: var(--tao-color-text-muted);
    text-align: center;
}
</style>
