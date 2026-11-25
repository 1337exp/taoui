import type { InjectionKey } from 'vue';

/**
 * One entry of a menu. A plain data tree: TaoMenu / TaoDropdownMenu know nothing about commands or editors.
 * `type` tells what the entry is, so a checkbox can be told from a plain item and radios can be grouped.
 * Один пункт меню. Простое дерево данных: меню ничего не знает о командах и редакторах.
 * `type` говорит, что это за пункт: чекбокс отличается от обычного, радио группируются.
 */
export interface TaoMenuActionItem {
    type?: 'item';
    id: string;
    label: string;
    /** The language of the label when it differs from the page (`lang` of the row): a screen reader reads it in that language. / Язык подписи, если он не язык страницы (`lang` строки): скринридер читает её на этом языке. */
    lang?: string;
    /** Icon name for TaoIcon. / Имя иконки для TaoIcon. */
    icon?: string;
    /** Shortcut as a ready string to show («Ctrl+S», «⌘S»); the menu does not parse or listen to it. / Готовая строка для показа. */
    shortcut?: string;
    disabled?: boolean;
    /** A submenu. / Подменю. */
    items?: TaoMenuItem[];
}

export interface TaoMenuCheckboxItem {
    type: 'checkbox';
    id: string;
    label: string;
    /** The language of the label when it differs from the page (`lang` of the row): a screen reader reads it in that language. / Язык подписи, если он не язык страницы (`lang` строки): скринридер читает её на этом языке. */
    lang?: string;
    checked: boolean;
    shortcut?: string;
    disabled?: boolean;
}

export interface TaoMenuRadioItem {
    type: 'radio';
    id: string;
    /** Radios of one group: the checked one is the value. / Радио одной группы. */
    group: string;
    label: string;
    /** The language of the label when it differs from the page (`lang` of the row): a screen reader reads it in that language. / Язык подписи, если он не язык страницы (`lang` строки): скринридер читает её на этом языке. */
    lang?: string;
    checked: boolean;
    shortcut?: string;
    disabled?: boolean;
}

/** A non-interactive caption of the group that follows. / Подпись следующей группы. */
export interface TaoMenuLabelItem {
    type: 'label';
    label: string;
    /** The language of the label when it differs from the page (`lang` of the row): a screen reader reads it in that language. / Язык подписи, если он не язык страницы (`lang` строки): скринридер читает её на этом языке. */
    lang?: string;
}

export interface TaoMenuSeparatorItem {
    type: 'separator';
}

export type TaoMenuItem =
    | TaoMenuActionItem
    | TaoMenuCheckboxItem
    | TaoMenuRadioItem
    | TaoMenuLabelItem
    | TaoMenuSeparatorItem;

/**
 * What a `select` event of a menu hands out: an entry the user can pick (an action, a checkbox, a radio): it always has an `id`.
 * Что отдаёт событие `select` меню: пункт, который можно выбрать (действие, чекбокс, радио): у него всегда есть `id`.
 */
export type TaoMenuPick = TaoMenuActionItem | TaoMenuCheckboxItem | TaoMenuRadioItem;

/** Can the user reach this entry with the keyboard and pick it? / Можно ли дойти до пункта с клавиатуры и выбрать. */
export function isMenuSelectable(item: TaoMenuItem): boolean {
    return item.type !== 'separator' && item.type !== 'label' && !item.disabled;
}

export function menuItemLabel(item: TaoMenuItem): string {
    return 'label' in item ? item.label : '';
}

/**
 * Why something closed, the one list for every `close` event of the kit (a menu, a modal, a drawer, a palette, a card, a tag): `escape`, `outside`
 * a press elsewhere, `select` a pick, `button` a close button, `tab` the focus left, `scroll` the page scrolled (`closeOnScroll`), `swipe` a sheet pulled down.
 * Почему что-то закрылось, один список для каждого события `close` набора: `escape`, `outside` — нажатие в другом месте, `select` — выбор,
 * `button` — кнопка закрытия, `tab` — фокус ушёл, `scroll` — прокрутка страницы (`closeOnScroll`), `swipe` — лист стянули вниз.
 */
export type TaoCloseReason = 'escape' | 'select' | 'outside' | 'button' | 'tab' | 'scroll' | 'swipe';

/**
 * Should the owner give the focus back to its trigger? Not when the user went elsewhere (a press, a scroll).
 * Возвращать ли фокус на кнопку? Нет, если пользователь ушёл в другое место (нажатие, прокрутка).
 */
export function menuReturnsFocus(reason: TaoCloseReason): boolean {
    return reason !== 'outside' && reason !== 'scroll';
}

/** What a submenu shares with the root menu it hangs from. / Что подменю делит с корневым меню. */
export interface TaoMenuTree {
    /** Id of the root: every panel of the tree carries it, so a press in a submenu is not "outside". */
    rootId: string;
    select: (item: TaoMenuItem) => void;
    closeAll: (reason: TaoCloseReason) => void;
}

export const menuTreeKey: InjectionKey<TaoMenuTree> = Symbol('taoMenuTree');
