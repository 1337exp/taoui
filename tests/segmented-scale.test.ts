import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import TaoSegmented from '../src/components/TaoSegmented.vue';
import TaoSegmentedOption from '../src/components/TaoSegmentedOption.vue';

// 5.32.2: the thumb of a TaoSegmented was measured in screen px and drawn in layout px, so inside a scaled parent (a zoomed
// canvas) it was too small and sat in the wrong place; and a change of the zoom does not resize the track, so it stayed so.
// 5.32.2: плашка TaoSegmented мерилась в экранных px, а рисовалась в px вёрстки: внутри масштабированного предка (холст с зумом)
// она была мала и стояла не там; а смена зума трек не меняет по размеру, так что так и оставалась.

const Host = defineComponent({
    props: { value: { type: String, default: 'b' } },
    setup: (props) => () =>
        h(TaoSegmented, { modelValue: props.value }, () => [
            h(TaoSegmentedOption, { value: 'a' }, () => 'A'),
            h(TaoSegmentedOption, { value: 'b' }, () => 'B'),
            h(TaoSegmentedOption, { value: 'c' }, () => 'C'),
        ]),
});

const box = (left: number, top: number, width: number, height: number) =>
    ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

/** A track of 300 × 40 layout px whose options are 100 wide, drawn at `scale`, its screen origin at (50, 20). / Трек 300 × 40 px вёрстки, варианты по 100, нарисован в масштабе `scale`. */
function layout(w: ReturnType<typeof mount>, scale: number, checked = 1) {
    const track = w.find('.tao-segmented__track').element as HTMLElement;
    Object.defineProperty(track, 'offsetWidth', { configurable: true, value: 300 });
    Object.defineProperty(track, 'offsetHeight', { configurable: true, value: 40 });
    track.getBoundingClientRect = () => box(50, 20, 300 * scale, 40 * scale);
    w.findAll('.tao-segmented-option').forEach((o, i) => {
        o.element.getBoundingClientRect = () => box(50 + i * 100 * scale, 20, 100 * scale, 40 * scale);
    });
    return { track, checked };
}

const thumb = (w: ReturnType<typeof mount>) => w.find('.tao-segmented__thumb').attributes('style') ?? '';

describe('TaoSegmented thumb in a scaled parent', () => {
    let w: ReturnType<typeof mount>;
    afterEach(() => w?.unmount());

    it('is as large as the option in layout px, at any scale', async () => {
        for (const scale of [1, 0.5, 1.6]) {
            w = mount(Host, { attachTo: document.body });
            layout(w, scale);
            await w.setProps({ value: 'c' });
            await nextTick();
            await nextTick();
            expect(thumb(w), `scale ${scale}`).toContain('width: 100px');
            expect(thumb(w), `scale ${scale}`).toContain('height: 40px');
            expect(thumb(w), `scale ${scale}`).toContain('translate(200px, 0px)');
            w.unmount();
        }
    });

    it('moves by layout px to the picked option', async () => {
        w = mount(Host, { attachTo: document.body });
        layout(w, 0.5);
        await w.setProps({ value: 'a' });
        await nextTick();
        await nextTick();
        expect(thumb(w)).toContain('translate(0px, 0px)');
        await w.setProps({ value: 'b' });
        await nextTick();
        await nextTick();
        expect(thumb(w)).toContain('translate(100px, 0px)');
    });

    it('keeps the borders of the track out of the offset', async () => {
        w = mount(Host, { attachTo: document.body });
        const { track } = layout(w, 0.5);
        Object.defineProperty(track, 'clientLeft', { configurable: true, value: 1 });
        Object.defineProperty(track, 'clientTop', { configurable: true, value: 1 });
        await w.setProps({ value: 'b' });
        await nextTick();
        await nextTick();
        expect(thumb(w)).toContain('translate(99px, -1px)');
    });

    it('draws the same without a layout (SSR, jsdom): the scale is 1', async () => {
        w = mount(Host, { attachTo: document.body });
        const track = w.find('.tao-segmented__track').element as HTMLElement;
        track.getBoundingClientRect = () => box(0, 0, 0, 0);
        w.findAll('.tao-segmented-option').forEach((o) => (o.element.getBoundingClientRect = () => box(120, 0, 80, 30)));
        await w.setProps({ value: 'c' });
        await nextTick();
        await nextTick();
        expect(thumb(w)).toContain('width: 80px');
        expect(thumb(w)).toContain('translate(120px, 0px)');
    });
});
