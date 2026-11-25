import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createKitPrefs } from '../src/kitPrefs';
import { localeEn, localeRu, setTaoLocale, taoLocale } from '../src/locale';

// createKitPrefs: the mode, the palette and the language of a product, read, put on the page, followed and saved in one call.
// createKitPrefs: режим, палитра и язык продукта: прочитаны, поставлены на страницу, отслежены и сохранены одним вызовом.

function memory(initial: Record<string, string> = {}) {
    const data = { ...initial };
    return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) };
}

let light = false;
let listener: (() => void) | null = null;

beforeEach(() => {
    light = false;
    listener = null;
    vi.stubGlobal('matchMedia', () => ({
        get matches() {
            return light;
        },
        addEventListener: (_: string, fn: () => void) => (listener = fn),
        removeEventListener: () => (listener = null),
    }));
});

afterEach(() => {
    vi.unstubAllGlobals();
    setTaoLocale(localeEn);
});

const root = () => document.createElement('html');

describe('what it reads', () => {
    it('without anything saved: the system mode, no palette, the browser language among the locales', () => {
        const r = root();
        const prefs = createKitPrefs({ storage: null, root: r, locales: { en: localeEn, ru: localeRu } });
        expect([prefs.mode.value, prefs.palette.value]).toEqual(['system', '']);
        expect(prefs.locale.value).toBe('en');
        prefs.dispose();
    });

    it('what is saved wins over the defaults', () => {
        const storage = memory({ 'app.mode': 'light', 'app.palette': 'lagoon', 'app.locale': 'ru' });
        const prefs = createKitPrefs({ key: 'app', storage, root: root(), mode: 'dark' });
        expect([prefs.mode.value, prefs.palette.value, prefs.locale.value]).toEqual(['light', 'lagoon', 'ru']);
        prefs.dispose();
    });

    it('a saved value that makes no sense is ignored', () => {
        const storage = memory({ 'app.mode': 'purple', 'app.locale': 'xx' });
        const prefs = createKitPrefs({ key: 'app', storage, root: root(), mode: 'dark', locale: 'ru' });
        expect([prefs.mode.value, prefs.locale.value]).toEqual(['dark', 'ru']);
        prefs.dispose();
    });

    it('a storage that throws is a page that saves nothing, not a crash', () => {
        const broken = {
            getItem: () => {
                throw new Error('blocked');
            },
            setItem: () => {
                throw new Error('blocked');
            },
        };
        const prefs = createKitPrefs({ key: 'app', storage: broken, root: root() });
        prefs.mode.value = 'dark';
        expect(prefs.mode.value).toBe('dark');
        prefs.dispose();
    });
});

describe('what it puts on the page', () => {
    it('the mode, the palette and the language', () => {
        const r = root();
        const prefs = createKitPrefs({ storage: null, root: r, mode: 'light', palette: 'lagoon', locale: 'ru' });
        expect(r.getAttribute('data-tao-mode')).toBe('light');
        expect(r.getAttribute('data-tao-theme')).toBe('lagoon');
        expect(r.getAttribute('lang')).toBe('ru');
        expect(taoLocale().code).toBe(localeRu.code);
        prefs.dispose();
    });

    it('a change goes to the page at once; no palette removes the attribute', async () => {
        const r = root();
        const prefs = createKitPrefs({ storage: null, root: r, mode: 'light', palette: 'lagoon' });
        prefs.mode.value = 'dark';
        prefs.palette.value = '';
        prefs.locale.value = 'ru';
        await nextTick();
        expect(r.getAttribute('data-tao-mode')).toBe('dark');
        expect(r.hasAttribute('data-tao-theme')).toBe(false);
        expect(taoLocale().code).toBe(localeRu.code);
        prefs.dispose();
    });

    it('a palette stays when the mode changes', async () => {
        const r = root();
        const prefs = createKitPrefs({ storage: null, root: r, mode: 'dark', palette: 'lagoon' });
        prefs.mode.value = 'light';
        await nextTick();
        expect([r.getAttribute('data-tao-mode'), r.getAttribute('data-tao-theme')]).toEqual(['light', 'lagoon']);
        prefs.dispose();
    });

    it('your own languages: a code is looked up in `locales`', () => {
        const prefs = createKitPrefs({ storage: null, root: root(), locales: { en: localeEn, tr: { ...localeRu, code: 'tr' } }, locale: 'tr' });
        expect(taoLocale().code).toBe('tr');
        prefs.dispose();
    });
});

describe('the system', () => {
    it('follows the operating system while the mode is system, and only then', async () => {
        const r = root();
        const prefs = createKitPrefs({ storage: null, root: r, mode: 'system' });
        expect(prefs.resolvedMode.value).toBe('dark');
        light = true;
        listener!();
        await nextTick();
        expect(prefs.resolvedMode.value).toBe('light');
        expect(r.getAttribute('data-tao-mode')).toBe('light');
        prefs.mode.value = 'dark';
        await nextTick();
        light = false;
        listener?.();
        expect(prefs.resolvedMode.value).toBe('dark');
        prefs.dispose();
    });

    it('dispose stops watching the system and saving', async () => {
        const storage = memory();
        const prefs = createKitPrefs({ key: 'app', storage, root: root() });
        prefs.dispose();
        expect(listener).toBeNull();
        prefs.mode.value = 'light';
        await nextTick();
        expect(storage.data['app.mode']).toBeUndefined();
    });
});

describe('what it saves', () => {
    it('every change, under the key given; nothing without a key', async () => {
        const storage = memory();
        const prefs = createKitPrefs({ key: 'app', storage, root: root() });
        prefs.mode.value = 'light';
        prefs.palette.value = 'sunset';
        prefs.locale.value = 'ru';
        await nextTick();
        expect(storage.data).toEqual({ 'app.mode': 'light', 'app.palette': 'sunset', 'app.locale': 'ru' });
        prefs.dispose();

        const other = memory();
        const keyless = createKitPrefs({ storage: other, root: root() });
        keyless.mode.value = 'light';
        await nextTick();
        expect(other.data).toEqual({});
        keyless.dispose();
    });

    it('what it saved comes back next time', async () => {
        const storage = memory();
        const first = createKitPrefs({ key: 'app', storage, root: root() });
        first.mode.value = 'light';
        first.locale.value = 'ru';
        await nextTick();
        first.dispose();
        const second = createKitPrefs({ key: 'app', storage, root: root() });
        expect([second.mode.value, second.locale.value]).toEqual(['light', 'ru']);
        second.dispose();
    });
});
