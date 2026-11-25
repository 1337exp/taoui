import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick, ref } from 'vue';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
import TaoDate from '../src/components/TaoDate.vue';
import TaoFormField from '../src/components/TaoFormField.vue';
import TaoInputNumber from '../src/components/TaoInputNumber.vue';
import TaoRadio from '../src/components/TaoRadio.vue';
import TaoRadioGroup from '../src/components/TaoRadioGroup.vue';
import TaoRangeSlider from '../src/components/TaoRangeSlider.vue';
import TaoSlider from '../src/components/TaoSlider.vue';
import TaoSwitch from '../src/components/TaoSwitch.vue';
import { useCarouselGlide } from '../src/carouselGlide';
import { nativeFieldAttrs } from '../src/formField';
import type { TaoTreeNode } from '../src/tree';
import { useTreeLoad } from '../src/treeLoad';

// The findings of the Grok review of v6, each checked by a test before it was fixed (docs/v6/grok/review.md).
// Находки ревью Grok по v6: каждая проверена тестом до исправления.

afterEach(() => {
    document.body.innerHTML = '';
});

describe('review 1: a finished pick that keeps the value still closes TaoDate', () => {
    it('clicking the selected day closes the calendar', async () => {
        const w = mount(TaoDate, { props: { modelValue: '2026-03-10', locale: 'en-US' }, attachTo: document.body });
        const trigger = w.find('button.tao-date__trigger');
        await trigger.trigger('click');
        await nextTick();
        expect(trigger.attributes('aria-expanded')).toBe('true');
        const day = [...document.querySelectorAll<HTMLElement>('[role="gridcell"]')].find((el) => el.textContent?.trim() === '10' && !el.className.includes('outside'))!;
        day.click();
        await nextTick();
        expect(trigger.attributes('aria-expanded')).toBe('false');
        w.unmount();
    });
});

describe('review 2: a failed reload leaves the children as they were', () => {
    it('keeps the old list and tells the app', async () => {
        const folder: TaoTreeNode = { id: 'src', label: 'src', hasChildren: true };
        const kids: TaoTreeNode[] = [{ id: 'a', label: 'a' }];
        const load = vi.fn<(node: TaoTreeNode) => Promise<TaoTreeNode[]>>().mockResolvedValueOnce(kids).mockRejectedValueOnce(new Error('no'));
        const expanded = ref(new Set<string>());
        const failed = vi.fn();
        const lazy = useTreeLoad({
            load: () => load,
            expanded: () => expanded.value,
            setExpanded: (ids) => (expanded.value = ids),
            checked: () => new Set(),
            setChecked: () => {},
            children: (node) => lazy.raw(node),
            failed,
        });
        await lazy.expand({ node: folder, level: 1, parentId: null, posinset: 1, setsize: 1, branch: true, expanded: false });
        await lazy.reload(folder);
        expect(failed).toHaveBeenCalledTimes(1);
        expect(lazy.raw(folder)).toEqual(kids);
    });
});

describe('review 3: a glide that jumps still recentres the cycle', () => {
    it('with reduced motion', () => {
        const el = document.createElement('div');
        const recenter = vi.fn();
        const setIndex = vi.fn();
        const glide = useCarouselGlide({ track: ref(el), pitch: () => 100, reducedMotion: ref(true), nearest: (left = el.scrollLeft) => Math.round(left / 100), setIndex, recenter });
        glide.glide(300, 0);
        expect(el.scrollLeft).toBe(300);
        expect(recenter).toHaveBeenCalledTimes(1);
        expect(setIndex).toHaveBeenLastCalledWith(3);
    });

    it('when the target is already under one pixel away', () => {
        const el = document.createElement('div');
        el.scrollLeft = 300;
        const recenter = vi.fn();
        const glide = useCarouselGlide({ track: ref(el), pitch: () => 100, reducedMotion: ref(false), nearest: (left = el.scrollLeft) => Math.round(left / 100), setIndex: vi.fn(), recenter });
        glide.glide(300.4, 0);
        expect(recenter).toHaveBeenCalledTimes(1);
    });
});

describe('review 4: a parent that refuses leaves no flipped control', () => {
    it('TaoSwitch', async () => {
        const w = mount(TaoSwitch, { props: { modelValue: false, 'onUpdate:modelValue': () => {} }, attachTo: document.body });
        const input = w.find('input');
        (input.element as HTMLInputElement).click();
        await nextTick();
        await nextTick();
        expect((input.element as HTMLInputElement).checked).toBe(false);
    });

    it('TaoCheckbox', async () => {
        const w = mount(TaoCheckbox, { props: { modelValue: false, 'onUpdate:modelValue': () => {} }, attachTo: document.body });
        const input = w.find('input');
        (input.element as HTMLInputElement).click();
        await nextTick();
        await nextTick();
        expect((input.element as HTMLInputElement).checked).toBe(false);
    });

    it('TaoRadio', async () => {
        const w = mount(TaoRadio, { props: { value: 'a', modelValue: 'b', 'onUpdate:modelValue': () => {} }, attachTo: document.body });
        const input = w.find('input');
        (input.element as HTMLInputElement).click();
        await nextTick();
        await nextTick();
        expect((input.element as HTMLInputElement).checked).toBe(false);
    });

    it('and a parent that follows still moves them', async () => {
        const w = mount(TaoSwitch, { props: { modelValue: false, 'onUpdate:modelValue': (v: boolean) => w.setProps({ modelValue: v }) }, attachTo: document.body });
        (w.find('input').element as HTMLInputElement).click();
        await nextTick();
        await nextTick();
        expect((w.find('input').element as HTMLInputElement).checked).toBe(true);
    });
});

describe('review 5: autofocus on a radio in a group focuses the radio', () => {
    it('inside a TaoFormField and a TaoRadioGroup', async () => {
        const w = mount(TaoFormField, {
            props: { label: 'Pick' },
            slots: { default: () => h(TaoRadioGroup, { modelValue: 'a' }, () => [h(TaoRadio, { value: 'a', autofocus: true }), h(TaoRadio, { value: 'b' })]) },
            attachTo: document.body,
        });
        await nextTick();
        expect(document.activeElement).toBe(w.findAll('input[type=radio]')[0]!.element);
    });
});

describe('review 8: TaoInputNumber commits once, and only for a change', () => {
    it('Enter then blur is one commit', async () => {
        const w = mount(TaoInputNumber, { props: { modelValue: 1 }, attachTo: document.body });
        const input = w.find('input');
        await input.trigger('focus');
        (input.element as HTMLInputElement).value = '4';
        await input.trigger('input');
        await input.trigger('keydown', { key: 'Enter' });
        await input.trigger('blur');
        expect(w.emitted('commit')).toEqual([[4]]);
    });

    it('a blur that changed nothing is not a commit', async () => {
        const w = mount(TaoInputNumber, { props: { modelValue: 3 } });
        await w.find('input').trigger('focus');
        await w.find('input').trigger('blur');
        expect(w.emitted('commit')).toBeUndefined();
    });
});

describe('review 9: a range that did not move says nothing', () => {
    it('a key at the end of the scale emits no update', async () => {
        const w = mount(TaoRangeSlider, { props: { modelValue: [0, 5] as [number, number], min: 0, max: 10 } });
        await w.findAll('.tao-slider__thumb')[0]!.trigger('keydown', { key: 'Home' });
        expect(w.emitted('update:modelValue')).toBeUndefined();
        expect(w.emitted('commit')).toBeUndefined();
    });
});

describe('review 10: nativeFieldAttrs does not wipe an attribute it does not own', () => {
    it('no readonly key when readOnly is not a prop of the control', () => {
        expect('readonly' in nativeFieldAttrs({ name: 'q' })).toBe(false);
        expect(nativeFieldAttrs({ readOnly: true }).readonly).toBe(true);
        expect('readonly' in nativeFieldAttrs({ readOnly: false })).toBe(true);
    });
});

describe('review 11: a gesture that never ended by the user is not committed', () => {
    beforeEach(() => {
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
            const width = this.classList.contains('tao-slider__rail') ? 200 : 16;
            return { x: 0, y: 0, left: 0, top: 0, right: width, bottom: 8, width, height: 8, toJSON: () => ({}) } as DOMRect;
        });
    });
    afterEach(() => vi.restoreAllMocks());

    it('TaoSlider: unmounting in the middle of a drag commits nothing', async () => {
        const commits: number[] = [];
        const w = mount(TaoSlider, {
            props: {
                modelValue: 0,
                min: 0,
                max: 100,
                'onUpdate:modelValue': (v: number) => void w.setProps({ modelValue: v }),
                onCommit: (v: number) => commits.push(v),
            },
            attachTo: document.body,
        });
        const rail = w.find('.tao-slider__rail');
        await rail.trigger('pointerdown', { pointerId: 1, clientX: 50, button: 0 });
        await rail.trigger('pointermove', { pointerId: 1, clientX: 100 });
        w.unmount();
        expect(commits).toEqual([]);
    });
});
