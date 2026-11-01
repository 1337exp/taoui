import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoSlider from '../src/components/TaoSlider.vue';
import TaoRangeSlider from '../src/components/TaoRangeSlider.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import source from '../src/components/TaoSliderBase.vue?raw';
import { normalizeZones, zoneAt, zoneColor, zoneGradient, zoneOn } from '../src/slider';

// 5.22.0: zones of the scale in colour: each runs to its `to`, a dot where it ends, the thumb in the colour of its zone.
// 5.22.0: зоны шкалы цветом: каждая идёт до своего `to`, точка там, где кончается, ручка цвета своей зоны.

describe('slider zones: the logic', () => {
    it('colours: a colour of your own wins, then the role of the tone, the accent by default', () => {
        expect(zoneColor({ color: '#ff0080', tone: 'danger' })).toBe('#ff0080');
        expect(zoneColor({ tone: 'danger' })).toBe('var(--tao-color-danger)');
        expect(zoneColor({})).toBe('var(--tao-color-accent)');
        expect(zoneColor({ tone: 'neutral' })).toBe('var(--tao-color-text-muted)');
    });

    it('the label on a zone: the on- role of the tone, black or white for a colour of your own, empty when it cannot be read', () => {
        expect(zoneOn({ tone: 'danger' })).toBe('var(--tao-color-on-danger)');
        expect(zoneOn({})).toBe('var(--tao-color-on-accent)');
        expect(zoneOn({ tone: 'neutral' })).toBe('var(--tao-color-bg)');
        expect(zoneOn({ color: '#ffffff' })).toBe('#0d0d0d');
        expect(zoneOn({ color: '#102030' })).toBe('#ffffff');
        expect(zoneOn({ color: 'rgb(255 214 0)' })).toBe('#0d0d0d');
        expect(zoneOn({ color: 'hsl(250 60% 25%)' })).toBe('#ffffff');
        expect(zoneOn({ color: 'rebeccapurple' })).toBe('');
        expect(zoneOn({ color: 'var(--mine)' })).toBe('');
        expect(normalizeZones([{ to: 100, tone: 'success' }], 0, 100)[0]!.on).toBe('var(--tao-color-on-success)');
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

    it('reveal: clear in the layer of the whole bar, in colour in the layer of the fill', () => {
        const zones = normalizeZones([{ to: 40, color: 'blue' }, { to: 100, color: 'red', reveal: true }], 0, 100);
        expect(zones.map((z) => z.reveal)).toEqual([false, true]);
        expect(zoneGradient(zones, 0, 100, false, true)).toBe('linear-gradient(to right, blue 0% 40%, transparent 40% 100%)');
        expect(zoneGradient(zones, 0, 100)).toBe('linear-gradient(to right, blue 0% 40%, red 40% 100%)');
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

    it('reveal: the dim layer is clear there, and the dot shows only once the fill has got to it', async () => {
        const revealed = [{ to: 40, tone: 'info' as const, dot: true, reveal: true }, { to: 70, tone: 'warning' as const, dot: true, reveal: true }, { to: 100, tone: 'danger' as const }];
        const w = mount(TaoSlider, { props: { modelValue: 10, zones: revealed } });
        expect(w.find('.tao-slider__zones--dim').attributes('style')).toContain('--_zones-dim: linear-gradient(to right, transparent 0% 40%, transparent 40% 70%, var(--tao-color-danger) 70% 100%)');
        expect(w.findAll('.tao-slider__dot')).toHaveLength(0);
        await w.setProps({ modelValue: 55 });
        expect(w.findAll('.tao-slider__dot')).toHaveLength(1);
        await w.setProps({ modelValue: 90 });
        expect(w.findAll('.tao-slider__dot')).toHaveLength(2);
        // the zones that are not revealed keep their dot at any value
        const plain = mount(TaoSlider, { props: { modelValue: 10, zones: [{ to: 40, dot: true }, { to: 100 }] } });
        expect(plain.findAll('.tao-slider__dot')).toHaveLength(1);
    });

    it('the keyboard and the value are untouched', async () => {
        const w = mount(TaoSlider, { props: { modelValue: 50, zones } });
        await w.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
        expect(w.emitted('update:modelValue')?.[0]).toEqual([51]);
        expect(w.find('[role="slider"]').attributes('aria-valuetext')).toBe('50');
    });

    it('the css: the layers take the track geometry; a bead is not hit; the invalid ring is not doubled on them', () => {
        expect(source).toMatch(/\.tao-slider__zones--dim \{\s*background: var\(--_zones-dim\);\s*opacity: 0\.4/);
        expect(source).toMatch(/\.tao-slider__dot \{[^}]*pointer-events: none/);
        expect(source).toContain('.tao-slider--invalid .tao-slider__track:not(.tao-slider__zones)');
    });
});

describe('slider bubble', () => {
    const zones = [{ to: 30, tone: 'info' as const }, { to: 100, tone: 'danger' as const }];

    it('off by default: no bubble, no class, so what exists does not change', () => {
        const w = mount(TaoSlider, { props: { modelValue: 50, zones } });
        expect(w.find('.tao-slider__bubble').exists()).toBe(false);
        expect(w.classes()).not.toContain('tao-slider--bubble');
    });

    it('with bubble: the text of the value (format counts), hidden from a screen reader that has aria-valuetext', () => {
        const w = mount(TaoSlider, { props: { modelValue: 434, max: 500, bubble: true, format: (v: number) => `${v}%` } });
        const bubble = w.find('.tao-slider__bubble');
        expect(bubble.text()).toBe('434%');
        expect(bubble.attributes('aria-hidden')).toBe('true');
        expect(w.find('[role="slider"]').attributes('aria-valuetext')).toBe('434%');
        expect(bubble.attributes('style')).toContain('left: 86.8%');
        expect(w.classes()).toContain('tao-slider--bubble');
        expect(w.classes()).not.toContain('tao-slider--bubble-always');
    });

    it("'always' keeps it on; the accent is the colour without zones", () => {
        const w = mount(TaoSlider, { props: { modelValue: 50, bubble: 'always' } });
        expect(w.classes()).toContain('tao-slider--bubble-always');
        const style = w.find('.tao-slider__bubble').attributes('style')!;
        expect(style).toContain('--_bg: var(--tao-color-accent)');
        expect(style).toContain('--_on: var(--tao-color-on-accent)');
    });

    it('it takes the colour of the zone the thumb stands in, and a label that reads on it', async () => {
        const w = mount(TaoSlider, { props: { modelValue: 20, bubble: true, zones } });
        expect(w.find('.tao-slider__bubble').attributes('style')).toContain('--_bg: var(--tao-color-info)');
        expect(w.find('.tao-slider__bubble').attributes('style')).toContain('--_on: var(--tao-color-on-info)');
        await w.setProps({ modelValue: 80 });
        expect(w.find('.tao-slider__bubble').attributes('style')).toContain('--_bg: var(--tao-color-danger)');
    });

    it('a colour of your own: black or white by contrast, and the browser decides when the script cannot read it', () => {
        const light = mount(TaoSlider, { props: { modelValue: 50, bubble: true, zones: [{ to: 100, color: '#ffe066' }] } });
        expect(light.find('.tao-slider__bubble').attributes('style')).toContain('--_on: #0d0d0d');
        expect(light.find('.tao-slider__bubble').classes()).not.toContain('tao-slider__bubble--auto');
        const named = mount(TaoSlider, { props: { modelValue: 50, bubble: true, zones: [{ to: 100, color: 'rebeccapurple' }] } });
        expect(named.find('.tao-slider__bubble').classes()).toContain('tao-slider__bubble--auto');
        expect(named.find('.tao-slider__bubble').attributes('style')).not.toContain('--_on');
    });

    it('a range has a bubble at each thumb; the slot gets the value and the zone', () => {
        const w = mount(TaoRangeSlider, {
            props: { modelValue: [20, 80], bubble: true, zones },
            slots: { bubble: `<template #bubble="{ value, zone }"><b class="mine">{{ value }}:{{ zone?.color }}</b></template>` },
        });
        expect(w.findAll('.tao-slider__bubble')).toHaveLength(2);
        const mine = w.findAll('.mine').map((b) => b.text());
        expect(mine).toEqual(['20:var(--tao-color-info)', '80:var(--tao-color-danger)']);
    });

    it('it follows a vertical bar from the bottom and sits right after its thumb (the css shows it by that)', () => {
        const w = mount(TaoSlider, { props: { modelValue: 40, vertical: true, bubble: true } });
        expect(w.find('.tao-slider__bubble').attributes('style')).toContain('bottom: 40%');
        const thumb = w.find('[role="slider"]').element;
        expect(thumb.nextElementSibling?.classList.contains('tao-slider__bubble')).toBe(true);
    });

    it('the css: it comes with hover, keyboard focus and the drag, stays under `always`, does not catch the pointer, does not fade under reduced motion', () => {
        expect(source).toMatch(/\.tao-slider__thumb:hover \+ \.tao-slider__bubble,\s*\.tao-slider__thumb:focus-visible \+ \.tao-slider__bubble,\s*\.tao-slider__thumb--active \+ \.tao-slider__bubble,\s*\.tao-slider--bubble-always \.tao-slider__bubble \{\s*opacity: 1/);
        expect(source).toMatch(/\.tao-slider__bubble \{[^}]*pointer-events: none/);
        // an icon beside the text sits on the middle line of it, not on the baseline
        expect(source).toMatch(/\.tao-slider__bubble \{[^}]*display: flex;\s*align-items: center;/);
        expect(source).toMatch(/prefers-reduced-motion: reduce\) \{\s*\.tao-slider__bubble \{\s*transition: none/);
    });
});
