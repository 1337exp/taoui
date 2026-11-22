import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TaoTextarea from '../src/components/TaoTextarea.vue';

// The autosize follows the width too: a ResizeObserver on the field re-measures when the width changes, not the height.
// happy-dom has no layout, so only the wiring is checked: attached on mount, disconnected on unmount, height-only entries ignored.
// Автовысота следует и за шириной: ResizeObserver на поле заново мерит при смене ширины, не высоты.
// В happy-dom нет вёрстки, поэтому проверяется только подключение: ставится при монтировании, снимается при размонтировании, записи только с высотой игнорируются.

class FakeResizeObserver {
    static all: FakeResizeObserver[] = [];
    observed: Element[] = [];
    disconnected = false;
    constructor(public callback: (entries: { contentRect: { width: number } }[]) => void) {
        FakeResizeObserver.all.push(this);
    }
    observe(el: Element) {
        this.observed.push(el);
    }
    disconnect() {
        this.disconnected = true;
    }
}

beforeEach(() => {
    FakeResizeObserver.all = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('TaoTextarea autosize and width', () => {
    it('observes the textarea and disconnects on unmount', () => {
        const w = mount(TaoTextarea, { attachTo: document.body });
        expect(FakeResizeObserver.all).toHaveLength(1);
        expect(FakeResizeObserver.all[0].observed).toEqual([w.find('textarea').element]);
        w.unmount();
        expect(FakeResizeObserver.all[0].disconnected).toBe(true);
    });

    it('re-measures on a new width only', async () => {
        vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
            cb();
            return 1;
        });
        const w = mount(TaoTextarea, { attachTo: document.body });
        const el = w.find('textarea').element;
        const observer = FakeResizeObserver.all[0];
        let writes = 0;
        let height = '';
        Object.defineProperty(el.style, 'height', {
            configurable: true,
            get: () => height,
            set: (v: string) => {
                height = v;
                writes++;
            },
        });

        observer.callback([{ contentRect: { width: 200 } }]);
        const afterFirst = writes;
        expect(afterFirst).toBeGreaterThan(0);

        // same width (only our own height write changed the box): nothing
        observer.callback([{ contentRect: { width: 200 } }]);
        expect(writes).toBe(afterFirst);

        observer.callback([{ contentRect: { width: 120 } }]);
        expect(writes).toBeGreaterThan(afterFirst);
        w.unmount();
    });

    it('works without ResizeObserver', () => {
        vi.stubGlobal('ResizeObserver', undefined);
        const w = mount(TaoTextarea);
        expect(w.find('textarea').exists()).toBe(true);
        w.unmount();
    });
});
