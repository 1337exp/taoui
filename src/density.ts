/**
 * How roomy the controls are, on top of their size: `compact` for dense tools and tables, `comfortable` for touch,
 * `auto` — comfortable on a touch screen and default with a mouse. A context: set it on a container.
 * Насколько просторны контролы поверх их размера: `compact` для плотных инструментов и таблиц, `comfortable` под палец,
 * `auto` — comfortable на сенсорном экране и обычная с мышью. Это контекст: ставится на контейнер.
 */
export type TaoDensity = 'compact' | 'default' | 'comfortable' | 'auto';

/** What `--tao-density` can hold: `auto` resolves to one of these. / Что лежит в `--tao-density`. */
export type TaoResolvedDensity = Exclude<TaoDensity, 'auto'>;

const resolved: readonly string[] = ['compact', 'default', 'comfortable'];

/**
 * Class that sets the density on an element and its subtree (see styles/contexts/size.css). No density → no class.
 * Класс плотности для элемента и его поддерева. Без плотности класса нет.
 */
export function densityClass(density?: TaoDensity | null): string | undefined {
    return density ? `tao-density-${density}` : undefined;
}

/**
 * Effective density at an element, from the inherited `--tao-density` (`auto` already resolved by the media query).
 * Teleported panels need it: in body they do not inherit it.
 * Итоговая плотность в точке элемента из унаследованного `--tao-density`. Нужна телепортированным панелям.
 */
export function resolveDensity(el: Element | null | undefined): TaoResolvedDensity {
    if (!el || typeof getComputedStyle === 'undefined') {
        return 'default';
    }
    const value = getComputedStyle(el).getPropertyValue('--tao-density').trim();
    return resolved.includes(value) ? (value as TaoResolvedDensity) : 'default';
}
