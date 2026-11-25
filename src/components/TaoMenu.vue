<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, provide, ref, useId, watch } from 'vue';
import { densityClass, resolveDensity, type TaoResolvedDensity } from '../density';
import { useDismiss } from '../dismiss';
import { isVirtualAnchor, useFloating, type TaoAnchor, type TaoPlacement } from '../floating';
import { useLayer } from '../layers';
import { useRoving } from '../primitives/useRoving';
import TaoKbd from './TaoKbd.vue';
import {
    isMenuSelectable,
    menuItemLabel,
    menuReturnsFocus,
    menuTreeKey,
    type TaoCloseReason,
    type TaoMenuItem,
    type TaoMenuPick,
    type TaoMenuTree,
} from '../menu';
import TaoIcon from './TaoIcon.vue';

defineOptions({ name: 'TaoMenu' });

// The menu panel: a floating list of items with submenus, checkboxes, radios, shortcuts and type-ahead.
// TaoDropdownMenu (a button + this panel) and the future TaoMenubar are thin shells around it.
// Панель меню: плавающий список с подменю, чекбоксами, радио, подписями сочетаний и быстрым поиском.
// TaoDropdownMenu (кнопка + эта панель) и будущий TaoMenubar — тонкие оболочки вокруг неё.
const props = withDefaults(
    defineProps<{
        items: TaoMenuItem[];
        open: boolean;
        /**
         * What the panel hangs from: a button, the item a submenu opens from, or a point `{ x, y }` on the screen (viewport
         * coordinates, optionally `width` / `height`) for a menu at the pointer. A point follows nothing: the panel stays at that
         * screen point (it is `fixed`), flips and shifts at the edges, and the focus goes back to where it was before the menu
         * opened. Change the point and the menu moves; swap an element for a point and back.
         * К чему крепится панель: кнопка, пункт, из которого открыто подменю, или точка `{ x, y }` экрана (координаты окна, при
         * желании `width` / `height`) для меню у указателя. Точка ни за чем не следует: панель стоит в этой точке экрана
         * (`fixed`), у краёв переворачивается и сдвигается, а фокус при закрытии возвращается туда, где был до открытия.
         * Сменили точку — меню переехало; элемент можно менять на точку и обратно.
         */
        anchor: TaoAnchor | null;
        /**
         * Default `bottom-end` for an element, `bottom-start` for a point (the top-left corner at the point, 4px under it).
         * По умолчанию `bottom-end` для элемента, `bottom-start` для точки (левый верхний угол у точки, на 4px ниже).
         */
        placement?: TaoPlacement;
        /** Accessible name of the menu. / Имя меню для скринридера. */
        label?: string;
        /**
         * Close when the page, or a scroll container that holds the anchor, scrolls: the place the menu is for moves away.
         * A scroll elsewhere (an autoplaying carousel, a live log) and inside the menu does not count. For a point the holder
         * is the element under it when the menu opens. A root menu only.
         * Закрывать при прокрутке страницы или контейнера, в котором лежит якорь: место, для которого меню, уезжает.
         * Прокрутка в другом месте (карусель с автопрокруткой, живой лог) и внутри меню не считается. Для точки держатель —
         * элемент под ней в момент открытия. Только корневое меню.
         */
        closeOnScroll?: boolean;
    }>(),
    {
        placement: undefined,
        label: undefined,
        closeOnScroll: false,
    },
);

const emit = defineEmits<{
    /** The id of the picked item (a root menu only; a submenu reports to its parent). / id выбранного пункта. */
    select: [item: TaoMenuPick];
    /** The menu wants to be closed; the owner turns `open` off. / Меню просит закрыть себя. */
    close: [reason: TaoCloseReason];
    /** The pointer entered a submenu panel (its parent stops a pending close). / Указатель вошёл в панель подменю. */
    enter: [];
    /** ← / → on the top level with nothing to open or close: the owner (a menu bar) moves to the neighbour menu. / ← / → на верхнем уровне: владелец (полоса меню) переходит к соседнему меню. */
    edge: [direction: 'prev' | 'next'];
}>();

defineSlots<{
    /** Replaces the text of one item. / Заменяет содержимое пункта. */
    item?(props: { item: TaoMenuItem; id: string; label: string; icon?: string }): unknown;
}>();

// With a virtual anchor there is no trigger to give the focus back to: the menu remembers what had it before it opened.
// У виртуального якоря нет кнопки, куда вернуть фокус: меню запоминает, у кого он был до открытия.
let returnTo: HTMLElement | null = null;
let lastReason: TaoCloseReason | undefined;

const parent = inject(menuTreeKey, null);
const isSub = parent !== null;
const ownRootId = useId();
const tree: TaoMenuTree = parent ?? {
    rootId: ownRootId,
    select: (item) => {
        if ('id' in item) {
            emit('select', item);
        }
    },
    closeAll: (reason) => {
        lastReason = reason;
        emit('close', reason);
    },
};
provide(menuTreeKey, tree);

const panelRef = ref<HTMLElement | null>(null);
const itemRefs = ref<(HTMLElement | null)[]>([]);
const activeIndex = ref(-1);
const openSub = ref(-1);
const menuId = useId();
/** The density where the menu hangs from: in body the panel would not inherit it. / Плотность в точке якоря. */
const density = ref<TaoResolvedDensity>('default');
let closeSubTimer: ReturnType<typeof setTimeout> | undefined;

const enabled = computed(() => props.items.map(isMenuSelectable));
const itemId = (index: number) => `${menuId}-item-${index}`;
const activeId = computed(() => (activeIndex.value >= 0 ? itemId(activeIndex.value) : undefined));

const { style: panelStyle } = useFloating(() => props.anchor, panelRef, () => props.open, {
    placement: () => props.placement ?? (isVirtualAnchor(props.anchor) ? 'bottom-start' : 'bottom-end'),
    gap: isSub ? 0 : 4,
});

// the root closes on a press outside the whole tree, a submenu leaves that to its root
useDismiss(
    () => props.open && !isSub,
    () => [props.anchor instanceof Element ? props.anchor : null, ...document.querySelectorAll(`[data-tao-menu-root="${tree.rootId}"]`)],
    () => tree.closeAll('outside'),
);

// Escape closes the top layer only: an open submenu first, then its parent
useLayer(() => props.open, {
    onEscape: () => (isSub ? emit('close', 'escape') : tree.closeAll('escape')),
});

const nav = useRoving({
    enabled: () => enabled.value,
    active: activeIndex,
    labels: () => props.items.map(menuItemLabel),
    onMove: () => {
        closeSub();
        scrollActiveIntoView();
    },
});

function scrollActiveIntoView() {
    itemRefs.value[activeIndex.value]?.scrollIntoView?.({ block: 'nearest' });
}

function cancelSubClose() {
    clearTimeout(closeSubTimer);
}

function closeSub() {
    clearTimeout(closeSubTimer);
    openSub.value = -1;
}

function openSubmenu(index: number) {
    clearTimeout(closeSubTimer);
    openSub.value = index;
}

function activate(index: number) {
    const item = props.items[index];
    if (!item || !isMenuSelectable(item)) {
        return;
    }
    if ('items' in item && item.items) {
        openSubmenu(index);
        return;
    }
    tree.select(item);
    tree.closeAll('select');
}

function onKeydown(event: KeyboardEvent) {
    if (nav.onKeydown(event)) {
        return;
    }

    const item = props.items[activeIndex.value];
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(activeIndex.value);
    } else if (event.key === 'ArrowRight' && item && 'items' in item && item.items && isMenuSelectable(item)) {
        event.preventDefault();
        openSubmenu(activeIndex.value);
    } else if (event.key === 'ArrowLeft' && isSub) {
        event.preventDefault();
        emit('close', 'escape');
    } else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !isSub) {
        event.preventDefault();
        emit('edge', event.key === 'ArrowLeft' ? 'prev' : 'next');
    } else if (event.key === 'Tab') {
        event.preventDefault();
        tree.closeAll('tab');
    }
}

function onItemEnter(index: number) {
    if (!enabled.value[index]) {
        return;
    }
    activeIndex.value = index;
    const item = props.items[index];
    if (item && 'items' in item && item.items) {
        openSubmenu(index);
        return;
    }
    // a short delay: the pointer crossing a neighbour on its way to the submenu must not close it
    if (openSub.value >= 0) {
        clearTimeout(closeSubTimer);
        closeSubTimer = setTimeout(closeSub, 150);
    }
}

function onSubClose() {
    closeSub();
    panelRef.value?.focus({ preventScroll: true });
}

function role(item: TaoMenuItem) {
    return item.type === 'checkbox' ? 'menuitemcheckbox' : item.type === 'radio' ? 'menuitemradio' : 'menuitem';
}

watch(
    () => props.open,
    async (isOpen) => {
        if (!isOpen) {
            closeSub();
            restoreFocus();
            return;
        }
        lastReason = undefined;
        returnTo = !isSub && isVirtualAnchor(props.anchor) && document.activeElement instanceof HTMLElement ? document.activeElement : null;
        activeIndex.value = enabled.value.indexOf(true);
        density.value = resolveDensity(props.anchor instanceof Element ? props.anchor : null);
        await nextTick();
        panelRef.value?.focus({ preventScroll: true });
    },
    { immediate: true },
);

function restoreFocus() {
    const target = returnTo;
    returnTo = null;
    if (!target || !target.isConnected) {
        return;
    }
    // went elsewhere on purpose (a press, a scroll): leave the focus; closed from outside with no reason: only if it was in the menu
    // ушёл нарочно (нажатие, прокрутка): не трогаем; закрыто владельцем без причины: только если фокус был в меню
    const active = document.activeElement;
    const lost = !active || active === document.body || Boolean(panelRef.value?.contains(active));
    if (lastReason ? menuReturnsFocus(lastReason) : lost) {
        target.focus({ preventScroll: true });
    }
}

watch(
    () => props.open && props.closeOnScroll && !isSub,
    (listen, _was, onCleanup) => {
        if (!listen || typeof window === 'undefined') {
            return;
        }
        // what the menu is for: the anchor element, or the element under the point (read now, before the panel covers it)
        // то, для чего меню: элемент-якорь или элемент под точкой (читаем сейчас, пока панель его не закрыла)
        const anchor = props.anchor;
        const holder: Element | null = isVirtualAnchor(anchor)
            ? (document.elementFromPoint?.(anchor.x + (anchor.width ?? 0) / 2, anchor.y + (anchor.height ?? 0) / 2) ?? returnTo)
            : anchor;
        const onScroll = (event: Event) => {
            const target = event.target;
            // a long menu scrolls its own list: that is not the page moving away
            // длинное меню прокручивает свой список: это не уезжающая страница
            if (target instanceof Element && target.closest('.tao-menu')) {
                return;
            }
            // a container that does not hold the anchor (a carousel elsewhere on the page) moves nothing under the menu
            // контейнер, в котором якоря нет (карусель в другом месте страницы), ничего под меню не двигает
            const page = !(target instanceof Element) || target === document.documentElement || target === document.body;
            if (!page && holder && !target.contains(holder)) {
                return;
            }
            tree.closeAll('scroll');
        };
        window.addEventListener('scroll', onScroll, { capture: true, passive: true });
        onCleanup(() => window.removeEventListener('scroll', onScroll, true));
    },
    { immediate: true },
);

onBeforeUnmount(() => clearTimeout(closeSubTimer));
</script>

<template>
    <Teleport to="body">
        <div
            v-if="open"
            ref="panelRef"
            class="tao-menu"
            :class="densityClass(density)"
            role="menu"
            tabindex="-1"
            :aria-label="label"
            :aria-activedescendant="activeId"
            :data-tao-menu-root="tree.rootId"
            :style="panelStyle"
            @keydown="onKeydown"
            @mouseenter="emit('enter')"
        >
            <template v-for="(item, index) in items" :key="'id' in item ? item.id : `${item.type}-${index}`">
                <div v-if="item.type === 'separator'" class="tao-menu__separator" role="separator"></div>
                <div v-else-if="item.type === 'label'" class="tao-menu__label" role="presentation" :lang="item.lang">{{ item.label }}</div>
                <template v-else>
                    <div
                        :id="itemId(index)"
                        :ref="(el) => (itemRefs[index] = el as HTMLElement | null)"
                        class="tao-menu__item"
                        :class="{
                            'tao-menu__item--active': index === activeIndex,
                            'tao-menu__item--disabled': item.disabled,
                            'tao-menu__item--checked': 'checked' in item && item.checked,
                        }"
                        :role="role(item)"
                        :lang="item.lang"
                        :aria-checked="'checked' in item ? item.checked : undefined"
                        :aria-disabled="item.disabled || undefined"
                        :aria-haspopup="'items' in item && item.items ? 'menu' : undefined"
                        :aria-expanded="'items' in item && item.items ? openSub === index : undefined"
                        :aria-keyshortcuts="'shortcut' in item ? item.shortcut : undefined"
                        @click="activate(index)"
                        @mouseenter="onItemEnter(index)"
                    >
                        <span v-if="item.type === 'checkbox' || item.type === 'radio'" class="tao-menu__mark" :class="`tao-menu__mark--${item.type}`" aria-hidden="true"></span>
                        <slot name="item" :item="item" :id="'id' in item ? item.id : ''" :label="item.label" :icon="'icon' in item ? item.icon : undefined">
                            <TaoIcon v-if="'icon' in item && item.icon" class="tao-menu__icon" :name="item.icon" />
                            <span class="tao-menu__text">{{ item.label }}</span>
                        </slot>
                        <TaoKbd v-if="'shortcut' in item && item.shortcut" variant="plain" class="tao-menu__shortcut">{{ item.shortcut }}</TaoKbd>
                        <span v-if="'items' in item && item.items" class="tao-menu__arrow" aria-hidden="true"></span>
                    </div>
                    <TaoMenu
                        v-if="'items' in item && item.items && openSub === index"
                        :items="item.items"
                        :open="true"
                        :anchor="itemRefs[index] ?? null"
                        placement="right-start"
                        :label="item.label"
                        @close="onSubClose"
                        @enter="cancelSubClose"
                    />
                </template>
            </template>
        </div>
    </Teleport>
</template>

<style>
.tao-menu {
    z-index: var(--tao-z-popup);
    position: fixed;
    min-width: 160px;
    max-width: min(360px, calc(100vw - 16px));
    max-height: calc(100vh - 16px);
    overflow-y: auto;
    /* the wheel at the end does not go on to scroll the page behind / колесо в конце не листает страницу за окном */
    overscroll-behavior: contain;
    padding: var(--tao-space-1);
    display: flex;
    flex-direction: column;
    font-size: var(--tao-font-size-md);
    color: var(--tao-color-text);
    background-color: var(--tao-color-surface-raised);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-shadow-md);
}

.tao-menu:focus {
    outline: none;
}

.tao-menu__item {
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    /* the control padding: the density (comfortable rows for a finger) reaches the menus too */
    padding: var(--tao-control-padding-y) var(--tao-control-padding-x);
    /* concentric corners: the panel radius minus its padding / концентричные углы */
    border-radius: max(0px, calc(var(--tao-radius-panel) - var(--tao-space-1)));
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    /* a row the pointer sweeps across changes at once, as in a system menu: a fade would trail behind it
       строку, по которой пробегает указатель, подсвечиваем сразу, как в системном меню */
    transition: none;
}

.tao-menu__item--active {
    color: var(--tao-color-text-strong);
    background-color: var(--tao-color-hover);
}

.tao-menu__item--disabled {
    color: var(--tao-color-text-disabled);
    cursor: default;
}

.tao-menu__item--disabled.tao-menu__item--active {
    color: var(--tao-color-text-disabled);
    background: none;
}

.tao-menu__text {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tao-menu__shortcut {
    margin-left: var(--tao-space-6);
    color: var(--tao-color-text-muted);
    font-size: var(--tao-font-size-sm);
}

.tao-menu__separator {
    height: 1px;
    margin: var(--tao-space-1) var(--tao-space-2);
    background: var(--tao-color-border);
}

.tao-menu__label {
    padding: var(--tao-space-2) var(--tao-space-3) var(--tao-space-1);
    color: var(--tao-color-text-muted);
    font-size: var(--tao-font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

/* check / radio marks drawn with borders: no glyphs, same everywhere. / галочка и точка рисуются границами, без символов */
.tao-menu__mark {
    position: relative;
    flex: 0 0 auto;
    width: 14px;
    height: 14px;
}

.tao-menu__item--checked .tao-menu__mark--checkbox::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 0;
    width: 4px;
    height: 9px;
    border: solid currentColor;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.tao-menu__item--checked .tao-menu__mark--radio::after {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: var(--tao-radius-full);
    background: currentColor;
}

/* submenu arrow */
.tao-menu__arrow {
    flex: 0 0 auto;
    width: 6px;
    height: 6px;
    margin-left: var(--tao-space-4);
    border: solid currentColor;
    border-width: 2px 2px 0 0;
    transform: rotate(45deg);
    opacity: 0.7;
}
</style>
