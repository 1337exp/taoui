import type { InjectionKey, Ref } from 'vue';

/**
 * A toolbar is one Tab stop: the arrows walk its items (a roving tabindex), as the WAI-ARIA toolbar pattern says.
 * The items are found in the DOM, so any control can sit in it: TaoButton, TaoSegmented, a native select.
 * Панель инструментов — одна остановка Tab: по элементам ходят стрелки (roving tabindex), по шаблону WAI-ARIA toolbar.
 * Элементы ищем в DOM, поэтому внутри может быть любой контрол: TaoButton, TaoSegmented, обычный select.
 */

export type TaoToolbarOrientation = 'horizontal' | 'vertical';

export const toolbarKey: InjectionKey<{ orientation: Ref<TaoToolbarOrientation> }> = Symbol('tao-toolbar');

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
    if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true' || el.hidden) {
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
