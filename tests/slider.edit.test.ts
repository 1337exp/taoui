import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoRangeSlider from '../src/components/TaoRangeSlider.vue';
import TaoSlider from '../src/components/TaoSlider.vue';

// `editable`: the value is typed into a field over the bar (a right click, a double click, Enter / F2 on a thumb).
// `editable`: значение набирают в поле поверх полосы (правый клик, двойной клик, Enter / F2 на ручке).

const mounted: VueWrapper[] = [];
afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount();
});

function slider(props: Record<string, unknown> = {}) {
    const w = mount(TaoSlider, { props: { modelValue: 40, editable: true, ...props }, attachTo: document.body });
    mounted.push(w);
    return w;
}

function range(props: Record<string, unknown> = {}) {
    const w = mount(TaoRangeSlider, { props: { modelValue: [20, 60], editable: true, ...props }, attachTo: document.body });
    mounted.push(w);
    return w;
}

/** The rail is 100 px wide, so a clientX is a percent. / Рельс шириной 100 px, поэтому clientX — это проценты. */
function sizeRail(w: VueWrapper) {
    const rail = w.find('.tao-slider__rail');
    vi.spyOn(rail.element, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, right: 100, bottom: 20, width: 100, height: 20, x: 0, y: 0, toJSON: () => ({}) });
    return rail;
}

/** A right click; returns the event, so the test can ask whether the menu was prevented. / Правый клик; возвращает событие. */
function rightClick(w: VueWrapper, clientX = 50) {
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX, clientY: 10 });
    w.find('.tao-slider__rail').element.dispatchEvent(event);
    return event;
}

const editor = (w: VueWrapper) => w.find<HTMLInputElement>('.tao-slider__editor');

async function type(w: VueWrapper, text: string, key: 'Enter' | 'Escape' | null = 'Enter') {
    const input = editor(w);
    await input.setValue(text);
    if (key) await input.trigger('keydown', { key });
    await nextTick();
}

describe('TaoSlider editable: opening the field', () => {
    it('is off by default: a right click leaves the browser menu alone and no field appears', async () => {
        const w = slider({ editable: undefined });
        const event = rightClick(w);
        await nextTick();
        expect(event.defaultPrevented).toBe(false);
        expect(editor(w).exists()).toBe(false);
        expect(w.find('[role=slider]').attributes('aria-keyshortcuts')).toBeUndefined();
    });

    it('a right click opens a field with the current value, selected, and keeps the browser menu away', async () => {
        const w = slider();
        const event = rightClick(w);
        await nextTick();
        expect(event.defaultPrevented).toBe(true);
        expect(editor(w).exists()).toBe(true);
        expect(editor(w).element.value).toBe('40');
        expect(document.activeElement).toBe(editor(w).element);
        expect(editor(w).element.selectionStart).toBe(0);
        expect(editor(w).element.selectionEnd).toBe(2);
    });

    it('a double click opens it too: for the touch screens that have no right click', async () => {
        const w = slider();
        await w.find('.tao-slider__rail').trigger('dblclick');
        expect(editor(w).exists()).toBe(true);
    });

    it('Enter and F2 on a thumb open it, so the keyboard can reach it; the thumb advertises the keys', async () => {
        const w = slider();
        expect(w.find('[role=slider]').attributes('aria-keyshortcuts')).toBe('Enter F2');
        await w.find('[role=slider]').trigger('keydown', { key: 'Enter' });
        expect(editor(w).exists()).toBe(true);
        await type(w, '', 'Escape');
        await w.find('[role=slider]').trigger('keydown', { key: 'F2' });
        expect(editor(w).exists()).toBe(true);
    });

    it('without editable Enter does nothing', async () => {
        const w = slider({ editable: false });
        await w.find('[role=slider]').trigger('keydown', { key: 'Enter' });
        expect(editor(w).exists()).toBe(false);
        expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('a disabled slider does not open, and one that becomes disabled closes the field', async () => {
        const off = slider({ disabled: true });
        rightClick(off);
        await nextTick();
        expect(editor(off).exists()).toBe(false);

        const w = slider();
        rightClick(w);
        await nextTick();
        expect(editor(w).exists()).toBe(true);
        await w.setProps({ disabled: true });
        expect(editor(w).exists()).toBe(false);
    });

    it('the value text on the bar gives way to the field while it is open', async () => {
        const w = slider({ showValue: true });
        expect(w.find('.tao-slider__value').exists()).toBe(true);
        rightClick(w);
        await nextTick();
        expect(w.find('.tao-slider__value').exists()).toBe(false);
        await type(w, '', 'Escape');
        expect(w.find('.tao-slider__value').exists()).toBe(true);
    });
});

describe('TaoSlider editable: setting the value', () => {
    it('Enter sets the typed value, ends the edit and gives the thumb its focus back', async () => {
        const w = slider();
        rightClick(w);
        await nextTick();
        await type(w, '75');
        expect(w.emitted('update:modelValue')).toEqual([[75]]);
        expect(w.emitted('change')).toEqual([[75]]);
        expect(editor(w).exists()).toBe(false);
        expect(document.activeElement).toBe(w.find('[role=slider]').element);
    });

    it('keeps the value in range and on the step, as a value picked with the pointer would be', async () => {
        const w = slider({ step: 5 });
        rightClick(w);
        await nextTick();
        await type(w, '152');
        rightClick(w);
        await nextTick();
        await type(w, '-9');
        rightClick(w);
        await nextTick();
        await type(w, '33');
        expect(w.emitted('update:modelValue')).toEqual([[100], [0], [35]]);
    });

    it('takes a comma as the decimal point, and spaces around the number', async () => {
        const w = slider({ min: 0, max: 10, step: 0.5, modelValue: 1 });
        rightClick(w);
        await nextTick();
        await type(w, '  2,5 ');
        expect(w.emitted('update:modelValue')).toEqual([[2.5]]);
    });

    it('snaps to the nearest mark on a discrete scale', async () => {
        const w = slider({ discrete: true, marks: [0, 25, 50, 100], modelValue: 0 });
        rightClick(w);
        await nextTick();
        await type(w, '80');
        expect(w.emitted('update:modelValue')).toEqual([[100]]);
    });

    it('leaving the field sets the value too, as TaoInputNumber does', async () => {
        const w = slider();
        rightClick(w);
        await nextTick();
        await type(w, '12', null);
        await editor(w).trigger('blur');
        expect(w.emitted('update:modelValue')).toEqual([[12]]);
        expect(editor(w).exists()).toBe(false);
    });

    it('Esc drops the edit: nothing is emitted and the thumb has the focus again', async () => {
        const w = slider();
        rightClick(w);
        await nextTick();
        await type(w, '99', 'Escape');
        expect(w.emitted('update:modelValue')).toBeUndefined();
        expect(w.emitted('change')).toBeUndefined();
        expect(editor(w).exists()).toBe(false);
        expect(document.activeElement).toBe(w.find('[role=slider]').element);
    });

    it.each(['', '   ', 'abc', '12abc', '0x10', '1e999', '--5', '1,2,3'])('"%s" is not a number: the value stays and the field closes', async (text) => {
        const w = slider();
        rightClick(w);
        await nextTick();
        await type(w, text);
        expect(w.emitted('update:modelValue')).toBeUndefined();
        expect(editor(w).exists()).toBe(false);
    });

    it('typing the value it already has is not a change', async () => {
        const w = slider();
        rightClick(w);
        await nextTick();
        await type(w, '40');
        expect(w.emitted('change')).toBeUndefined();
    });
});

describe('TaoSlider editable: the field and the rest of the slider', () => {
    it('a press inside the field is the field\'s own: it does not start a drag of the rail', async () => {
        const w = slider();
        sizeRail(w);
        rightClick(w);
        await nextTick();
        const down = new Event('pointerdown', { bubbles: true, cancelable: true }) as PointerEvent;
        Object.assign(down, { button: 0, pointerId: 1, clientX: 90, clientY: 10 });
        editor(w).element.dispatchEvent(down);
        expect(w.emitted('update:modelValue')).toBeUndefined();
        expect(w.find('.tao-slider__rail--dragging').exists()).toBe(false);
    });

    it('a right click inside the field keeps the browser menu (paste), and a wheel over it does not move the value', async () => {
        const w = slider({ wheel: 5 });
        rightClick(w);
        await nextTick();
        const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
        editor(w).element.dispatchEvent(menu);
        expect(menu.defaultPrevented).toBe(false);
        await editor(w).trigger('wheel', { deltaY: -100 });
        expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('the field is named: by ariaLabel, else by editLabel, else by the locale', async () => {
        const plain = slider();
        rightClick(plain);
        await nextTick();
        expect(editor(plain).attributes('aria-label')).toBe('Value');

        const own = slider({ editLabel: 'Tolerance, %' });
        rightClick(own);
        await nextTick();
        expect(editor(own).attributes('aria-label')).toBe('Tolerance, %');

        const named = slider({ ariaLabel: 'Opacity' });
        rightClick(named);
        await nextTick();
        expect(editor(named).attributes('aria-label')).toBe('Opacity');
    });

    it('the arrows still move the value without opening anything', async () => {
        const w = slider();
        await w.find('[role=slider]').trigger('keydown', { key: 'ArrowRight' });
        expect(w.emitted('update:modelValue')).toEqual([[41]]);
        expect(editor(w).exists()).toBe(false);
    });
});

describe('TaoRangeSlider editable', () => {
    it('edits the thumb nearest to the click', async () => {
        const w = range();
        sizeRail(w);
        rightClick(w, 90);
        await nextTick();
        expect(editor(w).element.value).toBe('60');
        await type(w, '80');
        expect(w.emitted('update:modelValue')).toEqual([[[20, 80]]]);

        const low = range();
        sizeRail(low);
        rightClick(low, 5);
        await nextTick();
        expect(editor(low).element.value).toBe('20');
        await type(low, '10');
        expect(low.emitted('update:modelValue')).toEqual([[[10, 60]]]);
    });

    it('the thumbs keep their gap: typing past the other one stops short of it', async () => {
        const w = range({ minGap: 10 });
        sizeRail(w);
        rightClick(w, 5);
        await nextTick();
        await type(w, '90');
        expect(w.emitted('update:modelValue')).toEqual([[[50, 60]]]);
    });

    it('Enter on the second thumb edits the second thumb', async () => {
        const w = range();
        await w.findAll('[role=slider]')[1]!.trigger('keydown', { key: 'Enter' });
        expect(editor(w).element.value).toBe('60');
    });
});
