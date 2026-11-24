// Pure layout of TaoCounter: a number into the slots the counter draws (digits, gaps, fixed text). No Vue, no DOM, so tests cover it.
// Чистая раскладка TaoCounter: число в слоты, которые рисует счётчик (цифры, пропуски, постоянный текст). Без Vue и DOM: проверяется тестами.
import { PIN_CELL, parsePinFormat } from './pinFormat';

/** A digit rolls, a gap is a narrow empty slot (a space), a text is a fixed character (`:`, `,`, `₽`). / Цифра катится, gap — узкий пустой слот (пробел), text — постоянный символ (`:`, `,`, `₽`). */
export type TaoCounterCellKind = 'digit' | 'gap' | 'text';

export interface TaoCounterCell {
    kind: TaoCounterCellKind;
    /** The character; a gap is a space. / Символ; у gap — пробел. */
    value: string;
    /** A digit that is only padding in front of the number. / Цифра, которая лишь добивает число слева. */
    leadingZero: boolean;
}

export interface TaoCounterLayout {
    /** The minus sign goes in front of the cells (it is not a cell). / Знак минус стоит перед ячейками (он не ячейка). */
    negative: boolean;
    cells: TaoCounterCell[];
    /** The number did not fit the mask and is shown as the largest one it holds (all nines). / Число не влезло в маску и показано наибольшим из возможных (одни девятки). */
    clamped: boolean;
    /** The `format` mask is in use; without it the counter is as it always was (grouped by thousands, grows with the number). / Маска `format` в работе; без неё счётчик как был (тысячи группами, растёт вместе с числом). */
    masked: boolean;
    /** What a screen reader says: the number as drawn, without the padding zeros (`$ 000 123` is `$123`). / Что читает скринридер: число как нарисовано, без добивающих нулей (`$ 000 123` — это `$123`). */
    text: string;
}

export interface TaoCounterLayoutOptions {
    /** A mask: `#` is a digit, any other character is drawn as it is (`##:##:##`, `#,###,###`, `### ###₽`). / Маска: `#` — цифра, любой другой символ рисуется как есть. */
    format?: string;
    /** Without a mask: the minimum width in digits. / Без маски: наименьшая ширина в цифрах. */
    maxDigits?: number;
    /** Dim the padding zeros in front of the number. / Приглушать добивающие нули слева от числа. */
    muteZeros?: boolean;
}

/** The whole part of the number as digits; not a number at all is 0. / Целая часть числа цифрами; не число вовсе — 0. */
export function counterDigits(value: number): string {
    return Number.isFinite(value) ? Math.abs(Math.trunc(value)).toString() : '0';
}

/** How many digits in front of the first significant one (the last digit always counts, 0 is `00 0`). / Сколько цифр перед первой значащей (последняя цифра считается всегда: 0 — это `00 0`). */
function paddingOf(digits: string): number {
    const first = digits.search(/[1-9]/);
    return first === -1 ? digits.length - 1 : first;
}

/** The number as slots. / Число слотами. */
export function counterLayout(value: number, options: TaoCounterLayoutOptions = {}): TaoCounterLayout {
    const mute = options.muteZeros ?? true;
    const negative = Number.isFinite(value) && Math.trunc(value) < 0;
    const mask = options.format === undefined ? null : parsePinFormat(options.format);
    const masked = mask !== null && mask.cells > 0;

    let digits = counterDigits(value);
    let clamped = false;
    const cells: TaoCounterCell[] = [];

    if (masked) {
        if (digits.length > mask.cells) {
            digits = '9'.repeat(mask.cells);
            clamped = true;
        } else {
            digits = digits.padStart(mask.cells, '0');
        }
        const padding = mute ? paddingOf(digits) : 0;
        let digitIndex = 0;
        for (const ch of mask.mask) {
            if (ch === PIN_CELL) {
                cells.push({ kind: 'digit', value: digits[digitIndex]!, leadingZero: digitIndex < padding });
                digitIndex += 1;
            } else {
                cells.push({ kind: ch === ' ' ? 'gap' : 'text', value: ch, leadingZero: false });
            }
        }
    } else {
        digits = digits.padStart(Math.max(1, options.maxDigits ?? 9), '0');
        const padding = mute ? paddingOf(digits) : 0;
        let digitIndex = 0;
        for (const ch of digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')) {
            if (ch === ' ') {
                cells.push({ kind: 'gap', value: ' ', leadingZero: false });
            } else {
                cells.push({ kind: 'digit', value: ch, leadingZero: digitIndex < padding });
                digitIndex += 1;
            }
        }
    }

    // the padding zeros and the separators between them are decoration: a screen reader skips them
    // добивающие нули и разделители между ними — украшение: скринридер их пропускает
    let text = negative ? '−' : '';
    let skipping = false;
    for (const cell of cells) {
        if (cell.kind === 'digit') {
            if (cell.leadingZero) {
                skipping = true;
                continue;
            }
            skipping = false;
        } else if (skipping) {
            continue;
        }
        text += cell.value;
    }

    return { negative, cells, clamped, masked, text };
}
