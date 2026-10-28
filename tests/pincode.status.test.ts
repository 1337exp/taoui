import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoPinCode from '../src/components/TaoPinCode.vue';

// The result of the check, set by the app: a shake on an error, a glow on a success, words for a screen reader.
// Результат проверки от приложения: встряхивание при ошибке, свечение при успехе, слова для скринридера.

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
});

const frame = async () => {
    await nextTick();
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await nextTick();
};

const pin = (props: Record<string, unknown> = {}) => mount(TaoPinCode, { props: { length: 4, numbersOnly: true, ...props }, attachTo: document.body });

describe('TaoPinCode status', () => {
    it('idle by default: no status classes, nothing said', () => {
        const w = pin();
        expect(w.classes().filter((c) => /--(success|shake|glow)$/.test(c))).toEqual([]);
        expect(w.find('[role="status"]').text()).toBe('');
    });

    it('error: red cells, aria-invalid, a shake, «Wrong code» for a screen reader', async () => {
        const w = pin({ modelValue: '1234' });
        await w.setProps({ status: 'error' });
        await frame();
        expect(w.classes()).toContain('tao-pin-code--shake');
        expect(w.attributes('aria-invalid')).toBe('true');
        expect(w.findAll('input').every((i) => i.classes().includes('tao-pin-code__value--invalid'))).toBe(true);
        expect(w.find('[role="status"]').text()).toBe('Wrong code');
    });

    it('success: green cells, a glow, «The code is correct»; each cell knows its place for the wave', async () => {
        const w = pin({ modelValue: '1234' });
        await w.setProps({ status: 'success' });
        await frame();
        expect(w.classes()).toEqual(expect.arrayContaining(['tao-pin-code--success', 'tao-pin-code--glow']));
        expect(w.attributes('aria-invalid')).toBeUndefined();
        expect(w.find('[role="status"]').text()).toBe('The code is correct');
        expect(w.findAll('input').map((i) => i.attributes('style'))).toEqual(['--_i: 0;', '--_i: 1;', '--_i: 2;', '--_i: 3;']);
    });

    it('back to idle stops it; play() runs the animation again for a second wrong code', async () => {
        const w = pin({ status: 'error' });
        await w.setProps({ status: 'idle' });
        expect(w.classes()).not.toContain('tao-pin-code--shake');
        await w.setProps({ status: 'error' });
        await frame();
        expect(w.classes()).toContain('tao-pin-code--shake');
        (w.vm as unknown as { play: () => void }).play();
        await nextTick();
        // off for a frame, then on again / на кадр снимается, потом снова
        expect(w.classes()).not.toContain('tao-pin-code--shake');
        await frame();
        expect(w.classes()).toContain('tao-pin-code--shake');
    });

    it('complete still fires when the cells are full, so the app can check and set the status', async () => {
        const w = pin();
        const inputs = w.findAll('input');
        for (const [index, digit] of ['1', '2', '3', '4'].entries()) {
            await inputs[index]!.setValue(digit);
        }
        expect(w.emitted('complete')).toEqual([['1234']]);
    });

    it('successText and errorText override the locale', async () => {
        const w = pin({ status: 'error', errorText: 'Try again' });
        expect(w.find('[role="status"]').text()).toBe('Try again');
    });
});
