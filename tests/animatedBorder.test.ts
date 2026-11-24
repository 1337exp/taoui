import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoAnimatedBorder from '../src/components/TaoAnimatedBorder.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import borderSource from '../src/components/TaoAnimatedBorder.vue?raw';

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

    it('radius by corner: the shorthand and the four corners; the border outside adds its width to each', () => {
        const s = style({ radius: [0, 0, 12, 12] });
        expect(s).toContain('--tao-radius: 0px 0px 12px 12px');
        expect(s).toContain('--tao-radius-br: 12px');
        expect(style({ radius: 16 })).not.toContain('--tao-radius-tl');
        // the glow and the ring read the same outer radius: each corner plus the width
        expect(borderSource).toMatch(/--_tao-outer-radius:\s*calc\(var\(--tao-radius-tl\) \+ var\(--tao-animated-border-width\)\) calc\(var\(--tao-radius-tr\)/);
        expect(borderSource.match(/border-radius: var\(--_tao-outer-radius\)/g)).toHaveLength(2);
    });
});
