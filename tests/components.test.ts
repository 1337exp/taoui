import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { warnDeprecated } from '../src/deprecate';
import TaoAlert from '../src/components/TaoAlert.vue';
import TaoBlock from '../src/components/TaoBlock.vue';
import TaoButton from '../src/components/TaoButton.vue';
import TaoCard from '../src/components/TaoCard.vue';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
import TaoCopy from '../src/components/TaoCopy.vue';
import TaoDropdownMenu from '../src/components/TaoDropdownMenu.vue';
import TaoInput from '../src/components/TaoInput.vue';
import TaoInputNumber from '../src/components/TaoInputNumber.vue';
import TaoPagination from '../src/components/TaoPagination.vue';
import TaoPinCode from '../src/components/TaoPinCode.vue';
import TaoSegmented from '../src/components/TaoSegmented.vue';
import TaoSelect from '../src/components/TaoSelect.vue';
import TaoTimeline from '../src/components/TaoTimeline.vue';
import TaoSlider from '../src/components/TaoSlider.vue';
import TaoRangeSlider from '../src/components/TaoRangeSlider.vue';
import TaoSpace from '../src/components/TaoSpace.vue';
import TaoSpoiler from '../src/components/TaoSpoiler.vue';
import TaoStages from '../src/components/TaoStages.vue';
import TaoTable from '../src/components/TaoTable.vue';
import TaoTabs from '../src/components/TaoTabs.vue';
import TaoTag from '../src/components/TaoTag.vue';
import TaoTextarea from '../src/components/TaoTextarea.vue';
import { localeEn, localeRu, setTaoLocale } from '../src/locale';

const cls = (el: Element) => el.className;

const last = <T,>(list: T[]): T => list[list.length - 1]!;

describe('sizes', () => {
    it('explicit size adds the size class, no size inherits', () => {
        expect(cls(mount(TaoInput, { props: { size: 'small' } }).element)).toContain('tao-size-small');
        expect(cls(mount(TaoInput).element)).not.toContain('tao-size-');
    });
});

describe('surfaces', () => {
    it('Card / Block get the surface class, flat keeps the plain look', () => {
        expect(cls(mount(TaoCard, { props: { surface: 'grain' } }).element)).toContain('tao-surface-grain');
        expect(cls(mount(TaoBlock, { props: { surface: 'glass' } }).element)).toContain('tao-surface-glass');
        expect(cls(mount(TaoCard).element)).not.toContain('tao-surface-');
    });
});

describe('fields: error', () => {
    it('error marks the field invalid', () => {
        const w = mount(TaoInputNumber, { props: { error: true, modelValue: 1 } });
        expect(cls(w.element)).toContain('tao-input-number--invalid');
        expect(w.find('input').attributes('aria-invalid')).toBe('true');
    });
});

describe('names removed in 5.0 stay removed', () => {
    // component → props / events that 2.0 deprecated and 5.0 deleted; the 5.0 names are covered by the tests around them
    const removed: [string, object, string[]][] = [
        ['TaoAlert', TaoAlert, ['type']],
        ['TaoTag', TaoTag, ['type', 'pointer']],
        ['TaoTabs', TaoTabs, ['tabs']],
        ['TaoCheckbox', TaoCheckbox, ['value']],
        ['TaoPinCode', TaoPinCode, ['hidden']],
        ['TaoSpace', TaoSpace, ['vertical']],
        ['TaoStages', TaoStages, ['vertical']],
        ['TaoCopy', TaoCopy, ['successMessage']],
        ['TaoInput', TaoInput, ['label', 'errorMessage']],
        ['TaoTextarea', TaoTextarea, ['noBorder', 'noBackground', 'dummy', 'textCenter', 'autoFocus', 'submitOnEnter', 'borderInverse']],
        ['TaoTable', TaoTable, ['compact']],
    ];

    it.each(removed)('%s has none of the removed props', (_name, component, names) => {
        const props = Object.keys(((component as { props?: object }).props ?? {}));
        expect(names.filter((name) => props.includes(name))).toEqual([]);
    });

    it('removed events are not emitted any more', async () => {
        const table = mount(TaoTable, { props: { columns: [{ key: 'name', label: 'Name', sortable: true }], rows: [] } });
        await table.find('.tao-table__sort-btn').trigger('click');
        expect(table.emitted('sort')).toBeUndefined();
        expect(table.emitted('change')).toHaveLength(1);
    });
});

describe('deprecation machinery', () => {
    // nothing is deprecated right now; this keeps the helper alive for the next removals
    afterEach(() => vi.restoreAllMocks());

    const Probe = defineComponent({
        props: { oldName: { type: String, default: undefined }, newName: { type: String, default: undefined } },
        setup() {
            warnDeprecated('Probe', { oldName: 'use `newName`' }, '9.0');
            return () => h('i');
        },
    });

    it('warns once about a passed old prop, never about the new one, and names the version', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        mount(Probe, { props: { newName: 'x' } });
        expect(warn).not.toHaveBeenCalled();
        mount(Probe, { props: { oldName: 'x' } });
        mount(Probe, { props: { oldName: 'x' } });
        expect(warn).toHaveBeenCalledTimes(1);
        expect(String(warn.mock.calls[0]![0])).toContain('Probe: prop "oldName" is deprecated — use `newName`. It will be removed in 9.0.');
    });
});

describe('events', () => {
    it('Tabs: change only when another tab is picked', async () => {
        const w = mount(TaoTabs, {
            props: { items: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], modelValue: 'a' },
        });
        const tabs = w.findAll('.tao-tabs__tab');
        await tabs[0]!.trigger('click');
        expect(w.emitted('change')).toBeUndefined();
        await tabs[1]!.trigger('click');
        expect(w.emitted('change')).toEqual([['b']]);
    });

    it('Spoiler: change on toggle', async () => {
        const w = mount(TaoSpoiler, { props: { title: 'T' } });
        await w.find('.tao-spoiler__header').trigger('click');
        expect(w.emitted('change')).toEqual([[true]]);
    });

    it('Table: change and update:sort on header click', async () => {
        const w = mount(TaoTable, {
            props: { columns: [{ key: 'name', label: 'Name', sortable: true }], rows: [] },
        });
        await w.find('.tao-table__sort-btn').trigger('click');
        expect(w.emitted('change')?.[0]).toEqual(w.emitted('update:sort')?.[0]);
    });

    it('DropdownMenu: select', async () => {
        const w = mount(TaoDropdownMenu, { props: { actions: [{ id: 'edit', name: 'Edit' }] }, attachTo: document.body });
        await w.find('.tao-dropdown-menu__button').trigger('click');
        await nextTick();
        // the list is teleported to body / список телепортирован в body
        document.querySelector<HTMLButtonElement>('.tao-dropdown-menu__item')!.click();
        expect(w.emitted('select')).toEqual([['edit']]);
        w.unmount();
    });

    it('Slider: change after a key press, not when the value stays', async () => {
        const w = mount(TaoSlider, { props: { modelValue: 0, min: 0, max: 10 } });
        const thumb = w.find('.tao-slider__thumb');
        await thumb.trigger('keydown', { key: 'ArrowRight' });
        expect(w.emitted('change')).toEqual([[1]]);
        await w.setProps({ modelValue: 0 });
        await thumb.trigger('keydown', { key: 'Home' });
        expect(w.emitted('change')).toHaveLength(1);
    });

    it('Slider: a range has two thumbs, each moves on its own and they keep the gap', async () => {
        const w = mount(TaoRangeSlider, { props: { modelValue: [2, 6] as [number, number], min: 0, max: 10, minGap: 1 } });
        const thumbs = w.findAll('.tao-slider__thumb');
        expect(thumbs).toHaveLength(2);

        await thumbs[0]!.trigger('keydown', { key: 'ArrowRight' });
        expect(last(w.emitted('update:modelValue')!)).toEqual([[3, 6]]);

        await thumbs[1]!.trigger('keydown', { key: 'Home' });
        expect(last(w.emitted('update:modelValue')!)).toEqual([[2, 3]]); // не ближе зазора к нижней ручке
    });

    it('Slider: marks are drawn, a click on a stepped mark sets the value', async () => {
        const marks = [{ value: 0, label: 'S' }, { value: 5, label: 'M' }, { value: 10, label: 'L' }];
        const w = mount(TaoSlider, { props: { modelValue: 0, min: 0, max: 10, marks, discrete: true } });
        expect(w.findAll('.tao-slider__mark').map((m) => m.text())).toEqual(['S', 'M', 'L']);
        expect(w.findAll('.tao-slider__mark--active')).toHaveLength(1); // подсвечена метка в закрашенной части

        await w.findAll('.tao-slider__mark')[2]!.trigger('click');
        expect(last(w.emitted('update:modelValue')!)).toEqual([10]);
        expect(last(w.emitted('change')!)).toEqual([10]);

        await w.setProps({ modelValue: 5 });
        await w.find('.tao-slider__thumb').trigger('keydown', { key: 'ArrowRight' });
        expect(last(w.emitted('update:modelValue')!)).toEqual([10]); // стрелка идёт по меткам, а не по шагу
    });

    it('Slider: vertical, aria and the id for a label', () => {
        const w = mount(TaoSlider, { props: { modelValue: 3, vertical: true } });
        expect(w.classes()).toContain('tao-slider--vertical');
        const thumb = w.find('.tao-slider__thumb');
        expect(thumb.attributes('aria-orientation')).toBe('vertical');
        expect(thumb.attributes('role')).toBe('slider');
        expect(thumb.attributes('id')).toBeTruthy();
    });
});

describe('Textarea noSpace', () => {
    it('strips pasted spaces', async () => {
        const w = mount(TaoTextarea, { props: { noSpace: true } });
        const ta = w.find('textarea');
        (ta.element as HTMLTextAreaElement).value = 'a b  c';
        await ta.trigger('input');
        expect(w.emitted('update:modelValue')).toEqual([['abc']]);
    });
});

describe('locale in components', () => {
    afterEach(() => setTaoLocale(localeEn));

    it('prop defaults come from the locale, a passed prop wins', async () => {
        expect(mount(TaoSelect).find('.tao-select__value').text()).toBe('Select');
        setTaoLocale(localeRu);
        expect(mount(TaoSelect).find('.tao-select__value').text()).toBe('Выберите');
        expect(mount(TaoSelect, { props: { placeholder: 'Own' } }).find('.tao-select__value').text()).toBe('Own');
    });

    it('switching the locale updates components already on the page', async () => {
        const select = mount(TaoSelect);
        const own = mount(TaoSelect, { props: { placeholder: 'Own' } });
        const pagination = mount(TaoPagination, { props: { page: 1, total: 42, pageSize: 10 } });
        expect(select.find('.tao-select__value').text()).toBe('Select');

        setTaoLocale(localeRu);
        await nextTick();

        expect(select.find('.tao-select__value').text()).toBe('Выберите');
        expect(own.find('.tao-select__value').text()).toBe('Own');
        expect(pagination.find('.tao-pagination__btn').attributes('aria-label')).toBe('Назад');
        expect(pagination.find('.tao-pagination__total').text()).toBe('1–10 из 42');
    });

    it('texts built in templates follow the locale', async () => {
        setTaoLocale(localeRu);
        const w = mount(TaoPagination, { props: { page: 1, total: 42, pageSize: 10 } });
        await nextTick();
        expect(w.find('.tao-pagination__total').text()).toBe('1–10 из 42');
    });
});

describe('input and slider together', () => {
    it('InputNumber: a value changed elsewhere replaces the draft of a focused field, typing is not overwritten', async () => {
        const w = mount(TaoInputNumber, { props: { modelValue: 5 }, attachTo: document.body });
        const input = w.find('input');
        await input.trigger('focus');

        // набор: поле само отдало значение, родитель вернул его же, черновик остаётся
        (input.element as HTMLInputElement).value = '12';
        await input.trigger('input');
        await w.setProps({ modelValue: 12 });
        expect((input.element as HTMLInputElement).value).toBe('12');

        // правка снаружи (слайдер): черновик заменяется, blur не вернёт старый текст
        await w.setProps({ modelValue: 40 });
        expect((input.element as HTMLInputElement).value).toBe('40');
        await input.trigger('blur');
        expect(last(w.emitted('commit')!)).toEqual([40]);
        w.unmount();
    });

    it('Slider: pressing on it takes the focus from a field first, then sets the value', async () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const field = document.createElement('input');
        host.appendChild(field);
        field.focus();

        const w = mount(TaoSlider, { props: { modelValue: 10, min: 0, max: 100 }, attachTo: host });
        await w.find('.tao-slider__rail').trigger('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 });
        expect(document.activeElement).toBe(w.find('.tao-slider__thumb').element);
        w.unmount();
        host.remove();
    });
});

describe('range collapsed into one point', () => {
    const mountRange = (value: [number, number]) => {
        const w = mount(TaoRangeSlider, { props: { modelValue: value, min: 0, max: 100 }, attachTo: document.body });
        const rail = w.find('.tao-slider__rail').element;
        rail.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 16, right: 100, bottom: 16, x: 0, y: 0, toJSON: () => ({}) });
        return w;
    };
    const rail = (w: ReturnType<typeof mountRange>) => w.find('.tao-slider__rail');

    it('the collapsed class is set, a drag to the right pulls the upper thumb, to the left the lower', async () => {
        const w = mountRange([40, 40]);
        expect(w.classes()).toContain('tao-slider--collapsed');

        await rail(w).trigger('pointerdown', { button: 0, clientX: 40, clientY: 8, pointerId: 1 });
        await rail(w).trigger('pointermove', { clientX: 40, clientY: 8, pointerId: 1 });
        expect(last(w.emitted('update:modelValue')!)).toEqual([[40, 40]]); // пока на точке, значение не меняется
        await rail(w).trigger('pointermove', { clientX: 70, clientY: 8, pointerId: 1 });
        expect(last(w.emitted('update:modelValue')!)).toEqual([[40, 70]]);
        await rail(w).trigger('pointerup', { pointerId: 1 });
        w.unmount();

        const left = mountRange([40, 40]);
        await rail(left).trigger('pointerdown', { button: 0, clientX: 40, clientY: 8, pointerId: 1 });
        await rail(left).trigger('pointermove', { clientX: 10, clientY: 8, pointerId: 1 });
        expect(last(left.emitted('update:modelValue')!)).toEqual([[10, 40]]);
        left.unmount();
    });
});


describe('focus ring', () => {
    it('after a mouse press the ring is suppressed, a key press brings it back', async () => {
        const w = mount(TaoSlider, { props: { modelValue: 10, min: 0, max: 100 }, attachTo: document.body });
        await w.find('.tao-slider__rail').trigger('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 });
        expect(w.classes()).toContain('tao-slider--pointer-focus');
        await w.find('.tao-slider__thumb').trigger('keydown', { key: 'ArrowRight' });
        expect(w.classes()).not.toContain('tao-slider--pointer-focus');
        w.unmount();
    });
});

describe('marksSide', () => {
    it('start puts the marks on the other side: a class, the marks stay in the markup', () => {
        const props = { modelValue: 5, min: 0, max: 10, marks: [0, 5, 10] };
        const end = mount(TaoSlider, { props });
        expect(end.classes()).not.toContain('tao-slider--marks-start');
        const start = mount(TaoSlider, { props: { ...props, marksSide: 'start' as const } });
        expect(start.classes()).toContain('tao-slider--marks-start');
        expect(start.findAll('.tao-slider__mark')).toHaveLength(3);
    });
});

describe('Timeline', () => {
    const mountTimeline = (props: Record<string, unknown> = {}) => mount(TaoTimeline, { props: { modelValue: 1.25, length: 8, ...props } });

    it('shows time / length, the play button toggles and is labelled from the locale', async () => {
        const w = mountTimeline();
        expect(w.find('.tao-timeline__time').text()).toBe('1.25 / 8.00');
        const play = w.find('.tao-timeline__controls button');
        expect(play.attributes('aria-label')).toBe('Play');
        await play.trigger('click');
        expect(w.emitted('update:playing')).toEqual([[true]]);

        await w.setProps({ playing: true });
        expect(w.find('.tao-timeline__controls button').attributes('aria-label')).toBe('Pause');
        await w.find('.tao-timeline__controls button').trigger('click');
        expect(last(w.emitted('update:playing')!)).toEqual([false]);
    });

    it('restart sets the time to 0 and tells about it, it can be hidden', async () => {
        const w = mountTimeline();
        await w.findAll('.tao-timeline__controls button')[1]!.trigger('click');
        expect(last(w.emitted('update:modelValue')!)).toEqual([0]);
        expect(w.emitted('restart')).toHaveLength(1);
        expect(mountTimeline({ showRestart: false }).findAll('.tao-timeline__controls button')).toHaveLength(1);
    });

    it('scrubbing sends the time and pauses a playing timeline (unless pauseOnScrub is off)', async () => {
        const w = mountTimeline({ playing: true });
        await w.find('.tao-slider__thumb').trigger('keydown', { key: 'ArrowRight' });
        expect(last(w.emitted('update:modelValue')!)).toEqual([1.26]);
        expect(last(w.emitted('update:playing')!)).toEqual([false]);
        expect(last(w.emitted('seek')!)).toEqual([1.26]);

        const still = mountTimeline({ playing: true, pauseOnScrub: false });
        await still.find('.tao-slider__thumb').trigger('keydown', { key: 'ArrowRight' });
        expect(still.emitted('update:playing')).toBeUndefined();
    });

    it('marks, format, the time slot and own texts', () => {
        const w = mount(TaoTimeline, {
            props: { modelValue: 2, length: 8, marks: [0, 2, 4], format: (t: number) => `${t} с`, playLabel: 'Go' },
            slots: { time: '<b class="custom">{{ params.text }}</b>' },
        });
        expect(w.findAll('.tao-slider__mark').map((m) => m.text())).toEqual(['0 с', '2 с', '4 с']);
        expect(w.find('.custom').text()).toBe('2 с / 8 с');
        expect(w.find('.tao-timeline__controls button').attributes('aria-label')).toBe('Go');
    });
});

describe('minWidth', () => {
    it('Button: the prop sets --tao-button-min-width, a number means px, nothing by default', () => {
        expect((mount(TaoButton).element as HTMLElement).style.getPropertyValue('--tao-button-min-width')).toBe('');
        expect((mount(TaoButton, { props: { minWidth: 120 } }).element as HTMLElement).style.getPropertyValue('--tao-button-min-width')).toBe('120px');
        expect((mount(TaoButton, { props: { minWidth: '8rem' } }).element as HTMLElement).style.getPropertyValue('--tao-button-min-width')).toBe('8rem');
    });

    it('Segmented: the prop sets --tao-segmented-option-min-width on the group', () => {
        expect((mount(TaoSegmented).element as HTMLElement).style.getPropertyValue('--tao-segmented-option-min-width')).toBe('');
        expect((mount(TaoSegmented, { props: { minWidth: 96 } }).element as HTMLElement).style.getPropertyValue('--tao-segmented-option-min-width')).toBe('96px');
    });
});
