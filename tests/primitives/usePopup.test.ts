import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { usePopup } from '../../src/primitives/usePopup';

// The plumbing of a pop-up field: hung on its anchor, dismissed by a press outside, closed by Escape (the layer stack), and a panel
// that scales takes the size resolved at the anchor.
// Общая часть поля с окном: висит на якоре, уходит от нажатия снаружи, закрывается Escape (стек слоёв), а масштабируемая панель
// берёт размер, вычисленный у якоря.

afterEach(() => {
    document.body.innerHTML = '';
});

function host(options: { scale?: boolean } = {}) {
    const calls = { dismiss: 0, escape: 0 };
    let api!: ReturnType<typeof usePopup>;
    const open = ref(false);
    const Host = defineComponent({
        setup() {
            const anchor = ref<HTMLElement | null>(null);
            const panel = ref<HTMLElement | null>(null);
            api = usePopup({
                open,
                anchor,
                panel,
                onDismiss: () => {
                    calls.dismiss++;
                    open.value = false;
                },
                onEscape: () => {
                    calls.escape++;
                    open.value = false;
                },
                scale: options.scale ? () => 'large' : undefined,
            });
            return () => h('div', { class: 'tao-size-small' }, [h('button', { ref: anchor, id: 'anchor' }, 'a'), open.value ? h('div', { ref: panel, id: 'panel' }, 'p') : null]);
        },
    });
    const w = mount(Host, { attachTo: document.body });
    return { w, open, calls, api: () => api };
}

describe('usePopup', () => {
    it('a press outside dismisses, a press on the anchor or the panel does not', async () => {
        const { open, calls } = host();
        open.value = true;
        await nextTick();
        document.getElementById('panel')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        document.getElementById('anchor')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(calls.dismiss).toBe(0);
        document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(calls.dismiss).toBe(1);
        expect(open.value).toBe(false);
    });

    it('Escape goes to the layer stack and calls onEscape once', async () => {
        const { open, calls } = host();
        open.value = true;
        await nextTick();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(calls.escape).toBe(1);
        expect(open.value).toBe(false);
    });

    it('nothing listens while it is shut', async () => {
        const { calls } = host();
        document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(calls).toEqual({ dismiss: 0, escape: 0 });
    });

    it('a scaling panel takes the size given, and keeps medium when it does not scale', async () => {
        const scaled = host({ scale: true });
        scaled.open.value = true;
        await nextTick();
        expect(scaled.api().panelSize.value).toBe('large');
        const plain = host();
        plain.open.value = true;
        await nextTick();
        expect(plain.api().panelSize.value).toBe('medium');
    });

    it('update gives the panel a position style', async () => {
        const { open, api } = host();
        open.value = true;
        await nextTick();
        api().update();
        expect(typeof api().style.value).toBe('object');
    });
});
