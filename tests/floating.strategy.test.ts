import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref, Teleport } from 'vue';
import { useFloating } from '../src/floating';

// The panel follows a smooth page scroll without trailing: absolute in document coordinates, fixed only when the
// anchor itself is pinned to the screen.
// Панель не отстаёт от плавной прокрутки: absolute в координатах документа, fixed только у прибитого к экрану якоря.

afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.position = '';
    Object.defineProperty(window, 'scrollX', { value: 0, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
});

async function float(anchorStyle = '', wrapperStyle = '') {
    let result!: ReturnType<typeof useFloating>;
    const Probe = defineComponent({
        setup() {
            const anchor = ref<HTMLElement | null>(null);
            const panel = ref<HTMLElement | null>(null);
            result = useFloating(anchor, panel, () => true, { placement: 'bottom-start', gap: 4 });
            return () =>
                h('div', { style: wrapperStyle }, [
                    h('button', { ref: anchor, style: anchorStyle }),
                    h(Teleport, { to: 'body' }, [h('div', { ref: panel })]),
                ]);
        },
    });
    const w = mount(Probe, { attachTo: document.body });
    const button = w.find('button').element;
    button.getBoundingClientRect = () => ({ left: 100, top: 200, width: 80, height: 30, right: 180, bottom: 230, x: 100, y: 200, toJSON: () => ({}) });
    await nextTick();
    await nextTick();
    result.update();
    return result;
}

describe('useFloating: positioning strategy', () => {
    it('an anchor in the page: absolute, the page scroll added', async () => {
        Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
        Object.defineProperty(window, 'scrollX', { value: 20, configurable: true });
        const { style } = await float();
        expect(style.value).toMatchObject({ position: 'absolute', top: `${200 + 30 + 4 + 500}px`, left: `${100 + 20}px` });
    });

    it('an anchor inside a fixed (or sticky) ancestor, or fixed itself: fixed, viewport coordinates', async () => {
        Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
        expect((await float('', 'position: fixed')).style.value).toMatchObject({ position: 'fixed', top: '234px', left: '100px' });
        document.body.innerHTML = '';
        expect((await float('', 'position: sticky')).style.value.position).toBe('fixed');
        document.body.innerHTML = '';
        expect((await float('position: fixed')).style.value.position).toBe('fixed');
    });

    it('a positioned body: relative to its box, not to the page scroll', async () => {
        document.body.style.position = 'relative';
        Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
        const bodyRect = document.body.getBoundingClientRect;
        document.body.getBoundingClientRect = () => ({ ...bodyRect.call(document.body), left: 0, top: -500 }) as DOMRect;
        const { style } = await float();
        expect(style.value).toMatchObject({ position: 'absolute', top: `${234 + 500}px`, left: '100px' });
    });
});
