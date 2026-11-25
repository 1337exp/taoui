import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoSplit from '../src/components/TaoSplit.vue';

// From the fourth review: a split lays itself out for the box it has TODAY; only the user's drag or key writes the model.
// Из четвёртого ревью: сплит раскладывается под блок, который есть СЕЙЧАС; в модель пишет только жест или клавиша пользователя.

let box = 500;
let gutter = 8;
let observe: (() => void) | null = null;

beforeEach(() => {
    box = 500;
    gutter = 8;
    observe = null;
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(cb: () => void) {
                observe = cb;
            }
            observe() {}
            disconnect() {}
        },
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = this.classList.contains('tao-split__handle') ? gutter : box;
        return { x: 0, y: 0, left: 0, top: 0, right: width, bottom: 20, width, height: 20, toJSON: () => ({}) } as DOMRect;
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
});

function make(props: Record<string, unknown> = {}) {
    const updates: number[] = [];
    const w = mount(TaoSplit, {
        attachTo: document.body,
        props: {
            modelValue: 200,
            unit: 'px',
            anchor: 'end',
            min: 160,
            minEnd: 240,
            ...props,
            'onUpdate:modelValue': (value: number) => {
                updates.push(value);
                void w.setProps({ modelValue: value });
            },
        },
        slots: { start: 'A', end: 'B' },
    });
    const startPx = () => (w.find('.tao-split').element as HTMLElement).style.getPropertyValue('--tao-split-start');
    const resize = async (width: number) => {
        box = width;
        observe?.();
        await nextTick();
    };
    return { w, updates, startPx, resize };
}

describe('the size the user chose is kept while the box is too small', () => {
    it('a box that cannot hold the minimums does not rewrite the model, and the size comes back when the box grows', async () => {
        const { updates, startPx, resize } = make();
        await nextTick();
        expect(startPx()).toBe('292px'); // 492 - 200
        await resize(420); // 412 available, the end pane may be 172 at most: the 200 chosen does not fit today
        expect(updates).toEqual([]);
        await resize(1000);
        expect(updates).toEqual([]);
        expect(startPx()).toBe('792px'); // 992 - 200: the chosen 200 is back
    });

    it('a box of no size at all (a hidden tab) writes nothing', async () => {
        const { updates, resize } = make();
        await resize(0);
        expect(updates).toEqual([]);
    });

    it('a closed pane is not measured and writes nothing', async () => {
        const { updates, resize } = make({ collapsed: 'end' });
        await resize(0);
        await resize(120);
        expect(updates).toEqual([]);
    });
});

describe('opening a collapsed pane measures the box again', () => {
    it('the handle had no width while it was hidden: the first open counts the gutter', async () => {
        gutter = 0;
        const { w, startPx } = make({ collapsed: 'end', modelValue: 200 });
        gutter = 8;
        await w.setProps({ collapsed: false });
        await nextTick();
        expect(startPx()).toBe('292px'); // 500 - 8 - 200, not 300
    });
});

describe('a resize in the middle of a drag moves the pane by the pointer only', () => {
    it('the box grows by 200px between the press and the first move: the pane changes by the move, not by the growth', async () => {
        const { w, updates } = make({ modelValue: 200 });
        const handle = w.find('.tao-split__handle');
        await handle.trigger('pointerdown', { pointerId: 1, clientX: 292, button: 0 });
        box = 700;
        observe?.();
        await handle.trigger('pointermove', { pointerId: 1, clientX: 293 });
        expect(updates.at(-1)).toBe(199);
    });
});

describe('the separator range is a range', () => {
    it('in a box that cannot hold the minimums the min is not above the max, and the value sits inside', async () => {
        const { w, resize } = make();
        await resize(300);
        const sep = w.find('[role=separator]');
        const min = Number(sep.attributes('aria-valuemin'));
        const max = Number(sep.attributes('aria-valuemax'));
        const now = Number(sep.attributes('aria-valuenow'));
        expect(min).toBeLessThanOrEqual(max);
        expect(now).toBeGreaterThanOrEqual(min);
        expect(now).toBeLessThanOrEqual(max);
    });
});
