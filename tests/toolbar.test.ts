import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';
import TaoButton from '../src/components/TaoButton.vue';
import TaoToolbar from '../src/components/TaoToolbar.vue';
import TaoToolbarGroup from '../src/components/TaoToolbarGroup.vue';
import TaoToolbarSeparator from '../src/components/TaoToolbarSeparator.vue';

// 5.2: a toolbar is one Tab stop, the arrows walk it; toggle buttons say aria-pressed.
// 5.2: панель инструментов — одна остановка Tab, по ней ходят стрелки; кнопки-переключатели говорят aria-pressed.

describe('TaoButton pressed', () => {
    it('without pressed it is an ordinary button: no aria-pressed, no update event', async () => {
        const w = mount(TaoButton, { slots: { default: 'Save' } });
        expect(w.attributes('aria-pressed')).toBeUndefined();
        await w.trigger('click');
        expect(w.emitted('update:pressed')).toBeUndefined();
    });

    it('with pressed it says its state, shows it, and asks for the other one on click', async () => {
        const w = mount(TaoButton, { props: { pressed: false, variant: 'ghost', icon: 'tao-plus' }, attrs: { 'aria-label': 'Bold' } });
        expect(w.attributes('aria-pressed')).toBe('false');
        expect(w.classes()).not.toContain('tao-button--pressed');
        await w.trigger('click');
        expect(w.emitted('update:pressed')).toEqual([[true]]);
        await w.setProps({ pressed: true });
        expect(w.attributes('aria-pressed')).toBe('true');
        expect(w.classes()).toContain('tao-button--pressed');
    });

    it('a disabled toggle does not change', async () => {
        const w = mount(TaoButton, { props: { pressed: false, disabled: true } });
        await w.trigger('click');
        expect(w.emitted('update:pressed')).toBeUndefined();
    });
});

function editor() {
    return mount(
        {
            render: () =>
                h(TaoToolbar, { label: 'Formatting' }, () => [
                    h(TaoToolbarGroup, { label: 'Style' }, () => [
                        h('button', { id: 'b' }, 'B'),
                        h('button', { id: 'i' }, 'I'),
                        h('button', { id: 'off', disabled: true }, 'S'),
                    ]),
                    h(TaoToolbarSeparator),
                    h('div', [
                        h('input', { type: 'radio', name: 'align', id: 'left', value: 'l' }),
                        h('input', { type: 'radio', name: 'align', id: 'center', value: 'c', checked: true }),
                        h('input', { type: 'radio', name: 'align', id: 'right', value: 'r' }),
                    ]),
                    h('input', { type: 'text', id: 'find' }),
                    h('button', { id: 'more' }, '…'),
                ]),
        },
        { attachTo: document.body },
    );
}

function el(w: ReturnType<typeof editor>, id: string): HTMLElement {
    return w.find(`#${id}`).element as HTMLElement;
}

async function key(target: HTMLElement, k: string) {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    await nextTick();
}

describe('TaoToolbar', () => {
    it('has the toolbar role, its name and orientation; groups and separators have theirs', () => {
        const w = editor();
        const bar = w.find('[role="toolbar"]');
        expect(bar.attributes('aria-label')).toBe('Formatting');
        expect(bar.attributes('aria-orientation')).toBe('horizontal');
        expect(w.find('[role="group"]').attributes('aria-label')).toBe('Style');
        expect(w.find('[role="separator"]').attributes('aria-orientation')).toBe('vertical');
        w.unmount();
    });

    it('is one Tab stop: only the first item is in the Tab order, a disabled one is skipped', () => {
        const w = editor();
        expect(el(w, 'b').getAttribute('tabindex')).toBe('0');
        for (const id of ['i', 'left', 'center', 'right', 'find', 'more']) {
            expect(el(w, id).getAttribute('tabindex')).toBe('-1');
        }
        w.unmount();
    });

    it('→ and ← walk the items and wrap; Home / End go to the ends', async () => {
        const w = editor();
        el(w, 'b').focus();
        await key(el(w, 'b'), 'ArrowRight');
        expect(document.activeElement).toBe(el(w, 'i'));
        expect(el(w, 'i').getAttribute('tabindex')).toBe('0');
        expect(el(w, 'b').getAttribute('tabindex')).toBe('-1');
        // the disabled S is skipped: the radio group comes next, on its checked option
        // выключенную S пропускаем: дальше группа радио, на выбранном варианте
        await key(el(w, 'i'), 'ArrowRight');
        expect(document.activeElement).toBe(el(w, 'center'));
        await key(el(w, 'center'), 'End');
        expect(document.activeElement).toBe(el(w, 'more'));
        await key(el(w, 'more'), 'ArrowRight');
        expect(document.activeElement).toBe(el(w, 'b'));
        await key(el(w, 'b'), 'ArrowLeft');
        expect(document.activeElement).toBe(el(w, 'more'));
        await key(el(w, 'more'), 'Home');
        expect(document.activeElement).toBe(el(w, 'b'));
        w.unmount();
    });

    it('inside a radio group the arrows are the group’s own; past its edge they move on', async () => {
        const w = editor();
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
        el(w, 'center').dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
        el(w, 'right').focus();
        await key(el(w, 'right'), 'ArrowRight');
        expect(document.activeElement).toBe(el(w, 'find'));
        el(w, 'left').focus();
        await key(el(w, 'left'), 'ArrowLeft');
        expect(document.activeElement).toBe(el(w, 'i'));
        w.unmount();
    });

    it('a text field keeps its arrows for the caret', async () => {
        const w = editor();
        el(w, 'find').focus();
        await key(el(w, 'find'), 'ArrowRight');
        expect(document.activeElement).toBe(el(w, 'find'));
        w.unmount();
    });

    it('the item the focus came to by pointer keeps the Tab order', async () => {
        const w = editor();
        el(w, 'more').focus();
        await nextTick();
        expect(el(w, 'more').getAttribute('tabindex')).toBe('0');
        expect(el(w, 'b').getAttribute('tabindex')).toBe('-1');
        w.unmount();
    });

    it('vertical: ↓ ↑ walk it, and the separator lies across', async () => {
        const w = mount(
            {
                render: () =>
                    h(TaoToolbar, { orientation: 'vertical', variant: 'plain' }, () => [
                        h('button', { id: 'a' }, 'A'),
                        h(TaoToolbarSeparator),
                        h('button', { id: 'z' }, 'Z'),
                    ]),
            },
            { attachTo: document.body },
        );
        expect(w.find('[role="separator"]').attributes('aria-orientation')).toBe('horizontal');
        expect(w.find('[role="toolbar"]').classes()).toContain('tao-toolbar--plain');
        el(w as never, 'a').focus();
        await key(el(w as never, 'a'), 'ArrowDown');
        expect(document.activeElement).toBe(el(w as never, 'z'));
        w.unmount();
    });
});
