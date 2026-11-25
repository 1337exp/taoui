import { mount } from '@vue/test-utils';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
import TaoInput from '../src/components/TaoInput.vue';
import TaoQuantity from '../src/components/TaoQuantity.vue';
import TaoSwitch from '../src/components/TaoSwitch.vue';
import TaoTextarea from '../src/components/TaoTextarea.vue';

// The events of the kit: `update:X` while a value is edited, `commit` when the edit is finished, no `change`, every emit typed.
// События набора: `update:X`, пока значение правят, `commit`, когда правка закончена; `change` нет; каждый emit типизирован.

describe('the guard of the event contract', () => {
    const dir = join(__dirname, '../src/components');
    const sources = readdirSync(dir)
        .filter((name) => name.endsWith('.vue'))
        .map((name) => ({ name, source: readFileSync(join(dir, name), 'utf8').replace(/\r\n/g, '\n') }));

    it('there are components to check', () => {
        expect(sources.length).toBeGreaterThan(80);
    });

    it('no component declares an untyped list of emits', () => {
        const untyped = sources.filter(({ source }) => /defineEmits\(\s*\[/.test(source)).map((s) => s.name);
        expect(untyped).toEqual([]);
    });

    it('no component declares or emits `change` (an edit ends with `commit`, a pick with `update:X`)', () => {
        const withChange = sources.filter(({ source }) => /^\s+change: \[/m.test(source) || /emit\('change'/.test(source)).map((s) => s.name);
        expect(withChange).toEqual([]);
    });

    it('no component emits the old names `seek`, `dec`, `inc`', () => {
        const old = sources.filter(({ source }) => /emit\('(seek|dec|inc)'/.test(source)).map((s) => s.name);
        expect(old).toEqual([]);
    });
});

describe('commit on the text fields', () => {
    it('TaoInput: the native change (blur or Enter with a changed text) is commit', async () => {
        const w = mount(TaoInput, { props: { modelValue: '' } });
        const input = w.find('input');
        (input.element as HTMLInputElement).value = 'abc';
        await input.trigger('input');
        expect(w.emitted('update:modelValue')).toEqual([['abc']]);
        expect(w.emitted('commit')).toBeUndefined();
        await input.trigger('change');
        expect(w.emitted('commit')).toEqual([['abc']]);
    });

    it('TaoTextarea: commit with the text, not the native event', async () => {
        const w = mount(TaoTextarea, { props: { modelValue: '' } });
        const area = w.find('textarea');
        (area.element as HTMLTextAreaElement).value = 'hello';
        await area.trigger('change');
        expect(w.emitted('commit')).toEqual([['hello']]);
    });

    it('a discrete control says update only: a click on TaoSwitch and TaoCheckbox', async () => {
        for (const component of [TaoSwitch, TaoCheckbox]) {
            const w = mount(component, { props: { modelValue: false } });
            await w.find('input').setValue(true);
            expect(w.emitted('update:modelValue')).toEqual([[true]]);
            expect(w.emitted('commit')).toBeUndefined();
        }
    });
});

describe('TaoQuantity events', () => {
    const buttons = (w: ReturnType<typeof mount>) => w.findAll('button');

    it('a plus is commit with the new number, after the update', async () => {
        const w = mount(TaoQuantity, { props: { modelValue: 2, min: 1 } });
        await buttons(w)[1]!.trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([[3]]);
        expect(w.emitted('commit')).toEqual([[3]]);
        expect(w.emitted('inc')).toBeUndefined();
    });

    it('a minus is commit; at the minimum, with allowRemove, it is `remove` and nothing else', async () => {
        const w = mount(TaoQuantity, { props: { modelValue: 2, min: 1 } });
        await buttons(w)[0]!.trigger('click');
        expect(w.emitted('commit')).toEqual([[1]]);
        await w.setProps({ modelValue: 1 });
        await buttons(w)[0]!.trigger('click');
        expect(w.emitted('remove')).toHaveLength(1);
        expect(w.emitted('commit')).toHaveLength(1);
        expect(w.emitted('dec')).toBeUndefined();
    });

    it('without allowRemove the minus at the minimum does nothing', async () => {
        const w = mount(TaoQuantity, { props: { modelValue: 1, min: 1, allowRemove: false } });
        await buttons(w)[0]!.trigger('click');
        expect(w.emitted('remove')).toBeUndefined();
        expect(w.emitted('commit')).toBeUndefined();
    });

    it('a plus at the maximum is not a commit', async () => {
        const w = mount(TaoQuantity, { props: { modelValue: 5, min: 1, max: 5 } });
        await w.find('input').trigger('keydown', { key: 'ArrowUp' });
        expect(w.emitted('commit')).toBeUndefined();
    });

    it('typing updates at once and commits once, when the field is left with a changed number', async () => {
        const w = mount(TaoQuantity, { props: { modelValue: 2, min: 1 } });
        const input = w.find('input');
        await input.trigger('focus');
        (input.element as HTMLInputElement).value = '7';
        await input.trigger('input');
        expect(w.emitted('update:modelValue')).toEqual([[7]]);
        expect(w.emitted('commit')).toBeUndefined();
        await w.setProps({ modelValue: 7 });
        await input.trigger('blur');
        expect(w.emitted('commit')).toEqual([[7]]);
        expect(w.emitted('blur')?.[0]?.[0]).toBeInstanceOf(FocusEvent);
    });

    it('leaving the field with the number it came with is not a commit', async () => {
        const w = mount(TaoQuantity, { props: { modelValue: 2, min: 1 } });
        await w.find('input').trigger('focus');
        await w.find('input').trigger('blur');
        expect(w.emitted('commit')).toBeUndefined();
    });
});
