import { mount } from '@vue/test-utils';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
import TaoChecklist from '../src/components/TaoChecklist.vue';
import TaoInput from '../src/components/TaoInput.vue';
import TaoInputNumber from '../src/components/TaoInputNumber.vue';
import TaoQuantity from '../src/components/TaoQuantity.vue';
import TaoSegmented from '../src/components/TaoSegmented.vue';
import TaoSegmentedOption from '../src/components/TaoSegmentedOption.vue';
import TaoSlider from '../src/components/TaoSlider.vue';
import TaoSwitch from '../src/components/TaoSwitch.vue';
import TaoTabs from '../src/components/TaoTabs.vue';
import TaoTextarea from '../src/components/TaoTextarea.vue';

// A model is Vue's own (`defineModel`): with `v-model` the parent holds the state, without it the component does.
// Модель — родная для Vue (`defineModel`): с `v-model` состояние держит родитель, без него — компонент.

describe('the guard: no hand-written model', () => {
    const dir = join(__dirname, '../src/components');
    const sources = readdirSync(dir)
        .filter((name) => name.endsWith('.vue'))
        .map((name) => ({ name, source: readFileSync(join(dir, name), 'utf8').replace(/\r\n/g, '\n') }));

    it('only TaoThemeToggle still declares update:modelValue by hand (it reads the page when it is not given a value)', () => {
        const hand = sources.filter(({ source }) => /'update:modelValue'\s*:\s*\[/.test(source)).map((s) => s.name);
        expect(hand).toEqual(['TaoThemeToggle.vue']);
    });
});

describe('without v-model the component keeps its own state', () => {
    it('TaoInput: what is typed stays', async () => {
        const w = mount(TaoInput);
        await w.find('input').setValue('abc');
        expect((w.find('input').element as HTMLInputElement).value).toBe('abc');
        expect(w.emitted('update:modelValue')).toEqual([['abc']]);
    });

    it('TaoTextarea: what is typed stays', async () => {
        const w = mount(TaoTextarea);
        await w.find('textarea').setValue('abc');
        expect((w.find('textarea').element as HTMLTextAreaElement).value).toBe('abc');
    });

    it('TaoSwitch and TaoCheckbox: a click turns them on', async () => {
        for (const component of [TaoSwitch, TaoCheckbox]) {
            const w = mount(component);
            await w.find('input').setValue(true);
            expect((w.find('input').element as HTMLInputElement).checked).toBe(true);
        }
    });

    it('TaoTabs: the picked tab becomes active', async () => {
        // no v-model at all: the component keeps its own state
        const w = mount(TaoTabs, { props: { items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] } as never });
        await w.findAll('.tao-tabs__tab')[1]!.trigger('click');
        expect(w.findAll('.tao-tabs__tab')[1]!.attributes('aria-selected')).toBe('true');
        expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['b']);
    });

    it('TaoChecklist: a ticked box stays ticked', async () => {
        const w = mount(TaoChecklist, { props: { items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] } });
        await w.findAll('input')[0]!.setValue(true);
        expect((w.findAll('input')[0]!.element as HTMLInputElement).checked).toBe(true);
        expect(w.emitted('update:modelValue')?.at(-1)).toEqual([['a']]);
    });

    it('TaoSegmented: the clicked option is selected', async () => {
        const w = mount(TaoSegmented, {
            slots: { default: () => [h(TaoSegmentedOption, { value: 'a' }, () => 'A'), h(TaoSegmentedOption, { value: 'b' }, () => 'B')] },
        });
        await w.findAll('input')[1]!.setValue(true);
        expect((w.findAll('input')[1]!.element as HTMLInputElement).checked).toBe(true);
    });

    it('TaoQuantity: the plus moves the number', async () => {
        const w = mount(TaoQuantity, { props: { max: 9 } });
        await w.findAll('button')[1]!.trigger('click');
        expect((w.find('input').element as HTMLInputElement).value).toBe('2');
    });

    it('TaoSlider: a key moves the thumb', async () => {
        const w = mount(TaoSlider, { props: { modelValue: 0, min: 0, max: 10 } });
        await w.find('.tao-slider__thumb').trigger('keydown', { key: 'ArrowRight' });
        expect(w.emitted('update:modelValue')).toEqual([[1]]);
    });
});

describe('with v-model the parent holds the state', () => {
    it('a parent that refuses keeps the value: TaoSwitch stays off', async () => {
        const w = mount(TaoSwitch, { props: { modelValue: false, 'onUpdate:modelValue': () => {} } });
        await w.find('input').setValue(true);
        expect(w.emitted('update:modelValue')).toEqual([[true]]);
        expect(w.find('.tao-switch').classes()).not.toContain('tao-switch--on');
    });

    it('a parent that follows moves the component', async () => {
        const w = mount(TaoSwitch, {
            props: { modelValue: false, 'onUpdate:modelValue': (v: boolean) => w.setProps({ modelValue: v }) },
        });
        await w.find('input').setValue(true);
        expect(w.find('.tao-switch').classes()).toContain('tao-switch--on');
    });

    it('a value that comes from outside shows at once, on a field that is not being typed in: TaoInputNumber', async () => {
        const w = mount(TaoInputNumber, { props: { modelValue: 1 } });
        await w.setProps({ modelValue: 7 });
        expect((w.find('input').element as HTMLInputElement).value).toBe('7');
    });
});
