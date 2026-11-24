import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { usePointerDrag, type PointerDragEnd, type UsePointerDragOptions } from '../../src/primitives/usePointerDrag';

// v6: the one pointer gesture (press, move, release) that the slider, the split, the colour square and the rest share
// v6: один жест указателя (нажать, вести, отпустить), который делят слайдер, сплит, цветовой квадрат и остальные

afterEach(() => {
    document.body.innerHTML = '';
});

function make(extra: Partial<UsePointerDragOptions> = {}) {
    const log: string[] = [];
    const ends: PointerDragEnd[] = [];
    let api!: ReturnType<typeof usePointerDrag>;
    const Comp = defineComponent({
        setup() {
            api = usePointerDrag({
                target: () => document.getElementById('t'),
                onStart: () => {
                    log.push('start');
                },
                onMove: (e) => log.push(`move ${e.clientX}`),
                onEnd: (reason) => {
                    ends.push(reason);
                    log.push(`end ${reason}`);
                },
                ...extra,
            });
            // in a template this is `v-on="drag.events"`; a render function wants the `on…` names
            const on = {
                onPointerdown: api.events.pointerdown,
                onPointermove: api.events.pointermove,
                onPointerup: api.events.pointerup,
                onPointercancel: api.events.pointercancel,
                onLostpointercapture: api.events.lostpointercapture,
            };
            return () => h('div', { id: 't', ...on });
        },
    });
    const w = mount(Comp, { attachTo: document.body });
    const el = () => w.find('#t');
    const down = (x = 0, pointerId = 1, button = 0) => el().trigger('pointerdown', { pointerId, clientX: x, button });
    const move = (x: number, pointerId = 1) => el().trigger('pointermove', { pointerId, clientX: x });
    const up = (pointerId = 1) => el().trigger('pointerup', { pointerId });
    return { w, log, ends, api: () => api, down, move, up, el };
}

describe('usePointerDrag', () => {
    it('press, move, release: start, the moves, one end', async () => {
        const { log, down, move, up, api } = make();
        await down(5);
        expect(api().dragging.value).toBe(true);
        expect(api().pointerId()).toBe(1);
        await move(10);
        await move(20);
        await up();
        expect(log).toEqual(['start', 'move 10', 'move 20', 'end up']);
        expect(api().dragging.value).toBe(false);
        expect(api().pointerId()).toBe(-1);
    });

    it('another pointer is ignored while one holds the gesture', async () => {
        const { log, down, move, up } = make();
        await down(0, 1);
        await down(0, 2); // a second finger
        await move(7, 2);
        await up(2);
        expect(log).toEqual(['start']);
        await up(1);
        expect(log).toEqual(['start', 'end up']);
    });

    it('only the main button starts it, and a move without a press is nothing', async () => {
        const { log, down, move } = make();
        await down(0, 1, 2); // right button
        await move(5);
        expect(log).toEqual([]);
    });

    it('onStart can refuse: nothing is taken, no gesture', async () => {
        const { log, down, move, api } = make({ onStart: () => false });
        await down();
        await move(5);
        expect(api().dragging.value).toBe(false);
        expect(log).toEqual([]);
    });

    it('a browser cancel ends it as cancel; a lost capture as lost', async () => {
        const first = make();
        await first.down();
        await first.el().trigger('pointercancel', { pointerId: 1 });
        expect(first.ends).toEqual(['cancel']);

        const second = make();
        await second.down();
        await second.el().trigger('lostpointercapture');
        expect(second.ends).toEqual(['lost']);
    });

    it('the window losing the focus mid-gesture ends it, once, and the pointerup that never came changes nothing', async () => {
        const { ends, down, move, up, log } = make();
        await down();
        await move(30);
        window.dispatchEvent(new Event('blur'));
        await nextTick();
        expect(ends).toEqual(['lost']);
        await move(60);
        await up();
        expect(log).toEqual(['start', 'move 30', 'end lost']);
    });

    it('the page being hidden ends it too', async () => {
        const { ends, down } = make();
        await down();
        window.dispatchEvent(new Event('pagehide'));
        expect(ends).toEqual(['lost']);
    });

    it('the focus-loss listener is gone once the gesture ends: a later blur ends nothing', async () => {
        const { ends, down, up } = make();
        await down();
        await up();
        window.dispatchEvent(new Event('blur'));
        expect(ends).toEqual(['up']);
    });

    it('end() ends it from outside, with the reason given; with no gesture it does nothing', async () => {
        const { ends, down, api } = make();
        api().end('abort');
        expect(ends).toEqual([]);
        await down();
        api().end('abort');
        api().end('abort');
        expect(ends).toEqual(['abort']);
    });

    it('a new press after the end starts a new gesture', async () => {
        const { log, down, up } = make();
        await down();
        await up();
        await down();
        await up();
        expect(log.filter((entry) => entry === 'start')).toHaveLength(2);
    });

    it('the component going away mid-gesture ends it as unmount and leaves no listener', async () => {
        const { w, ends, down } = make();
        await down();
        w.unmount();
        expect(ends).toEqual(['unmount']);
        window.dispatchEvent(new Event('blur'));
        expect(ends).toEqual(['unmount']);
    });

    it('preventDefault is on the press by default and can be turned off', async () => {
        const on = make();
        const event = new Event('pointerdown', { cancelable: true, bubbles: true }) as Event & { pointerId: number; button: number };
        event.pointerId = 1;
        event.button = 0;
        on.el().element.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);

        const off = make({ preventDefault: false });
        const other = new Event('pointerdown', { cancelable: true, bubbles: true }) as Event & { pointerId: number; button: number };
        other.pointerId = 1;
        other.button = 0;
        off.el().element.dispatchEvent(other);
        expect(other.defaultPrevented).toBe(false);
    });
});
