import { computed, type Ref, type WritableComputedRef } from 'vue';
import { linearToSrgb, parseColor, srgbToLinear, toHex, type Rgba } from './color';

export interface ColorModelOptions {
    /** Как цвет хранится у вас: объект `{ r, g, b, a }`, массив `[r, g, b, a]` или строка `rgb(r g b / a)`. По умолчанию объект. */
    format?: 'object' | 'array' | 'css';
    /** Диапазон r, g, b: 255 (по умолчанию) или 1. Прозрачность всегда 0…1. */
    range?: 255 | 1;
    /** Пространство r, g, b: `srgb` (по умолчанию, как в CSS) или `linear` (рендер: у градиента TaoFX). Линейный цвет только с `range: 1`. */
    space?: 'srgb' | 'linear';
    /** Хранить и показывать прозрачность. Без неё цвет отдаётся как `#rrggbb`, а у массива и объекта нет поля прозрачности. */
    alpha?: boolean;
    /** Знаков после запятой у дробных значений (range 1). По умолчанию 5: у линейного цвета меньше даёт видимые ступени в тёмном. */
    precision?: number;
}

const round = (v: number, digits: number) => {
    const k = Math.pow(10, digits);
    return Math.round(v * k) / k + 0;
};

/**
 * Превращает ваше хранилище цвета в записываемую строку hex для `v-model` у TaoColorPicker и TaoColorInput:
 * `const hex = colorModel(rgba, { format: 'array', range: 1, space: 'linear' })`. Чтение переводит ваш вид в sRGB hex,
 * запись переводит обратно (и округляет). Строка, которая не цвет, игнорируется.
 */
export function colorModel<T>(source: Ref<T>, options: ColorModelOptions = {}): WritableComputedRef<string> {
    const { format = 'object', range = 255, space = 'srgb', alpha = false, precision = 5 } = options;
    if (space === 'linear' && range !== 1) throw new Error('colorModel: linear space needs range: 1');

    /** Ваш вид в sRGB 0…255. */
    function read(value: T): Rgba {
        let parts: number[];
        if (format === 'css') {
            return parseColor(String(value)) ?? { r: 0, g: 0, b: 0, a: 1 };
        } else if (format === 'array') {
            parts = (value as unknown as number[]).slice(0, 4);
        } else {
            const o = value as unknown as { r?: number; g?: number; b?: number; a?: number };
            parts = [o.r ?? 0, o.g ?? 0, o.b ?? 0, o.a ?? 1];
        }
        const channels = [0, 1, 2].map((i) => {
            const v = Number(parts[i] ?? 0);
            return space === 'linear' ? linearToSrgb(v) * 255 : range === 1 ? v * 255 : v;
        });
        return { r: channels[0]!, g: channels[1]!, b: channels[2]!, a: parts[3] === undefined ? 1 : Number(parts[3]) };
    }

    /** sRGB 0…255 в ваш вид. */
    function write(c: Rgba): T {
        const out = [c.r, c.g, c.b].map((v) => {
            if (space === 'linear') return round(srgbToLinear(v / 255), precision);
            return range === 1 ? round(v / 255, precision) : Math.round(v);
        });
        const a = round(c.a, 3);
        if (format === 'css') {
            const [r, g, b] = [c.r, c.g, c.b].map(Math.round);
            return (alpha ? `rgb(${r} ${g} ${b} / ${a})` : `rgb(${r} ${g} ${b})`) as unknown as T;
        }
        if (format === 'array') return (alpha ? [...out, a] : out) as unknown as T;
        return (alpha ? { r: out[0], g: out[1], b: out[2], a } : { r: out[0], g: out[1], b: out[2] }) as unknown as T;
    }

    return computed({
        get: () => toHex(read(source.value), alpha),
        set: (hex) => {
            const parsed = parseColor(hex);
            if (parsed) source.value = write(parsed);
        },
    });
}
