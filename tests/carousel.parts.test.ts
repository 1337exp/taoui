import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { centerDistance, cycleTarget, nearestSlide, wantedCopies } from '../src/carousel';
import { useCarouselGlide } from '../src/carouselGlide';
import { useCarouselPause } from '../src/carouselPause';

describe('wantedCopies', () => {
    it('is one without a cycle', () => {
        expect(wantedCopies(8, 3, false, true)).toBe(1);
        expect(wantedCopies(8, 3, true, false)).toBe(1);
        expect(wantedCopies(1, 3, true, true)).toBe(1);
    });

    it('is odd and gives each side enough slides for the view and a drag', () => {
        // view 3 + 1 = 4 slides on each side: 8 real slides fill it with one set each side
        expect(wantedCopies(8, 3, true, true)).toBe(3);
        // 2 real slides need 2 sets each side
        expect(wantedCopies(2, 3, true, true)).toBe(5);
        for (const real of [2, 3, 5, 9]) expect(wantedCopies(real, 5, true, true) % 2).toBe(1);
    });
});

describe('nearestSlide', () => {
    const base = { pitch: 100, total: 6, step: 1, cyclic: false };

    it('rounds the position to a slide', () => {
        expect(nearestSlide({ ...base, left: 149 })).toBe(1);
        expect(nearestSlide({ ...base, left: 151 })).toBe(2);
    });

    it('stops at the last place a view can start at', () => {
        expect(nearestSlide({ ...base, step: 3, left: 900 })).toBe(3);
        expect(nearestSlide({ ...base, left: -150 })).toBe(0);
    });

    it('goes round in a cycle', () => {
        expect(nearestSlide({ ...base, cyclic: true, left: 600 })).toBe(0);
        expect(nearestSlide({ ...base, cyclic: true, left: 700 })).toBe(1);
        expect(nearestSlide({ ...base, cyclic: true, left: -100 })).toBe(5);
    });

    it('is 0 while nothing is measured', () => {
        expect(nearestSlide({ ...base, pitch: 0, left: 300 })).toBe(0);
        expect(nearestSlide({ ...base, total: 0, left: 300 })).toBe(0);
    });
});

describe('cycleTarget', () => {
    // 5 real slides, 3 sets: the real one is the middle (base 5), the slots are 0..14
    it('an instant move stands in the real set', () => {
        expect(cycleTarget(14, 2, 5, 5, 3, true)).toBe(7);
    });

    it('a smooth move takes the copy nearest to where the strip is', () => {
        expect(cycleTarget(9.2, 0, 5, 5, 3, false)).toBe(10); // forward from the last slide: the first of the next set
        expect(cycleTarget(5.2, 4, 5, 5, 3, false)).toBe(4); // back from the first: the last of the previous set
        expect(cycleTarget(7, 2, 5, 5, 3, false)).toBe(7);
    });
});

describe('centerDistance', () => {
    it('is how far the slide is from the middle, at most two', () => {
        expect(centerDistance(3, 3)).toBe(0);
        expect(centerDistance(4, 3.5)).toBeCloseTo(0.5);
        expect(centerDistance(0, 9)).toBe(2);
    });
});

describe('useCarouselGlide', () => {
    beforeEach(() => {
        // performance.now() is what the glide measures time by: it moves with the fake clock
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'] });
        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16) as unknown as number);
        vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    function make(reduced = false) {
        const el = document.createElement('div');
        Object.defineProperty(el, 'scrollWidth', { value: 1000 });
        Object.defineProperty(el, 'clientWidth', { value: 200 });
        const setIndex = vi.fn();
        const recenter = vi.fn();
        const glide = useCarouselGlide({
            track: ref(el),
            pitch: () => 100,
            reducedMotion: ref(reduced),
            nearest: (left = el.scrollLeft) => Math.round(left / 100),
            setIndex,
            recenter,
        });
        return { el, glide, setIndex, recenter };
    }

    it('release speed is the pointer travel over the last 100 ms, flipped for the scroll', () => {
        const { glide } = make();
        glide.record(500);
        vi.advanceTimersByTime(40);
        glide.record(400);
        expect(glide.releaseVelocity()).toBeCloseTo(100 / 40, 1); // pointer left: content scrolls right
        expect(glide.releaseVelocity()).toBe(0); // the samples are forgotten
    });

    it('is 0 when the pointer stood still before letting go', () => {
        const { glide } = make();
        glide.record(500);
        vi.advanceTimersByTime(20);
        glide.record(450);
        vi.advanceTimersByTime(200);
        expect(glide.releaseVelocity()).toBe(0);
    });

    it('rolls to the target in frames, then recentres and tells where it landed', () => {
        const { el, glide, setIndex, recenter } = make();
        glide.glide(300, 0);
        expect(glide.gliding.value).toBe(true);
        expect(setIndex).toHaveBeenCalledWith(3);
        vi.advanceTimersByTime(2000);
        expect(el.scrollLeft).toBe(300);
        expect(glide.gliding.value).toBe(false);
        expect(recenter).toHaveBeenCalledTimes(1);
        expect(setIndex).toHaveBeenLastCalledWith(3);
    });

    it('cancel stops the roll where it is', () => {
        const { el, glide } = make();
        glide.glide(300, 0);
        vi.advanceTimersByTime(80);
        glide.cancel();
        const at = el.scrollLeft;
        vi.advanceTimersByTime(2000);
        expect(el.scrollLeft).toBe(at);
        expect(glide.gliding.value).toBe(false);
    });

    it('jumps at once with reduced motion', () => {
        const { el, glide } = make(true);
        glide.glide(300, 0);
        expect(el.scrollLeft).toBe(300);
        expect(glide.gliding.value).toBe(false);
    });

    it('target snaps to a slide and keeps inside the strip', () => {
        const { glide } = make();
        expect(glide.target(130, 0)).toBe(100);
        expect(glide.target(790, 5)).toBe(800); // the end of the strip: 1000 - 200
    });
});

describe('useCarouselPause', () => {
    function host() {
        const dragging = ref(false);
        const gliding = ref(false);
        let api!: ReturnType<typeof useCarouselPause>;
        const w = mount(
            defineComponent({
                setup() {
                    api = useCarouselPause({ dragging, gliding, alive: () => true });
                    return () => null;
                },
            }),
            { attachTo: document.body },
        );
        return { w, api, dragging, gliding };
    }

    it('is paused by a hover, a drag, a glide, the button and a hidden page, each on its own', async () => {
        const { w, api, dragging, gliding } = host();
        expect(api.paused.value).toBe(false);
        api.onMouseEnter();
        expect(api.paused.value).toBe(true);
        api.onMouseLeave();
        dragging.value = true;
        expect(api.paused.value).toBe(true);
        dragging.value = false;
        gliding.value = true;
        expect(api.paused.value).toBe(true);
        gliding.value = false;
        api.userPaused.value = true;
        expect(api.paused.value).toBe(true);
        api.userPaused.value = false;
        expect(api.paused.value).toBe(false);
        w.unmount();
    });

    it('a window that loses the focus drops the hover (the mouseleave is swallowed)', async () => {
        const { w, api } = host();
        api.onMouseEnter();
        window.dispatchEvent(new Event('blur'));
        expect(api.hoverPaused.value).toBe(false);
        api.onMouseEnter();
        window.dispatchEvent(new Event('pagehide'));
        expect(api.hoverPaused.value).toBe(false);
        w.unmount();
    });

    it('a hidden page pauses, a shown one resumes', async () => {
        const { w, api } = host();
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        expect(api.pageHidden.value).toBe(true);
        expect(api.paused.value).toBe(true);
        Object.defineProperty(document, 'hidden', { value: false, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        expect(api.paused.value).toBe(false);
        w.unmount();
    });

    it('stops listening when the component goes away', async () => {
        const { w, api } = host();
        w.unmount();
        await nextTick();
        api.onMouseEnter();
        window.dispatchEvent(new Event('blur'));
        expect(api.hoverPaused.value).toBe(true); // nobody drops it any more
    });
});
