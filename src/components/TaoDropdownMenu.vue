<script lang="ts" setup>
import { ref } from 'vue';
import type { TaoPlacement } from '../floating';
import { useLocaleText } from '../locale';
import { menuReturnsFocus, type TaoCloseReason, type TaoMenuItem, type TaoMenuPick } from '../menu';
import { sizeClass, type TaoSize } from '../size';
import TaoIcon from './TaoIcon.vue';
import TaoMenu from './TaoMenu.vue';

defineOptions({ name: 'TaoDropdownMenu' });

const props = withDefaults(
    defineProps<{
        /** Entries: items, submenus, checkboxes, radios, separators (see TaoMenuItem). / Пункты: обычные, подменю, чекбоксы, радио, разделители. */
        items?: TaoMenuItem[];
        /** Where the list opens against the button; flips when there is no room. / Где открывается список; при нехватке места переворачивается. */
        placement?: TaoPlacement;
        menuLabel?: string;
        /** Close when the page scrolls (the menu otherwise follows its button). / Закрывать при прокрутке страницы (иначе меню едет за кнопкой). */
        closeOnScroll?: boolean;
        /**
         * The button becomes a square of the control height of this size (a compact kebab in a list row); without it the
         * button keeps its padding around the icon.
         * Кнопка становится квадратом высотой с контрол этого размера (компактный «кебаб» в строке списка); без него
         * кнопка остаётся с отступом вокруг иконки.
         */
        size?: TaoSize;
        /**
         * The three dots of the button: `vertical` (⋮, a narrow column, a toolbar) or `horizontal` (⋯, a row of a table or a
         * list, the corner of a card). Ignored when the `#icon` or `#button` slot is given.
         * Три точки кнопки: `vertical` (⋮, узкая колонка, тулбар) или `horizontal` (⋯, строка таблицы или списка, угол
         * карточки). Игнорируется, если передан слот `#icon` или `#button`.
         */
        dots?: 'vertical' | 'horizontal';
        /**
         * The button is a Tab stop. Turn it off when the row has its own key for the menu (a menu key, Shift+F10): the
         * button leaves the Tab order and still opens by a click.
         * Кнопка — остановка Tab. Выключите, когда у строки своя клавиша для меню (клавиша меню, Shift+F10): кнопка
         * уходит из порядка Tab и по-прежнему открывается нажатием.
         */
        tabbable?: boolean;
        /**
         * The button fills the width (and the height) of its place and draws nothing of its own: no padding, no
         * background, the corners of its parent. For a trigger that is a whole chip of your own in `#button` (the
         * project of an app under the main action of TaoNav, an account in a header): the chip is the button, the hover
         * and the focus ring go round it.
         * Кнопка занимает ширину (и высоту) своего места и не рисует ничего своего: без отступа, без фона, с углами
         * родителя. Для кнопки, которая целиком ваша «фишка» в `#button` (проект приложения под главным действием TaoNav,
         * аккаунт в шапке): фишка и есть кнопка, наведение и рамка фокуса обходят её.
         */
        block?: boolean;
    }>(),
    {
        items: () => [],
        placement: 'bottom-end',
        closeOnScroll: false,
        size: undefined,
        dots: 'vertical',
        tabbable: true,
        block: false,
    },
);
const l10n = useLocaleText(props, 'dropdownMenu');

const emit = defineEmits<{
    /** The picked item (`item.id` names it). / Выбранный пункт (`item.id` называет его). */
    select: [item: TaoMenuPick];
}>();

defineSlots<{
    /** The whole trigger content, replaces the button face. / Всё содержимое кнопки. */
    button?(): unknown;
    /** The default button face (three dots). / Вид кнопки по умолчанию. */
    icon?(): unknown;
    /** Replaces the text of one item. / Заменяет содержимое пункта. */
    item?(props: { item: TaoMenuItem; id: string; label: string; icon?: string }): unknown;
}>();

const triggerRef = ref<HTMLButtonElement | null>(null);
const isOpen = ref(false);

function toggleMenu() {
    isOpen.value = !isOpen.value;
}

function onClose(reason: TaoCloseReason) {
    isOpen.value = false;
    // a press elsewhere leaves the focus where the user put it / нажатие в другом месте оставляет фокус там, куда его поставили
    if (menuReturnsFocus(reason)) {
        triggerRef.value?.focus();
    }
}

function onTriggerKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        isOpen.value = true;
    }
}
</script>

<template>
    <div class="tao-dropdown-menu" :class="{ 'tao-dropdown-menu--block': block }">
        <button
            ref="triggerRef"
            type="button"
            class="tao-dropdown-menu__button"
            :class="size ? [sizeClass(size), 'tao-dropdown-menu__button--sized'] : undefined"
            :tabindex="tabbable ? undefined : -1"
            aria-haspopup="menu"
            :aria-expanded="isOpen"
            :aria-label="$slots.button ? undefined : l10n.menuLabel"
            @click="toggleMenu"
            @keydown="onTriggerKeydown"
        >
            <slot v-if="$slots.button" name="button" />
            <span v-else aria-hidden="true">
                <slot name="icon"><TaoIcon :name="dots === 'horizontal' ? 'tao-more-horizontal' : 'tao-more-vertical'" /></slot>
            </span>
        </button>

        <TaoMenu
            :items="items"
            :open="isOpen"
            :anchor="triggerRef"
            :placement="placement"
            :label="menuLabel ?? l10n.menuLabel"
            :close-on-scroll="closeOnScroll"
            @select="emit('select', $event)"
            @close="onClose"
        >
            <template v-if="$slots.item" #item="slotProps">
                <slot name="item" v-bind="slotProps" />
            </template>
        </TaoMenu>
    </div>
</template>

<style scoped>
.tao-dropdown-menu {
    position: relative;
    display: inline-block;
}

.tao-dropdown-menu__button {
    padding: var(--tao-space-2);
    color: var(--tao-color-text);
    border: none;
    border-radius: var(--tao-radius-control);
    background: none;
    cursor: pointer;
    user-select: none;
    font: inherit;
    line-height: 1;
    transition: var(--tao-transition-base);
}

.tao-dropdown-menu__button--sized {
    display: inline-grid;
    place-items: center;
    box-sizing: border-box;
    width: var(--tao-control-height);
    height: var(--tao-control-height);
    padding: 0;
}

.tao-dropdown-menu__button:hover {
    background: var(--tao-color-hover);
}

/* block: the place of the menu is the button; the chip in #button draws the rest
   block: место меню — это кнопка; остальное рисует фишка в #button */
.tao-dropdown-menu--block {
    display: block;
    border-radius: var(--tao-radius-control);
}

.tao-dropdown-menu--block > .tao-dropdown-menu__button {
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0;
    border-radius: inherit;
    text-align: start;
}

/* the button fills its place, often a box that clips (the action of TaoNav): the ring goes inside, as on a list row
   кнопка занимает своё место, часто внутри обрезающего блока (действие TaoNav): рамка внутри, как у строки списка */
.tao-dropdown-menu--block > .tao-dropdown-menu__button:focus-visible {
    outline-offset: -2px;
}

.tao-dropdown-menu--block > .tao-dropdown-menu__button > :slotted(*) {
    flex: 1 1 auto;
    min-width: 0;
}

.tao-dropdown-menu__button:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}
</style>
