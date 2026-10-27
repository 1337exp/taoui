import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoAnimatedBorder from '../src/components/TaoAnimatedBorder.vue';

const style = (props: Record<string, unknown> = {}) => mount(TaoAnimatedBorder, { props, slots: { default: 'x' } }).attributes('style') ?? '';

describe('TaoAnimatedBorder', () => {
    it('the rainbow is the default and comes from a token, not from the component', () => {
        expect(style()).toContain('var(--tao-gradient-rainbow)');
    });

    it('variant="tone" runs through the colours of a tone and takes its class', () => {
        const w = mount(TaoAnimatedBorder, { props: { variant: 'tone', tone: 'success' }, slots: { default: 'x' } });
        expect(w.classes()).toContain('tao-tone-success');
        expect(w.attributes('style')).toContain('var(--tao-tone)');
        expect(mount(TaoAnimatedBorder, { props: { variant: 'tone' } }).classes()).toContain('tao-tone-accent');
    });

    it('colors win over the variant; one colour still makes a gradient', () => {
        expect(style({ variant: 'tone', colors: ['red', 'blue'] })).toContain('linear-gradient(60deg, red, blue)');
        expect(style({ colors: ['red'] })).toContain('linear-gradient(60deg, red, red)');
    });

    it('width, speed and radius go to variables; the default radius is the panel token', () => {
        const s = style({ borderWidth: 5, speed: 2, radius: 16 });
        expect(s).toContain('--tao-animated-border-width: 5px');
        expect(s).toContain('--tao-animated-border-speed: 2s');
        expect(s).toContain('--tao-radius: 16px');
        expect(style()).not.toContain('--tao-radius:');
    });
});
