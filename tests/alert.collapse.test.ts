import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoAlert from '../src/components/TaoAlert.vue';

// A collapsible alert: the title and the tone stay, the body folds; folded text stays in the DOM for find-in-page.
// Сворачиваемый алерт: заголовок и тон остаются, тело сворачивается; свёрнутый текст остаётся в DOM для поиска.

const alert = (props: Record<string, unknown> = {}) =>
    mount(TaoAlert, { props: { title: 'Disk almost full', tone: 'warning', ...props }, slots: { default: () => 'Free up 2 GB to keep the backups.' } });

describe('TaoAlert collapsible', () => {
    it('is off by default: a plain title, the body shown', () => {
        const w = alert();
        expect(w.find('.tao-alert__toggle').exists()).toBe(false);
        expect(w.find('.tao-alert__title').text()).toBe('Disk almost full');
        expect(w.find('.tao-alert__message').attributes('hidden')).toBeUndefined();
    });

    it('turns the title into a disclosure button that controls the body', () => {
        const w = alert({ collapsible: true });
        const toggle = w.find('.tao-alert__toggle');
        expect(toggle.element.tagName).toBe('BUTTON');
        expect(toggle.attributes('aria-expanded')).toBe('true');
        expect(toggle.attributes('aria-controls')).toBe(w.find('.tao-alert__message').attributes('id'));
        expect(toggle.text()).toBe('Disk almost full');
    });

    it('a click folds the body (still in the DOM, hidden until found) and reports it; a second click opens it', async () => {
        const w = alert({ collapsible: true });
        await w.find('.tao-alert__toggle').trigger('click');
        const body = w.find('.tao-alert__message');
        expect(body.attributes('hidden')).toBe('until-found');
        expect(body.text()).toContain('Free up 2 GB');
        expect(w.find('.tao-alert__toggle').attributes('aria-expanded')).toBe('false');
        expect(w.emitted('update:collapsed')).toEqual([[true]]);
        await w.find('.tao-alert__toggle').trigger('click');
        expect(w.find('.tao-alert__message').attributes('hidden')).toBeUndefined();
    });

    it('v-model:collapsed controls it and can start folded', async () => {
        const w = alert({ collapsible: true, collapsed: true });
        expect(w.find('.tao-alert__message').attributes('hidden')).toBe('until-found');
        await w.find('.tao-alert__toggle').trigger('click');
        expect(w.emitted('update:collapsed')).toEqual([[false]]);
        // controlled: stays folded until the parent says otherwise / управляемый: ждёт родителя
        expect(w.find('.tao-alert__message').attributes('hidden')).toBe('until-found');
        await w.setProps({ collapsed: false });
        expect(w.find('.tao-alert__message').attributes('hidden')).toBeUndefined();
    });

    it('find-in-page (beforematch) opens a folded alert', async () => {
        const w = alert({ collapsible: true, collapsed: true });
        await w.find('.tao-alert__message').trigger('beforematch');
        expect(w.emitted('update:collapsed')).toEqual([[false]]);
    });

    it('collapsed without collapsible means nothing', () => {
        expect(alert({ collapsed: true }).find('.tao-alert__message').attributes('hidden')).toBeUndefined();
    });

    it('without a title the toggle says «Details»; the tone and the live role stay', () => {
        const w = alert({ collapsible: true, title: '' });
        expect(w.find('.tao-alert__toggle').text()).toBe('Details');
        expect(w.classes()).toContain('tao-tone-warning');
        expect(w.attributes('role')).toBe('status');
    });

    it('closable still works next to it', async () => {
        const w = alert({ collapsible: true, closable: true });
        await w.find('.tao-alert__close').trigger('click');
        expect(w.emitted('close')).toHaveLength(1);
        expect(w.emitted('update:collapsed')).toBeUndefined();
    });
});

describe('TaoAlert folds with a slide, like TaoSpoiler', () => {
    it('the row closes first; the text is hidden until found only when the slide ends, and opens at once', async () => {
        const real = window.getComputedStyle;
        const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
            (el: Element) => ({ ...real(el), transitionDuration: '0.3s' }) as CSSStyleDeclaration,
        );
        const w = mount(TaoAlert, { props: { collapsible: true, title: 'Details' }, slots: { default: 'Body' }, attachTo: document.body });
        const fold = w.find('.tao-alert__fold');
        await w.find('.tao-alert__toggle').trigger('click');
        expect(fold.classes()).toContain('tao-alert__fold--closed');
        expect(w.find('.tao-alert__message').attributes('hidden')).toBeUndefined();
        fold.element.dispatchEvent(new Event('transitionend'));
        await nextTick();
        expect(w.find('.tao-alert__message').attributes('hidden')).toBe('until-found');
        await w.find('.tao-alert__toggle').trigger('click');
        expect(fold.classes()).not.toContain('tao-alert__fold--closed');
        expect(w.find('.tao-alert__message').attributes('hidden')).toBeUndefined();
        spy.mockRestore();
        w.unmount();
    });

    it('an alert that does not fold has no fold wrapper', () => {
        const w = mount(TaoAlert, { props: { title: 'Note' }, slots: { default: 'Body' } });
        expect(w.find('.tao-alert__fold').exists()).toBe(false);
        expect(w.find('.tao-alert__message').exists()).toBe(true);
    });
});
