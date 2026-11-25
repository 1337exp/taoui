import { mount } from '@vue/test-utils';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import TaoHosts from '../src/components/TaoHosts.vue';
import TaoProp from '../src/components/TaoProp.vue';
import { toast } from '../src/toast';
import TaoSelect from '../src/components/TaoSelect.vue';
import TaoSlider from '../src/components/TaoSlider.vue';

// Findings of the second Grok review (the new v6 work), each pinned by a test that failed before the fix.
// Находки второго ревью Grok (новая работа v6): каждая закреплена тестом, который падал до исправления.

afterEach(() => {
    document.body.innerHTML = '';
});

const items = [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Bravo' }];

describe('a form reset', () => {
    it('does not leave the hidden value behind the model: the next submit sends what the control shows', async () => {
        const Form = defineComponent({
            render: () => h('form', [h(TaoSelect, { items, modelValue: 'b', name: 'letter' })]),
        });
        const w = mount(Form, { attachTo: document.body });
        const form = w.find('form').element as HTMLFormElement;
        await new Promise((r) => setTimeout(r));
        expect(new FormData(form).get('letter')).toBe('b');
        // the platform resets the input to its default (empty) value and tells nobody
        // a real reset: the event first, then the platform puts the defaults back (happy-dom does not do the second half, so it is done here)
        const hidden = form.querySelector('input[name="letter"]') as HTMLInputElement;
        form.addEventListener('reset', () => (hidden.value = ''));
        form.reset();
        expect(hidden.value).toBe('');
        await new Promise((r) => setTimeout(r, 30));
        expect(new FormData(form).get('letter')).toBe('b');
        w.unmount();
    });
});

describe('TaoProp: the caption of a control that is not labelable', () => {
    it('focuses the thumb of a named slider, not its hidden value input', async () => {
        const w = mount(TaoProp, {
            props: { label: 'Volume' },
            slots: { default: () => h(TaoSlider, { modelValue: 5, name: 'volume' }) },
            attachTo: document.body,
        });
        await w.find('.tao-prop__label').trigger('click');
        const active = document.activeElement as HTMLElement | null;
        expect(active?.getAttribute('role')).toBe('slider');
        expect(active?.classList.contains('tao-sr-only')).toBe(false);
        w.unmount();
    });
});

describe('a toast follows the status-message and timing rules', () => {
    const live = async (type: 'danger' | 'info') => {
        const w = mount(TaoHosts, { attachTo: document.body });
        toast({ type, message: 'Hello', timeout: 100 });
        await new Promise((r) => setTimeout(r));
        return { w, el: document.querySelector('.tao-toast') as HTMLElement };
    };

    it('an alert keeps the implicit assertive politeness (no aria-live polite over it), the others are a status', async () => {
        const a = await live('danger');
        expect(a.el.getAttribute('role')).toBe('alert');
        expect(a.el.hasAttribute('aria-live')).toBe(false);
        a.w.unmount();
        toast.dismiss();
        const s = await live('info');
        expect(s.el.getAttribute('role')).toBe('status');
        expect(s.el.hasAttribute('aria-live')).toBe(false);
        s.w.unmount();
        toast.dismiss();
    });

    it('the time stops while the focus is inside the toast and runs again when it leaves', async () => {
        const { w, el } = await live('info');
        el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 250));
        expect(document.querySelectorAll('.tao-toast')).toHaveLength(1);
        el.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
        await new Promise((r) => setTimeout(r, 250));
        expect(document.querySelectorAll('.tao-toast')).toHaveLength(0);
        w.unmount();
    });
});

describe('the kit has no !important', () => {
    // an author `!important` in a layer beats an author `!important` outside of it, and the app could not win
    function files(dir: string): string[] {
        return readdirSync(dir).flatMap((entry) => {
            const full = join(dir, entry);
            return statSync(full).isDirectory() ? files(full) : /\.(css|vue)$/.test(entry) ? [full] : [];
        });
    }
    it('not in any stylesheet or component style of src', () => {
        const bad = files(resolve(__dirname, '../src')).filter((f) => /!important/.test(readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')));
        expect(bad).toEqual([]);
    });
});

describe('autocomplete reaches the input', () => {
    it.each([
        ['TaoQuantity', () => import('../src/components/TaoQuantity.vue'), { modelValue: 1 }],
        ['TaoInputNumber', () => import('../src/components/TaoInputNumber.vue'), { modelValue: 1 }],
        ['TaoCombobox', () => import('../src/components/TaoCombobox.vue'), { items: [] }],
    ])('%s: the autocomplete you give wins over the default off', async (_n, load, props) => {
        const Component = (await load()).default;
        expect(mount(Component as never, { props: props as never }).find('input').attributes('autocomplete')).toBe('off');
        expect(mount(Component as never, { props: props as never, attrs: { autocomplete: 'postal-code' } }).find('input').attributes('autocomplete')).toBe('postal-code');
    });
});

describe('a toast that is shown once', () => {
    it('can be closed by the handle, also by the handle of the repeat that was not shown', async () => {
        const w = mount(TaoHosts, { attachTo: document.body });
        const first = toast({ message: 'Saved', once: true, timeout: 0 });
        const again = toast({ message: 'Saved', once: true, timeout: 0 });
        await new Promise((r) => setTimeout(r));
        expect(document.querySelectorAll('.tao-toast')).toHaveLength(1);
        again.dismiss();
        await new Promise((r) => setTimeout(r, 50));
        expect(document.querySelectorAll('.tao-toast')).toHaveLength(0);
        expect(first.id).toBe(again.id);
        w.unmount();
    });
});

describe('usePopup: a panel that is open on the first render', () => {
    it('takes the size of its anchor once the anchor is mounted', async () => {
        const { usePopup } = await import('../src/primitives/usePopup');
        const { ref: vueRef } = await import('vue');
        let size = '';
        const C = defineComponent({
            setup() {
                const anchor = vueRef<HTMLElement | null>(null);
                const popup = usePopup({ open: vueRef(true), anchor, panel: vueRef(null), onDismiss: () => {}, onEscape: () => {}, scale: () => undefined });
                size = '';
                return () => {
                    size = popup.panelSize.value;
                    return h('div', [h('button', { ref: anchor, style: '--tao-size: large' })]);
                };
            },
        });
        const w = mount(C, { attachTo: document.body });
        await new Promise((r) => setTimeout(r));
        expect(size).toBe('large');
        w.unmount();
    });
});

describe('review 3: TaoSelect', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ id: `o${i}`, label: `Option ${i}` }));
    const keyOn = (el: Element, key: string, init: KeyboardEventInit = {}) => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
        return new Promise((r) => setTimeout(r));
    };
    const openIt = async (props: Record<string, unknown>) => {
        const w = mount(TaoSelect, { props: props as never, attachTo: document.body });
        const trigger = w.find('[role="combobox"]');
        await trigger.trigger('click');
        return { w, trigger };
    };

    it('a press inside the list is not a leave: the panel keeps the focus on the trigger, and a blur into it does not close', async () => {
        const { w, trigger } = await openIt({ items, modelValue: 'a' });
        const panel = document.querySelector('.tao-select__panel')!;
        const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        panel.dispatchEvent(down);
        expect(down.defaultPrevented).toBe(true);
        await trigger.trigger('blur', { relatedTarget: panel });
        expect(document.querySelector('[role="listbox"]')).not.toBeNull();
        await trigger.trigger('blur');
        expect(document.querySelector('[role="listbox"]')).toBeNull();
        w.unmount();
    });

    it('a select that becomes read-only while open closes, and its options no longer commit', async () => {
        const { w } = await openIt({ items, modelValue: 'a' });
        await w.setProps({ readOnly: true });
        expect(document.querySelector('[role="listbox"]')).toBeNull();
        expect(w.emitted('update:modelValue')).toBeUndefined();
        w.unmount();
    });

    it('the active option stays one of the items when they shrink while the list is open', async () => {
        const { w, trigger } = await openIt({ items: many, modelValue: 'o20' });
        expect(trigger.attributes('aria-activedescendant')).toMatch(/opt-20$/);
        await w.setProps({ items: many.slice(0, 5) });
        const id = trigger.attributes('aria-activedescendant');
        expect(id === undefined || document.getElementById(id) !== null).toBe(true);
        w.unmount();
    });

    it('PageDown / PageUp jump ten options, Alt+ArrowUp picks the active one and closes', async () => {
        const { w, trigger } = await openIt({ items: many, modelValue: 'o0' });
        await keyOn(trigger.element, 'PageDown');
        expect(trigger.attributes('aria-activedescendant')).toMatch(/opt-10$/);
        await keyOn(trigger.element, 'PageUp');
        expect(trigger.attributes('aria-activedescendant')).toMatch(/opt-0$/);
        await keyOn(trigger.element, 'PageDown');
        await keyOn(trigger.element, 'ArrowUp', { altKey: true });
        expect(w.emitted('update:modelValue')).toEqual([['o10']]);
        expect(document.querySelector('[role="listbox"]')).toBeNull();
        w.unmount();
    });
});
