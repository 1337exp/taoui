<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue';
import { useLocaleText } from '../locale';
import { isMenuSelectable, menuReturnsFocus, type TaoMenuActionItem, type TaoMenuCloseReason, type TaoMenuItem } from '../menu';
import { sizeClass, type TaoSize } from '../size';
import TaoMenu from './TaoMenu.vue';

defineOptions({ name: 'TaoMenubar' });

// The strip of menus on top of an editor: File | Edit | View. ARIA `menubar`: the bar is one tab stop, ← / → walk the
// menus, ↓ / Enter / Space open one, and with a menu open ← / → move on to the neighbour menu. Each top entry is an item
// with `items` (its menu); an entry without `items` is a plain action. The panels are TaoMenu: submenus, checkboxes,
// radios, shortcuts to show, type-ahead, everything of TaoDropdownMenu.
// Полоса меню над редактором: Файл | Правка | Вид. ARIA `menubar`: полоса — одна остановка Tab, ← / → ходят по меню,
// ↓ / Enter / Space открывают, при открытом меню ← / → переходят к соседнему.
const props = withDefaults(
    defineProps<{
        /** The top entries: `{ id, label, items }` for a menu, `{ id, label }` for a plain action. / Верхние пункты. */
        items: TaoMenuItem[];
        /** Without it the size of ancestors. / Без него — размер предков. */
        size?: TaoSize;
        /** Accessible name of the bar. / Имя полосы для скринридера. */
        ariaLabel?: string;
        /** Close an open menu when the page scrolls (otherwise it follows its entry). / Закрывать меню при прокрутке (иначе оно едет за пунктом). */
        closeOnScroll?: boolean;
    }>(),
    {
        size: undefined,
        ariaLabel: undefined,
        closeOnScroll: false,
    },
);
const l10n = useLocaleText(props, 'menubar');

const emit = defineEmits<{
    /** The id of the picked item, in a menu or a plain top entry. / id выбранного пункта. */
    select: [id: string];
}>();

defineSlots<{
    /** Replaces the text of one item inside the menus. / Заменяет содержимое пункта в меню. */
    item?(props: { item: TaoMenuItem; id: string; label: string; icon?: string }): unknown;
}>();

// only entries that can be reached: separators and group labels mean nothing on a bar
const entries = computed(() =>
    props.items.filter((item): item is TaoMenuActionItem => item.type === undefined || item.type === 'item'),
);

const buttons = ref<(HTMLElement | null)[]>([]);
const openIndex = ref(-1);
/** The entry that is the tab stop (roving tabindex). / Пункт, на котором стоит Tab. */
const current = ref(0);

const enabled = computed(() => entries.value.map(isMenuSelectable));
const hasMenu = (index: number) => Boolean(entries.value[index]?.items?.length);

function step(from: number, delta: 1 | -1) {
    const count = entries.value.length;
    for (let i = 1; i <= count; i += 1) {
        const index = (from + delta * i + count * i) % count;
        if (enabled.value[index]) {
            return index;
        }
    }
    return from;
}

function focusEntry(index: number) {
    current.value = index;
    void nextTick(() => buttons.value[index]?.focus());
}

function open(index: number) {
    if (!enabled.value[index]) {
        return;
    }
    current.value = index;
    openIndex.value = hasMenu(index) ? index : -1;
}

function close() {
    openIndex.value = -1;
}

function activate(index: number) {
    const entry = entries.value[index];
    if (!entry || !enabled.value[index]) {
        return;
    }
    if (hasMenu(index)) {
        if (openIndex.value === index) {
            close();
        } else {
            open(index);
        }
        return;
    }
    close();
    emit('select', entry.id);
}

function onKeydown(event: KeyboardEvent, index: number) {
    const key = event.key;
    if (key === 'ArrowRight' || key === 'ArrowLeft') {
        event.preventDefault();
        const next = step(index, key === 'ArrowRight' ? 1 : -1);
        // with a menu open the neighbour opens too, as in every desktop menu bar
        if (openIndex.value >= 0) {
            open(next);
        }
        focusEntry(next);
    } else if (key === 'Home' || key === 'End') {
        event.preventDefault();
        const next = key === 'Home' ? enabled.value.indexOf(true) : enabled.value.lastIndexOf(true);
        if (next >= 0) {
            focusEntry(next);
        }
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
        if (hasMenu(index) && enabled.value[index]) {
            event.preventDefault();
            open(index);
        }
    } else if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        activate(index);
    }
}

function onEnter(index: number) {
    // while a menu is open, pointing at another one switches to it
    if (openIndex.value >= 0 && openIndex.value !== index && enabled.value[index]) {
        open(index);
    }
}

function onMenuClose(reason: TaoMenuCloseReason) {
    const index = openIndex.value;
    close();
    // a press elsewhere leaves the focus where the user put it
    if (menuReturnsFocus(reason) && index >= 0) {
        focusEntry(index);
    }
}

function onEdge(direction: 'prev' | 'next') {
    const next = step(openIndex.value, direction === 'next' ? 1 : -1);
    open(next);
    focusEntry(next);
}
</script>

<template>
    <div class="tao-menubar" :class="sizeClass(size)" role="menubar" :aria-label="l10n.ariaLabel">
        <template v-for="(entry, index) in entries" :key="entry.id">
            <button
                :ref="(el) => (buttons[index] = el as HTMLElement | null)"
                type="button"
                class="tao-menubar__item"
                :class="{ 'tao-menubar__item--open': openIndex === index }"
                role="menuitem"
                :tabindex="current === index ? 0 : -1"
                :aria-haspopup="hasMenu(index) ? 'menu' : undefined"
                :aria-expanded="hasMenu(index) ? openIndex === index : undefined"
                :aria-disabled="entry.disabled || undefined"
                @click="activate(index)"
                @keydown="onKeydown($event, index)"
                @mouseenter="onEnter(index)"
                @focus="current = index"
            >
                {{ entry.label }}
            </button>
            <TaoMenu
                v-if="hasMenu(index)"
                :items="entry.items!"
                :open="openIndex === index"
                :anchor="buttons[index] ?? null"
                placement="bottom-start"
                :label="entry.label"
                :close-on-scroll="closeOnScroll"
                @select="emit('select', $event)"
                @close="onMenuClose"
                @edge="onEdge"
            >
                <template v-if="$slots.item" #item="slotProps">
                    <slot name="item" v-bind="slotProps" />
                </template>
            </TaoMenu>
        </template>
    </div>
</template>

<style scoped>
.tao-menubar {
    display: flex;
    align-items: center;
    gap: var(--tao-space-1);
    min-height: var(--tao-control-height);
    padding: var(--tao-space-1);
    background: var(--tao-color-surface-raised);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    color: var(--tao-color-text);
    font-size: var(--tao-control-font-size);
}

.tao-menubar__item {
    height: calc(var(--tao-control-height) - var(--tao-space-2));
    padding: 0 var(--tao-space-3);
    /* concentric corners: the bar radius minus its padding / концентричные углы */
    border: 0;
    border-radius: max(0px, calc(var(--tao-radius-panel) - var(--tao-space-1)));
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    /* a row the pointer sweeps across changes at once, as in a system menu: a fade would trail behind it
       строку, по которой пробегает указатель, подсвечиваем сразу, как в системном меню */
    transition: none;
    /* selecting the text around must not catch the button label / выделение текста вокруг не захватывает подпись кнопки */
    user-select: none;
}

.tao-menubar__item:hover,
.tao-menubar__item--open {
    background: var(--tao-color-hover);
    color: var(--tao-color-text-strong);
}

.tao-menubar__item[aria-disabled='true'] {
    color: var(--tao-color-text-disabled);
    cursor: default;
}

.tao-menubar__item[aria-disabled='true']:hover {
    background: transparent;
}

.tao-menubar__item:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}
</style>
