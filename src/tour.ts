import type { TaoPlacement } from './floating';

/**
 * A step of a tour for `TaoTour`. `target` is what to light up: a CSS selector, an element, or a function that finds it
 * (so it can look again after the page changed); without it the step is a card in the middle of the screen.
 * Шаг тура для `TaoTour`. `target` — что подсветить: CSS-селектор, элемент или функция, которая его находит (чтобы
 * искать заново после смены страницы); без него шаг — карточка посередине экрана.
 */
export interface TaoTourStep {
    id: string;
    target?: string | Element | (() => Element | null) | null;
    title?: string;
    text?: string;
    /** Where the card stands against the target; the tour's own `placement` by default. / Где карточка относительно цели. */
    placement?: TaoPlacement;
}

export interface TourRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

/**
 * The element a step points at, or null (no target, a selector that finds nothing, a hidden element).
 * Элемент, на который указывает шаг, или null (цели нет, селектор ничего не нашёл, элемент скрыт).
 */
export function resolveTourTarget(target: TaoTourStep['target'], root: ParentNode = document): HTMLElement | null {
    if (!target) {
        return null;
    }
    let el: Element | null = null;
    if (typeof target === 'string') {
        try {
            el = root.querySelector(target);
        } catch {
            el = null; // a selector that is not valid: the same as one that finds nothing / невалидный селектор — как ничего не найденный
        }
    } else if (typeof target === 'function') {
        el = target();
    } else {
        el = target;
    }
    if (!(el instanceof HTMLElement) || !el.isConnected || el.getClientRects().length === 0) {
        return null;
    }
    return el;
}

/** The lit window: the target's box, grown by `padding` on every side. / Освещённое окно: рамка цели, увеличенная на `padding`. */
export function spotlightRect(rect: TourRect, padding: number): TourRect {
    return { top: rect.top - padding, left: rect.left - padding, width: rect.width + padding * 2, height: rect.height + padding * 2 };
}

/**
 * A `clip-path` that covers the whole screen except the window: pointer events pass through the hole only. The corners
 * are rounded by `radius`, which is cut down to what the window can bear.
 * `clip-path`, закрывающий весь экран, кроме окна: события указателя проходят только через дыру. Углы скруглены
 * на `radius`, урезанный до того, что окно выдержит.
 */
export function holeClipPath(hole: TourRect, viewport: { width: number; height: number }, radius: number): string {
    const r = Math.max(0, Math.min(radius, hole.width / 2, hole.height / 2));
    const { left: x, top: y, width: w, height: h } = hole;
    const f = (n: number) => +n.toFixed(2);
    const window =
        `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}` +
        `A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}` +
        `V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`;
    return `path(evenodd, "M0 0H${f(viewport.width)}V${f(viewport.height)}H0Z${window}")`;
}

/** Whether a box is fully inside the viewport, with `margin` to spare. / Лежит ли рамка целиком в окне с запасом `margin`. */
export function isInView(rect: TourRect, viewport: { width: number; height: number }, margin = 0): boolean {
    return rect.top >= margin && rect.left >= margin && rect.top + rect.height <= viewport.height - margin && rect.left + rect.width <= viewport.width - margin;
}
