import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoSlider from '../src/components/TaoSlider.vue';

// v6: the drag of the slider runs on the shared pointer gesture (usePointerDrag); this holds what the user sees of it
// v6: протяжка слайдера идёт на общем жесте указателя (usePointerDrag); тест держит то, что видит пользователь

beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const wide = this.classList.contains('tao-slider__rail');
        const width = wide ? 200 : 16;
        return { x: 0, y: 0, left: 0, top: 0, right: width, bottom: 8, width, height: 8, toJSON: () => ({}) } as DOMRect;
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

function make(props: Record<string, unknown> = {}) {
    const updates: number[] = [];
    const changes: number[] = [];
    const w = mount(TaoSlider, {
        attachTo: document.body,
        props: {
            modelValue: 0,
            min: 0,
            max: 100,
            step: 1,
            ...props,
            'onUpdate:modelValue': (value: number) => {
                updates.push(value);
                void w.setProps({ modelValue: value });
            },
            onCommit: (value: number) => changes.push(value),
        },
    });
    const rail = () => w.find('.tao-slider__rail');
    const down = (x: number, id = 1) => rail().trigger('pointerdown', { pointerId: id, clientX: x, button: 0 });
    const move = (x: number, id = 1) => rail().trigger('pointermove', { pointerId: id, clientX: x });
    const up = (id = 1) => rail().trigger('pointerup', { pointerId: id });
    return { w, updates, changes, rail, down, move, up };
}

describe('the drag of the slider', () => {
    it('the thumb follows the pointer, and the end of the drag is one change', async () => {
        const { updates, changes, down, move, up, w } = make();
        await down(50); // 50 of 200px: 25
        expect(updates.at(-1)).toBe(25);
        await move(100);
        expect(updates.at(-1)).toBe(50);
        expect(w.find('.tao-slider__rail').classes()).toContain('tao-slider__rail--dragging');
        expect(changes).toEqual([]);
        await up();
        expect(changes).toEqual([50]);
        expect(w.find('.tao-slider__rail').classes()).not.toContain('tao-slider__rail--dragging');
    });

    it('the window losing the focus mid-drag lets the thumb go: one change, nothing stuck', async () => {
        const { changes, updates, down, move, up, w } = make();
        await down(20);
        await move(100);
        window.dispatchEvent(new Event('blur'));
        await nextTick();
        expect(changes).toEqual([50]);
        expect(w.find('.tao-slider__rail').classes()).not.toContain('tao-slider__rail--dragging');
        const seen = updates.length;
        await move(180);
        await up();
        expect(updates.length).toBe(seen);
        expect(changes).toEqual([50]);
    });

    it('a disabled slider does not take a press', async () => {
        const { updates, down } = make({ disabled: true });
        await down(100);
        expect(updates).toEqual([]);
    });

    it('another pointer is ignored while one holds the thumb', async () => {
        const { updates, down, move } = make();
        await down(50, 1);
        const seen = updates.length;
        await move(190, 2);
        expect(updates.length).toBe(seen);
    });

    it('a press with no move ends as a release: no change when the value did not move off where it was', async () => {
        const { changes, down, up } = make({ modelValue: 25 });
        await down(50); // the thumb is already at 25
        await up();
        expect(changes).toEqual([]);
    });
});
