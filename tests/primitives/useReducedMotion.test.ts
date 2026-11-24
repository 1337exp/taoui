import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { useReducedMotion } from '../../src/primitives/useReducedMotion';

// v6: the «reduce motion» setting, live, for the motion that is done in script
// v6: настройка «уменьшить движение», живая, для движения, которое делается в скрипте

type Listener = () => void;

function fakeMedia(initial: boolean) {
    const listeners = new Set<Listener>();
    const media = {
        matches: initial,
        addEventListener: (_: string, fn: Listener) => listeners.add(fn),
        removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
    };
    vi.stubGlobal('matchMedia', vi.fn(() => media));
    return {
        listeners,
        set(value: boolean) {
            media.matches = value;
            listeners.forEach((fn) => fn());
        },
    };
}

afterEach(() => {
    vi.unstubAllGlobals();
});

function make() {
    let reduced!: ReturnType<typeof useReducedMotion>;
    const w = mount(defineComponent({ setup: () => ((reduced = useReducedMotion()), () => h('div')) }));
    return { w, reduced: () => reduced };
}

describe('useReducedMotion', () => {
    it('reads the setting on mount', () => {
        fakeMedia(true);
        expect(make().reduced().value).toBe(true);
        fakeMedia(false);
        expect(make().reduced().value).toBe(false);
    });

    it('follows a change of the setting after mount', async () => {
        const media = fakeMedia(false);
        const { reduced } = make();
        expect(reduced().value).toBe(false);
        media.set(true);
        await nextTick();
        expect(reduced().value).toBe(true);
        media.set(false);
        expect(reduced().value).toBe(false);
    });

    it('leaves no listener once the component is gone', () => {
        const media = fakeMedia(false);
        const { w } = make();
        expect(media.listeners.size).toBe(1);
        w.unmount();
        expect(media.listeners.size).toBe(0);
    });

    it('a browser without matchMedia is «no preference», not an error', () => {
        vi.stubGlobal('matchMedia', undefined);
        expect(make().reduced().value).toBe(false);
    });
});
