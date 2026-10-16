import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoAlert from '../src/components/TaoAlert.vue';
import TaoBlock from '../src/components/TaoBlock.vue';
import TaoCard from '../src/components/TaoCard.vue';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
import TaoCopy from '../src/components/TaoCopy.vue';
import TaoDropdownMenu from '../src/components/TaoDropdownMenu.vue';
import TaoInput from '../src/components/TaoInput.vue';
import TaoInputNumber from '../src/components/TaoInputNumber.vue';
import TaoPagination from '../src/components/TaoPagination.vue';
import TaoPinCode from '../src/components/TaoPinCode.vue';
import TaoSelect from '../src/components/TaoSelect.vue';
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

describe('deprecated aliases still work', () => {
    // they use old names on purpose; warnings have their own tests / старые имена намеренно, у предупреждений свои тесты
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => vi.restoreAllMocks());

    it('Alert / Tag: type → tone, pointer → clickable', () => {
        expect(cls(mount(TaoAlert, { props: { type: 'success' } }).element)).toContain('tao-alert--success');
        const tag = mount(TaoTag, { props: { type: 'error', pointer: true } });
        expect(cls(tag.element)).toContain('tao-tag--danger');
        expect(cls(tag.element)).toContain('tao-tag--pointer');
    });

    it('Tabs: tabs + key', async () => {
        const w = mount(TaoTabs, {
            props: { tabs: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }], modelValue: 'a' },
        });
        await w.findAll('.tao-tabs__tab')[1]!.trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([['b']]);
    });

    it('Checkbox value, PinCode hidden, Space / Stages vertical, Textarea flags', () => {
        expect((mount(TaoCheckbox, { props: { value: true } }).find('input').element as HTMLInputElement).checked).toBe(true);
        expect(mount(TaoPinCode, { props: { length: 2, hidden: true } }).find('input').attributes('type')).toBe('password');
        expect(cls(mount(TaoSpace, { props: { vertical: true } }).element)).toContain('tao-space--vertical');
        expect(cls(mount(TaoStages, { props: { vertical: false, items: [] } }).element)).toContain('tao-stages--horizontal');
        const ta = mount(TaoTextarea, { props: { noBorder: true, noBackground: true, textCenter: true } }).find('textarea');
        expect(cls(ta.element)).toContain('tao-textarea--plain');
        expect(cls(ta.element)).toContain('tao-textarea--align-center');
    });
});

describe('deprecation warnings', () => {
    afterEach(() => vi.restoreAllMocks());

    it('warns once about a passed deprecated prop, never about the new one', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        mount(TaoTag, { props: { tone: 'success' } });
        expect(warn).not.toHaveBeenCalled();
        mount(TaoCopy, { props: { text: 'x', successMessage: 'Done' } });
        mount(TaoCopy, { props: { text: 'x', successMessage: 'Done' } });
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0]![0]).toContain('TaoCopy: prop "successMessage" is deprecated');
    });

    it('warns about a deprecated listener', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        mount(TaoTable, { props: { columns: [] }, attrs: { onSort: () => {} } });
        expect(warn.mock.calls.some(([text]) => String(text).includes('TaoTable: event "sort"'))).toBe(true);
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

    it('Table: change and the deprecated sort on header click', async () => {
        const w = mount(TaoTable, {
            props: { columns: [{ key: 'name', label: 'Name', sortable: true }], rows: [] },
        });
        await w.find('.tao-table__sort-btn').trigger('click');
        expect(w.emitted('change')?.[0]).toEqual(w.emitted('update:sort')?.[0]);
        expect(w.emitted('sort')?.[0]).toEqual(w.emitted('change')?.[0]);
    });

    it('DropdownMenu: select and the deprecated selected', async () => {
        const w = mount(TaoDropdownMenu, { props: { actions: [{ id: 'edit', name: 'Edit' }] }, attachTo: document.body });
        await w.find('.tao-dropdown-menu__button').trigger('click');
        await nextTick();
        // the list is teleported to body / список телепортирован в body
        document.querySelector<HTMLButtonElement>('.tao-dropdown-menu__item')!.click();
        expect(w.emitted('select')).toEqual([['edit']]);
        expect(w.emitted('selected')).toEqual([['edit']]);
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
    afterEach(() => setTaoLocale(localeRu));

    it('prop defaults come from the locale, a passed prop wins', async () => {
        expect(mount(TaoSelect).find('.tao-select__value').text()).toBe('Выберите');
        setTaoLocale(localeEn);
        expect(mount(TaoSelect).find('.tao-select__value').text()).toBe('Select');
        expect(mount(TaoSelect, { props: { placeholder: 'Own' } }).find('.tao-select__value').text()).toBe('Own');
    });

    it('switching the locale updates components already on the page', async () => {
        const select = mount(TaoSelect);
        const own = mount(TaoSelect, { props: { placeholder: 'Own' } });
        const pagination = mount(TaoPagination, { props: { page: 1, total: 42, pageSize: 10 } });
        expect(select.find('.tao-select__value').text()).toBe('Выберите');

        setTaoLocale(localeEn);
        await nextTick();

        expect(select.find('.tao-select__value').text()).toBe('Select');
        expect(own.find('.tao-select__value').text()).toBe('Own');
        expect(pagination.find('.tao-pagination__btn').attributes('aria-label')).toBe('Previous');
        expect(pagination.find('.tao-pagination__total').text()).toBe('1–10 of 42');
    });

    it('texts built in templates follow the locale', async () => {
        setTaoLocale(localeEn);
        const w = mount(TaoPagination, { props: { page: 1, total: 42, pageSize: 10 } });
        await nextTick();
        expect(w.find('.tao-pagination__total').text()).toBe('1–10 of 42');
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
