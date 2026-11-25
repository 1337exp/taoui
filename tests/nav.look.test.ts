import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoNav from '../src/components/TaoNav.vue';
import { navCompact, navLook } from '../src/nav';

// The look of TaoNav as a value: `v-model:layout` is what the app asks, `v-model:look` is what TaoNav has.
// Вид TaoNav как значение: `v-model:layout` — что просит приложение, `v-model:look` — что есть у TaoNav.

const items = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];

afterEach(() => vi.unstubAllGlobals());

describe('navLook / navCompact', () => {
    it('the thresholds of auto: 600 and 840', () => {
        expect([0, 599, 600, 839, 840, 2000].map(navLook)).toEqual(['bar', 'bar', 'rail', 'rail', 'drawer', 'drawer']);
    });
    it('the bar and the rail are compact, the drawer is not', () => {
        expect([navCompact('bar'), navCompact('rail'), navCompact('drawer'), navCompact(undefined)]).toEqual([true, true, false, false]);
    });
});

describe('TaoNav look', () => {
    it('an explicit layout is the look at once', () => {
        const w = mount(TaoNav, { props: { items, layout: 'rail' } });
        expect(w.emitted('update:look')?.at(-1)).toEqual(['rail']);
        expect(w.classes()).toContain('tao-nav--rail');
    });

    it('layout is a model: the parent may change it', async () => {
        const w = mount(TaoNav, { props: { items, layout: 'drawer' } });
        await w.setProps({ layout: 'rail' });
        expect(w.classes()).toContain('tao-nav--rail');
        expect(w.emitted('update:look')?.at(-1)).toEqual(['rail']);
    });

    it('auto follows the measured width, and again when it changes', async () => {
        let callback: ResizeObserverCallback = () => {};
        vi.stubGlobal('ResizeObserver', class { constructor(cb: ResizeObserverCallback) { callback = cb; } observe() {} disconnect() {} unobserve() {} });
        const m = mount(TaoNav, { props: { items }, attachTo: document.body });
        callback([{ contentRect: { width: 500 } } as ResizeObserverEntry], {} as ResizeObserver);
        await nextTick();
        expect(m.emitted('update:look')?.at(-1)).toEqual(['bar']);
        callback([{ contentRect: { width: 900 } } as ResizeObserverEntry], {} as ResizeObserver);
        await nextTick();
        expect(m.emitted('update:look')?.at(-1)).toEqual(['drawer']);
        m.unmount();
    });

    it('without a measure (no layout in the test, no observer) an auto nav says nothing wrong', () => {
        const w = mount(TaoNav, { props: { items } });
        const last = w.emitted('update:look')?.at(-1)?.[0];
        expect([undefined, 'bar']).toContain(last);
    });
});
