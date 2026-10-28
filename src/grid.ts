/**
 * The width classes of TaoGrid, by the width of the grid itself (not of the window): compact below 600px, medium below
 * 840px, expanded from 840px — the same as TaoNav.
 * Классы ширины TaoGrid по ширине самой сетки (не окна): compact до 600px, medium до 840px, expanded от 840px — как у TaoNav.
 */
export type TaoGridSize = 'compact' | 'medium' | 'expanded';

export const TAO_GRID_SIZES: readonly TaoGridSize[] = ['compact', 'medium', 'expanded'];

/** One value for every width, or a value per width class. / Одно значение на все ширины или по классам ширины. */
export type TaoResponsive<T> = T | Partial<Record<TaoGridSize, T>>;

/** How many columns an item takes: a number, or `'full'` for the whole row. / Сколько колонок: число или `'full'` — весь ряд. */
export type TaoGridSpan = number | 'full';

/** `'full'` is a span larger than any grid; the CSS clamps every span to the columns there are. */
export const FULL_SPAN = 999;

/**
 * Spreads a value over the width classes, mobile first: a class without a value takes the one of the smaller class,
 * the smallest takes `fallback`. A plain value is the same everywhere, except `compactPlain` for compact.
 * Раскладывает значение по классам ширины от меньшего: класс без значения берёт значение меньшего, самый маленький —
 * `fallback`. Простое значение одинаково везде, кроме `compactPlain` для compact.
 */
export function perSize<T>(value: TaoResponsive<T> | undefined, fallback: T, compactPlain?: T): Record<TaoGridSize, T> {
    if (value === undefined || value === null) {
        return { compact: fallback, medium: fallback, expanded: fallback };
    }
    if (typeof value !== 'object') {
        return { compact: compactPlain ?? value, medium: value, expanded: value };
    }
    const own = value as Partial<Record<TaoGridSize, T>>;
    const compact = own.compact ?? fallback;
    const medium = own.medium ?? compact;
    const expanded = own.expanded ?? medium;
    return { compact, medium, expanded };
}

/** A span as the number the CSS gets. / Охват числом для CSS. */
export const spanNumber = (span: TaoGridSpan): number => (span === 'full' ? FULL_SPAN : Math.max(1, Math.round(span)));
