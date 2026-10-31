import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoSlider from '../src/components/TaoSlider.vue';
import TaoRangeSlider from '../src/components/TaoRangeSlider.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import source from '../src/components/TaoSliderBase.vue?raw';
import { normalizeZones, zoneAt, zoneColor, zoneGradient } from '../src/slider';

// 5.22.0: zones of the scale in colour: each runs to its `to`, a dot where it ends, the thumb in the colour of its zone.
// 5.22.0: зоны шкалы цветом: каждая идёт до своего `to`, точка там, где кончается, ручка цвета своей зоны.

describe('slider zones: the logic', () => {
    it('colours: a colour of your own wins, then the role of the tone, the accent by default', () => {
        expect(zoneColor({ color: '#ff0080', tone: 'danger' })).toBe('#ff0080');
        expect(zoneColor({ tone: 'danger' })).toBe('var(--tao-color-danger)');
        expect(zoneColor({})).toBe('var(--tao-color-accent)');
        expect(zoneColor({ tone: 'neutral' })).toBe('var(--tao-color-text-muted)');
    });

    it('each zone runs from the end of the previous one; the last is stretched to max', () => {
        const zones = normalizeZones([{ to: 30, tone: 'info' }, { to: 70, tone: 'warning' }, { to: 90, tone: 'danger' }], 0, 100);
        expect(zones.map((z) => [z.from, z.to])).toEqual([[0, 30], [30, 70], [70, 100]]);
    });

    it('sorts, keeps inside the scale, drops a repeat and a bad number', () => {
        const zones = normalizeZones([{ to: 70 }, { to: 30 }, { to: 30 }, { to: Number.NaN }, { to: 500 }, { to: -5 }], 0, 100);
        expect(zones.map((z) => [z.from, z.to])).toEqual([[0, 30], [30, 70], [70, 100]]);
        expect(normalizeZones(undefined, 0, 100)).toEqual([]);
        expect(normalizeZones([], 0, 100)).toEqual([]);
        expect(normalizeZones([{ to: 50 }], 5, 5)).toEqual([]);
    });

    it('a dot sits where a zone really ended, never at max', () => {
        const zones = normalizeZones([{ to: 40, dot: true }, { to: 100, dot: true }], 0, 100);
        expect(zones.map((z) => z.dot)).toEqual([true, false]);
    });

    it('a value on a border belongs to the zone that ends there', () => {
        const zones = normalizeZones([{ to: 30, tone: 'info' }, { to: 100, tone: 'danger' }], 0, 100);
        expect(zoneAt(30, zones)?.color).toBe('var(--tao-color-info)');
        expect(zoneAt(30.5, zones)?.color).toBe('var(--tao-color-danger)');
        expect(zoneAt(0, zones)?.color).toBe('var(--tao-color-info)');
        expect(zoneAt(100, zones)?.color).toBe('var(--tao-color-danger)');
    });

    it('the gradient has hard borders, from the start or from the bottom', () => {
        const zones = normalizeZones([{ to: 25, color: 'red' }, { to: 100, color: 'blue' }], 0, 100);
        expect(zoneGradient(zones, 0, 100)).toBe('linear-gradient(to right, red 0% 25%, blue 25% 100%)');
        expect(zoneGradient(zones, 0, 100, true)).toBe('linear-gradient(to top, red 0% 25%, blue 25% 100%)');
        // a scale that does not start at zero
        const shifted = normalizeZones([{ to: 0, color: 'red' }, { to: 50, color: 'blue' }], -50, 50);
        expect(zoneGradient(shifted, -50, 50)).toBe('linear-gradient(to right, red 0% 50%, blue 50% 100%)');
    });
});

describe('slider zones: the component', () => {
    const zones = [{ to: 30, tone: 'info' as const }, { to: 70, tone: 'warning' as const, dot: true }, { to: 100, tone: 'danger' as const }];

    it('without zones nothing changes: the plain fill, no layers, no dots', () => {
        const w = mount(TaoSlider, { props: { modelValue: 50 } });
        expect(w.find('.tao-slider__fill').exists()).toBe(true);
        expect(w.find('.tao-slider__zones').exists()).toBe(false);
        expect(w.classes()).not.toContain('tao-slider--zoned');
    });

    it('with zones: a dimmed layer, a clipped one in full colour, the dots; the plain fill is gone', () => {
        const w = mount(TaoSlider, { props: { modelValue: 50, zones } });
        expect(w.classes()).toContain('tao-slider--zoned');
        expect(w.find('.tao-slider__fill').exists()).toBe(false);
        const layers = w.findAll('.tao-slider__zones');
        expect(layers).toHaveLength(2);
        expect(layers[0]!.classes()).toContain('tao-slider__zones--dim');
        expect(layers[1]!.attributes('style')).toContain('inset(0 50% 0 0%');
        expect(layers[1]!.attributes('style')).toContain('--_zones');
        const dots = w.findAll('.tao-slider__dot');
        expect(dots).toHaveLength(1);
        expect(dots[0]!.attributes('style')).toContain('left: 70%');
        expect(dots[0]!.attributes('aria-hidden')).toBe('true');
    });

    it('the thumb takes the colour of the zone it stands in, and changes with the value', async () => {
        const w = mount(TaoSlider, { props: { modelValue: 20, zones } });
        const thumb = () => w.find('[role="slider"]').attributes('style') ?? '';
        expect(thumb()).toContain('var(--tao-color-info)');
        await w.setProps({ modelValue: 85 });
        expect(thumb()).toContain('var(--tao-color-danger)');
    });

    it('a vertical bar counts the clip and the dots from the bottom', () => {
        const w = mount(TaoSlider, { props: { modelValue: 40, vertical: true, zones } });
        expect(w.findAll('.tao-slider__zones')[1]!.attributes('style')).toContain('inset(60% 0 0% 0');
        expect(w.find('.tao-slider__dot').attributes('style')).toContain('bottom: 70%');
        expect(w.find('.tao-slider__zones').attributes('style')).toContain('to top');
    });

    it('a range clips to the part between its thumbs, and each thumb has its own colour', () => {
        const w = mount(TaoRangeSlider, { props: { modelValue: [20, 85], zones } });
        expect(w.findAll('.tao-slider__zones')[1]!.attributes('style')).toContain('inset(0 15% 0 20%');
        const [a, b] = w.findAll('[role="slider"]');
        expect(a!.attributes('style')).toContain('var(--tao-color-info)');
        expect(b!.attributes('style')).toContain('var(--tao-color-danger)');
    });

    it('the keyboard and the value are untouched', async () => {
        const w = mount(TaoSlider, { props: { modelValue: 50, zones } });
        await w.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
        expect(w.emitted('update:modelValue')?.[0]).toEqual([51]);
        expect(w.find('[role="slider"]').attributes('aria-valuetext')).toBe('50');
    });

    it('the css: the layers take the track geometry; a bead is not hit; the invalid ring is not doubled on them', () => {
        expect(source).toMatch(/\.tao-slider__zones--dim \{\s*opacity: 0\.4/);
        expect(source).toMatch(/\.tao-slider__dot \{[^}]*pointer-events: none/);
        expect(source).toContain('.tao-slider--invalid .tao-slider__track:not(.tao-slider__zones)');
    });
});
