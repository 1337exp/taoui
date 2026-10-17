import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoColorInput from '../src/components/TaoColorInput.vue';
import TaoColorPicker from '../src/components/TaoColorPicker.vue';

const last = <T,>(list: T[]): T => list[list.length - 1]!;

describe('ColorPicker', () => {
    const mountPicker = (props: Record<string, unknown> = {}) => mount(TaoColorPicker, { props: { modelValue: '#ff8800', ...props }, attachTo: document.body });
    const area = (w: ReturnType<typeof mountPicker>) => w.find('.tao-color-picker__area');
    const hexField = (w: ReturnType<typeof mountPicker>) => w.find('.tao-color-picker__hex input');

    it('shows the colour: hex in the field, the preview, the cursor in the right place', () => {
        const w = mountPicker();
        expect((hexField(w).element as HTMLInputElement).value).toBe('#ff8800');
        expect(w.find('.tao-color-picker__preview span').attributes('style')).toContain('#ff8800');
        const cursor = w.find('.tao-color-picker__cursor').attributes('style')!;
        expect(cursor).toContain('left: 100%');
        expect(cursor).toContain('top: 0%');
    });

    it('arrow keys move saturation and brightness, Shift is ten times bigger, every key is a finished change', async () => {
        const w = mountPicker({ modelValue: '#808080' });
        await area(w).trigger('keydown', { key: 'ArrowRight' });
        expect(last(w.emitted('update:modelValue')!)[0]).not.toBe('#808080');
        expect(w.emitted('change')).toHaveLength(1);

        const before = last(w.emitted('update:modelValue')!)[0] as string;
        await area(w).trigger('keydown', { key: 'ArrowUp', shiftKey: true });
        const after = last(w.emitted('update:modelValue')!)[0] as string;
        expect(parseInt(after.slice(1, 3), 16)).toBeGreaterThan(parseInt(before.slice(1, 3), 16) + 15);
        await area(w).trigger('keydown', { key: 'a' });
        expect(w.emitted('change')).toHaveLength(2);
    });

    it('a press on the square sets saturation and brightness by position', async () => {
        const w = mountPicker({ modelValue: '#000000' });
        area(w).element.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) });
        await area(w).trigger('pointerdown', { button: 0, clientX: 100, clientY: 0, pointerId: 1 });
        expect(last(w.emitted('update:modelValue')!)[0]).toBe('#ff0000');
        expect(w.emitted('change')).toBeUndefined();
        await area(w).trigger('pointerup', { pointerId: 1 });
        expect(w.emitted('change')).toEqual([['#ff0000']]);
    });

    it('the hex field commits on blur (short forms are expanded), garbage turns the field red and changes nothing', async () => {
        const w = mountPicker();
        await hexField(w).setValue('#0f0');
        await hexField(w).trigger('blur');
        expect(last(w.emitted('update:modelValue')!)[0]).toBe('#00ff00');
        expect(last(w.emitted('change')!)[0]).toBe('#00ff00');

        const count = w.emitted('update:modelValue')!.length;
        await hexField(w).setValue('nope');
        await hexField(w).trigger('blur');
        expect(w.emitted('update:modelValue')).toHaveLength(count);
        expect(w.find('.tao-input-shell').classes().join(' ')).toContain('invalid');
    });

    it('swatches: a click picks the colour, the current one is marked', async () => {
        const w = mountPicker({ swatches: ['#ff0000', '#00ff00', '#ff8800'] });
        expect(w.findAll('.tao-color-picker__swatch--on')).toHaveLength(1);
        await w.findAll('.tao-color-picker__swatch')[1]!.trigger('click');
        expect(last(w.emitted('update:modelValue')!)[0]).toBe('#00ff00');
        expect(last(w.emitted('change')!)[0]).toBe('#00ff00');
    });

    it('a value from outside is picked up, grey keeps the hue', async () => {
        const w = mountPicker({ modelValue: '#0000ff' });
        await w.setProps({ modelValue: '#808080' });
        expect((hexField(w).element as HTMLInputElement).value).toBe('#808080');
        // оттенок остался синим (240°): прибавка насыщенности даёт синий, а не красный
        await area(w).trigger('keydown', { key: 'ArrowRight', shiftKey: true });
        const next = last(w.emitted('update:modelValue')!)[0] as string;
        const [r, , b] = [1, 3, 5].map((i) => parseInt(next.slice(i, i + 2), 16));
        expect(b!).toBeGreaterThan(r!);
    });

    it('opacity: the strip and #rrggbbaa only with alpha', async () => {
        const plain = mountPicker();
        expect(plain.find('.tao-color-picker__alpha').exists()).toBe(false);
        const w = mountPicker({ alpha: true, modelValue: '#ff880080' });
        expect(w.find('.tao-color-picker__alpha').exists()).toBe(true);
        expect((hexField(w).element as HTMLInputElement).value).toBe('#ff880080');
        await hexField(w).setValue('#00000000');
        await hexField(w).trigger('blur');
        expect(last(w.emitted('update:modelValue')!)[0]).toBe('#00000000');
    });

    it('labels come from the locale and from props', () => {
        const w = mountPicker({ hueLabel: 'Hue!' });
        expect(area(w).attributes('aria-label')).toBe('Насыщенность и яркость');
        expect(w.find('.tao-color-picker__hue .tao-slider__thumb').attributes('aria-label')).toBe('Hue!');
    });
});

describe('ColorInput', () => {
    it('the button shows the colour, the popover opens with the picker, a change goes out', async () => {
        const w = mount(TaoColorInput, { props: { modelValue: '#ff8800' }, attachTo: document.body });
        const trigger = w.find('.tao-color-input');
        expect(trigger.text()).toBe('#ff8800');
        expect(trigger.attributes('aria-label')).toBe('Выбрать цвет: #ff8800');
        expect(document.querySelector('.tao-popover__panel')).toBeNull();

        await trigger.trigger('click');
        await nextTick();
        const area = document.querySelector('.tao-popover__panel .tao-color-picker__area') as HTMLElement;
        expect(area).not.toBeNull();
        area.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        await nextTick();
        expect(w.emitted('update:modelValue')).toBeTruthy();
        expect(w.emitted('change')).toBeTruthy();
        w.unmount();
    });

    it('disabled does not open', async () => {
        const w = mount(TaoColorInput, { props: { modelValue: '#ff8800', disabled: true }, attachTo: document.body });
        await w.find('.tao-color-input').trigger('click');
        await nextTick();
        expect(document.querySelector('.tao-popover__panel')).toBeNull();
        w.unmount();
    });
});
