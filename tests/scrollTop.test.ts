import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoScrollTop from '../src/components/TaoScrollTop.vue';
import { localeEn, setTaoLocale } from '../src/locale';

function scrollTo(y: number) {
    Object.defineProperty(window, 'pageYOffset', { value: y, configurable: true });
    window.dispatchEvent(new Event('scroll'));
}

// the button appears on a reverse scroll past `boundary`
async function shown(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
    scrollTo(0);
    const wrapper = mount(TaoScrollTop, { props: { boundary: 100, ...props }, attrs });
    scrollTo(1000);
    scrollTo(900);
    await nextTick();
    return wrapper;
}

afterEach(() => {
    setTaoLocale(localeEn);
    scrollTo(0);
});

describe('TaoScrollTop', () => {
    it('is solid, on the right, without a caption by default', async () => {
        const wrapper = await shown();
        expect(wrapper.find('.tao-scroll-top--solid').exists()).toBe(true);
        expect((wrapper.find('.tao-scroll-top-wrap').element as HTMLElement).style.right).toBe('24px');
        expect(wrapper.find('.tao-scroll-top__label').exists()).toBe(false);
    });

    it('side and offset place the wrapper; right stays an alias of offset', async () => {
        const left = await shown({ side: 'left', offset: 12 });
        const style = (left.find('.tao-scroll-top-wrap').element as HTMLElement).style;
        expect(style.left).toBe('12px');
        expect(style.right).toBe('');

        const alias = await shown({ right: 7 });
        expect((alias.find('.tao-scroll-top-wrap').element as HTMLElement).style.right).toBe('7px');
    });

    it('the caption opens towards the page, an explicit labelSide wins', async () => {
        const onRight = await shown({ label: 'Up' });
        expect(onRight.find('.tao-scroll-top__label--left').text()).toBe('Up');

        const onLeft = await shown({ label: 'Up', side: 'left' });
        expect(onLeft.find('.tao-scroll-top__label--right').exists()).toBe(true);

        const forced = await shown({ label: 'Up', side: 'left', labelSide: 'left' });
        expect(forced.find('.tao-scroll-top__label--left').exists()).toBe(true);
    });

    it('text variant always shows a caption, defaulting to the locale text, and has no circle', async () => {
        const wrapper = await shown({ variant: 'text' });
        expect(wrapper.find('.tao-scroll-top__text').text()).toBe('Back to top');
        expect(wrapper.find('.tao-scroll-top__label').exists()).toBe(false);
        expect(wrapper.find('.tao-scroll-top__ripple').exists()).toBe(false);
        expect((wrapper.find('button').element as HTMLElement).style.width).toBe('');
    });

    it('text variant puts the arrow at the edge: caption first on the right side, after it on the left', async () => {
        expect((await shown({ variant: 'text' })).find('button').classes()).toContain('tao-scroll-top--caption-left');
        expect((await shown({ variant: 'text', side: 'left' })).find('button').classes()).toContain(
            'tao-scroll-top--caption-right',
        );
    });

    it('always has an accessible name: ariaLabel, then label, then the locale text', async () => {
        expect((await shown()).find('button').attributes('aria-label')).toBe('Back to top');
        expect((await shown({ label: 'Up' })).find('button').attributes('aria-label')).toBe('Up');
        expect((await shown({ label: 'Up', ariaLabel: 'Scroll up' })).find('button').attributes('aria-label')).toBe('Scroll up');
    });

    it('fall-through attributes land on the button', async () => {
        const wrapper = await shown({}, { 'data-test': 'x' });
        expect(wrapper.find('button').attributes('data-test')).toBe('x');
        expect(wrapper.find('.tao-scroll-top-wrap').attributes('data-test')).toBeUndefined();
    });
});

describe('TaoScrollTop: empty label', () => {
    it('hides the caption of the text variant, leaving just the arrow button with a name', async () => {
        const wrapper = await shown({ variant: 'text', label: '' });
        expect(wrapper.find('.tao-scroll-top__text').exists()).toBe(false);
        expect(wrapper.find('svg').exists()).toBe(true);
        expect(wrapper.find('button').attributes('aria-label')).toBe('Back to top');
    });

    it('shows no hover caption for solid either', async () => {
        expect((await shown({ label: '' })).find('.tao-scroll-top__label').exists()).toBe(false);
    });
});
