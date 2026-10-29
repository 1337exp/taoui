import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
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
