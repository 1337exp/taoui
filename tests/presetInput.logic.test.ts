import { describe, expect, it } from 'vitest';
import { parsePreset, presetLine, presetList, stepPreset, type TaoPresetOption } from '../src/presetInput';

// 5.32.0: the logic of TaoPresetInput, apart from the component.
// 5.32.0: логика TaoPresetInput отдельно от компонента.

const sizes = [4, 8, 12, 64];
const options: TaoPresetOption[] = [
    { value: 'auto', label: 'Auto', default: true },
    ...sizes.map((size) => ({ value: size, label: String(size) })),
];

describe('presetLine / presetList', () => {
    it('the arrows walk the default option last, the pop-up shows it first', () => {
        expect(presetLine(options).map((o) => o.value)).toEqual([4, 8, 12, 64, 'auto']);
        expect(presetList(options).map((o) => o.value)).toEqual(['auto', 4, 8, 12, 64]);
    });

    it('a disabled option is not a stop of the arrows, but stays in the pop-up', () => {
        const some = [...options, { value: 99, label: '99', disabled: true }];
        expect(presetLine(some).map((o) => o.value)).not.toContain(99);
        expect(presetList(some).map((o) => o.value)).toContain(99);
    });
});

describe('stepPreset', () => {
    it('up goes to the next, from the last to the default option, where the line ends', () => {
        expect(stepPreset(options, 4, 1)).toBe(8);
        expect(stepPreset(options, 64, 1)).toBe('auto');
        expect(stepPreset(options, 'auto', 1)).toBe('auto');
    });

    it('down goes to the previous, from the default option to the last number, and stops at the first', () => {
        expect(stepPreset(options, 'auto', -1)).toBe(64);
        expect(stepPreset(options, 12, -1)).toBe(8);
        expect(stepPreset(options, 4, -1)).toBe(4);
    });

    it('with loop the ends join: up from the default option is the first, down from the first is the default option', () => {
        expect(stepPreset(options, 'auto', 1, true)).toBe(4);
        expect(stepPreset(options, 4, -1, true)).toBe('auto');
    });

    it('a number that is not in the list goes to the nearest one on that side', () => {
        expect(stepPreset(options, 10, 1)).toBe(12);
        expect(stepPreset(options, 10, -1)).toBe(8);
        expect(stepPreset(options, 100, 1)).toBe('auto');
        expect(stepPreset(options, 100, -1)).toBe(64);
        expect(stepPreset(options, 2, -1)).toBe(2);
        expect(stepPreset(options, 2, -1, true)).toBe('auto');
    });

    it('with nothing picked up starts at the first and down at the last; without a default option the ends hold', () => {
        expect(stepPreset(options, null, 1)).toBe(4);
        expect(stepPreset(options, null, -1)).toBe('auto');
        const plain = options.filter((o) => !o.default);
        expect(stepPreset(plain, 64, 1)).toBe(64);
        expect(stepPreset(plain, 100, 1)).toBe(100);
        expect(stepPreset(plain, 64, 1, true)).toBe(4);
    });

    it('an empty list changes nothing', () => {
        expect(stepPreset([], 5, 1)).toBe(5);
    });
});

describe('parsePreset', () => {
    it('a label in any case or an empty text is an option; the empty one is the default option', () => {
        expect(parsePreset('auto', options)).toBe('auto');
        expect(parsePreset(' AUTO ', options)).toBe('auto');
        expect(parsePreset('', options)).toBe('auto');
        expect(parsePreset('8', options)).toBe(8);
    });

    it('a whole number inside min…max is a value, anything else is not', () => {
        expect(parsePreset('16', options)).toBe(16);
        expect(parsePreset('16,4', options)).toBe(16);
        expect(parsePreset('0', options)).toBeUndefined();
        expect(parsePreset('1000', options)).toBeUndefined();
        expect(parsePreset('12px', options)).toBeUndefined();
        expect(parsePreset('-3', options)).toBeUndefined();
        expect(parsePreset('5', options, { min: 10, max: 20 })).toBeUndefined();
    });

    it('with custom off only the options count; an empty text with no default option is not a value', () => {
        expect(parsePreset('16', options, { custom: false })).toBeUndefined();
        expect(parsePreset('12', options, { custom: false })).toBe(12);
        expect(parsePreset('', options.filter((o) => !o.default))).toBeUndefined();
    });
});
