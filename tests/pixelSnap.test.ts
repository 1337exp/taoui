import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import confirmSource from '../src/components/TaoConfirmHost.vue?raw';
// @ts-expect-error Vite `?raw` import
import modalSource from '../src/components/TaoModal.vue?raw';
import { centringNudge } from '../src/pixelSnap';
import { useWholePixelPanel } from '../src/wholePixel';

// 5.27.1: a centred panel must not stand on a half pixel, or a button in it jumps when it is repainted under the pointer.
// 5.27.1: отцентрованная панель не должна стоять на половинке пикселя, иначе кнопка в ней прыгает при перерисовке под указателем.

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

describe('centringNudge', () => {
    it('is 1 when the room left over is odd (the panel would start on a half), else 0', () => {
        expect(centringNudge(846, 143)).toBe(1);
        expect(centringNudge(846, 118)).toBe(0);
        expect(centringNudge(757, 143)).toBe(0);
        expect(centringNudge(100, 100)).toBe(0);
        expect(centringNudge(101, 100)).toBe(1);
    });

    it('works from whole pixels: a fractional size is rounded first, and the order does not matter', () => {
        expect(centringNudge(845.6, 142.8)).toBe(centringNudge(846, 143));
        expect(centringNudge(143, 846)).toBe(1);
    });
});

describe('useWholePixelPanel', () => {
    function host(boxHeight: number, panelHeight: number, open = true) {
        const isOpen = ref(open);
        const Comp = defineComponent({
            setup() {
                const panel = ref<HTMLElement | null>(null);
                useWholePixelPanel(panel, () => isOpen.value);
                return () => h('div', { class: 'box' }, h('div', { ref: panel, class: 'panel' }));
            },
        });
        const wrapper = mount(Comp, { attachTo: document.body });
        const box = wrapper.find('.box').element as HTMLElement;
        const panel = wrapper.find('.panel').element as HTMLElement;
        Object.defineProperty(box, 'clientHeight', { value: boxHeight, configurable: true });
        Object.defineProperty(panel, 'offsetHeight', { value: panelHeight, configurable: true });
        return { wrapper, panel, isOpen };
    }

    it('gives the panel a margin of 1px when the room left over is odd, and none when it is even', async () => {
        const odd = host(846, 143, false);
        odd.isOpen.value = true;
        await nextTick();
        await nextTick();
        expect(odd.panel.style.marginTop).toBe('1px');
        odd.wrapper.unmount();
        const even = host(846, 118, false);
        even.isOpen.value = true;
        await nextTick();
        await nextTick();
        expect(even.panel.style.marginTop).toBe('');
        even.wrapper.unmount();
    });

    it('looks again when the window is resized', async () => {
        const w = host(846, 143, false);
        w.isOpen.value = true;
        await nextTick();
        await nextTick();
        expect(w.panel.style.marginTop).toBe('1px');
        Object.defineProperty(w.panel.parentElement!, 'clientHeight', { value: 845, configurable: true });
        window.dispatchEvent(new Event('resize'));
        expect(w.panel.style.marginTop).toBe('');
        w.wrapper.unmount();
    });
});

describe('the centred panels of the kit keep whole pixels', () => {
    const confirm = confirmSource as string;
    const modal = modalSource as string;

    it('confirm: the line heights are whole pixels at the default sizes (16 x 1.25, 14 x 1.5), and the panel is snapped', () => {
        expect(confirm).toMatch(/font-size: var\(--tao-font-size-lg\);\s*font-weight: 600;[\s\S]*?line-height: 1\.25;/);
        expect(confirm).toMatch(/font-size: var\(--tao-font-size-md\);\s*line-height: 1\.5;/);
        expect(confirm).toContain('useWholePixelPanel(panelRef');
    });

    it('modal: the title is as high as the close button (24px at the default size), and the panel is snapped', () => {
        expect(modal).toMatch(/\.tao-modal__title \{[^}]*line-height: calc\(var\(--tao-font-size-xl\) \* 4 \/ 3\);/);
        expect(modal).toContain('useWholePixelPanel(panelRef');
    });
});
