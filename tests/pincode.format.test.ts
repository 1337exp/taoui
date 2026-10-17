import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoPinCode from '../src/components/TaoPinCode.vue';
import { parsePinFormat, pinFromPaste, separatorAfter } from '../src/pinFormat';

const digit = (ch: string) => (/^[0-9]$/.test(ch) ? ch : '');
const any = (ch: string) => ch;

describe('parsePinFormat', () => {
    it('counts cells and keeps separators in front of each', () => {
        const f = parsePinFormat('#-##-##');
        expect(f.cells).toBe(5);
        expect(f.before).toEqual(['', '-', '', '-', '']);
        expect(f.after).toBe('');
        expect(f.hasSeparators).toBe(true);
    });

    it('supports a prefix, a suffix and several characters in a separator', () => {
        const f = parsePinFormat('(##) ##');
        expect(f.cells).toBe(4);
        expect(f.before).toEqual(['(', '', ') ', '']);
        expect(parsePinFormat('##-').after).toBe('-');
        expect(separatorAfter(parsePinFormat('#-##-##'), 0)).toBe('-');
        expect(separatorAfter(parsePinFormat('#-##-##'), 1)).toBe('');
        expect(separatorAfter(parsePinFormat('##-'), 1)).toBe('-');
    });

    it('a mask without separators is plain cells', () => {
        const f = parsePinFormat('####');
        expect(f.cells).toBe(4);
        expect(f.hasSeparators).toBe(false);
    });
});

describe('pinFromPaste', () => {
    const f = parsePinFormat('#-##-##');

    it('takes cells out of text in the shape of the format', () => {
        expect(pinFromPaste('0-12-34', f, 5, digit)).toEqual(['0', '1', '2', '3', '4']);
        expect(pinFromPaste('  0-12-34\n', f, 5, digit)).toEqual(['0', '1', '2', '3', '4']);
    });

    it('a clean code of the same length goes in as is', () => {
        expect(pinFromPaste('01234', f, 5, digit)).toEqual(['0', '1', '2', '3', '4']);
        expect(pinFromPaste('AB1C2', f, 5, any)).toEqual(['A', 'B', '1', 'C', '2']); // text mode: letters are fine too
        expect(pinFromPaste('A-B1-C2', f, 5, any)).toEqual(['A', 'B', '1', 'C', '2']);
    });

    it('returns null for anything else, so the caller falls back to taking what fits', () => {
        expect(pinFromPaste('0-12', f, 5, digit)).toBeNull();
        expect(pinFromPaste('0.12.34', f, 5, digit)).toBeNull(); // wrong separators, wrong length for a clean code
        expect(pinFromPaste('0123x', f, 5, digit)).toBeNull(); // a clean code needs every character valid
    });

    it('works without a format: only the clean-code shape is recognised', () => {
        expect(pinFromPaste('1234', null, 4, digit)).toEqual(['1', '2', '3', '4']);
        expect(pinFromPaste('12', null, 4, digit)).toBeNull();
    });
});

describe('TaoPinCode with format', () => {
    const mountPin = (props: Record<string, unknown> = {}) => mount(TaoPinCode, { props: { format: '#-##-##', numbersOnly: true, modelValue: '', ...props }, attachTo: document.body });
    const paste = async (w: ReturnType<typeof mountPin>, text: string, cell = 0) => {
        const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & { clipboardData: unknown };
        event.clipboardData = { getData: () => text };
        w.findAll('input')[cell]!.element.dispatchEvent(event);
        await nextTick();
    };
    const last = (w: ReturnType<typeof mountPin>) => {
        const all = w.emitted('update:modelValue')!;
        return all[all.length - 1]![0];
    };

    it('draws cells by the mask and the separators between them, without a length', () => {
        const w = mountPin();
        expect(w.findAll('input')).toHaveLength(5);
        const seps = w.findAll('.tao-pin-code__separator');
        expect(seps.map((s) => s.text())).toEqual(['-', '-']);
        expect(seps[0]!.attributes('aria-hidden')).toBe('true');
        w.unmount();
    });

    it('the mask wins over length', () => {
        const w = mountPin({ length: 3 });
        expect(w.findAll('input')).toHaveLength(5);
        w.unmount();
    });

    it('a paste in the shape of the format fills the cells, the value has no separators', async () => {
        const w = mountPin();
        await paste(w, '0-12-34');
        expect(last(w)).toBe('01234');
        expect(w.emitted('complete')).toEqual([['01234']]);
        w.unmount();
    });

    it('a clean code of the same length is pasted as is, even into a cell in the middle', async () => {
        const w = mountPin();
        await paste(w, '98765', 3);
        expect(last(w)).toBe('98765');
        w.unmount();
    });

    it('anything else is pasted the old way: what fits, from the focused cell', async () => {
        const w = mountPin();
        await paste(w, '1-2', 0);
        expect(last(w)).toBe('12');
        w.unmount();
    });

    it('typing the separator after a filled group jumps to the next cell', async () => {
        const w = mountPin({ clearOn: 'input' }); // с clearOn='focus' возврат в ячейку стёр бы её
        const inputs = w.findAll('input');
        await inputs[0]!.setValue('7');
        // фокус ушёл в ячейку 1; вернёмся в 0 и наберём разделитель
        (inputs[0]!.element as HTMLInputElement).focus();
        await inputs[0]!.setValue('-');
        await nextTick();
        expect(document.activeElement).toBe(inputs[1]!.element);
        expect((inputs[0]!.element as HTMLInputElement).value).toBe('7');
        w.unmount();
    });

    it('without a format everything works as before', async () => {
        const w = mount(TaoPinCode, { props: { length: 4, modelValue: '' }, attachTo: document.body });
        expect(w.findAll('input')).toHaveLength(4);
        expect(w.findAll('.tao-pin-code__separator')).toHaveLength(0);
        w.unmount();
    });
});
