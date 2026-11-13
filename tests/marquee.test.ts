import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import TaoMarquee from '../src/components/TaoMarquee.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import source from '../src/components/TaoMarquee.vue?raw';

// One line that runs round when it does not fit, stands still when it does, and can always be stopped.
// Одна строка: бежит, когда не помещается, стоит, когда помещается, и её всегда можно остановить.

const wrappers: VueWrapper[] = [];
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    vi.restoreAllMocks();
});

/** Mounts with a box of `box` px and a line of `line` px (happy-dom has no layout). / Монтирует с заданными ширинами. */
async function marquee(box: number, line: number, props: Record<string, unknown> = {}, reduce = false) {
    vi.spyOn(window, 'matchMedia').mockImplementation(
        (query: string) => ({ matches: reduce && query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
        return this.classList.contains('tao-marquee') ? box : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = this.classList.contains('tao-marquee__meter') ? line : 0;
        return { width, height: 20, top: 0, left: 0, right: width, bottom: 20, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    const w = mount(TaoMarquee, { props: { text: 'North Paper Mill', ...props }, attachTo: document.body });
    wrappers.push(w);
    await nextTick();
    await nextTick();
    return w;
}

describe('TaoMarquee', () => {
    it('a line that fits stands still: one copy, no tab stop, no mask', async () => {
        const w = await marquee(300, 120);
        expect(w.classes()).not.toContain('tao-marquee--run');
        expect(w.findAll('.tao-marquee__item')).toHaveLength(1);
        expect(w.attributes('tabindex')).toBeUndefined();
    });

    it('a line that does not fit runs: a second copy, hidden and inert, and a tab stop to stop it from the keyboard', async () => {
        const w = await marquee(100, 240);
        expect(w.classes()).toContain('tao-marquee--run');
        const items = w.findAll('.tao-marquee__item');
        expect(items).toHaveLength(2);
        expect(items[1]!.attributes('aria-hidden')).toBe('true');
        expect(items[1]!.attributes('inert')).toBeDefined();
        expect(w.attributes('tabindex')).toBe('0');
    });

    it('the speed and the gap make the round: one line plus the gap at speed px per second', async () => {
        const w = await marquee(100, 240, { speed: 50, gap: 60 });
        const style = w.find('.tao-marquee__track').attributes('style')!;
        expect(style).toContain('--_shift: -300px');
        expect(style).toContain('--_duration: 6.00s');
        expect(style).toContain('--_gap: 60px');
    });

    it('a tap stops and starts it; a mouse click does not (it has hover)', async () => {
        const w = await marquee(100, 240);
        const tap = (pointerType: string) => w.element.dispatchEvent(Object.assign(new Event('pointerup', { bubbles: true }), { pointerType }));
        tap('mouse');
        await nextTick();
        expect(w.classes()).not.toContain('tao-marquee--stopped');
        tap('touch');
        await nextTick();
        expect(w.classes()).toContain('tao-marquee--stopped');
        tap('touch');
        await nextTick();
        expect(w.classes()).not.toContain('tao-marquee--stopped');
    });

    it('pauseOnHover off: a tap does not stop it, and the running line cannot be selected', async () => {
        const w = await marquee(100, 240, { pauseOnHover: false });
        expect(w.classes()).not.toContain('tao-marquee--hover-pause');
        w.element.dispatchEvent(Object.assign(new Event('pointerup', { bubbles: true }), { pointerType: 'touch' }));
        await nextTick();
        expect(w.classes()).not.toContain('tao-marquee--stopped');
        expect(source).toMatch(/\.tao-marquee--run:not\(\.tao-marquee--hover-pause\) \{\s*user-select: none/);
        // focus still stops it and it stays a tab stop: the keyboard keeps its way to stop moving content
        expect(w.attributes('tabindex')).toBe('0');
    });

    it('decorative: a ghost, hidden, inert, no tab stop, no tap, no pause between rounds', async () => {
        const w = await marquee(100, 240, { decorative: true });
        expect(w.attributes('aria-hidden')).toBe('true');
        expect(w.attributes('inert')).toBeDefined();
        expect(w.attributes('tabindex')).toBeUndefined();
        expect(w.classes()).toContain('tao-marquee--ghost');
        expect(w.classes()).toContain('tao-marquee--seamless');
        expect(w.classes()).not.toContain('tao-marquee--hover-pause');
        w.element.dispatchEvent(Object.assign(new Event('pointerup', { bubbles: true }), { pointerType: 'touch' }));
        await nextTick();
        expect(w.classes()).not.toContain('tao-marquee--stopped');
        expect(source).toMatch(/\.tao-marquee--ghost \{\s*pointer-events: none;\s*user-select: none/);
    });

    it('a decorative line under reduced motion stands still and does not wrap', async () => {
        const w = await marquee(100, 240, { decorative: true }, true);
        expect(w.classes()).not.toContain('tao-marquee--wrap');
        expect(w.classes()).not.toContain('tao-marquee--run');
    });

    it('roundPause: an ordinary line rests at the start of a round, off it does not; a decorative one does not unless asked', async () => {
        expect((await marquee(100, 240)).classes()).not.toContain('tao-marquee--seamless');
        expect((await marquee(100, 240, { roundPause: false })).classes()).toContain('tao-marquee--seamless');
        expect((await marquee(100, 240, { decorative: true })).classes()).toContain('tao-marquee--seamless');
        expect((await marquee(100, 240, { decorative: true, roundPause: true })).classes()).not.toContain('tao-marquee--seamless');
        expect(source).toContain('@keyframes tao-marquee-seamless');
    });

    it('paused stops it from the app', async () => {
        expect((await marquee(100, 240, { paused: true })).classes()).toContain('tao-marquee--stopped');
    });

    it('with reduced motion it does not run: the line wraps like plain text', async () => {
        const w = await marquee(100, 240, {}, true);
        expect(w.classes()).toContain('tao-marquee--wrap');
        expect(w.classes()).not.toContain('tao-marquee--run');
        expect(w.findAll('.tao-marquee__item')).toHaveLength(1);
    });

    it('the slot takes inline content; its copies are hidden and inert, so a link is one tab stop', async () => {
        vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList);
        vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
            return this.classList.contains('tao-marquee') ? 100 : 0;
        });
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
            const width = this.classList.contains('tao-marquee__meter') ? 400 : 0;
            return { width, height: 20, top: 0, left: 0, right: width, bottom: 20, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
        });
        const w = mount(TaoMarquee, { slots: { default: () => h('a', { href: '#x' }, 'Listen on Spotify') }, attachTo: document.body });
        wrappers.push(w);
        await nextTick();
        await nextTick();
        const links = w.findAll('a');
        expect(links).toHaveLength(3); // the measured copy, the line, the second round
        const live = links.filter((a) => !a.element.closest('[inert]'));
        expect(live).toHaveLength(1);
    });

    it('it stops on hover (unless pauseOnHover is off), on focus inside, and only moves transform', () => {
        expect(source).toContain('.tao-marquee--hover-pause.tao-marquee--run:hover .tao-marquee__track');
        expect(source).toContain('.tao-marquee--run:focus-within .tao-marquee__track');
        expect(source).toMatch(/@keyframes tao-marquee \{[^@]*transform: translateX\(var\(--_shift\)\)/);
        expect(source).toContain('@media (prefers-reduced-motion: no-preference)');
    });

    // 5.39.0: fill, reverse, and the content is watched. / 5.39.0: fill, reverse и слежение за содержимым.
    it('fill: a line that fits runs too, repeated until the copies cover the box and one more', async () => {
        const w = await marquee(300, 100, { fill: true, gap: 48 }); // a round is 148px: 3 cover 300px, plus one
        expect(w.classes()).toContain('tao-marquee--run');
        const items = w.findAll('.tao-marquee__item');
        expect(items).toHaveLength(4);
        expect(items[0]!.attributes('aria-hidden')).toBeUndefined();
        for (const copy of items.slice(1)) {
            expect(copy.attributes('aria-hidden')).toBe('true');
            expect(copy.attributes('inert')).toBeDefined();
        }
        expect(w.attributes('tabindex')).toBe('0');
        expect(w.find('.tao-marquee__track').attributes('style')).toContain('--_shift: -148px');
    });

    it('fill: a line wider than the box still has two copies, an empty one has nothing to repeat, reduced motion stands still', async () => {
        expect((await marquee(100, 240, { fill: true })).findAll('.tao-marquee__item')).toHaveLength(2);
        expect((await marquee(300, 0, { fill: true, text: '' })).classes()).not.toContain('tao-marquee--run');
        const still = await marquee(300, 100, { fill: true }, true);
        expect(still.classes()).not.toContain('tao-marquee--run');
        expect(still.findAll('.tao-marquee__item')).toHaveLength(1);
    });

    it('reverse runs the same round the other way', async () => {
        const w = await marquee(100, 240, { reverse: true });
        expect(w.classes()).toContain('tao-marquee--reverse');
        expect((await marquee(100, 240)).classes()).not.toContain('tao-marquee--reverse');
        expect(source).toMatch(/\.tao-marquee--run\.tao-marquee--reverse \.tao-marquee__track \{[^}]*animation-direction: reverse/);
    });

    it('measures again when the content changes, with nobody calling measure()', async () => {
        const watched: Element[] = [];
        let notify: () => void = () => {};
        class FakeObserver {
            constructor(callback: () => void) {
                notify = callback;
            }
            observe(el: Element) {
                watched.push(el);
            }
            disconnect() {}
        }
        vi.stubGlobal('ResizeObserver', FakeObserver);
        vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList);
        vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
            return this.classList.contains('tao-marquee') ? 200 : 0;
        });
        let line = 120;
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
            const width = this.classList.contains('tao-marquee__meter') ? line : 0;
            return { width, height: 20, top: 0, left: 0, right: width, bottom: 20, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
        });
        const w = mount(TaoMarquee, { props: { text: 'AAPL 189.20' }, attachTo: document.body });
        wrappers.push(w);
        await nextTick();
        expect(watched.map((el) => el.className)).toEqual(expect.arrayContaining([expect.stringContaining('tao-marquee'), 'tao-marquee__meter']));
        expect(w.classes()).not.toContain('tao-marquee--run');

        line = 320; // the prices changed and the line grew; the box did not
        notify();
        await nextTick();
        expect(w.classes()).toContain('tao-marquee--run');
        vi.unstubAllGlobals();
    });
});
