import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoPresetInput from '../src/components/TaoPresetInput.vue';

// 5.32.0: TaoPresetInput, a field with presets: an input, two arrows, a narrow pop-up.
// 5.32.0: TaoPresetInput, поле с заготовками: поле ввода, две стрелки, узкое окно.

const options = [
    { value: 'auto', label: 'Auto', default: true },
    ...[4, 8, 12, 64].map((size) => ({ value: size, label: String(size) })),
];

const wrappers: VueWrapper[] = [];
function make(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
    const w: VueWrapper = mount(TaoPresetInput, {
        props: { options, modelValue: 'auto', 'onUpdate:modelValue': (v: unknown) => void w.setProps({ modelValue: v as never }), ...props } as never,
        attrs,
        attachTo: document.body,
    });
    wrappers.push(w);
    return w;
}
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
});

const $$ = (selector: string) => [...document.body.querySelectorAll<HTMLElement>(selector)];
async function key(w: VueWrapper, name: string) {
    await w.find('input').trigger('keydown', { key: name });
    await nextTick();
}
const value = (w: VueWrapper) => (w.find('input').element as HTMLInputElement).value;
const steps = (w: VueWrapper) => w.findAll('.tao-preset-input__step');

describe('TaoPresetInput', () => {
    it('is a combobox named by what the user gives it, with two arrows that are not tab stops', () => {
        const w = make({}, { 'aria-label': 'Font size' });
        const input = w.find('input');
        expect(input.attributes('role')).toBe('combobox');
        expect(input.attributes('aria-label')).toBe('Font size');
        expect(input.attributes('aria-expanded')).toBe('false');
        expect(steps(w)).toHaveLength(2);
        expect(steps(w).every((b) => b.attributes('tabindex') === '-1')).toBe(true);
        expect(steps(w)[0]!.attributes('aria-label')).toBe('Next value');
        expect(value(w)).toBe('Auto');
    });

    it('opens on focus with every preset, the default one first, and names the picked one for a screen reader', async () => {
        const w = make({ modelValue: 8 });
        await w.find('input').trigger('focus');
        await nextTick();
        const rows = $$('[role="option"]');
        expect(rows.map((r) => r.textContent!.trim())).toEqual(['Auto', '4', '8', '12', '64']);
        const selected = rows.find((r) => r.getAttribute('aria-selected') === 'true')!;
        expect(selected.textContent!.trim()).toBe('8');
        const input = w.find('input');
        expect(input.attributes('aria-expanded')).toBe('true');
        expect(input.attributes('aria-controls')).toBe(document.body.querySelector('[role="listbox"]')!.id);
        expect(input.attributes('aria-activedescendant')).toBe(selected.id);
    });

    it('a click on a preset picks it and closes the pop-up', async () => {
        const w = make();
        await w.find('input').trigger('focus');
        await nextTick();
        $$('[role="option"]')[3]!.click();
        await nextTick();
        expect(w.emitted('update:modelValue')?.slice(-1)[0]).toEqual([12]);
        expect(w.emitted('change')?.slice(-1)[0]).toEqual([12]);
        expect($$('[role="option"]')).toHaveLength(0);
        expect(value(w)).toBe('12');
    });

    it('the arrows walk the line: down from Auto is the last, up from the last is Auto, and Auto ends it', async () => {
        const w = make();
        await steps(w)[1]!.trigger('click');
        expect(value(w)).toBe('64');
        await steps(w)[1]!.trigger('click');
        expect(value(w)).toBe('12');
        await steps(w)[0]!.trigger('click');
        await steps(w)[0]!.trigger('click');
        expect(value(w)).toBe('Auto');
        await steps(w)[0]!.trigger('click');
        expect(value(w)).toBe('Auto');
    });

    it('the ends hold at the first preset too, unless loop joins them', async () => {
        const w = make({ modelValue: 4 });
        await steps(w)[1]!.trigger('click');
        expect(value(w)).toBe('4');
        const ring = make({ modelValue: 4, loop: true });
        await steps(ring)[1]!.trigger('click');
        expect(value(ring)).toBe('Auto');
        await steps(ring)[0]!.trigger('click');
        expect(value(ring)).toBe('4');
    });

    it('ArrowUp and ArrowDown do the same from the keyboard, and Home and End go to the ends', async () => {
        const w = make({ modelValue: 8 });
        await key(w, 'ArrowUp');
        expect(value(w)).toBe('12');
        await key(w, 'ArrowDown');
        await key(w, 'ArrowDown');
        expect(value(w)).toBe('4');
        await key(w, 'End');
        expect(value(w)).toBe('Auto');
        await key(w, 'Home');
        expect(value(w)).toBe('4');
    });

    it('Home and End stay with the caret while a text is being typed', async () => {
        const w = make({ modelValue: 8 });
        await w.find('input').setValue('1');
        await key(w, 'End');
        expect(value(w)).toBe('1');
    });

    it('a number typed by hand is applied on Enter, and the arrows then go to the nearest preset', async () => {
        const w = make();
        await w.find('input').setValue('16');
        await key(w, 'Enter');
        expect(w.emitted('update:modelValue')?.slice(-1)[0]).toEqual([16]);
        await steps(w)[0]!.trigger('click');
        expect(value(w)).toBe('64');
    });

    it('a text that is not a value goes back; an empty one is the default preset', async () => {
        const w = make({ modelValue: 8 });
        await w.find('input').setValue('big');
        await key(w, 'Enter');
        expect(value(w)).toBe('8');
        expect(w.emitted('update:modelValue')).toBeUndefined();
        await w.find('input').setValue('');
        await key(w, 'Enter');
        expect(w.emitted('update:modelValue')?.slice(-1)[0]).toEqual(['auto']);
    });

    it('custom off: only the presets are values', async () => {
        const w = make({ modelValue: 8, custom: false });
        await w.find('input').setValue('16');
        await key(w, 'Enter');
        expect(value(w)).toBe('8');
    });

    it('leaving the field (Tab) applies the text and closes the pop-up', async () => {
        const w = make({ modelValue: 8 });
        await w.find('input').trigger('focus');
        await w.find('input').setValue('24');
        await w.find('input').trigger('blur');
        await nextTick();
        expect(w.emitted('update:modelValue')?.slice(-1)[0]).toEqual([24]);
        expect($$('[role="option"]')).toHaveLength(0);
    });

    it('Escape closes the pop-up and throws the typed text away', async () => {
        const w = make({ modelValue: 8 });
        await w.find('input').trigger('focus');
        await nextTick();
        await w.find('input').setValue('99');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await nextTick();
        expect(value(w)).toBe('8');
        expect($$('[role="option"]')).toHaveLength(0);
    });

    it('a press outside closes the pop-up and applies the text', async () => {
        const w = make({ modelValue: 8 });
        await w.find('input').trigger('focus');
        await nextTick();
        await w.find('input').setValue('18');
        document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await nextTick();
        expect($$('[role="option"]')).toHaveLength(0);
        expect(w.emitted('update:modelValue')?.slice(-1)[0]).toEqual([18]);
    });

    it('disabled: no input, no arrows', () => {
        const w = make({ disabled: true });
        expect(w.find('input').attributes('disabled')).toBeDefined();
        expect(steps(w).every((b) => b.attributes('disabled') !== undefined)).toBe(true);
    });
});
