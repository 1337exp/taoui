import { mount } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import TaoSegmented from '../src/components/TaoSegmented.vue';
import TaoSegmentedOption from '../src/components/TaoSegmentedOption.vue';

// 5.49.2: a caption of a TaoSegmented that did not fit was cut off by the track without a trace (the `block` ellipsis rule matched
// nothing: the label is not a child of the track). Now it wraps to a second line, ends in an ellipsis, and the full text is the title.
// 5.49.2: подпись TaoSegmented, которая не влезла, срезалась дорожкой без следа (правило многоточия для `block` ничего не находило:
// подпись не ребёнок дорожки). Теперь она переносится на вторую строку, кончается многоточием, а полный текст — в title.
const read = (file: string) => readFileSync(join(__dirname, '../src/components', file), 'utf8').replace(/\r\n/g, '\n');
const optionCss = read('TaoSegmentedOption.vue');
const groupCss = read('TaoSegmented.vue');

describe('TaoSegmented captions that do not fit (CSS)', () => {
    it('lets an option shrink and the label wrap to two lines with an ellipsis', () => {
        expect(optionCss).toMatch(/\.tao-segmented-option \{[^}]*flex: 0 1 auto;/);
        expect(optionCss).toMatch(/\.tao-segmented-option__label \{[^}]*-webkit-line-clamp: 2;[^}]*overflow: hidden;/);
        expect(optionCss).toMatch(/\.tao-segmented-option__face \{(?![^}]*white-space: nowrap)[^}]*\}/);
    });

    it('has no rule for a label as a direct child of the track (it never matched)', () => {
        expect(groupCss).not.toMatch(/__track > :deep\(\.tao-segmented-option__label\)/);
    });
});

const Host = defineComponent({
    setup: () => () =>
        h(TaoSegmented, { modelValue: 'a' }, () => [
            h(TaoSegmentedOption, { value: 'a' }, () => ' every month without fail '),
            h(TaoSegmentedOption, { value: 'b' }, () => 'once'),
        ]),
});

describe('TaoSegmentedOption title for a cut caption', () => {
    let w: ReturnType<typeof mount>;
    afterEach(() => w?.unmount());

    const size = (el: Element, scroll: number, client: number) => {
        Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scroll });
        Object.defineProperty(el, 'clientHeight', { configurable: true, value: client });
    };

    it('shows the full text on hover only when the label is cut', async () => {
        w = mount(Host);
        const [first, second] = w.findAll('.tao-segmented-option');
        size(first.find('.tao-segmented-option__label').element, 60, 33);
        size(second.find('.tao-segmented-option__label').element, 16, 16);

        expect(first.attributes('title')).toBeUndefined();
        await first.trigger('mouseenter');
        await second.trigger('mouseenter');
        expect(first.attributes('title')).toBe('every month without fail');
        expect(second.attributes('title')).toBeUndefined();
    });

    it('drops the title when the caption fits again', async () => {
        w = mount(Host);
        const first = w.findAll('.tao-segmented-option')[0];
        const label = first.find('.tao-segmented-option__label').element;
        size(label, 60, 33);
        await first.trigger('mouseenter');
        expect(first.attributes('title')).toBeDefined();
        size(label, 16, 16);
        await first.trigger('mouseenter');
        expect(first.attributes('title')).toBeUndefined();
    });
});
