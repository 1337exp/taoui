import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import TaoThemeToggle from '../src/components/TaoThemeToggle.vue';
import { applyTaoMode, readTaoMode } from '../src/themeMode';

// 5.24.0: TaoThemeToggle, the light / dark switch as one icon button.
// 5.24.0: TaoThemeToggle, переключатель светлой / тёмной темы одной кнопкой-иконкой.

const root = document.documentElement;
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
});
