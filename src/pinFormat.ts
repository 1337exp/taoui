// Format mask for TaoPinCode: `#` is a cell, any other character is a visual separator ("#-##-##" is 0-00-00).
// Маска пин-кода: `#` это ячейка, любой другой символ это визуальный разделитель ("#-##-##" даёт 0-00-00).

export interface PinFormat {
    /** The mask as characters. / Маска по символам. */
    mask: string[];
    /** Number of cells (`#`). / Число ячеек (`#`). */
    cells: number;
    /** Separator text in front of each cell ('' if none). / Текст разделителя перед каждой ячейкой ('' если нет). */
    before: string[];
    /** Text after the last cell. / Текст после последней ячейки. */
    after: string;
    /** There is at least one separator. / Есть хотя бы один разделитель. */
    hasSeparators: boolean;
}

export const PIN_CELL = '#';

export function parsePinFormat(format: string): PinFormat {
    const mask = [...format];
    const before: string[] = [];
    let pending = '';
    for (const ch of mask) {
        if (ch === PIN_CELL) {
            before.push(pending);
            pending = '';
        } else {
            pending += ch;
        }
    }
    return { mask, cells: before.length, before, after: pending, hasSeparators: mask.some((ch) => ch !== PIN_CELL) };
}

/** Separator text right after the cell with this index (the typed character that "jumps" over it). / Текст разделителя сразу после ячейки с этим номером. */
export function separatorAfter(format: PinFormat, index: number): string {
    return index === format.cells - 1 ? format.after : (format.before[index + 1] ?? '');
}

/**
 * Cell characters from pasted text, or null when the text is neither of the two known shapes:
 * 1. it matches the format exactly, separators in their places ("0-00-00"): the cells are taken out of it;
 * 2. it is as long as the code itself ("00000"): it is a clean code, pasted as is.
 * Anything else is left to the caller (it takes whatever fits, as before).
 *
 * Символы ячеек из вставленного текста или null, если текст не подходит ни под одну из двух форм:
 * 1. он в точности по формату, разделители на местах ("0-00-00"): из него берутся ячейки;
 * 2. он по длине равен самому коду ("00000"): это уже чистый код, вставляется как есть.
 * Всё остальное остаётся вызывающему (он берёт то, что подходит, как раньше).
 */
export function pinFromPaste(text: string, format: PinFormat | null, cells: number, accept: (ch: string) => string): string[] | null {
    const chars = [...text.trim()];

    if (format?.hasSeparators && chars.length === format.mask.length) {
        const cellChars: string[] = [];
        const matches = format.mask.every((expected, i) => {
            const ch = chars[i]!;
            if (expected !== PIN_CELL) return ch === expected;
            const accepted = accept(ch);
            if (!accepted) return false;
            cellChars.push(accepted);
            return true;
        });
        if (matches) return cellChars;
    }

    if (chars.length === cells && chars.every((ch) => accept(ch))) return chars.map((ch) => accept(ch));
    return null;
}
