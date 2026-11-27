import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoQuantity from '../src/components/TaoQuantity.vue';
import TaoSlider from '../src/components/TaoSlider.vue';

// A focused field shows the model: a value that comes from elsewhere (an undo, a reset, a load) replaces its text, and leaving the field does
// not write the stale text back over it. The same rule as in TaoDragNumber / TaoInputNumber.
// Поле в фокусе показывает модель: значение «снаружи» (отмена, сброс, загрузка) заменяет его текст, а уход из поля не пишет устаревший
// текст поверх. То же правило, что у TaoDragNumber / TaoInputNumber.

const mounted: VueWrapper[] = [];
afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount();
    document.body.innerHTML = '';
});

describe('TaoQuantity', () => {
    function make(props: Record<string, unknown> = {}) {
        const updates: number[] = [];
        const commits: number[] = [];
        const w = mount(TaoQuantity, {
            attachTo: document.body,
            props: {
                modelValue: 3,
                ...props,
                'onUpdate:modelValue': (value: number) => {
                    updates.push(value);
                    void w.setProps({ modelValue: value });
                },
                onCommit: (value: number) => commits.push(value),
            },
        });
        mounted.push(w);
        return { w, updates, commits };
    }

    it('an undo while the field is focused shows, and blur does not write the old number back', async () => {
        const { w, commits } = make({ modelValue: 3 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('7');
        await nextTick();
        expect(w.props('modelValue')).toBe(7);
        await w.setProps({ modelValue: 3 }); // the app undoes it
        await nextTick();
        expect(input.element.value).toBe('3');
        await input.trigger('blur');
        expect(w.props('modelValue')).toBe(3);
        expect(commits).toEqual([]);
    });

    it('its own typing leaves the text as it is while it goes on, and blur commits once', async () => {
        const { w, commits } = make({ modelValue: 3 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('12');
        await nextTick();
        expect(input.element.value).toBe('12');
        await input.trigger('blur');
        expect(commits).toEqual([12]);
    });

    it('a redo that equals the number the field wrote before shows too', async () => {
        const { w } = make({ modelValue: 3 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('7');
        await nextTick();
        await w.setProps({ modelValue: 3 });
        await nextTick();
        await w.setProps({ modelValue: 7 });
        await nextTick();
        expect(input.element.value).toBe('7');
    });
});

describe('TaoSlider editor', () => {
    it('a value of the thumb that changes from outside while the field is open shows in it, and Enter does not put the old text back', async () => {
        const w = mount(TaoSlider, { props: { modelValue: 40, editable: true }, attachTo: document.body });
        mounted.push(w);
        await w.find('.tao-slider__rail').trigger('dblclick', { clientX: 50, clientY: 10 });
        await nextTick();
        const editor = w.find<HTMLInputElement>('.tao-slider__editor');
        expect(editor.exists()).toBe(true);
        expect(editor.element.value).toBe('40');
        await w.setProps({ modelValue: 25 }); // an undo of the app
        await nextTick();
        expect(editor.element.value).toBe('25');
        await editor.trigger('keydown', { key: 'Enter' });
        expect(w.props('modelValue')).toBe(25);
        expect(w.emitted('update:modelValue') ?? []).toEqual([]);
    });
});
