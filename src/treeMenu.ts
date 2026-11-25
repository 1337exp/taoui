import { nextTick, ref, shallowRef, type Ref } from 'vue';
import type { TaoVirtualAnchor } from './floating';
import type { TaoMenuItem } from './menu';
import { menuSelection, type TaoTreeMenu, type TaoTreeNode, type TaoTreeRow, type TaoTreeSelection } from './tree';

/**
 * The context menu of a TaoTree row: a right click, the Menu key, Shift+F10. A right click outside the selection selects that row
 * first; the menu hangs from the pointer, or under the row when it came from the keyboard.
 * Контекстное меню строки TaoTree: правый клик, клавиша Menu, Shift+F10. Правый клик вне выбора сначала выбирает строку; меню
 * висит у указателя, а с клавиатуры под строкой.
 */
export interface TreeMenuOptions {
    menu: () => TaoTreeMenu | undefined;
    selection: () => TaoTreeSelection;
    selected: () => ReadonlySet<string>;
    setSelected: (value: string | string[] | null) => void;
    /** The row that holds the focus (roving tabindex). / Строка с фокусом. */
    current: Ref<number>;
    rowEl: (index: number) => HTMLElement | null | undefined;
    /** The app is asked first (`@menu`); it takes the request over with `event.preventDefault()`. / Сначала спрашиваем приложение. */
    ask: (node: TaoTreeNode, event: MouseEvent | KeyboardEvent) => void;
    /** An item was picked: its id, the row and the ids it acts on. / Выбран пункт. */
    pick: (id: string, node: TaoTreeNode, selected: string[]) => void;
}

export function useTreeMenu(o: TreeMenuOptions) {
    const menuOpen = ref(false);
    const menuAnchor = ref<TaoVirtualAnchor | null>(null);
    const menuItems = shallowRef<TaoMenuItem[]>([]);
    const menuNode = shallowRef<TaoTreeNode | null>(null);
    const menuIds = ref<string[]>([]);
    // the Menu key opens the menu on keydown; the contextmenu event the browser sends after it is the same request
    // клавиша Menu открывает меню на keydown; событие contextmenu, которое браузер шлёт следом, — та же просьба
    let keyMenuAt = -Infinity;

    /** Under the row, from the start of its label: where a menu opened from the keyboard hangs. / Под строкой, от начала подписи. */
    function rowAnchor(index: number): TaoVirtualAnchor | null {
        const el = o.rowEl(index);
        if (!el) {
            return null;
        }
        const box = el.getBoundingClientRect();
        const label = el.querySelector('.tao-tree__label')?.getBoundingClientRect();
        return { x: label ? label.left : box.left, y: box.top, width: 0, height: box.height };
    }

    /** Opens `menu` for a row; false when there is nothing to show (no `menu`, an empty list). */
    function open(row: TaoTreeRow, index: number, anchor: TaoVirtualAnchor | null): boolean {
        const menu = o.menu();
        if (!menu || !anchor) {
            return false;
        }
        const selected = o.selected();
        const change = menuSelection(o.selection(), selected, row.node);
        const ids = change !== undefined ? [row.node.id] : selected.has(row.node.id) ? [...selected] : [row.node.id];
        const items = typeof menu === 'function' ? menu(row.node, ids) : menu;
        if (!items.length) {
            return false;
        }
        if (change !== undefined) {
            o.setSelected(change);
        }
        o.current.value = index;
        menuNode.value = row.node;
        menuIds.value = ids;
        menuItems.value = items;
        menuAnchor.value = anchor;
        // a second right click while the menu is open moves it: close, then open at the new point
        // второй правый клик при открытом меню переносит его: закрыть и открыть в новой точке
        menuOpen.value = false;
        void nextTick(() => (menuOpen.value = true));
        return true;
    }

    function onRowContextMenu(event: MouseEvent, row: TaoTreeRow, index: number) {
        if (performance.now() - keyMenuAt < 500) {
            event.preventDefault();
            return;
        }
        o.ask(row.node, event);
        if (event.defaultPrevented) {
            return;
        }
        // a contextmenu from the keyboard (where the keydown did not reach us) has no pointer: hang it from the row
        // contextmenu с клавиатуры (когда keydown до нас не дошёл) без указателя: вешаем меню на строку
        const fromKeyboard = event.clientX === 0 && event.clientY === 0;
        const anchor = fromKeyboard ? rowAnchor(index) : { x: event.clientX, y: event.clientY };
        if (open(row, index, anchor)) {
            event.preventDefault();
        }
    }

    /** True when the key was the menu key and the menu took it. / True, если это клавиша меню и меню её взяло. */
    function onKey(event: KeyboardEvent, row: TaoTreeRow, index: number): boolean {
        if (!o.menu() || !(event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey))) {
            return false;
        }
        o.ask(row.node, event);
        // the app took it (a menu of its own), or ours opened: either way the contextmenu that follows is not a new request
        // приложение взяло его на себя (своё меню) или открылось наше: contextmenu следом — не новая просьба
        if (!event.defaultPrevented && !open(row, index, rowAnchor(index))) {
            return false;
        }
        event.preventDefault();
        keyMenuAt = performance.now();
        return true;
    }

    function onSelect(id: string) {
        if (menuNode.value) {
            o.pick(id, menuNode.value, menuIds.value);
        }
    }

    // TaoMenu gives the focus back to the row itself / TaoMenu сам возвращает фокус строке
    function onClose() {
        menuOpen.value = false;
    }

    return { menuOpen, menuAnchor, menuItems, menuNode, onRowContextMenu, onKey, onSelect, onClose };
}
