import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoBlock from '../src/components/TaoBlock.vue';
import TaoCard from '../src/components/TaoCard.vue';

describe('TaoCard slots', () => {
    it('media, header, title, sub, body and footer render in their places', () => {
        const w = mount(TaoCard, {
            slots: { media: '<i>m</i>', header: 'H', title: 'T', sub: 'S', default: 'B', footer: 'F' },
        });
        expect(w.find('.tao-card__media').text()).toBe('m');
        expect(w.find('.tao-card__header').text()).toBe('H');
        expect(w.find('.tao-card__title').text()).toBe('T');
        expect(w.find('.tao-card__sub').text()).toBe('S');
        expect(w.find('.tao-card__body').text()).toBe('B');
        expect(w.find('.tao-card__footer').text()).toBe('F');
    });

    it('media alone makes a media-only tile', () => {
        expect(mount(TaoCard, { slots: { media: '<i>m</i>' } }).classes()).toContain('tao-card--media-only');
        expect(mount(TaoCard, { slots: { media: '<i>m</i>', default: 'x' } }).classes()).not.toContain('tao-card--media-only');
    });

    it('the corner slot makes room for itself: the card says so', () => {
        const w = mount(TaoCard, { slots: { title: 'T', corner: '<b>tag</b>' } });
        expect(w.find('.tao-card__corner').text()).toBe('tag');
        expect(w.classes()).toContain('tao-card--has-corner');
        expect(mount(TaoCard, { slots: { title: 'T' } }).classes()).not.toContain('tao-card--has-corner');
    });

    it('closable adds a named button that only emits close', async () => {
        const w = mount(TaoCard, { props: { closable: true }, slots: { default: 'B' } });
        const button = w.find('.tao-card__close');
        expect(button.attributes('aria-label')).toBe('Close');
        await button.trigger('click');
        expect(w.emitted('close')).toHaveLength(1);
        expect(w.find('.tao-card').exists() || w.classes().includes('tao-card')).toBe(true); // the parent removes it, not the card
        expect(mount(TaoCard, { slots: { default: 'B' } }).find('.tao-card__close').exists()).toBe(false);
    });

    it('closeLabel overrides the text', () => {
        expect(mount(TaoCard, { props: { closable: true, closeLabel: 'Dismiss' } }).find('.tao-card__close').attributes('aria-label')).toBe('Dismiss');
    });
});

describe('the panel contract', () => {
    it('Card and Block are panels; defaults come from tokens, only what is passed goes inline', () => {
        for (const component of [TaoCard, TaoBlock]) {
            const plain = mount(component, { slots: { default: 'x' } });
            expect(plain.classes()).toContain('tao-panel');
            expect(plain.attributes('style') ?? '').not.toContain('--tao-radius');
            expect(plain.attributes('style') ?? '').not.toContain('--tao-pad');

            const set = mount(component, { props: { radius: 20, padding: [12, 24] }, slots: { default: 'x' } });
            const style = set.attributes('style') ?? '';
            expect(style).toContain('--tao-radius: 20px');
            expect(style).toContain('--tao-pad: 12px'); // the first value, for concentric corners
        }
    });
});

describe('media-only card', () => {
    it('the class the template sets is the one the stylesheet stretches (a picture fills a mosaic tile)', async () => {
        const { mount } = await import('@vue/test-utils');
        const { h } = await import('vue');
        const TaoCard = (await import('../src/components/TaoCard.vue')).default;
        // @ts-expect-error Vite `?raw` import: the component source as text
        const source = (await import('../src/components/TaoCard.vue?raw')).default as string;
        const w = mount(TaoCard, { props: { flush: true }, slots: { media: () => h('img', { src: 'x.png', alt: '' }) } });
        expect(w.classes()).toContain('tao-card--media-only');
        expect(source).toMatch(/\.tao-card--media-only \.tao-card__media \{[^}]*flex: 1 1 auto/);
        expect(source).not.toContain('cover-only');
    });
});
