import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { hslToRgb, hsvToRgb, linearToSrgb, normalizeHex, rgbToHsl, parseColor, rgbToHsv, rgbaToHsva, hsvaToRgba, srgbToLinear, toHex } from '../src/color';
import { colorModel } from '../src/colorModel';

describe('parseColor', () => {
    it('hex в четырёх видах, с решёткой и без', () => {
        expect(parseColor('#f80')).toEqual({ r: 255, g: 136, b: 0, a: 1 });
        expect(parseColor('#FF8800')).toEqual({ r: 255, g: 136, b: 0, a: 1 });
        expect(parseColor('ff8800')).toEqual({ r: 255, g: 136, b: 0, a: 1 });
        expect(parseColor('#f808')).toMatchObject({ r: 255, g: 136, b: 0 });
        expect(parseColor('#f808')!.a).toBeCloseTo(0.533, 2);
        expect(parseColor('#ff880080')!.a).toBeCloseTo(0.502, 2);
    });

    it('rgb() и rgba() с запятыми, пробелами, слэшем и процентами', () => {
        expect(parseColor('rgb(255 136 0)')).toEqual({ r: 255, g: 136, b: 0, a: 1 });
        expect(parseColor('rgba(255, 136, 0, 0.5)')).toEqual({ r: 255, g: 136, b: 0, a: 0.5 });
        expect(parseColor('rgb(255 136 0 / 50%)')).toEqual({ r: 255, g: 136, b: 0, a: 0.5 });
        expect(parseColor('rgb(100%, 0%, 0%)')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
        expect(parseColor('rgb(300 -5 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('не цвет: null', () => {
        for (const bad of ['', 'red', '#12', '#12345', '#gg0000', 'rgb(1 2)', 'rgb(1 2 3 4 5)', 'rgb(a b c)', 'hwb(0 0% 0%)']) expect(parseColor(bad), bad).toBeNull();
    });

    it('normalizeHex приводит к одному виду', () => {
        expect(normalizeHex('#f80')).toBe('#ff8800');
        expect(normalizeHex('rgb(255 136 0 / 0.5)', true)).toBe('#ff880080');
        expect(normalizeHex('rgb(255 136 0 / 0.5)')).toBe('#ff8800');
        expect(normalizeHex('nope')).toBeNull();
    });
});

describe('toHex и HSV', () => {
    it('зажимает и округляет', () => {
        expect(toHex({ r: 300, g: -2, b: 135.6, a: 1 })).toBe('#ff0088');
        expect(toHex({ r: 255, g: 255, b: 255, a: 0 }, true)).toBe('#ffffff00');
        expect(toHex({ r: 0, g: 0, b: 0, a: 1 }, true)).toBe('#000000ff');
    });

    it('RGB ↔ HSV: круговой проход по основным цветам', () => {
        for (const [r, g, b] of [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 136, 0], [12, 200, 90], [128, 128, 128], [0, 0, 0], [255, 255, 255]] as const) {
            const { h, s, v } = rgbToHsv(r, g, b);
            const back = hsvToRgb(h, s, v);
            expect([Math.round(back.r), Math.round(back.g), Math.round(back.b)]).toEqual([r, g, b]);
        }
        expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 1, v: 1 });
        expect(rgbToHsv(0, 0, 255).h).toBe(240);
        expect(rgbToHsv(128, 128, 128)).toMatchObject({ h: 0, s: 0 });
        expect(hsvToRgb(360, 1, 1).r).toBe(255);
        expect(hsvToRgb(-120, 1, 1).b).toBe(255); // оттенок оборачивается
    });

    it('Rgba ↔ Hsva сохраняет прозрачность', () => {
        const c = { r: 255, g: 136, b: 0, a: 0.25 };
        expect(hsvaToRgba(rgbaToHsva(c)).a).toBe(0.25);
    });
});

describe('sRGB ↔ линейный', () => {
    it('взаимно обратны, края на месте', () => {
        for (const c of [0, 0.002, 0.04, 0.3, 0.8, 1]) expect(linearToSrgb(srgbToLinear(c))).toBeCloseTo(c, 6);
        expect(srgbToLinear(1)).toBe(1);
        expect(linearToSrgb(0)).toBe(0);
        expect(srgbToLinear(0.5)).toBeCloseTo(0.2140, 3);
    });
});

describe('colorModel', () => {
    it('объект 0…255: чтение и запись, прозрачность только с alpha', () => {
        const stored = ref({ r: 255, g: 136, b: 0 });
        const hex = colorModel(stored);
        expect(hex.value).toBe('#ff8800');
        hex.value = '#102030';
        expect(stored.value).toEqual({ r: 16, g: 32, b: 48 });

        const withAlpha = ref({ r: 255, g: 136, b: 0, a: 0.5 });
        const hexA = colorModel(withAlpha, { alpha: true });
        expect(hexA.value).toBe('#ff880080');
        hexA.value = '#00000000';
        expect(withAlpha.value).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    });

    it('массив 0…1 в линейном пространстве (как градиент TaoFX)', () => {
        const stored = ref<number[]>([1, 0.2, 0.05]);
        const hex = colorModel(stored, { format: 'array', range: 1, space: 'linear' });
        expect(hex.value).toBe('#ff7c3f');
        hex.value = '#ff7c3f';
        expect(stored.value.every((v, i) => Math.abs(v - [1, 0.2, 0.05][i]!) < 0.01)).toBe(true);
        expect(stored.value).toHaveLength(3);
        hex.value = '#000000';
        expect(stored.value).toEqual([0, 0, 0]);
    });

    it('массив с alpha и строка css', () => {
        const arr = ref<number[]>([1, 0.5, 0, 0.5]);
        const a = colorModel(arr, { format: 'array', range: 1, alpha: true, precision: 3 });
        expect(a.value).toBe('#ff800080');
        a.value = '#ffffff40';
        expect(arr.value).toEqual([1, 1, 1, 0.251]);

        const css = ref('rgb(255 136 0 / 0.5)');
        const c = colorModel(css, { format: 'css', alpha: true });
        expect(c.value).toBe('#ff880080');
        c.value = '#000000';
        expect(css.value).toBe('rgb(0 0 0 / 1)');
    });

    it('строка, которая не цвет, молча игнорируется; линейное пространство требует range 1', () => {
        const stored = ref({ r: 1, g: 2, b: 3 });
        const hex = colorModel(stored);
        hex.value = 'не цвет';
        expect(stored.value).toEqual({ r: 1, g: 2, b: 3 });
        expect(() => colorModel(stored, { space: 'linear' })).toThrow(/range/);
    });
});

describe('HSL', () => {
    it('hsl() и hsla() читаются: запятые, пробелы, слэш', () => {
        expect(parseColor('hsl(0 100% 50%)')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
        expect(parseColor('hsl(120, 100%, 25%)')).toEqual({ r: 0, g: 128, b: 0, a: 1 });
        expect(parseColor('hsla(240, 100%, 50%, 0.5)')).toEqual({ r: 0, g: 0, b: 255, a: 0.5 });
        expect(parseColor('hsl(30 100% 50% / 25%)')).toMatchObject({ r: 255, g: 128, b: 0, a: 0.25 });
        expect(parseColor('hsl(a b c)')).toBeNull();
        expect(parseColor('hsl(1 2)')).toBeNull();
    });

    it('RGB ↔ HSL: круговой проход, серый и края', () => {
        for (const [r, g, b] of [[255, 0, 0], [0, 255, 0], [255, 136, 0], [12, 200, 90], [128, 128, 128], [0, 0, 0], [255, 255, 255]] as const) {
            const { h, s, l } = rgbToHsl(r, g, b);
            expect(hslToRgb(h, s, l)).toEqual({ r, g, b });
        }
        expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 1, l: 0.5 });
        expect(rgbToHsl(128, 128, 128).s).toBe(0);
        expect(rgbToHsl(255, 255, 255)).toMatchObject({ s: 0, l: 1 });
        expect(rgbToHsl(0, 0, 0)).toMatchObject({ s: 0, l: 0 });
    });
});
