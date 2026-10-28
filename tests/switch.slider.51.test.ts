import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoSwitch from '../src/components/TaoSwitch.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import sliderSource from '../src/components/TaoSliderBase.vue?raw';

// 5.1: a switch that is applying its change, and a slider thumb with a contact patch.
// 5.1: переключатель, который применяет изменение, и бегунок слайдера с пятном контакта.

describe('TaoSwitch loading', () => {
    it('says busy, shows the spinner class, and is not greyed out like disabled', () => {
        const w = mount(TaoSwitch, { props: { loading: true, label: 'Sync' } });
        expect(w.find('input').attributes('aria-busy')).toBe('true');
        expect(w.classes()).toContain('tao-switch--loading');
        expect(w.classes()).not.toContain('tao-switch--disabled');
        expect(w.find('input').attributes('disabled')).toBeUndefined();
    });

    it('a click while loading changes nothing, and the box stays as the model says', async () => {
        const w = mount(TaoSwitch, { props: { loading: true, modelValue: false } });
        const input = w.find('input');
        await input.setValue(true);
        expect(w.emitted('update:modelValue')).toBeUndefined();
        expect((input.element as HTMLInputElement).checked).toBe(false);
    });

    it('without loading it toggles as before; no aria-busy', async () => {
        const w = mount(TaoSwitch, { props: { modelValue: false } });
        expect(w.find('input').attributes('aria-busy')).toBeUndefined();
        await w.find('input').setValue(true);
        expect(w.emitted('update:modelValue')).toEqual([[true]]);
    });
});

describe('TaoSlider thumb', () => {
    it('has a contact patch: a ring of its own colour, wider on hover and while dragging, none when flat or disabled', () => {
        expect(sliderSource).toMatch(/\.tao-slider__thumb \{[^}]*box-shadow: 0 0 0 var\(--_tao-halo\)/);
        expect(sliderSource).toMatch(/\.tao-slider:not\(\.tao-slider--disabled\) \.tao-slider__thumb:hover \{[^}]*--_tao-halo: 6px/);
        expect(sliderSource).toMatch(/\.tao-slider__thumb--active \{[^}]*--_tao-halo: 8px/);
        expect(sliderSource).toMatch(/\.tao-slider--flat \.tao-slider__thumb \{[^}]*box-shadow: none/);
        expect(sliderSource).toMatch(/\.tao-slider--disabled \.tao-slider__thumb \{[^}]*--_tao-halo: 0px/);
    });

    it('the keyboard focus ring stays outside the patch', () => {
        expect(sliderSource).toContain('outline-offset: calc(var(--_tao-halo) + 2px)');
    });
});

describe('TaoSlider cursor', () => {
    it('one cursor, the finger, over the thumb and on the whole rail while dragging; no grab, which Opera draws as arrows', () => {
        expect(sliderSource).toMatch(/\.tao-slider__thumb \{[^}]*cursor: pointer;/);
        expect(sliderSource).toMatch(/\.tao-slider__rail--dragging,\s*\.tao-slider__rail--dragging \* \{[^}]*cursor: pointer;/);
        expect(sliderSource).not.toMatch(/cursor: grab/);
        expect(sliderSource).toContain(":class=\"{ 'tao-slider__rail--dragging': isDragging }\"");
    });
});
