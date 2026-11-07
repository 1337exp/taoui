import type { InjectionKey, Ref } from 'vue';

/**
 * A toolbar is one Tab stop: the arrows walk its items (a roving tabindex), as the WAI-ARIA toolbar pattern says.
 * The items are found in the DOM, so any control can sit in it: TaoButton, TaoSegmented, a native select.
 * Панель инструментов — одна остановка Tab: по элементам ходят стрелки (roving tabindex), по шаблону WAI-ARIA toolbar.
 * Элементы ищем в DOM, поэтому внутри может быть любой контрол: TaoButton, TaoSegmented, обычный select.
 */

export type TaoToolbarOrientation = 'horizontal' | 'vertical';

/**
 * A part of the toolbar that the overflow mode can move: a group, or a separator (it goes with the group after it).
 * Часть панели, которую режим overflow умеет переносить: группа или разделитель (уходит вместе с группой после него).
 */
export interface ToolbarUnit {
    kind: 'group' | 'separator';
    /** The element in the row: for a group the host (its first child is the group itself). / Элемент в строке. */
    el: Ref<HTMLElement | null>;
    pinned: Ref<boolean>;
    /** Set by the toolbar: the unit lives in the «⋮» menu. / Ставит панель: часть живёт в меню «⋮». */
    away: Ref<boolean>;
    /** Set by the toolbar: the place among the hidden groups, and whether it is the first of them. / Ставит панель. */
    order: Ref<number>;
    first: Ref<boolean>;
    /** The last width seen in the row (a hidden group keeps it). / Последняя ширина в строке (скрытая группа её помнит). */
    width: number;
}

export interface ToolbarContext {
    orientation: Ref<TaoToolbarOrientation>;
    /** The overflow mode is on and works: groups register and may leave. / Режим overflow включён и работает. */
    overflow: Ref<boolean>;
    /** Where the hidden groups are drawn while the menu is open; null while it is closed. / Куда рисуются скрытые группы, пока меню открыто. */
    menuEl: Ref<HTMLElement | null>;
    register: (unit: ToolbarUnit) => () => void;
}

export const toolbarKey: InjectionKey<ToolbarContext> = Symbol('tao-toolbar');

/** One thing in the row, as the overflow plan sees it. / Одна вещь в строке, как её видит план переполнения. */
export interface OverflowEntry {
    kind: 'group' | 'separator' | 'loose';
    width: number;
    pinned?: boolean;
}

/**
 * Which entries leave the row. If everything fits, none. Otherwise the groups that are not pinned go from the last one to the
 * first, each with the separator before it, until what is left plus the «⋮» button fits. Loose items (a segmented control, a
 * lone button) and pinned groups never go. Returns the indexes of the entries that leave.
 * Какие части уходят из строки. Если всё влезает — никакие. Иначе незакреплённые группы уходят с последней к первой, каждая
 * вместе с разделителем перед ней, пока остаток вместе с кнопкой «⋮» не влезет. Одиночные элементы и закреплённые группы не уходят.
 */
export function planOverflow(entries: OverflowEntry[], available: number, gap: number, moreWidth: number): Set<number> {
    const away = new Set<number>();
    const widthOf = (hidden: Set<number>) => {
        let count = 0;
        let sum = 0;
        entries.forEach((entry, i) => {
            if (!hidden.has(i)) {
                count += 1;
                sum += entry.width;
            }
        });
        return sum + gap * Math.max(0, count - 1) + (hidden.size ? gap + moreWidth : 0);
    };
    if (widthOf(away) <= available) {
        return away;
    }
    for (let i = entries.length - 1; i >= 0; i -= 1) {
        const entry = entries[i];
        if (entry.kind !== 'group' || entry.pinned) {
            continue;
        }
        away.add(i);
        if (entries[i - 1]?.kind === 'separator') {
            away.add(i - 1);
        }
        if (widthOf(away) <= available) {
            break;
        }
    }
    return away;
}

const ITEMS = 'button, a[href], input, select, textarea, [role="button"], [data-tao-toolbar-item]';

/** Inputs that need the arrow keys for their own text. / Поля, которым стрелки нужны для своего текста. */
const TEXT_INPUT = /^(text|search|email|url|tel|password|number|date|time|datetime-local|month|week)$/;

/**
 * One stop of the toolbar: a control, or a group of radios with one name (TaoSegmented), which the arrows walk natively.
 * Одна остановка панели: контрол или группа радио с одним name (TaoSegmented), по которой стрелки ходят сами.
 */
export interface ToolbarStop {
    els: HTMLElement[];
    radio: boolean;
}

function usable(el: HTMLElement): boolean {
    // a group that went to the «⋮» menu sits hidden in the row while the menu is closed: not a stop
    // группа, ушедшая в меню «⋮», пока оно закрыто, лежит скрытой в строке: не остановка
    if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[hidden], [data-tao-away]')) {
        return false;
    }
    // an element inside an inner widget's own stop (a button inside a link, a nested item) is that widget's business
    // элемент внутри другого элемента панели — забота того элемента
    return !el.parentElement?.closest(ITEMS);
}

export function isRadio(el: Element): el is HTMLInputElement {
    return el instanceof HTMLInputElement && el.type === 'radio';
}

/** The stops in document order; radios of one name share a stop. / Остановки по порядку; радио одного name — одна остановка. */
export function toolbarStops(root: HTMLElement): ToolbarStop[] {
    const stops: ToolbarStop[] = [];
    for (const el of Array.from(root.querySelectorAll<HTMLElement>(ITEMS))) {
        if (!usable(el)) {
            continue;
        }
        const last = stops[stops.length - 1];
        if (isRadio(el) && el.name && last?.radio && (last.els[0] as HTMLInputElement).name === el.name) {
            last.els.push(el);
        } else {
            stops.push({ els: [el], radio: isRadio(el) });
        }
    }
    return stops;
}

/** Where the focus lands on a stop: the checked radio, else the first element. / Куда встаёт фокус: на выбранное радио или первый элемент. */
export function stopTarget(stop: ToolbarStop): HTMLElement {
    return (stop.radio && stop.els.find((el) => (el as HTMLInputElement).checked)) || stop.els[0];
}

/**
 * Leaves exactly one stop in the Tab order. Radios of the current stop get no tabindex at all: the browser then tabs
 * to the checked one by itself.
 * Оставляет в порядке Tab ровно одну остановку. Радио текущей остановки остаются без tabindex: тогда браузер сам
 * ведёт Tab на выбранное.
 */
export function applyRoving(stops: ToolbarStop[], current: number): void {
    stops.forEach((stop, index) => {
        for (const el of stop.els) {
            if (index !== current) {
                el.setAttribute('tabindex', '-1');
            } else if (stop.radio) {
                el.removeAttribute('tabindex');
            } else {
                el.setAttribute('tabindex', '0');
            }
        }
    });
}

export function isTextField(el: EventTarget | null): boolean {
    if (!(el instanceof HTMLElement)) {
        return false;
    }
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || el.isContentEditable) {
        return true;
    }
    return el instanceof HTMLInputElement && TEXT_INPUT.test(el.type);
}
