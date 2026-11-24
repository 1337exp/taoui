import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoDragNumber from '../src/components/TaoDragNumber.vue';

// 5.53.0: TaoDragNumber, a number you step with ±, type, or drag sideways.
// 5.53.0: TaoDragNumber, число, которое меняют ±, вводом или протяжкой вбок.

afterEach(() => {
    document.body.innerHTML = '';
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

const pointer = (x: number, extra: Record<string, unknown> = {}) => ({ clientX: x, pointerId: 1, button: 0, ...extra });

async function press(w: ReturnType<typeof make>['w'], x: number) {
    await w.find('.tao-drag-number__field').trigger('pointerdown', pointer(x));
}
async function move(w: ReturnType<typeof make>['w'], x: number, extra: Record<string, unknown> = {}) {
    await w.find('.tao-drag-number__field').trigger('pointermove', pointer(x, extra));
}
async function release(w: ReturnType<typeof make>['w'], x: number) {
    await w.find('.tao-drag-number__field').trigger('pointerup', pointer(x));
}

describe('what it shows', () => {
    it('the caption, the number and the unit; the caption names the spinbutton', () => {
        const { w } = make({ label: 'Width', unit: 'm', min: 0, max: 10 });
        expect(w.find('.tao-drag-number__label').text()).toBe('Width');
        expect(w.find('.tao-drag-number__unit').text()).toBe('m');
        const input = w.find('input');
        expect(input.element.value).toBe('5');
        expect(input.attributes('role')).toBe('spinbutton');
        expect(input.attributes('aria-valuenow')).toBe('5');
        expect(input.attributes('aria-valuemin')).toBe('0');
        expect(input.attributes('aria-valuemax')).toBe('10');
        expect(input.attributes('aria-valuetext')).toBe('5 m');
        expect(input.attributes('aria-labelledby')).toBe(w.find('.tao-drag-number__label').attributes('id'));
    });

    it('a given aria-label wins over the caption', () => {
        const { w } = make({ label: 'Width', 'aria-label': 'Box width' });
        expect(w.find('input').attributes('aria-label')).toBe('Box width');
        expect(w.find('input').attributes('aria-labelledby')).toBeUndefined();
    });

    it('trims trailing zeros, and `format` styles the number at rest', async () => {
        const { w } = make({ modelValue: 0.5, step: 0.25 });
        expect(w.find('input').element.value).toBe('0.5');
        await w.setProps({ format: (v: number) => v.toFixed(2) });
        expect(w.find('input').element.value).toBe('0.50');
    });

    it('without controls there are no buttons; without a caption the number is centred', () => {
        const { w } = make({ controls: false });
        expect(w.findAll('button')).toHaveLength(0);
        expect(w.classes()).toContain('tao-drag-number--bare');
    });

    it('the class and the style go to the wrapper', () => {
        const { w } = make({ class: 'mine' });
        expect(w.classes()).toContain('mine');
    });
});

describe('±, the keys', () => {
    it('the buttons step by `step` and commit once each; the minus stops at min', async () => {
        const { w, updates, commits } = make({ step: 0.5, min: 4.5 });
        await w.find('.tao-drag-number__btn--inc').trigger('click');
        expect(updates).toEqual([5.5]);
        expect(commits).toEqual([5.5]);
        await w.find('.tao-drag-number__btn--dec').trigger('click');
        await w.find('.tao-drag-number__btn--dec').trigger('click');
        expect(w.find('.tao-drag-number__btn--dec').attributes('disabled')).toBeDefined();
        expect(updates.at(-1)).toBe(4.5);
    });

    it('arrows step, PageUp / PageDown ten steps, Home / End go to the bounds', async () => {
        const { w, updates } = make({ min: 0, max: 100 });
        const input = w.find('input');
        await input.trigger('keydown', { key: 'ArrowUp' });
        await input.trigger('keydown', { key: 'PageUp' });
        await input.trigger('keydown', { key: 'ArrowDown' });
        await input.trigger('keydown', { key: 'End' });
        await input.trigger('keydown', { key: 'Home' });
        expect(updates).toEqual([6, 16, 15, 100, 0]);
    });

    it('a disabled field ignores both', async () => {
        const { w, updates } = make({ disabled: true });
        await w.find('input').trigger('keydown', { key: 'ArrowUp' });
        await press(w, 10);
        await move(w, 80);
        expect(updates).toEqual([]);
    });
});

describe('typing', () => {
    it('Enter takes the number, also with the unit after it, and commits', async () => {
        const { w, updates, commits } = make({ unit: 'm', step: 0.5 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('7,5 m');
        await input.trigger('keydown', { key: 'Enter' });
        expect(updates).toEqual([7.5]);
        expect(commits).toEqual([7.5]);
    });

    it('blur takes it too; the same number commits nothing', async () => {
        const { w, updates, commits } = make();
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('9');
        await input.trigger('blur');
        expect(updates).toEqual([9]);
        await input.trigger('focus');
        await input.trigger('blur');
        expect(commits).toEqual([9]);
    });

    it('rounds to the precision and clamps to the bounds', async () => {
        const { w, updates } = make({ min: 0, max: 10, step: 0.1 });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('99');
        await input.trigger('keydown', { key: 'Enter' });
        await input.setValue('2.345');
        await input.trigger('keydown', { key: 'Enter' });
        expect(updates).toEqual([10, 2.3]);
    });

    it('text that is no number is dropped: the value stays, the field shows it again', async () => {
        const { w, updates } = make({ unit: 'm' });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('5 cm');
        await input.trigger('blur');
        await nextTick();
        expect(updates).toEqual([]);
        expect(input.element.value).toBe('5');
    });

    it('Escape gives the typed text up', async () => {
        const { w, updates } = make();
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('8');
        await input.trigger('keydown', { key: 'Escape' });
        expect(updates).toEqual([]);
    });
});

describe('the drag', () => {
    it('moving sideways changes the value, a quarter of a step per pixel, and commits once at the end', async () => {
        const { w, updates, commits } = make({ step: 1 });
        await press(w, 100);
        await move(w, 101); // under the threshold: nothing yet
        expect(updates).toEqual([]);
        await move(w, 110); // crosses the threshold: the value runs from 103, so 7px of this move count
        await move(w, 130); // 27px in all: 5 + 6.75 = 11.75
        await release(w, 130);
        expect(updates.at(-1)).toBe(12);
        expect(commits).toEqual([12]);
        expect(w.classes()).not.toContain('tao-drag-number--dragging');
    });

    it('is tinted while it is dragged', async () => {
        const { w } = make();
        await press(w, 0);
        await move(w, 20);
        expect(w.classes()).toContain('tao-drag-number--dragging');
        await release(w, 20);
        expect(w.classes()).not.toContain('tao-drag-number--dragging');
    });

    it('stops at the bounds', async () => {
        const { w, updates } = make({ min: 0, max: 6 });
        await press(w, 0);
        await move(w, 10);
        await move(w, 400);
        expect(updates.at(-1)).toBe(6);
        await move(w, 404);
        expect(updates.at(-1)).toBe(6);
    });

    it('Shift is slow, Ctrl snaps to the step', async () => {
        const slow = make({ step: 1, dragSpeed: 1 });
        await press(slow.w, 0);
        await move(slow.w, 3, { shiftKey: true }); // exactly the threshold: nothing moves yet
        await move(slow.w, 53, { shiftKey: true }); // 50px × 0.1 = 5
        expect(slow.updates.at(-1)).toBe(10);

        const snap = make({ modelValue: 0, step: 5, dragSpeed: 0.1, precision: 2 });
        await press(snap.w, 0);
        await move(snap.w, 10);
        await move(snap.w, 38, { ctrlKey: true }); // 28px × 0.1 = 2.8 → the grid of 5
        expect(snap.updates.at(-1)).toBe(5);
    });

    it('Escape puts the value back and commits nothing', async () => {
        const { w, updates, commits } = make();
        await press(w, 0);
        await move(w, 10);
        await move(w, 90);
        expect(updates.at(-1)).not.toBe(5);
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
        await nextTick();
        expect(updates.at(-1)).toBe(5);
        await release(w, 90);
        expect(commits).toEqual([]);
    });

    it('the window losing the focus mid-drag ends it: the value stays, one commit, no stuck press', async () => {
        const { w, updates, commits } = make();
        await press(w, 0);
        await move(w, 10);
        await move(w, 50);
        const shown = updates.at(-1);
        window.dispatchEvent(new Event('blur'));
        await nextTick();
        expect(w.classes()).not.toContain('tao-drag-number--dragging');
        expect(commits).toEqual([shown]);
        // the pointerup that never came, and a move after it, change nothing
        await move(w, 200);
        await release(w, 200);
        expect(updates.at(-1)).toBe(shown);
        expect(commits).toEqual([shown]);
    });

    it('so does the page being hidden, and the capture taken away', async () => {
        const hidden = make();
        await press(hidden.w, 0);
        await move(hidden.w, 40);
        window.dispatchEvent(new Event('pagehide'));
        await nextTick();
        expect(hidden.w.classes()).not.toContain('tao-drag-number--dragging');
        expect(hidden.commits).toHaveLength(1);

        const lost = make();
        await press(lost.w, 0);
        await move(lost.w, 40);
        await lost.w.find('.tao-drag-number__field').trigger('lostpointercapture');
        expect(lost.w.classes()).not.toContain('tao-drag-number--dragging');
        expect(lost.commits).toHaveLength(1);
    });

    it('a press lost before it moved is not a click: nothing is focused', async () => {
        const { w, commits } = make();
        await press(w, 50);
        window.dispatchEvent(new Event('blur'));
        await release(w, 50);
        expect(document.activeElement).not.toBe(w.find('input').element);
        expect(commits).toEqual([]);
    });

    it('Escape after the drag is over is not swallowed, and an unmounted field leaves no listener', async () => {
        const { w } = make();
        await press(w, 0);
        await move(w, 40);
        w.unmount();
        const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
        window.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
    });

    it('a press without a move is a click: the field gets the focus to type in', async () => {
        const { w, updates, commits } = make();
        await press(w, 50);
        await release(w, 51);
        expect(document.activeElement).toBe(w.find('input').element);
        expect(w.classes()).toContain('tao-drag-number--focused');
        expect(updates).toEqual([]);
        expect(commits).toEqual([]);
    });

    it('a press on the number of a field that is being typed in is left to the caret', async () => {
        const { w } = make();
        const input = w.find('input');
        await input.trigger('focus');
        await input.trigger('pointerdown', pointer(10));
        await move(w, 60);
        expect(w.classes()).not.toContain('tao-drag-number--dragging');
    });
});
