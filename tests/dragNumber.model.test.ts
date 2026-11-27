import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoDragNumber from '../src/components/TaoDragNumber.vue';

// The rule of the field: what it shows is the model. A number that can be read is written at once, a value from outside replaces the text,
// `commit` is the edge of an action (found by the Deck of Bones editor: an undo under the cursor was written back at blur, and a number typed
// without Enter was not in the model at Ctrl+S).
// Правило поля: то, что оно показывает, это модель. Читаемое число пишется сразу, значение снаружи заменяет текст, `commit` это край действия.

afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
});

function make(props: Record<string, unknown> = {}) {
    const updates: number[] = [];
    const commits: number[] = [];
    const w = mount(TaoDragNumber, {
        attachTo: document.body,
        props: {
            modelValue: 5,
            ...props,
            'onUpdate:modelValue': (value: number) => {
                updates.push(value);
                void w.setProps({ modelValue: value });
            },
            onCommit: (value: number) => commits.push(value),
        },
    });
    return { w, updates, commits };
}

type Wrapper = ReturnType<typeof make>['w'];
const pointer = (x: number) => ({ clientX: x, pointerId: 1, button: 0 });
const press = (w: Wrapper, x: number) => w.find('.tao-drag-number__field').trigger('pointerdown', pointer(x));
const move = (w: Wrapper, x: number) => w.find('.tao-drag-number__field').trigger('pointermove', pointer(x));
const release = (w: Wrapper, x: number) => w.find('.tao-drag-number__field').trigger('pointerup', pointer(x));

describe('typing', () => {
    it('a number typed is in the model at once (an app that saves on Ctrl+S saves it); the commit comes with Enter, once', async () => {
        const { w, updates, commits } = make({ modelValue: 1.45, step: 0.01 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('2.2');
        expect(updates).toEqual([2.2]);
        expect(w.props('modelValue')).toBe(2.2);
        expect(commits).toEqual([]);
        await input.trigger('keydown', { key: 'Enter' });
        await input.trigger('blur');
        expect(commits).toEqual([2.2]);
    });

    it('text that is not a number yet (`-`, a word) waits: the model keeps the last number, and blur puts the text back', async () => {
        const { w, updates, commits } = make({ modelValue: 5 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('-');
        await input.setValue('abc');
        expect(updates).toEqual([]);
        expect(input.element.value).toBe('abc');
        await input.trigger('blur');
        expect(input.element.value).toBe('5');
        expect(commits).toEqual([]);
    });

    it('the text stays as typed while the model follows it (clamped, rounded), and blur puts the tidy number in the field', async () => {
        const { w } = make({ modelValue: 15, min: 10, max: 20, precision: 0 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('5');
        await nextTick();
        expect(w.props('modelValue')).toBe(10);
        expect(input.element.value).toBe('5');
        await input.setValue('12.4');
        await nextTick();
        expect(w.props('modelValue')).toBe(12);
        expect(input.element.value).toBe('12.4');
        await input.trigger('blur');
        expect(input.element.value).toBe('12');
    });

    it('Enter and blur commit once between them, and a blur that finds the committed number commits nothing', async () => {
        const { w, commits } = make({ modelValue: 5 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('7');
        await input.trigger('keydown', { key: 'Enter' });
        await input.trigger('blur');
        await input.trigger('focus');
        await input.setValue('7.0');
        await input.trigger('blur');
        expect(commits).toEqual([7]);
    });

    it('an IME composition is not a number: nothing is written until it ends, and an outside value waits for it', async () => {
        const { w, updates } = make({ modelValue: 5 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.trigger('compositionstart');
        await input.setValue('1');
        await input.setValue('12');
        expect(updates).toEqual([]);
        await w.setProps({ modelValue: 9 });
        await nextTick();
        expect(input.element.value).toBe('12');
        await input.trigger('compositionend');
        expect(updates).toEqual([12]);
    });
});

describe('a value from outside', () => {
    it('an undo and a redo of the app both show, also the redo that equals what the field wrote itself', async () => {
        const { w, commits } = make({ modelValue: 1.45, step: 0.01 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.trigger('keydown', { key: 'ArrowUp' });
        await input.trigger('keyup', { key: 'ArrowUp' });
        await nextTick();
        expect(input.element.value).toBe('1.46');
        await w.setProps({ modelValue: 1.45 }); // Ctrl+Z
        await nextTick();
        expect(input.element.value).toBe('1.45');
        await w.setProps({ modelValue: 1.46 }); // Ctrl+Y: the number the field wrote before
        await nextTick();
        expect(input.element.value).toBe('1.46');
        await input.trigger('blur');
        expect(w.props('modelValue')).toBe(1.46);
        expect(commits).toEqual([1.46]);
    });

    it('is assigned, not selected: the caret is not taken away (a step still selects)', async () => {
        const { w } = make({ modelValue: 5 });
        const input = w.find('input');
        await input.trigger('focus');
        await nextTick();
        const select = vi.spyOn(input.element, 'select');
        await w.setProps({ modelValue: 8 });
        await nextTick();
        expect(input.element.value).toBe('8');
        expect(select).not.toHaveBeenCalled();
        await input.trigger('keydown', { key: 'ArrowUp' });
        await nextTick();
        expect(select).toHaveBeenCalled();
    });

    it('a held button: a value from outside is where the run goes on from, and the release commits what the model holds', async () => {
        vi.useFakeTimers();
        const { w, commits } = make({ modelValue: 0 });
        await w.find('.tao-drag-number__btn--inc').trigger('pointerdown', { pointerId: 1, button: 0 });
        await w.setProps({ modelValue: 50 });
        await vi.advanceTimersByTimeAsync(400);
        expect(w.props('modelValue')).toBe(51);
        await w.find('.tao-drag-number__btn--inc').trigger('pointerup', { pointerId: 1, button: 0 });
        expect(commits).toEqual([51]);
    });

    it('a press that has not moved yet (under the threshold): the value from outside is where the drag starts', async () => {
        const { w, commits } = make({ modelValue: 5, step: 1 });
        await press(w, 100);
        await w.setProps({ modelValue: 40 });
        await nextTick();
        await move(w, 110);
        await move(w, 120);
        await release(w, 120);
        expect(w.props('modelValue')).toBeGreaterThan(40);
        expect(commits.length).toBe(1);
    });
});
