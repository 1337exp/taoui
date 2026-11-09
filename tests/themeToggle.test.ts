import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TaoThemeToggle from '../src/components/TaoThemeToggle.vue';
import { applyTaoMode, readTaoMode, resolveTaoMode } from '../src/themeMode';

// 5.24.0: TaoThemeToggle, the light / dark switch as one icon button.
// 5.24.0: TaoThemeToggle, переключатель светлой / тёмной темы одной кнопкой-иконкой.

const root = document.documentElement;
// the built-in glyphs by a piece of their path: the icon renders as an svg
// встроенные значки по куску пути: иконка рисуется как svg
const MONITOR = 'M8 20.5h8';
const SUN = 'r="4.25"';
afterEach(() => {
    root.removeAttribute('data-tao-mode');
    root.removeAttribute('data-tao-theme');
});

describe('readTaoMode / applyTaoMode', () => {
    it('reads data-tao-mode, then the old data-tao-theme="light", else dark', () => {
        const el = document.createElement('div');
        expect(readTaoMode(el)).toBe('dark');
        el.setAttribute('data-tao-theme', 'light');
        expect(readTaoMode(el)).toBe('light');
        el.setAttribute('data-tao-mode', 'dark');
        expect(readTaoMode(el)).toBe('dark');
        el.removeAttribute('data-tao-mode');
        el.setAttribute('data-tao-theme', 'lagoon');
        expect(readTaoMode(el)).toBe('dark');
    });

    it('a palette keeps its name, the old dark / light spelling follows the mode', () => {
        const el = document.createElement('div');
        el.setAttribute('data-tao-theme', 'lagoon');
        applyTaoMode(el, 'light');
        expect(el.getAttribute('data-tao-theme')).toBe('lagoon');
        expect(el.getAttribute('data-tao-mode')).toBe('light');
        el.setAttribute('data-tao-theme', 'dark');
        applyTaoMode(el, 'light');
        expect(el.getAttribute('data-tao-theme')).toBe('light');
    });
});

describe('TaoThemeToggle', () => {
    it('is an icon button named by what a click does: a sun to go light, a moon to go dark', async () => {
        const wrapper = mount(TaoThemeToggle, { attachTo: document.body });
        expect(wrapper.attributes('aria-label')).toBe('Switch to the light theme');
        expect(wrapper.html()).toContain('tao-button--icon-only');
        root.setAttribute('data-tao-mode', 'light');
        await new Promise((r) => setTimeout(r, 0));
        expect(wrapper.attributes('aria-label')).toBe('Switch to the dark theme');
        wrapper.unmount();
    });

    it('takes the mode of the page on mount, and a click flips it on <html> and says so', async () => {
        root.setAttribute('data-tao-mode', 'light');
        const wrapper = mount(TaoThemeToggle, { attachTo: document.body });
        await nextTick();
        expect(wrapper.attributes('aria-label')).toBe('Switch to the dark theme');
        await wrapper.trigger('click');
        expect(root.getAttribute('data-tao-mode')).toBe('dark');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['dark']);
        expect(wrapper.emitted('change')?.[0]).toEqual(['dark']);
        wrapper.unmount();
    });

    it('with apply off it only reports; with v-model it shows what it is given', async () => {
        const wrapper = mount(TaoThemeToggle, { props: { modelValue: 'light', apply: false }, attachTo: document.body });
        expect(wrapper.attributes('aria-label')).toBe('Switch to the dark theme');
        await wrapper.trigger('click');
        expect(root.getAttribute('data-tao-mode')).toBeNull();
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['dark']);
        expect(wrapper.attributes('aria-label')).toBe('Switch to the dark theme');
        await wrapper.setProps({ modelValue: 'dark' });
        expect(wrapper.attributes('aria-label')).toBe('Switch to the light theme');
        wrapper.unmount();
    });

    it('the icon slot gets the mode and the mode a click leads to, and the button stays named and square', async () => {
        const wrapper = mount(TaoThemeToggle, {
            props: { modelValue: 'dark', apply: false },
            slots: { icon: '<template #icon="{ mode, next }"><b class="mine">{{ mode }}>{{ next }}</b></template>' },
        });
        expect(wrapper.find('.mine').text()).toBe('dark>light');
        expect(wrapper.attributes('aria-label')).toBe('Switch to the light theme');
        expect(wrapper.classes()).toContain('tao-theme-toggle--custom');
        await wrapper.setProps({ modelValue: 'light' });
        expect(wrapper.find('.mine').text()).toBe('light>dark');
    });

    it('the labels can be given', () => {
        const wrapper = mount(TaoThemeToggle, { props: { toLightLabel: 'Light please' } });
        expect(wrapper.attributes('aria-label')).toBe('Light please');
    });

    describe('5.32.0: system', () => {
        let prefersLight = false;
        let listener: (() => void) | null = null;
        beforeEach(() => {
            prefersLight = false;
            listener = null;
            vi.stubGlobal('matchMedia', () => ({
                get matches() {
                    return prefersLight;
                },
                addEventListener: (_: string, fn: () => void) => (listener = fn),
                removeEventListener: () => (listener = null),
            }));
        });
        afterEach(() => {
            vi.unstubAllGlobals();
            root.removeAttribute('data-tao-mode-choice');
        });

        it('goes system → light → dark → system, the monitor is the state, the label is where the click leads', async () => {
            const wrapper = mount(TaoThemeToggle, { props: { modelValue: 'system', apply: false, system: true } });
            await nextTick();
            expect(wrapper.html()).toContain(MONITOR);
            expect(wrapper.attributes('aria-label')).toBe('Switch to the light theme');
            await wrapper.trigger('click');
            expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['light']);
            await wrapper.setProps({ modelValue: 'light' });
            expect(wrapper.attributes('aria-label')).toBe('Switch to the dark theme');
            await wrapper.trigger('click');
            expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['dark']);
            await wrapper.setProps({ modelValue: 'dark' });
            expect(wrapper.attributes('aria-label')).toBe('Switch to the system theme');
            await wrapper.trigger('click');
            expect(wrapper.emitted('update:modelValue')?.[2]).toEqual(['system']);
        });

        it('the page gets the mode the system asks for, follows it, and is marked as the system\'s', async () => {
            const wrapper = mount(TaoThemeToggle, { props: { system: true }, attachTo: document.body });
            await nextTick();
            await wrapper.trigger('click'); // dark → system
            expect(root.getAttribute('data-tao-mode')).toBe('dark');
            expect(root.getAttribute('data-tao-mode-choice')).toBe('system');
            prefersLight = true;
            listener?.();
            await nextTick();
            expect(root.getAttribute('data-tao-mode')).toBe('light');
            await wrapper.trigger('click'); // system → light, the mark goes
            expect(root.getAttribute('data-tao-mode-choice')).toBeNull();
            wrapper.unmount();
        });

        it('a remounted toggle reads «system» from the page, a mode somebody else set is just that mode', async () => {
            root.setAttribute('data-tao-mode', 'dark');
            root.setAttribute('data-tao-mode-choice', 'system');
            const wrapper = mount(TaoThemeToggle, { props: { system: true }, attachTo: document.body });
            await nextTick();
            expect(wrapper.html()).toContain(MONITOR);
            root.setAttribute('data-tao-mode', 'light');
            await new Promise((r) => setTimeout(r, 0));
            expect(wrapper.html()).toContain(SUN);
            expect(root.getAttribute('data-tao-mode-choice')).toBeNull();
            wrapper.unmount();
        });

        it('without system nothing changes: «system» is the mode the system asks for, the icon leads', async () => {
            const wrapper = mount(TaoThemeToggle, { props: { modelValue: 'system', apply: false } });
            await nextTick();
            expect(wrapper.html()).not.toContain(MONITOR);
            expect(wrapper.attributes('aria-label')).toBe('Switch to the light theme');
        });

        it('resolveTaoMode turns a pick into a mode', () => {
            expect(resolveTaoMode('light')).toBe('light');
            expect(resolveTaoMode('system')).toBe('dark');
            prefersLight = true;
            expect(resolveTaoMode('system')).toBe('light');
        });
    });

    it('5.32.0: tone goes to the button, and is neutral by default (the accent is not for a quiet tool)', () => {
        const plain = mount(TaoThemeToggle);
        expect(plain.find('button').classes().join(' ')).toContain('neutral');

        const accent = mount(TaoThemeToggle, { props: { tone: 'accent' } });
        expect(accent.find('button').classes().join(' ')).not.toContain('neutral');

        const quiet = mount(TaoThemeToggle, { props: { tone: 'neutral' } });
        expect(quiet.find('button').classes().join(' ')).toContain('neutral');

        const custom = mount(TaoThemeToggle, { props: { tone: 'neutral' }, slots: { icon: '<b>x</b>' } });
        expect(custom.find('button').classes().join(' ')).toContain('neutral');
    });
});
