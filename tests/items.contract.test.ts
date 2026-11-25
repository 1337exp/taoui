import { mount } from '@vue/test-utils';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import TaoChecklist from '../src/components/TaoChecklist.vue';
import TaoCombobox from '../src/components/TaoCombobox.vue';
import TaoDocTabs from '../src/components/TaoDocTabs.vue';
import TaoSelect from '../src/components/TaoSelect.vue';
import TaoTabs from '../src/components/TaoTabs.vue';
import TaoTree from '../src/components/TaoTree.vue';

// A list is `items`, and a row is `{ id, label }`: what `v-model` holds is the `id`. (TaoPresetInput keeps `options` and `value`:
// a preset is a number the arrows step over, not the identity of a row.)
// Список — `items`, строка — `{ id, label }`: `v-model` хранит `id`. (У TaoPresetInput остались `options` и `value`:
// заготовка — число, по которому ходят стрелки, а не идентичность строки.)

const items = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Bravo' },
];

describe('the list of a control is `items` with an id', () => {
    it('TaoSelect shows the label of the id in the model', () => {
        const w = mount(TaoSelect, { props: { items, modelValue: 'b' } });
        expect(w.find('.tao-select__value').text()).toBe('Bravo');
    });

    it('TaoCombobox shows the label of the id in the model', () => {
        const w = mount(TaoCombobox, { props: { items, modelValue: 'a' } });
        expect((w.find('input').element as HTMLInputElement).value).toBe('Alpha');
    });

    it('TaoTabs: the id selects, and the model gets the id', async () => {
        const w = mount(TaoTabs, { props: { items, modelValue: 'a' } });
        await w.findAll('.tao-tabs__tab')[1]!.trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([['b']]);
    });

    it('TaoTabs: the label slot gets the id', () => {
        const w = mount(TaoTabs, { props: { items, modelValue: 'a' }, slots: { label: (p: { id: string }) => `[${p.id}]` } });
        expect(w.findAll('.tao-tabs__tab').map((t) => t.text())).toEqual(['[a]', '[b]']);
    });

    it('TaoChecklist: the model is the ids that are ticked', async () => {
        const w = mount(TaoChecklist, { props: { items, modelValue: ['a'] } });
        expect((w.findAll('input')[0]!.element as HTMLInputElement).checked).toBe(true);
        await w.findAll('input')[1]!.setValue(true);
        expect(w.emitted('update:modelValue')?.at(-1)).toEqual([['a', 'b']]);
    });

    it('TaoDocTabs: the id of the document is what is selected', async () => {
        const w = mount(TaoDocTabs, { props: { items, modelValue: 'a' } });
        await w.findAll('[role="tab"]')[1]!.trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([['b']]);
    });

    it('TaoTree takes `items`', () => {
        const w = mount(TaoTree, { props: { items: [{ id: 'r', label: 'Root' }] } });
        expect(w.findAll('[role="treeitem"]')).toHaveLength(1);
    });
});

describe('the guard: no old list name or key', () => {
    const dir = join(__dirname, '../src');
    const read = (rel: string) => readFileSync(join(dir, rel), 'utf8').replace(/\r\n/g, '\n');

    it('the item types name their identity `id`', () => {
        for (const file of ['select.ts', 'tabs.ts', 'checklist.ts', 'docTabs.ts']) {
            expect(read(file), file).toMatch(/^\s+id: string/m);
            expect(read(file), file).not.toMatch(/^\s+value: string/m);
        }
    });

    it('no component but the preset input has a prop called `options` or `nodes`', () => {
        const sources = readdirSync(join(dir, 'components')).filter((n) => n.endsWith('.vue'));
        const withOld = sources
            .filter((name) => /^\s+(options|nodes)\??: /m.test(read(`components/${name}`)))
            .filter((name) => name !== 'TaoPresetInput.vue');
        expect(withOld).toEqual([]);
    });
});
