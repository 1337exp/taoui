export interface TaoDateParts {
    y: number;
    m: number;
    d: number;
}

export interface TaoDateCell {
    iso: string;
    day: number;
    currentMonth: boolean;
}

export interface TaoDateRangeValue {
    start: string;
    end: string;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatTaoDateIso(parts: TaoDateParts): string {
    return `${String(parts.y).padStart(4, '0')}-${String(parts.m).padStart(2, '0')}-${String(parts.d).padStart(2, '0')}`;
}

export function parseTaoDate(value: string | null | undefined): TaoDateParts | null {
    if (!value) {
        return null;
    }

    const match = ISO_DATE.exec(value);
    if (!match) {
        return null;
    }

    const y = Number(match[1]);
    const m = Number(match[2]);
    const d = Number(match[3]);
    const date = new Date(y, m - 1, d);

    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
        return null;
    }

    return { y, m, d };
}

export function todayTaoDate(): string {
    const now = new Date();
    return formatTaoDateIso({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() });
}

export function shiftTaoDate(iso: string, days: number): string {
    const parts = parseTaoDate(iso);
    if (!parts) {
        return iso;
    }

    const date = new Date(parts.y, parts.m - 1, parts.d + days);
    return formatTaoDateIso({ y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() });
}

export function shiftTaoMonth(iso: string, months: number): string {
    const parts = parseTaoDate(iso);
    if (!parts) {
        return iso;
    }

    const monthStart = new Date(parts.y, parts.m - 1 + months, 1);
    const y = monthStart.getFullYear();
    const m = monthStart.getMonth() + 1;
    const lastDay = new Date(y, m, 0).getDate();
    return formatTaoDateIso({ y, m, d: Math.min(parts.d, lastDay) });
}

export function clampTaoDateCursor(iso: string, min?: string, max?: string): string {
    if (isTaoDateInRange(iso, min, max)) {
        return iso;
    }

    if (min && parseTaoDate(min) && iso < min) {
        return min;
    }

    if (max && parseTaoDate(max) && iso > max) {
        return max;
    }

    return iso;
}

export function isTaoDateInRange(iso: string, min?: string, max?: string): boolean {
    if (!parseTaoDate(iso)) {
        return false;
    }

    if (min && parseTaoDate(min) && iso < min) {
        return false;
    }

    if (max && parseTaoDate(max) && iso > max) {
        return false;
    }

    return true;
}

export function formatTaoDateLabel(iso: string, locale = 'en-US'): string {
    const parts = parseTaoDate(iso);
    if (!parts) {
        return '';
    }

    return new Date(parts.y, parts.m - 1, parts.d).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function sortTaoDateRange(a: string, b: string): TaoDateRangeValue {
    return a <= b ? { start: a, end: b } : { start: b, end: a };
}

export function parseTaoDateRange(value: TaoDateRangeValue | null | undefined): TaoDateRangeValue | null {
    if (!value) {
        return null;
    }

    const start = parseTaoDate(value.start);
    const end = parseTaoDate(value.end);
    if (!start || !end) {
        return null;
    }

    return sortTaoDateRange(formatTaoDateIso(start), formatTaoDateIso(end));
}

export function formatTaoDateRangeLabel(start: string, end: string, locale = 'en-US'): string {
    const fromParts = parseTaoDate(start);
    const toParts = parseTaoDate(end);
    if (!fromParts || !toParts) {
        return '';
    }

    if (start === end) {
        return formatTaoDateLabel(start, locale);
    }

    const from = new Date(fromParts.y, fromParts.m - 1, fromParts.d).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        ...(fromParts.y === toParts.y ? {} : { year: 'numeric' }),
    });

    return `${from} — ${formatTaoDateLabel(end, locale)}`;
}

export function formatTaoMonthLabel(year: number, month: number, locale = 'en-US'): string {
    const label = new Date(year, month - 1, 1).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function taoDateWeekdayIndex(iso: string): number {
    const parts = parseTaoDate(iso);
    if (!parts) {
        return 0;
    }

    return (new Date(parts.y, parts.m - 1, parts.d).getDay() + 6) % 7;
}

export function taoWeekdayLabels(locale = 'en-US'): string[] {
    return Array.from({ length: 7 }, (_, index) => {
        const label = new Date(2026, 0, 5 + index).toLocaleDateString(locale, { weekday: 'short' });
        return label.replace(/\.$/, '');
    });
}

/** Monday-first 6×7 grid so the popup height stays stable. */
export function buildTaoDateGrid(year: number, month: number): TaoDateCell[] {
    const first = new Date(year, month - 1, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month - 1, 1 - mondayOffset);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
        return {
            iso: formatTaoDateIso({ y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() }),
            day: date.getDate(),
            currentMonth: date.getMonth() === month - 1,
        };
    });
}

//--------------------------------------------------
// Typing a date / Ввод даты с клавиатуры

export type TaoDateField = 'd' | 'm' | 'y';

/**
 * The order of day, month and year in a locale's short date: `['d', 'm', 'y']` for ru-RU and en-GB, `['m', 'd', 'y']`
 * for en-US, `['y', 'm', 'd']` for ja-JP and sv-SE.
 * Порядок дня, месяца и года в короткой дате языка.
 */
export function taoDateOrder(locale = 'en-US'): TaoDateField[] {
    try {
        const parts = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(
            new Date(2001, 10, 22),
        );
        const order = parts
            .map((p) => (p.type === 'day' ? 'd' : p.type === 'month' ? 'm' : p.type === 'year' ? 'y' : null))
            .filter((f): f is TaoDateField => f !== null);
        return order.length === 3 ? order : ['d', 'm', 'y'];
    } catch {
        return ['d', 'm', 'y'];
    }
}

/**
 * A date in the field as the locale writes it in numbers: `05.03.2026` (ru-RU), `03/05/2026` (en-US).
 * Дата в поле так, как язык пишет её цифрами.
 */
export function formatTaoDateShort(iso: string, locale = 'en-US'): string {
    const parts = parseTaoDate(iso);
    if (!parts) {
        return '';
    }
    return new Date(parts.y, parts.m - 1, parts.d).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * A two-digit year to a full one: the century that puts it nearest to the reference year (26 → 2026, 99 → 1999 in 2026).
 * Двузначный год в полный: век, при котором он ближе всего к опорному году.
 */
function fullYear(yy: number, referenceYear: number): number {
    const base = Math.floor(referenceYear / 100) * 100;
    const candidates = [base - 100 + yy, base + yy, base + 100 + yy];
    return candidates.reduce((best, y) => (Math.abs(y - referenceYear) < Math.abs(best - referenceYear) ? y : best));
}

export interface TaoDateInputOptions {
    locale?: string;
    /** What a partial date is completed from (the month and the year of `5`); today by default. / От чего дополняется неполная дата; по умолчанию сегодня. */
    reference?: string;
}

/**
 * Reads a typed date, in the locale's order of day and month. `5` is the 5th of the reference month, `5.3` the 5th of
 * March of the reference year (`3/5` in en-US), `05.03.26` and `5.3.2026` full dates; any of `. / - ,` or a space
 * separates, and digits alone split as 2 + 2 (+ 2 or 4): `0503`, `050326`. ISO `2026-03-05` is read too. Null when it
 * is not a real date (`31.02`).
 * Читает набранную дату в порядке дня и месяца языка. `5` — 5-е число опорного месяца, `5.3` — 5 марта опорного года
 * (`3/5` в en-US), `05.03.26` и `5.3.2026` — полные даты; разделяет любой из `. / - ,` или пробел, а одни цифры делятся
 * как 2 + 2 (+ 2 или 4). Читается и ISO. Null, если это не настоящая дата (`31.02`).
 */
export function parseTaoDateInput(text: string, options: TaoDateInputOptions = {}): string | null {
    const value = text.trim();
    if (!value) {
        return null;
    }
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) {
        const [y, m, d] = value.split('-').map(Number);
        return checked(y!, m!, d!);
    }

    const ref = parseTaoDate(options.reference) ?? parseTaoDate(todayTaoDate())!;
    let tokens = value.split(/[\s./,-]+/).filter(Boolean);
    if (tokens.some((t) => !/^\d+$/.test(t))) {
        return null;
    }
    if (tokens.length === 1 && tokens[0]!.length > 2) {
        const digits = tokens[0]!;
        if (![4, 6, 8].includes(digits.length)) {
            return null;
        }
        tokens = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean);
    }
    if (tokens.length > 3) {
        return null;
    }

    // the day and the month in the locale's order (ja-JP: month, day); a full date of a year-first locale starts with the year
    // день и месяц в порядке языка (ja-JP: месяц, день); полная дата языка «год первым» начинается с года
    const order = taoDateOrder(options.locale).filter((f) => f !== 'y');
    const n = tokens.map(Number);
    let d: number;
    let m = ref.m;
    let y = ref.y;
    if (n.length === 1) {
        d = n[0]!;
    } else {
        const yearFirst = taoDateOrder(options.locale)[0] === 'y' && n.length === 3;
        const [a, b, c] = yearFirst ? [n[1]!, n[2]!, n[0]!] : [n[0]!, n[1]!, n[2]];
        d = order[0] === 'd' ? a : b;
        m = order[0] === 'd' ? b : a;
        if (c !== undefined) {
            const yearText = yearFirst ? tokens[0]! : tokens[2]!;
            if (yearText.length === 2) y = fullYear(c, ref.y);
            else if (yearText.length === 4) y = c;
            else return null;
        }
    }
    return checked(y, m, d);
}

function checked(y: number, m: number, d: number): string | null {
    const iso = formatTaoDateIso({ y, m, d });
    return parseTaoDate(iso) ? iso : null;
}
