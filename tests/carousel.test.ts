import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import TaoCarousel from '../src/components/TaoCarousel.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import carouselSource from '../src/components/TaoCarousel.vue?raw';

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

describe('TaoCarousel centered', () => {
    const nine = () => Array.from({ length: 9 }, (_, n) => h('div', { class: 'slide' }, `s${n}`));

    it('the arrows go by one slide however many are in view, and the dots count every slide', async () => {
        const w = await make({ centered: true, perView: 3, indicator: 'dots' }, { default: nine });
        expect(w.findAll('.tao-carousel__dot')).toHaveLength(9);
        await w.find('.tao-carousel__nav--next').trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([[1]]);
        await w.find('.tao-carousel__nav--next').trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([[1], [2]]);
    });

    it('the strip is not the end until the last slide is in the middle', async () => {
        const w = await make({ centered: true, perView: 3, modelValue: 7 }, { default: nine });
        expect(w.find('.tao-carousel__nav--next').attributes('disabled')).toBeUndefined();
        await w.find('.tao-carousel__nav--next').trigger('click');
        expect(w.find('.tao-carousel__nav--next').attributes('disabled')).toBeDefined();
    });

    it('marks the root, keeps the full per-view for the CSS and leaves a plain strip alone', async () => {
        const w = await make({ centered: true, perView: 3, peek: 40 }, { default: nine });
        expect(w.classes()).toContain('tao-carousel--centered');
        expect(w.attributes('style')).toContain('--tao-carousel-per-view: 3');
        expect(w.attributes('style')).toContain('--tao-carousel-peek: 40px');
        const plain = await make({ perView: 3 }, { default: nine });
        expect(plain.classes()).not.toContain('tao-carousel--centered');
        // a plain strip moves by the whole frame
        await plain.find('.tao-carousel__nav--next').trigger('click');
        expect(plain.emitted('update:modelValue')).toEqual([[3]]);
    });

    it('tells every slide how far it is from the middle', async () => {
        const w = await make({ centered: true, perView: 3, modelValue: 0 }, { default: nine });
        const track = w.find('.tao-carousel__track').element as HTMLElement;
        track.scrollLeft = 116;
        await w.find('.tao-carousel__track').trigger('scroll');
        const distance = (n: number) => (track.children[n] as HTMLElement).style.getPropertyValue('--tao-carousel-d');
        // every box is 100px and the gap is 0 in happy-dom: scrollLeft 116 = 1.16 slides
        expect(distance(1)).toBe('0.160');
        expect(distance(0)).toBe('1.160');
        expect(distance(2)).toBe('0.840');
        // the far ones stop at 2: no more shrinking
        expect(distance(8)).toBe('2.000');
    });

    // a cycle: 9 real slides, 3 in view → the slides are drawn 3 times and the real ones are the middle set
    // цикл: 9 настоящих слайдов, 3 в кадре → слайды нарисованы 3 раза, настоящие — средний набор
    async function cycle(props: Record<string, unknown> = {}) {
        const scrollTo = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
            this.scrollLeft = options.left ?? 0;
        });
        (HTMLElement.prototype as unknown as { scrollTo: unknown }).scrollTo = scrollTo;
        const w = await make({ centered: true, loop: true, perView: 3, indicator: 'dots', ...props }, { default: nine });
        await nextTick();
        await nextTick();
        return { w, scrollTo, track: w.find('.tao-carousel__track').element as HTMLElement };
    }

    it('loop draws the slides three times, the copies are inert, the dots and the arrows count the real ones', async () => {
        const { w, track } = await cycle();
        expect(track.children).toHaveLength(27);
        expect(w.findAll('.tao-carousel__dot')).toHaveLength(9);
        const copies = [...track.children].map((el) => el.hasAttribute('inert'));
        expect(copies.slice(0, 9).every(Boolean)).toBe(true);
        expect(copies.slice(9, 18).some(Boolean)).toBe(false);
        expect(copies.slice(18).every(Boolean)).toBe(true);
        expect(track.children[0]!.getAttribute('aria-hidden')).toBe('true');
        expect(track.children[10]!.getAttribute('aria-hidden')).toBeNull();
        // the real set is where the strip stands: slide 0 is the 10th, 9 × 100px
        expect(track.scrollLeft).toBe(900);
        expect(w.find('.tao-carousel__nav--prev').attributes('disabled')).toBeUndefined();
    });

    it('forward from the last slide is the first one, in the next copy, not a rewind', async () => {
        const { w, scrollTo, track } = await cycle({ modelValue: 8 });
        expect(track.scrollLeft).toBe(1700);
        scrollTo.mockClear();
        await w.find('.tao-carousel__nav--next').trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([[0]]);
        expect(scrollTo).toHaveBeenCalledWith({ left: 1800, behavior: 'smooth' });
    });

    it('back from the first slide is the last one, in the previous copy', async () => {
        const { w, scrollTo } = await cycle();
        scrollTo.mockClear();
        await w.find('.tao-carousel__nav--prev').trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([[8]]);
        expect(scrollTo).toHaveBeenCalledWith({ left: 800, behavior: 'smooth' });
    });

    it('a dot goes to the nearest copy of its slide', async () => {
        const { w, scrollTo } = await cycle({ modelValue: 7 });
        scrollTo.mockClear();
        // from 7 (the 17th) the shortest way to 1 is forward through the end, the copy of 1 that is the 20th: 3 slides, not 6 back
        await w.findAll('.tao-carousel__dot')[1]!.trigger('click');
        expect(scrollTo).toHaveBeenCalledWith({ left: 1900, behavior: 'smooth' });
    });

    it('a strip that stopped in a copy jumps back to the real set, to the same slide', async () => {
        const { w, track } = await cycle();
        track.scrollLeft = 1900; // the 20th: a copy of slide 1
        await w.find('.tao-carousel__track').trigger('scrollend');
        expect(track.scrollLeft).toBe(1000);
        track.scrollLeft = 300; // the 4th: a copy of slide 3
        await w.find('.tao-carousel__track').trigger('scrollend');
        expect(track.scrollLeft).toBe(1200);
    });

    it('every drawn slide, the copies too, gets its distance from the middle', async () => {
        const { w, track } = await cycle({ modelValue: 8 });
        await w.find('.tao-carousel__track').trigger('scroll');
        // the strip stands on the real slide 8 (the 18th); the first copy of slide 0 is the 19th, one slide away
        expect((track.children[18] as HTMLElement).style.getPropertyValue('--tao-carousel-d')).toBe('1.000');
        expect((track.children[26] as HTMLElement).style.getPropertyValue('--tao-carousel-d')).toBe('2.000');
    });

    it('a few slides are drawn more times, so the frame is never empty', async () => {
        const w = await make({ centered: true, loop: true, perView: 3 });
        await nextTick();
        const track = w.find('.tao-carousel__track').element as HTMLElement;
        // 3 real slides and 4 needed on each side: 2 sets on each side + the real one
        expect(track.children).toHaveLength(15);
    });

    it('without centered, loop is still a rewind and draws the slides once', async () => {
        const w = await make({ loop: true, modelValue: 2 });
        await nextTick();
        expect(w.findAll('.tao-carousel__track > .slide')).toHaveLength(3);
        await w.find('.tao-carousel__nav--next').trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([[0]]);
    });

    it('the look is CSS: the spacers, the snap to the middle, the scale and the fade by distance', () => {
        const css = carouselSource as string;
        expect(css).toMatch(/\.tao-carousel--centered \.tao-carousel__track::before/);
        expect(css).toMatch(/scroll-snap-align:\s*center/);
        expect(css).toMatch(/scale:\s*calc\(1 - var\(--tao-carousel-d, 0\)/);
        expect(css).toMatch(/opacity:\s*calc\(1 - max\(var\(--tao-carousel-d, 0\) - 1, 0\)/);
    });
});

describe('TaoCarousel cursor', () => {
    it('does not change the system cursor of the track: no grab, no grabbing (the developer decides; Opera shows a big black arrow)', () => {
        expect(carouselSource as string).not.toMatch(/cursor:\s*grab/);
    });
});
