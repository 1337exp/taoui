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

export function formatTaoDateLabel(iso: string, locale = 'ru-RU'): string {
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

export function formatTaoDateRangeLabel(start: string, end: string, locale = 'ru-RU'): string {
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

export function formatTaoMonthLabel(year: number, month: number, locale = 'ru-RU'): string {
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

export function taoWeekdayLabels(locale = 'ru-RU'): string[] {
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
