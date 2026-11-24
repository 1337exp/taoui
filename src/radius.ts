// Pure logic of the `radius` prop of TaoCard / TaoBlock / TaoAnimatedBorder: one length, or the corners one by one. No Vue, no DOM, so tests cover it.
// Чистая логика пропа `radius` у TaoCard / TaoBlock / TaoAnimatedBorder: одна длина или углы по отдельности. Без Vue и DOM: проверяется тестами.
import { toCssLength, type TaoLength } from './length';

/**
 * One length for all corners, or the corners one by one: an array of 1 to 4 lengths in the order of CSS `border-radius`
 * (`[top-left, top-right, bottom-right, bottom-left]`, two values are `[top-left and bottom-right, top-right and bottom-left]`,
 * three are `[top-left, top-right and bottom-left, bottom-right]`). A string of 1 to 4 lengths means the same (`'0 0 12px 12px'`).
 * Одна длина на все углы или углы по отдельности: массив из 1–4 длин в порядке CSS `border-radius`
 * (`[верх-лево, верх-право, низ-право, низ-лево]`, две — `[верх-лево и низ-право, верх-право и низ-лево]`, три —
 * `[верх-лево, верх-право и низ-лево, низ-право]`). Строка из 1–4 длин значит то же (`'0 0 12px 12px'`).
 */
export type TaoRadius = TaoLength | TaoLength[];

/** The four corners as CSS lengths: top-left, top-right, bottom-right, bottom-left. / Четыре угла CSS-длинами. */
export type TaoCorners = [string, string, string, string];

/** The parts of a CSS value at the top level (`calc(1px + 2px)` and `var(--x, 1px 2px)` stay whole); null when it has a slash (an elliptical corner). / Части CSS-значения на верхнем уровне; null, если есть косая черта (эллиптический угол). */
function topLevelParts(text: string): string[] | null {
    const parts: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of text.trim()) {
        if (ch === '(') {
            depth += 1;
        } else if (ch === ')') {
            depth -= 1;
        }
        if (depth === 0 && ch === '/') {
            return null;
        }
        if (depth === 0 && /\s/.test(ch)) {
            if (current !== '') {
                parts.push(current);
                current = '';
            }
        } else {
            current += ch;
        }
    }
    if (current !== '') {
        parts.push(current);
    }
    return parts;
}

/**
 * The radius as four corners, or null when it cannot be told (nothing given, more than four values, a slash): the caller then
 * passes the value on as it is, as before.
 * Радиус четырьмя углами или null, если не разобрать (ничего не задано, больше четырёх значений, косая черта): вызывающий
 * тогда отдаёт значение как есть, как раньше.
 */
export function cornerRadii(value: TaoRadius | null | undefined): TaoCorners | null {
    if (value === undefined || value === null) {
        return null;
    }
    const raw = Array.isArray(value) ? value.map((part) => toCssLength(part) ?? '0') : typeof value === 'string' ? topLevelParts(value) : [toCssLength(value)!];
    if (!raw || raw.length < 1 || raw.length > 4) {
        return null;
    }
    // a bare 0 is fine for `border-radius`, but not inside `calc()` and `max()`, where the panel works out the inner radii: 0px
    // голый 0 годится для `border-radius`, но не внутри `calc()` и `max()`, где панель считает внутренние радиусы: 0px
    const parts = raw.map((part) => (/^[+-]?0*\.?0+$/.test(part) ? '0px' : part));
    // the CSS order: a missing top-right is the top-left, a missing bottom-right too, a missing bottom-left is the top-right
    // порядок CSS: нет верх-право — берётся верх-лево, нет низ-право — тоже, нет низ-лево — берётся верх-право
    const [topLeft, topRight = topLeft, bottomRight = topLeft, bottomLeft = topRight] = parts as [string, ...string[]];
    return [topLeft, topRight, bottomRight, bottomLeft];
}

/**
 * The custom properties a panel gets for its `radius`: `--tao-radius` (the value for `border-radius`) and, only when the corners
 * differ, the four `--tao-radius-tl / -tr / -br / -bl` that the panel contract (contexts/surface.css) turns into the inner radii.
 * Only what the user passed: no radius, nothing.
 * Что панель получает за свой `radius`: `--tao-radius` (значение для `border-radius`) и, только когда углы разные, четыре
 * `--tao-radius-tl / -tr / -br / -bl`, из которых контракт панели делает внутренние радиусы. Только то, что передал
 * пользователь: нет радиуса — ничего.
 */
export function radiusVars(value: TaoRadius | null | undefined): Record<string, string> {
    const corners = cornerRadii(value);
    if (!corners) {
        const raw = typeof value === 'number' || typeof value === 'string' ? toCssLength(value) : undefined;
        return raw === undefined ? {} : { '--tao-radius': raw };
    }
    const [tl, tr, br, bl] = corners;
    if (tl === tr && tr === br && br === bl) {
        return { '--tao-radius': tl };
    }
    return {
        '--tao-radius': `${tl} ${tr} ${br} ${bl}`,
        '--tao-radius-tl': tl,
        '--tao-radius-tr': tr,
        '--tao-radius-br': br,
        '--tao-radius-bl': bl,
    };
}
