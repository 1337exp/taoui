// Чистая логика цвета для TaoColorPicker и TaoColorInput: разбор строк, перевод RGB ↔ HSV, запись в hex, sRGB ↔ линейный.
// Без Vue и DOM, поэтому проверяется тестами. Компоненты говорят строкой hex; всё остальное: переводчики на границе.

/** Цвет: r, g, b от 0 до 255, a (прозрачность) от 0 до 1. Это обычный sRGB, как в CSS. */
export interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}

/** Цвет в HSV: h (оттенок) от 0 до 360, s и v от 0 до 1, a от 0 до 1. Внутреннее состояние палитры: оттенок не теряется на сером. */
export interface Hsva {
    h: number;
    s: number;
    v: number;
    a: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const byte = (v: number) => Math.round(clamp(v, 0, 255));
const hex2 = (v: number) => byte(v).toString(16).padStart(2, '0');

/** Число из «0.5» или «50%» (процент относительно `scale`); не число: NaN. */
function channel(text: string, scale: number): number {
    const t = text.trim();
    return t.endsWith('%') ? (parseFloat(t) / 100) * scale : parseFloat(t);
}

/**
 * Разбирает цвет из строки: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb(255 136 0)`, `rgba(255, 136, 0, 0.5)`,
 * `rgb(255 136 0 / 50%)`. Не цвет: null.
 */
export function parseColor(input: string): Rgba | null {
    const text = input.trim();

    const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text);
    if (hex) {
        let h = hex[1]!;
        if (h.length <= 4) h = [...h].map((c) => c + c).join('');
        const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
        return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
    }

    const fn = /^rgba?\(\s*([^)]+?)\s*\)$/i.exec(text);
    if (fn) {
        const [main, slash] = fn[1]!.split('/');
        const parts = main!.trim().split(/[\s,]+/);
        // rgb(r g b / a) и rgba(r, g, b, a): прозрачность либо после «/», либо четвёртым числом
        const alphaText = slash !== undefined ? slash : parts[3];
        if (parts.length < 3 || parts.length > (slash === undefined ? 4 : 3)) return null;
        const r = channel(parts[0]!, 255);
        const g = channel(parts[1]!, 255);
        const b = channel(parts[2]!, 255);
        const a = alphaText === undefined ? 1 : channel(alphaText, 1);
        if ([r, g, b, a].some((v) => Number.isNaN(v))) return null;
        return { r: byte(r), g: byte(g), b: byte(b), a: clamp(a, 0, 1) };
    }
    return null;
}

/** Строка hex: `#rrggbb`, а с `alpha` и `#rrggbbaa`. Значения вне диапазона зажимаются, дробные округляются. */
export function toHex(color: Rgba, alpha = false): string {
    const base = `#${hex2(color.r)}${hex2(color.g)}${hex2(color.b)}`;
    return alpha ? `${base}${hex2(clamp(color.a, 0, 1) * 255)}` : base;
}

/** RGB (0…255) в HSV: h 0…360, s и v 0…1. У серого оттенок 0. */
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    const R = clamp(r, 0, 255) / 255;
    const G = clamp(g, 0, 255) / 255;
    const B = clamp(b, 0, 255) / 255;
    const max = Math.max(R, G, B);
    const d = max - Math.min(R, G, B);
    let h = 0;
    if (d > 0) {
        if (max === R) h = ((G - B) / d) % 6;
        else if (max === G) h = (B - R) / d + 2;
        else h = (R - G) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }
    return { h, s: max === 0 ? 0 : d / max, v: max };
}

/** HSV в RGB (0…255, дробные: округляет `toHex`). */
export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    const H = (((h % 360) + 360) % 360) / 60;
    const S = clamp(s, 0, 1);
    const V = clamp(v, 0, 1);
    const f = (n: number) => {
        const k = (n + H) % 6;
        return V - V * S * Math.max(0, Math.min(k, 4 - k, 1));
    };
    return { r: f(5) * 255, g: f(3) * 255, b: f(1) * 255 };
}

export const rgbaToHsva = (c: Rgba): Hsva => ({ ...rgbToHsv(c.r, c.g, c.b), a: c.a });
export const hsvaToRgba = (c: Hsva): Rgba => ({ ...hsvToRgb(c.h, c.s, c.v), a: c.a });

/** Линейный цвет (0…1) в sRGB (0…1). */
export const linearToSrgb = (c: number): number => {
    const x = clamp(c, 0, 1);
    return x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
};

/** sRGB (0…1) в линейный цвет (0…1). */
export const srgbToLinear = (c: number): number => {
    const x = clamp(c, 0, 1);
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};

/** Нормализует строку из поля ввода к `#rrggbb` / `#rrggbbaa`; не цвет: null. */
export function normalizeHex(input: string, alpha = false): string | null {
    const c = parseColor(input);
    return c ? toHex(c, alpha) : null;
}
