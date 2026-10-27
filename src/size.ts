/** One size scale for every control. / Единая шкала размеров для всех контролов. */
export type TaoSize = 'small' | 'medium' | 'large';

const sizes: readonly string[] = ['small', 'medium', 'large'];

/**
 * Class that sets the size tokens on an element and its subtree (see styles/contexts/size.css).
 * No size → no class: the control takes the size of its ancestors.
 * Класс с токенами размера для элемента и его поддерева. Без size класса нет — контрол наследует размер предков.
 */
export function sizeClass(size?: TaoSize | null): string | undefined {
    return size ? `tao-size-${size}` : undefined;
}

/**
 * Effective size at an element: the explicit prop wins, otherwise `--tao-size` inherited through CSS.
 * Needed by teleported panels: they live in body and cannot inherit it.
 * Итоговый размер в точке элемента: явный prop или унаследованный через CSS `--tao-size`.
 * Нужен телепортированным панелям — в body они его не наследуют.
 */
export function resolveSize(el: Element | null | undefined, size?: TaoSize | null): TaoSize {
    if (size) {
        return size;
    }

    if (!el || typeof getComputedStyle === 'undefined') {
        return 'medium';
    }

    const value = getComputedStyle(el).getPropertyValue('--tao-size').trim();
    return sizes.includes(value) ? (value as TaoSize) : 'medium';
}
