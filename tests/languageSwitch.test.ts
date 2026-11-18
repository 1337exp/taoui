import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import TaoLanguageSwitch from '../src/components/TaoLanguageSwitch.vue';
import { taoLanguageName } from '../src/languageName';

// 5.50.0: TaoLanguageSwitch, the language of the interface as a globe that opens a list of the languages by their own names.
// 5.50.0: TaoLanguageSwitch, язык интерфейса: глобус, который открывает список языков их собственными названиями.

const root = document.documentElement;
afterEach(() => root.removeAttribute('lang'));

describe('taoLanguageName', () => {
    it('is the language in itself, with a capital', () => {
        expect(taoLanguageName('ru')).toBe('Русский');
        expect(taoLanguageName('en')).toBe('English');
        expect(taoLanguageName('de')).toBe('Deutsch');
    });

    it('stands on the code when the engine does not know it', () => {
        expect(taoLanguageName('')).toBe('');
        expect(taoLanguageName('not a tag')).toBe('NOT A TAG');
    });
});

const mountSwitch = (props: Record<string, unknown> = {}) =>
    mount(TaoLanguageSwitch, { props: { languages: ['ru', 'en'], modelValue: 'ru', ...props }, attachTo: document.body });

describe('TaoLanguageSwitch', () => {
    it('is a button with the globe and the name of the current language', () => {
        const w = mountSwitch();
        const button = w.find('button');
        expect(w.find('svg').exists()).toBe(true);
        expect(button.text()).toContain('Русский');
        expect(button.attributes('aria-haspopup')).toBe('menu');
        w.unmount();
    });

    it('the accessible name is «Language: name» (the visible word is inside it), also for the icon only', () => {
        const withName = mountSwitch({ modelValue: 'en' });
        expect(withName.find('button').text()).toBe('Language: English');
        withName.unmount();

        const iconOnly = mountSwitch({ modelValue: 'en', iconOnly: true });
        expect(iconOnly.find('button').text()).toBe('Language: English');
        expect(iconOnly.find('.tao-language-switch__name').classes()).toContain('tao-language-switch__sr');
        expect(iconOnly.find('.tao-language-switch__face--icon').exists()).toBe(true);
        iconOnly.unmount();
    });

    it('takes the label from the locale, or from the prop', () => {
        const w = mountSwitch({ label: 'Sprache', modelValue: 'en' });
        expect(w.find('button').text()).toBe('Sprache: English');
        w.unmount();
    });

    it('a language may bring its own name', () => {
        const w = mountSwitch({ languages: ['ru', { code: 'en', label: 'English (US)' }], modelValue: 'en' });
        expect(w.find('button').text()).toContain('English (US)');
        w.unmount();
    });

    it('opens a list of radios, the current one checked, and a pick says the code', async () => {
        const w = mountSwitch();
        await w.find('button').trigger('click');
        await nextTick();
        const radios = [...document.querySelectorAll('[role="menuitemradio"]')];
        expect(radios.map((r) => r.textContent?.trim())).toEqual(['Русский', 'English']);
        expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false']);

        (radios[1] as HTMLElement).click();
        await nextTick();
        expect(w.emitted('update:modelValue')).toEqual([['en']]);
        expect(w.emitted('change')).toEqual([['en']]);
        w.unmount();
    });

    it('picking the language in use says nothing', async () => {
        const w = mountSwitch();
        await w.find('button').trigger('click');
        await nextTick();
        (document.querySelectorAll('[role="menuitemradio"]')[0] as HTMLElement).click();
        await nextTick();
        expect(w.emitted('update:modelValue')).toBeUndefined();
        w.unmount();
    });

    it('writes the language to <html lang>, on mount and on a change, unless apply is off', async () => {
        const w = mountSwitch({ modelValue: 'ru' });
        await nextTick();
        expect(root.getAttribute('lang')).toBe('ru');
        await w.setProps({ modelValue: 'en' });
        expect(root.getAttribute('lang')).toBe('en');
        w.unmount();

        root.removeAttribute('lang');
        const quiet = mountSwitch({ apply: false });
        await nextTick();
        expect(root.hasAttribute('lang')).toBe(false);
        quiet.unmount();
    });

    it('without v-model it keeps the choice itself, starting on the first language', async () => {
        const w = mountSwitch({ modelValue: undefined });
        expect(w.find('button').text()).toContain('Русский');
        await w.find('button').trigger('click');
        await nextTick();
        (document.querySelectorAll('[role="menuitemradio"]')[1] as HTMLElement).click();
        await nextTick();
        expect(w.find('button').text()).toContain('English');
        w.unmount();
    });
});
