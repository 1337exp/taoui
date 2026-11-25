import { computed, effectScope, ref, watch, type ComputedRef, type Ref } from 'vue';
import { detectTaoLanguage, localeEn, localeRu, setTaoLocale, type TaoLocaleOverrides } from './locale';
import { applyTaoMode, resolveTaoMode, systemTaoMode, type TaoMode, type TaoModeChoice } from './themeMode';

/**
 * The preferences every product sets up the same way: the mode of the page (light, dark, or the system's), the palette, and the
 * language of the kit's own texts. One call reads what was saved, puts it on the page (`data-tao-mode`, `data-tao-theme`, `lang`,
 * `setTaoLocale`), keeps the page in step with the operating system while the mode is `system`, and saves every change. The refs it
 * gives bind to `TaoThemeToggle` (`:apply="false"`, `system`) and `TaoLanguageSwitch`.
 * Настройки, которые каждый продукт заводит одинаково: режим страницы (светлый, тёмный или системный), палитра и язык собственных
 * текстов набора. Один вызов читает сохранённое, ставит его на страницу (`data-tao-mode`, `data-tao-theme`, `lang`,
 * `setTaoLocale`), держит страницу в ногу с системой, пока режим `system`, и сохраняет каждое изменение. Выданные ref привязываются
 * к `TaoThemeToggle` (`:apply="false"`, `system`) и `TaoLanguageSwitch`.
 */
export interface TaoKitPrefsOptions {
    /** Prefix of the keys it saves under: `<key>.mode`, `<key>.palette`, `<key>.locale`. Without it nothing is saved. / Префикс ключей, под которыми сохраняет. Без него ничего не сохраняется. */
    key?: string;
    /** The mode when nothing is saved. `system` by default. / Режим, когда ничего не сохранено. По умолчанию `system`. */
    mode?: TaoModeChoice;
    /** The palette when nothing is saved: a name of `taoPalettes` (its CSS is imported), `''` is the default theme. / Палитра, когда ничего не сохранено. */
    palette?: string;
    /** The languages of the kit's texts: code → locale. `en` and `ru` by default. / Языки текстов набора: код → локаль. По умолчанию `en` и `ru`. */
    locales?: Record<string, TaoLocaleOverrides>;
    /** The language when nothing is saved: else the one of the browser among `locales`, else the first. / Язык, когда ничего не сохранено. */
    locale?: string;
    /** Where it saves: `localStorage` by default; `null` saves nothing. / Куда сохраняет: по умолчанию `localStorage`; `null` — не сохранять. */
    storage?: Pick<Storage, 'getItem' | 'setItem'> | null;
    /** The element the attributes go on: `<html>` by default. / Элемент, на который идут атрибуты: по умолчанию `<html>`. */
    root?: HTMLElement | null;
}

export interface TaoKitPrefs {
    /** What the person picked: `light`, `dark` or `system`. / Что выбрал человек. */
    mode: Ref<TaoModeChoice>;
    /** The mode the page is in now (`system` resolved). / Режим, в котором страница сейчас (`system` сведён к одному из двух). */
    resolvedMode: ComputedRef<TaoMode>;
    /** The palette name; `''` is the default theme. / Имя палитры; `''` — тема по умолчанию. */
    palette: Ref<string>;
    /** The code of the language of the kit's texts. / Код языка текстов набора. */
    locale: Ref<string>;
    /** Stops watching the system and saving. / Перестаёт следить за системой и сохранять. */
    dispose(): void;
}

function defaultStorage(): TaoKitPrefsOptions['storage'] {
    try {
        return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
        // a browser that refuses storage (a private window, a blocked cookie) is a page that saves nothing
        return null;
    }
}

function read(storage: TaoKitPrefsOptions['storage'], key: string | undefined, name: string): string | null {
    if (!storage || !key) return null;
    try {
        return storage.getItem(`${key}.${name}`);
    } catch {
        return null;
    }
}

function write(storage: TaoKitPrefsOptions['storage'], key: string | undefined, name: string, value: string) {
    if (!storage || !key) return;
    try {
        storage.setItem(`${key}.${name}`, value);
    } catch {
        // full or refused: the preference lives until the page closes
    }
}

const isChoice = (value: string | null): value is TaoModeChoice => value === 'light' || value === 'dark' || value === 'system';

export function createKitPrefs(options: TaoKitPrefsOptions = {}): TaoKitPrefs {
    const storage = options.storage === undefined ? defaultStorage() : options.storage;
    const root = options.root === undefined ? (typeof document === 'undefined' ? null : document.documentElement) : options.root;
    const locales: Record<string, TaoLocaleOverrides> = options.locales ?? { en: localeEn, ru: localeRu };
    const codes = Object.keys(locales);

    const savedMode = read(storage, options.key, 'mode');
    const savedLocale = read(storage, options.key, 'locale');
    const mode = ref<TaoModeChoice>(isChoice(savedMode) ? savedMode : (options.mode ?? 'system'));
    const palette = ref<string>(read(storage, options.key, 'palette') ?? options.palette ?? '');
    const locale = ref<string>(
        savedLocale && savedLocale in locales ? savedLocale : options.locale && options.locale in locales ? options.locale : detectTaoLanguage(codes),
    );

    // the system's mode is a live value while `system` is picked
    const system = ref<TaoMode>(systemTaoMode());
    const resolvedMode = computed<TaoMode>(() => (mode.value === 'system' ? system.value : resolveTaoMode(mode.value)));

    const scope = effectScope(true);
    let media: MediaQueryList | null = null;
    const onSystem = () => (system.value = systemTaoMode());
    if (typeof matchMedia !== 'undefined') {
        media = matchMedia('(prefers-color-scheme: light)');
        media.addEventListener?.('change', onSystem);
    }

    scope.run(() => {
        watch(
            resolvedMode,
            (value) => {
                if (root) applyTaoMode(root, value);
            },
            { immediate: true },
        );
        watch(
            palette,
            (value) => {
                if (!root) return;
                if (value) root.setAttribute('data-tao-theme', value);
                else root.removeAttribute('data-tao-theme');
                // a palette goes with the mode it is in: the mode attribute is not lost when the theme attribute changes
                applyTaoMode(root, resolvedMode.value);
            },
            { immediate: true },
        );
        watch(
            locale,
            (code) => {
                setTaoLocale(locales[code] ?? localeEn);
                if (root) root.setAttribute('lang', code);
            },
            { immediate: true },
        );
        watch(mode, (value) => write(storage, options.key, 'mode', value));
        watch(palette, (value) => write(storage, options.key, 'palette', value));
        watch(locale, (value) => write(storage, options.key, 'locale', value));
    });

    return {
        mode,
        resolvedMode,
        palette,
        locale,
        dispose() {
            media?.removeEventListener?.('change', onSystem);
            scope.stop();
        },
    };
}
