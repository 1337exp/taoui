/** Length prop: a number is pixels, a string goes to CSS as is (`1rem`, `50%`, `var(--tao-space-4)`). / Число — пиксели, строка уходит в CSS как есть. */
export type TaoLength = number | string;

export function toCssLength(value: TaoLength | null | undefined): string | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    return typeof value === 'number' ? `${value}px` : value;
}

export function toCssBox(value: TaoLength | TaoLength[]): string | undefined {
    return Array.isArray(value) ? value.map((part) => toCssLength(part) ?? '0').join(' ') : toCssLength(value);
}
