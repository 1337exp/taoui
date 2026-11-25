import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoSplit from '../src/components/TaoSplit.vue';

// v6: the drag of the split handle runs on the shared pointer gesture (usePointerDrag); this holds what the user sees of it
// v6: протяжка ручки сплита идёт на общем жесте указателя (usePointerDrag); тест держит то, что видит пользователь

beforeEach(() => {
    // no layout in happy-dom: the split is 500px wide, its handle 8px
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = this.classList.contains('tao-split__handle') ? 8 : 500;
        return { x: 0, y: 0, left: 0, top: 0, right: width, bottom: 20, width, height: 20, toJSON: () => ({}) } as DOMRect;
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    document.body.style.cursor = '';
});

function make(props: Record<string, unknown> = {}) {
    const updates: number[] = [];
    const changes: number[] = [];
    const w = mount(TaoSplit, {
        attachTo: document.body,
        props: {
            modelValue: 200,
            unit: 'px',
            ...props,
            'onUpdate:modelValue': (value: number) => {
                updates.push(value);
                void w.setProps({ modelValue: value });
            },
            onCommit: (value: number) => changes.push(value),
        },
        slots: { start: 'A', end: 'B' },
    });
    const handle = () => w.find('.tao-split__handle');
    const down = (x: number) => handle().trigger('pointerdown', { pointerId: 1, clientX: x, button: 0 });
    const move = (x: number) => handle().trigger('pointermove', { pointerId: 1, clientX: x });
    const up = () => handle().trigger('pointerup', { pointerId: 1 });
    return { w, updates, changes, handle, down, move, up };
}

describe('the drag of the split handle', () => {
    it('moves with the pointer, and the end of the drag is one change', async () => {
        const { updates, changes, down, move, up, w } = make();
        await down(100);
        expect(w.classes()).toContain('tao-split--dragging');
        await move(130);
        await move(150);
        expect(updates.at(-1)).toBe(250);
        expect(changes).toEqual([]);
        await up();
        expect(changes).toEqual([250]);
        expect(w.classes()).not.toContain('tao-split--dragging');
    });

    it('the page gets the resize cursor while it is dragged and gives it back', async () => {
        const { down, up } = make();
        await down(100);
        expect(document.body.style.cursor).toBe('ew-resize');
        await up();
        expect(document.body.style.cursor).toBe('');
    });

    it('the window losing the focus mid-drag lets go of the handle: one change, the cursor back, no stuck drag', async () => {
        const { changes, down, move, up, w } = make();
        await down(100);
        await move(150);
        window.dispatchEvent(new Event('blur'));
        await nextTick();
        expect(changes).toEqual([250]);
        expect(document.body.style.cursor).toBe('');
        expect(w.classes()).not.toContain('tao-split--dragging');
        // the pointerup that never came, and a move after it, change nothing
        await move(300);
        await up();
        expect(changes).toEqual([250]);
    });

    it('a fixed split cannot be dragged', async () => {
        const { updates, down, move, w } = make({ resizable: false });
        await down(100);
        await move(160);
        expect(updates).toEqual([]);
        expect(w.classes()).not.toContain('tao-split--dragging');
    });

    it('a second pointer is ignored while one holds the handle', async () => {
        const { updates, down, handle } = make();
        await down(100);
        await handle().trigger('pointermove', { pointerId: 2, clientX: 400 });
        expect(updates).toEqual([]);
    });

    it('going away mid-drag gives the cursor back', async () => {
        const { down, w } = make();
        await down(100);
        expect(document.body.style.cursor).toBe('ew-resize');
        w.unmount();
        expect(document.body.style.cursor).toBe('');
    });
});

describe('anchor="end": the model is the size of the END pane', () => {
    it('lays the box out by the end pane: 492px available, an end pane of 100px leaves 392px for the start', async () => {
        const { w } = make({ modelValue: 100, anchor: 'end' });
        await nextTick();
        expect((w.find('.tao-split').element as HTMLElement).style.getPropertyValue('--tao-split-start')).toBe('392px');
        w.unmount();
    });

    it('dragging the handle toward the end makes the end pane smaller (the model follows it, not the start pane)', async () => {
        const { updates, changes, down, move, up } = make({ modelValue: 100, anchor: 'end' });
        await down(392);
        await move(422);
        expect(updates.at(-1)).toBe(70);
        await up();
        expect(changes).toEqual([70]);
    });

    it('min and max bound the END pane, minEnd the start pane', async () => {
        const { updates, down, move } = make({ modelValue: 100, anchor: 'end', min: 80, max: 150, minEnd: 300 });
        await down(392);
        await move(600);
        expect(updates.at(-1)).toBe(80);
        await move(0);
        // the start pane may shrink to 300px: the end pane is 192px at the most, and `max` stops it at 150
        expect(updates.at(-1)).toBe(150);
    });

    it('ArrowRight moves the handle toward the end, so the end pane shrinks by a step; ArrowLeft grows it', async () => {
        const { w, updates, handle } = make({ modelValue: 100, anchor: 'end', step: 10 });
        await handle().trigger('keydown', { key: 'ArrowRight' });
        expect(updates.at(-1)).toBe(90);
        await handle().trigger('keydown', { key: 'ArrowLeft' });
        await handle().trigger('keydown', { key: 'ArrowLeft' });
        expect(updates.at(-1)).toBe(110);
        w.unmount();
    });
});
