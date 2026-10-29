import { mount } from '@vue/test-utils';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
import TaoColorInput from '../src/components/TaoColorInput.vue';
import TaoColorPicker from '../src/components/TaoColorPicker.vue';
import TaoFileDrop from '../src/components/TaoFileDrop.vue';
import TaoPinCode from '../src/components/TaoPinCode.vue';
import TaoQuantity from '../src/components/TaoQuantity.vue';
import TaoCombobox from '../src/components/TaoCombobox.vue';
import TaoDate from '../src/components/TaoDate.vue';
import TaoDateRange from '../src/components/TaoDateRange.vue';
import TaoInput from '../src/components/TaoInput.vue';
import TaoInputNumber from '../src/components/TaoInputNumber.vue';
import TaoRadio from '../src/components/TaoRadio.vue';
import TaoSelect from '../src/components/TaoSelect.vue';
import TaoSwitch from '../src/components/TaoSwitch.vue';
import TaoTextarea from '../src/components/TaoTextarea.vue';

// 5.8.2: the attributes of a field reach its control (an aria-label named nothing on the wrapper), the looks its wrapper.
// 5.8.2: атрибуты поля доходят до элемента управления (aria-label на обёртке ничего не называл), внешний вид — до обёртки.

const cases: [string, unknown, Record<string, unknown>, string][] = [
    ['TaoInput', TaoInput, {}, 'input'],
    ['TaoTextarea', TaoTextarea, {}, 'textarea'],
    ['TaoInputNumber', TaoInputNumber, { modelValue: 1 }, 'input'],
    ['TaoCombobox', TaoCombobox, { options: [] }, 'input'],
    ['TaoSelect', TaoSelect, { options: [] }, 'button.tao-select__trigger'],
    ['TaoDate', TaoDate, {}, 'button.tao-date__trigger'],
    ['TaoDate editable', TaoDate, { editable: true }, 'input.tao-date__input'],
    ['TaoDateRange', TaoDateRange, {}, 'button.tao-date-range__trigger'],
    ['TaoSwitch', TaoSwitch, {}, 'input'],
    ['TaoCheckbox', TaoCheckbox, {}, 'input'],
    ['TaoRadio', TaoRadio, { value: 'a' }, 'input'],
    ['TaoQuantity', TaoQuantity, { modelValue: 1 }, 'input'],
    ['TaoFileDrop', TaoFileDrop, {}, 'input[type=file]'],
];

describe('a field passes its attributes to its control', () => {
    it.each(cases)('%s: aria-label, name, data-* and listeners on the control; class and style on the wrapper', (_, component, props, control) => {
        const onFocus = vi.fn();
        const w = mount(component as never, {
            props: props as never,
            attrs: { 'aria-label': 'Search', name: 'q', 'data-testid': 'f', class: 'mine', style: 'margin-top: 3px', onFocus },
        });
        const el = w.find(control);
        expect(el.exists()).toBe(true);
        expect(el.attributes('aria-label')).toBe('Search');
        expect(el.attributes('name')).toBe('q');
        expect(el.attributes('data-testid')).toBe('f');
        expect(w.classes()).toContain('mine');
        expect(w.attributes('style')).toContain('margin-top: 3px');
        expect(w.attributes('aria-label')).toBeUndefined();
        (el.element as HTMLElement).dispatchEvent(new FocusEvent('focus'));
        expect(onFocus).toHaveBeenCalled();
    });
});

// 5.8.4: the fields that named themselves in their own way.
// 5.8.4: поля, у которых имя устроено по-своему.
describe('the fields with a name of their own', () => {
    it('TaoColorInput: the given aria-label names the trigger, the colour follows it', () => {
        const w = mount(TaoColorInput, { props: { modelValue: '#ff8800' }, attrs: { 'aria-label': 'Background', class: 'mine' } });
        const button = w.find('button.tao-color-input');
        expect(button.attributes('aria-label')).toBe('Background: #ff8800');
        expect(w.find('.mine').exists()).toBe(true);
        expect(w.find('.mine').attributes('aria-label')).toBeUndefined();
    });

    it('TaoColorInput: without one, the locale names it', () => {
        const w = mount(TaoColorInput, { props: { modelValue: '#ff8800' } });
        expect(w.find('button.tao-color-input').attributes('aria-label')).toMatch(/: #ff8800$/);
    });

    it('TaoColorPicker: a group, so its aria-label names something', () => {
        const w = mount(TaoColorPicker, { props: { modelValue: '#ff8800' }, attrs: { 'aria-label': 'Accent' } });
        expect(w.attributes('role')).toBe('group');
        expect(w.attributes('aria-label')).toBe('Accent');
    });

    it('TaoPinCode: each cell says which character it is', () => {
        const w = mount(TaoPinCode, { props: { modelValue: '', length: 4 } as never });
        const labels = w.findAll('input').map((i) => i.attributes('aria-label'));
        expect(labels).toEqual(['Character 1 of 4', 'Character 2 of 4', 'Character 3 of 4', 'Character 4 of 4']);
    });
});

// The guard for the fields to come: a component whose control takes the field id (`:id="controlId"`) is a wrapper
// around it, so it must split its attributes (`useControlAttrs`), or an aria-label lands on the wrapper again.
// Страж для будущих полей: компонент, чей элемент управления берёт id поля (`:id="controlId"`), — обёртка вокруг него
// и должен разделять атрибуты (`useControlAttrs`), иначе aria-label снова окажется на обёртке.
describe('every field splits its attributes', () => {
    const dir = join(__dirname, '../src/components');
    const fields = readdirSync(dir)
        .filter((name) => name.endsWith('.vue'))
        .map((name) => ({ name, source: readFileSync(join(dir, name), 'utf8').replace(/\r\n/g, '\n') }))
        .filter(({ source }) => source.includes(':id="controlId"'));

    it('there are fields to check', () => {
        expect(fields.length).toBeGreaterThanOrEqual(10);
    });

    it.each(fields.map((f) => [f.name, f.source]))('%s: inheritAttrs: false, rootAttrs() on the wrapper, controlAttrs() on the control', (_, source) => {
        expect(source).toMatch(/inheritAttrs:\s*false/);
        expect(source).toContain('useControlAttrs()');
        expect(source).toContain('v-bind="rootAttrs()"');
        expect(source).toContain('v-bind="controlAttrs()"');
    });
});

describe('TaoInput variant', () => {
    it('outline by default; filled and plain mark the frame', () => {
        expect(mount(TaoInput).find('.tao-input-shell').classes().some((c) => c.startsWith('tao-input-shell--') && /filled|plain|outline/.test(c))).toBe(false);
        expect(mount(TaoInput, { props: { variant: 'plain' } }).find('.tao-input-shell').classes()).toContain('tao-input-shell--plain');
        expect(mount(TaoInput, { props: { variant: 'filled' } }).find('.tao-input-shell').classes()).toContain('tao-input-shell--filled');
    });
});

describe('the text fields share the variants', () => {
    it.each([
        ['TaoInputNumber', TaoInputNumber, { modelValue: 1 }, 'tao-input-number'],
        ['TaoCombobox', TaoCombobox, { options: [] }, 'tao-combobox'],
    ] as [string, unknown, Record<string, unknown>, string][])('%s: outline by default, filled and plain mark the root', (_, component, props, base) => {
        const classes = (variant?: string) => mount(component as never, { props: { ...props, variant } as never }).classes();
        expect(classes().filter((c) => /--(filled|plain|outline)$/.test(c))).toEqual([]);
        expect(classes('filled')).toContain(`${base}--filled`);
        expect(classes('plain')).toContain(`${base}--plain`);
    });
});
