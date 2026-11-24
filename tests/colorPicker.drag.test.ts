import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoColorPicker from '../src/components/TaoColorPicker.vue';

// v6: the drag over the colour square runs on the shared pointer gesture; a lost pointerup (Alt-Tab, a screenshot) no longer leaves it pressed
// v6: протяжка по цветовому квадрату идёт на общем жесте; потерянный pointerup (Alt-Tab, скриншот) больше не оставляет его нажатым

beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
        return { x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, toJSON: () => ({}) } as DOMRect;
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

function make(props: Record<string, unknown> = {}) {
    const updates: string[] = [];
    const changes: string[] = [];
    const w = mount(TaoColorPicker, {
        attachTo: document.body,
        props: {
            modelValue: '#ff0000',
            ...props,
            'onUpdate:modelValue': (v: string) => {
                updates.push(v);
                void w.setProps({ modelValue: v });
            },
            onChange: (v: string) => changes.push(v),
        },
    });
    const area = () => w.find('.tao-color-picker__area');
    return {
        w,
        updates,
        changes,
        down: (x: number, y: number) => area().trigger('pointerdown', { pointerId: 1, clientX: x, clientY: y, button: 0 }),
        move: (x: number, y: number) => area().trigger('pointermove', { pointerId: 1, clientX: x, clientY: y }),
        up: () => area().trigger('pointerup', { pointerId: 1 }),
    };
}

describe('the drag over the colour square', () => {
    it('follows the pointer, and the release is one change', async () => {
        const { updates, changes, down, move, up } = make();
        await down(50, 50);
        const afterDown = updates.length;
        expect(afterDown).toBeGreaterThan(0);
        await move(80, 20);
        expect(updates.length).toBeGreaterThan(afterDown);
        expect(changes).toEqual([]);
        await up();
        expect(changes).toHaveLength(1);
        expect(changes[0]).toBe(updates.at(-1));
    });

    it('the window losing the focus mid-drag ends it: one change, and the square is not stuck pressed', async () => {
        const { updates, changes, down, move, up } = make();
        await down(50, 50);
        await move(80, 20);
        window.dispatchEvent(new Event('blur'));
        await nextTick();
        expect(changes).toHaveLength(1);
        const seen = updates.length;
        // the pointerup that never came, and a move after it, change nothing
        await move(10, 90);
        await up();
        expect(updates.length).toBe(seen);
        expect(changes).toHaveLength(1);
    });

    it('a disabled picker does not take a press', async () => {
        const { updates, down } = make({ disabled: true });
        await down(50, 50);
        expect(updates).toEqual([]);
    });
});
