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
        (form.querySelector('input[name="letter"]') as HTMLInputElement).value = '';
        form.dispatchEvent(new Event('reset'));
        await new Promise((r) => setTimeout(r, 5));
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
