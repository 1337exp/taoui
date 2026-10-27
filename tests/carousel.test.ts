import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import TaoCarousel from '../src/components/TaoCarousel.vue';

// The slide metrics need a layout; happy-dom has none, so every box is 100px wide.
// Метрикам слайдов нужна раскладка, а в happy-dom её нет: каждая рамка 100px.
beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 100, height: 40, top: 0, left: 0, right: 100, bottom: 40, x: 0, y: 0, toJSON: () => ({}) });
    (HTMLElement.prototype as unknown as { scrollTo: () => void }).scrollTo = () => {};
});
afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
});

const slides = () => [1, 2, 3].map((n) => h('div', { class: 'slide' }, `s${n}`));

async function make(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
    const w = mount(TaoCarousel, { props, slots: { default: slides, ...slots } as never });
    await nextTick();
    await nextTick();
    return w;
}

const fills = (w: ReturnType<typeof mount>) => w.findAll('.tao-carousel__fill');

describe('TaoCarousel indicators', () => {
    it('nothing under the track without an indicator or autoplay', async () => {
        const w = await make();
        expect(w.find('.tao-carousel__footer').exists()).toBe(false);
    });

    it('dots: one per slide, the current one marked, no fill without autoplay', async () => {
        const w = await make({ indicator: 'dots' });
        const dots = w.findAll('.tao-carousel__dot');
        expect(dots).toHaveLength(3);
        expect(dots[0]!.attributes('aria-current')).toBe('true');
        expect(dots[0]!.attributes('aria-label')).toBe('Slide 1 of 3');
        expect(fills(w)).toHaveLength(0);
        await dots[2]!.trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([[2]]);
    });

    it('bars and progress get their own markup', async () => {
        expect((await make({ indicator: 'bars' })).find('.tao-carousel__indicator--bars').exists()).toBe(true);
        const progress = await make({ indicator: 'progress' });
        // without autoplay the bar shows the position: 1 of 3
        expect(progress.find('.tao-carousel__position').attributes('style')).toContain('scaleX(0.333');
    });
});

describe('TaoCarousel autoplay as a fill', () => {
    it('the current dot carries the fill, which runs for the interval', async () => {
        const w = await make({ indicator: 'dots', autoplay: 1000 });
        expect(fills(w)).toHaveLength(1);
        expect(w.findAll('.tao-carousel__dot')[0]!.find('.tao-carousel__fill').attributes('style')).toContain('animation-duration: 1000ms');
        expect(w.findAll('.tao-carousel__dot')[0]!.find('.tao-carousel__pip').classes()).toContain('tao-carousel__pip--filling');
    });

    it('the end of the fill moves to the next slide and a new fill starts there', async () => {
        const w = await make({ indicator: 'dots', autoplay: 1000 });
        await fills(w)[0]!.trigger('animationend');
        expect(w.emitted('update:modelValue')).toEqual([[1]]);
        await nextTick();
        expect(w.findAll('.tao-carousel__dot')[1]!.find('.tao-carousel__fill').exists()).toBe(true);
        expect(w.findAll('.tao-carousel__dot')[0]!.find('.tao-carousel__fill').exists()).toBe(false);
    });

    it('a manual change starts the fill again', async () => {
        const w = await make({ indicator: 'bars', autoplay: 1000 });
        const before = fills(w)[0]!.element;
        await w.findAll('.tao-carousel__dot')[1]!.trigger('click');
        await nextTick();
        const after = fills(w)[0]!.element;
        expect(after).not.toBe(before);
        expect(w.findAll('.tao-carousel__dot')[1]!.find('.tao-carousel__fill').exists()).toBe(true);
    });

    it('progress: one bar whose fill runs over the slide', async () => {
        const w = await make({ indicator: 'progress', autoplay: 1000 });
        expect(w.find('.tao-carousel__bar .tao-carousel__fill').exists()).toBe(true);
        await fills(w)[0]!.trigger('animationend');
        expect(w.emitted('update:modelValue')).toEqual([[1]]);
    });

    it('without an indicator an invisible timer keeps the time', async () => {
        const w = await make({ autoplay: 1000 });
        expect(w.find('.tao-carousel__timer').exists()).toBe(true);
        expect(w.find('.tao-carousel__timer').attributes('aria-hidden')).toBe('true');
        await fills(w)[0]!.trigger('animationend');
        expect(w.emitted('update:modelValue')).toEqual([[1]]);
    });

    it('your own dots slot still gets the time from the invisible timer', async () => {
        const w = await make({ autoplay: 1000 }, { dots: () => h('i', { class: 'mine' }, '•') });
        expect(w.find('.mine').exists()).toBe(true);
        expect(w.find('.tao-carousel__timer').exists()).toBe(true);
    });

    it('stops at the last slide without loop (no fill), keeps going with loop', async () => {
        const w = await make({ indicator: 'dots', autoplay: 1000, modelValue: 2 });
        expect(fills(w)).toHaveLength(0);
        const looped = await make({ indicator: 'dots', autoplay: 1000, modelValue: 2, loop: true });
        await fills(looped)[0]!.trigger('animationend');
        expect(looped.emitted('update:modelValue')).toEqual([[0]]);
    });
});

describe('TaoCarousel pauses', () => {
    it('hover pauses the fill, leaving resumes it', async () => {
        const w = await make({ indicator: 'dots', autoplay: 1000 });
        await w.trigger('mouseenter');
        expect(fills(w)[0]!.classes()).toContain('tao-carousel__fill--paused');
        await w.trigger('mouseleave');
        expect(fills(w)[0]!.classes()).not.toContain('tao-carousel__fill--paused');
    });

    it('an animationend that arrives while paused does nothing', async () => {
        const w = await make({ indicator: 'dots', autoplay: 1000 });
        await w.trigger('mouseenter');
        await fills(w)[0]!.trigger('animationend');
        expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('the pause button stops and resumes, and says which', async () => {
        const w = await make({ indicator: 'dots', autoplay: 1000 });
        const toggle = w.find('.tao-carousel__toggle');
        expect(toggle.attributes('aria-label')).toBe('Pause autoplay');
        expect(toggle.attributes('aria-pressed')).toBe('false');
        await toggle.trigger('click');
        expect(toggle.attributes('aria-label')).toBe('Start autoplay');
        expect(toggle.attributes('aria-pressed')).toBe('true');
        expect(fills(w)[0]!.classes()).toContain('tao-carousel__fill--paused');
        await toggle.trigger('click');
        expect(fills(w)[0]!.classes()).not.toContain('tao-carousel__fill--paused');
    });

    it('pausable can be turned off; no autoplay means no button', async () => {
        expect((await make({ indicator: 'dots', autoplay: 1000, pausable: false })).find('.tao-carousel__toggle').exists()).toBe(false);
        expect((await make({ indicator: 'dots' })).find('.tao-carousel__toggle').exists()).toBe(false);
    });

    it('a hidden tab pauses the fill', async () => {
        const w = await make({ indicator: 'dots', autoplay: 1000 });
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        await nextTick();
        expect(fills(w)[0]!.classes()).toContain('tao-carousel__fill--paused');
        Object.defineProperty(document, 'hidden', { value: false, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        await nextTick();
        expect(fills(w)[0]!.classes()).not.toContain('tao-carousel__fill--paused');
    });

    it('prefers-reduced-motion turns the autoplay off: no fill, no timer, no button', async () => {
        const original = window.matchMedia;
        window.matchMedia = ((query: string) => ({ matches: query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} })) as never;
        try {
            const w = await make({ indicator: 'dots', autoplay: 1000 });
            expect(fills(w)).toHaveLength(0);
            expect(w.find('.tao-carousel__toggle').exists()).toBe(false);
            expect(w.find('.tao-carousel__timer').exists()).toBe(false);
            expect(w.findAll('.tao-carousel__dot')).toHaveLength(3);
        } finally {
            window.matchMedia = original;
        }
    });
});
