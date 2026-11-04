import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoButton from '../src/components/TaoButton.vue';
import TaoLoader from '../src/components/TaoLoader.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import source from '../src/components/TaoLoader.vue?raw';
// @ts-expect-error Vite `?raw` import: the button source as text
import buttonSource from '../src/components/TaoButton.vue?raw';

// 5.23.0: TaoLoader has three looks, a voice for a screen reader, a colour role and a calm way for reduced motion.
// 5.23.0: у TaoLoader три вида, голос для скринридера, роль цвета и спокойный вид при «уменьшить движение».

describe('TaoLoader', () => {
    it('as it was: four dots, 80px, the accent; nothing asked changes', () => {
        const w = mount(TaoLoader);
        expect(w.classes()).toContain('tao-loader--dots');
        expect(w.findAll('.tao-loader__ellipsis > div')).toHaveLength(4);
        expect(w.attributes('style')).toContain('--_s: 80px');
        expect(w.classes()).toContain('tao-tone-accent');
        expect(mount(TaoLoader, { props: { size: 40, inline: true } }).classes()).toContain('tao-loader--inline');
    });

    it('three looks, and the others default to 40px', () => {
        const ring = mount(TaoLoader, { props: { variant: 'ring' } });
        expect(ring.find('.tao-loader__ring').exists()).toBe(true);
        expect(ring.find('.tao-loader__ellipsis').exists()).toBe(false);
        expect(ring.attributes('style')).toContain('--_s: 40px');
        expect(mount(TaoLoader, { props: { variant: 'pulse' } }).find('.tao-loader__pulse').exists()).toBe(true);
    });

    it('the size: a number, a px string, a name; nonsense falls back to the default', () => {
        const side = (size: unknown, variant = 'ring') => mount(TaoLoader, { props: { variant, size } as never }).attributes('style');
        expect(side(24)).toContain('--_s: 24px');
        expect(side('32px')).toContain('--_s: 32px');
        expect(side('small')).toContain('--_s: 24px');
        expect(side('medium')).toContain('--_s: 40px');
        expect(side('large')).toContain('--_s: 64px');
        expect(side('wide')).toContain('--_s: 40px');
        expect(side(-3, 'dots')).toContain('--_s: 80px');
    });

    it('a tone is a colour role; a colour of your own wins', () => {
        expect(mount(TaoLoader, { props: { tone: 'danger' } }).classes()).toContain('tao-tone-danger');
        const own = mount(TaoLoader, { props: { tone: 'danger', color: 'rebeccapurple' } });
        expect(own.attributes('style')).toContain('--_color: rebeccapurple');
        expect(source).toContain('--_c: var(--_color, var(--tao-tone))');
    });

    it('a screen reader hears it: a status with a text, in the language of the locale, or your own', () => {
        const w = mount(TaoLoader);
        expect(w.attributes('role')).toBe('status');
        expect(w.find('.tao-sr-only').text()).toBe('Loading');
        expect(mount(TaoLoader, { props: { label: 'Saving' } }).find('.tao-sr-only').text()).toBe('Saving');
        expect(w.find('.tao-loader__ellipsis').attributes('aria-hidden')).toBe('true');
    });

    it('decorative is a picture only: hidden, no role, no text', () => {
        const w = mount(TaoLoader, { props: { decorative: true } });
        expect(w.attributes('aria-hidden')).toBe('true');
        expect(w.attributes('role')).toBeUndefined();
        expect(w.find('.tao-sr-only').exists()).toBe(false);
    });

    it('diamonds: a hollow one and two filled ones, the hollow on top; hidden from the reader like the others', () => {
        const wrapper = mount(TaoLoader, { props: { variant: 'diamonds' } });
        expect(wrapper.find('.tao-loader__swap').attributes('aria-hidden')).toBe('true');
        expect([...wrapper.findAll('.tao-loader__swap i')].map((i) => i.classes()[0])).toEqual(['tao-loader__swap-left', 'tao-loader__swap-right', 'tao-loader__swap-hollow']);
        expect(wrapper.attributes('style')).toContain('--_s: 40px');
        expect(wrapper.text()).toContain('Loading');
    });

    it('reduced motion: nothing travels or turns, every look breathes instead', () => {
        const reduce = (source as string).slice((source as string).indexOf('@media (prefers-reduced-motion: reduce)'));
        expect(reduce).toMatch(/\.tao-loader__ring \{\s*animation: tao-loader-breathe/);
        expect(reduce).toMatch(/\.tao-loader__ellipsis div \{\s*animation: tao-loader-breathe[^}]*transform: none/);
        expect(reduce).toMatch(/\.tao-loader__pulse::after \{\s*display: none/);
        expect(reduce).toMatch(/\.tao-loader__swap i \{\s*animation: tao-loader-breathe/);
        expect(source).toContain('@keyframes tao-loader-breathe');
    });

    it('the sizes come from one number, in CSS: no JS geometry left', () => {
        expect(source).not.toContain('v-bind(');
        expect(source).toContain('--_dot: calc(var(--_s) * 0.1625)');
    });
});

describe('TaoButton loading wears the ring', () => {
    it('a decorative ring in the text colour, and the button says it is busy itself', () => {
        const w = mount(TaoButton, { props: { loading: true }, slots: { default: 'Save' } });
        const ring = w.findComponent(TaoLoader);
        expect(ring.exists()).toBe(true);
        expect(ring.props('variant')).toBe('ring');
        expect(ring.props('color')).toBe('currentColor');
        expect(ring.props('decorative')).toBe(true);
        expect(w.attributes('aria-busy')).toBe('true');
        expect(w.attributes('disabled')).toBeDefined();
        expect(buttonSource).not.toContain('tao-spin');
    });

    it('not loading: no ring, no aria-busy', () => {
        const w = mount(TaoButton, { slots: { default: 'Save' } });
        expect(w.findComponent(TaoLoader).exists()).toBe(false);
        expect(w.attributes('aria-busy')).toBeUndefined();
    });
});
