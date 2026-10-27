import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import TaoChecklist from '../src/components/TaoChecklist.vue';
import TaoFormField from '../src/components/TaoFormField.vue';
import type { TaoChecklistItem } from '../src/checklist';

const items: TaoChecklistItem[] = [
    { value: 'milk', label: 'Milk' },
    { value: 'bread', label: 'Bread', description: 'Rye, sliced' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'salt', label: 'Salt', disabled: true },
];

const list = (props: Record<string, unknown> = {}) => mount(TaoChecklist, { props: { items, ...props } });
const boxes = (w: ReturnType<typeof list>) => w.findAll('.tao-checklist__item input[type="checkbox"]');
const all = (w: ReturnType<typeof list>) => w.find('.tao-checklist__all input');

describe('TaoChecklist', () => {
    it('is a fieldset with a legend and a checkbox per item, checked from the model', () => {
        const w = list({ modelValue: ['bread'], legend: 'Shopping' });
        expect(w.element.tagName).toBe('FIELDSET');
        expect(w.find('legend').text()).toBe('Shopping');
        expect(boxes(w).map((b) => (b.element as HTMLInputElement).checked)).toEqual([false, true, false, false]);
        expect(w.find('.tao-checklist__description').text()).toBe('Rye, sliced');
        expect(boxes(w)[3]!.attributes('disabled')).toBeDefined();
    });

    it('a click adds or removes the value, the model keeps the order of the items', async () => {
        const w = list({ modelValue: ['eggs'] });
        await boxes(w)[0]!.setValue(true);
        expect(w.emitted('update:modelValue')).toEqual([[['milk', 'eggs']]]);
        await w.setProps({ modelValue: ['milk', 'eggs'] });
        await boxes(w)[2]!.setValue(false);
        expect(w.emitted('update:modelValue')!.at(-1)).toEqual([['milk']]);
        expect(w.emitted('change')).toHaveLength(2);
    });

    it('select all: mixed when some are checked; it checks every enabled item, then clears them', async () => {
        const w = list({ modelValue: ['milk', 'salt'], selectAll: true });
        expect(w.find('.tao-checklist__all').text()).toBe('Select all');
        expect(all(w).attributes('aria-checked')).toBe('mixed');
        await all(w).setValue(true);
        expect(w.emitted('update:modelValue')!.at(-1)).toEqual([['milk', 'bread', 'eggs', 'salt']]);
        await w.setProps({ modelValue: ['milk', 'bread', 'eggs'] });
        expect((all(w).element as HTMLInputElement).checked).toBe(true);
        expect(all(w).attributes('aria-checked')).toBeUndefined();
        await all(w).setValue(false);
        // the disabled item keeps its state / недоступный пункт сохраняет своё состояние
        expect(w.emitted('update:modelValue')!.at(-1)).toEqual([[]]);
    });

    it('the counter says how many are checked, politely live', () => {
        const w = list({ modelValue: ['milk', 'eggs'], counter: true });
        const counter = w.find('.tao-checklist__counter');
        expect(counter.text()).toBe('2 of 4');
        expect(counter.attributes('aria-live')).toBe('polite');
    });

    it('strike-through is a look on the checked items only; the checkbox keeps the state', () => {
        const w = list({ modelValue: ['milk'], strike: true });
        expect(w.classes()).toContain('tao-checklist--strike');
        expect(w.findAll('.tao-checklist__item--checked')).toHaveLength(1);
        expect((boxes(w)[0]!.element as HTMLInputElement).checked).toBe(true);
    });

    it('disabled disables the whole group', () => {
        expect(list({ disabled: true }).attributes('disabled')).toBeDefined();
    });

    it('the item slot gets the item and its state', () => {
        const w = mount(TaoChecklist, {
            props: { items, modelValue: ['eggs'] },
            slots: { item: ({ item, checked }: { item: TaoChecklistItem; checked: boolean }) => `${item.label}${checked ? '!' : ''}` },
        });
        expect(w.findAll('.tao-checklist__text').map((t) => t.text())).toEqual(['Milk', 'Bread', 'Eggs!', 'Salt']);
    });

    it('in a TaoFormField the group takes the field id and label; the checkboxes keep ids of their own', () => {
        const w = mount(TaoFormField, { props: { label: 'Groceries', error: 'Pick one' }, slots: { default: () => h(TaoChecklist, { items }) } });
        const group = w.find('fieldset');
        expect(group.attributes('id')).toBeTruthy();
        expect(group.attributes('aria-labelledby')).toBe(`${group.attributes('id')}-label`);
        expect(group.attributes('aria-invalid')).toBe('true');
        const ids = w.findAll('input[type="checkbox"]').map((i) => i.attributes('id'));
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids).not.toContain(group.attributes('id'));
    });

    it('selectAllLabel and counterText override the locale', () => {
        const w = list({ selectAll: true, counter: true, selectAllLabel: 'All of it', counterText: '{checked}/{total}' });
        expect(w.find('.tao-checklist__all').text()).toBe('All of it');
        expect(w.find('.tao-checklist__counter').text()).toBe('0/4');
    });
});
