import { computed, effectScope, getCurrentInstance, onMounted, provide, ref, watch, type ComputedRef, type Ref } from 'vue';
import { createTaoLocale, detectTaoLanguage, localeEn, localeKey, localeRu, setTaoLocale, type TaoLocaleOverrides } from './locale';
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
    /**
     * For an app that is rendered on the server and hydrates. The first state comes from the options only (the same on the server and in
     * the browser, so the markup matches); what was saved and the mode of the system are read by `restore()`, which is called from
     * `onMounted` by itself when `createKitPrefs` runs in a component, and nothing is saved before it. Off by default: a page that is
     * not rendered on the server reads them at once and does not flash the wrong theme.
     * Для приложения, которое рендерится на сервере и гидратируется. Первое состояние берётся только из опций (на сервере и в браузере
     * одно и то же, разметка совпадает); сохранённое и режим системы читает `restore()`, он зовётся из `onMounted` сам, когда
     * `createKitPrefs` вызван в компоненте, и до него ничего не сохраняется. По умолчанию выключено: страница без серверного рендера
     * читает их сразу и не мигает чужой темой.
     */
    deferred?: boolean;
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
    /**
     * With `deferred`: reads what was saved and the mode of the system, and starts to follow it and to save. Called once (the next calls
     * do nothing); in a component it is called from `onMounted` for you. Without `deferred` there is nothing left to do.
     * С `deferred`: читает сохранённое и режим системы, начинает следить за ней и сохранять. Зовётся один раз (следующие вызовы ничего
     * не делают); в компоненте его зовёт `onMounted`. Без `deferred` делать уже нечего.
     */
    restore(): void;
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

    const deferred = Boolean(options.deferred);
    const pickMode = (saved: string | null) => (isChoice(saved) ? saved : (options.mode ?? 'system'));
    const pickLocale = (saved: string | null, detect: boolean) =>
        saved && saved in locales
            ? saved
            : options.locale && options.locale in locales
              ? options.locale
              : detect
                ? detectTaoLanguage(codes)
                : (codes[0] ?? 'en');

    // deferred: the first state is the options and nothing else, so the server and the first render of the browser agree
    // deferred: первое состояние это опции и ничего больше, так что сервер и первый рендер браузера совпадают
    const mode = ref<TaoModeChoice>(pickMode(deferred ? null : read(storage, options.key, 'mode')));
    const palette = ref<string>((deferred ? null : read(storage, options.key, 'palette')) ?? options.palette ?? '');
    const locale = ref<string>(pickLocale(deferred ? null : read(storage, options.key, 'locale'), !deferred));

    // the system's mode is a live value while `system` is picked
    // deferred: the server does not know the scheme of the system, so the first state is the server's (dark) and `restore()` reads the real one
    // deferred: сервер не знает схему системы, поэтому первое состояние серверное (тёмное), а настоящую читает `restore()`
    const system = ref<TaoMode>(deferred ? 'dark' : systemTaoMode());
    const resolvedMode = computed<TaoMode>(() => (mode.value === 'system' ? system.value : resolveTaoMode(mode.value)));

    const scope = effectScope(true);
    let media: MediaQueryList | null = null;
    const onSystem = () => (system.value = systemTaoMode());
    const follow = () => {
        if (typeof matchMedia !== 'undefined' && !media) {
            media = matchMedia('(prefers-color-scheme: light)');
            media.addEventListener?.('change', onSystem);
        }
    };
    // nothing is saved before what was saved has been read
    // ничего не сохраняется, пока не прочитано сохранённое
    let ready = !deferred;
    if (!deferred) {
        follow();
    }

    // on the server there is one module for every request: the language goes to the tree of this app by `provide`, not to the global locale
    // на сервере один модуль на все запросы: язык уходит в дерево этого приложения через `provide`, а не в глобальную локаль
    const onServer = typeof window === 'undefined';
    const instance = getCurrentInstance();
    const provided = onServer && instance ? computed(() => createTaoLocale(locales[locale.value] ?? localeEn).value) : null;
    if (provided) {
        provide(localeKey, provided);
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
                if (!provided) setTaoLocale(locales[code] ?? localeEn);
                if (root) root.setAttribute('lang', code);
            },
            { immediate: true },
        );
        watch(mode, (value) => ready && write(storage, options.key, 'mode', value));
        watch(palette, (value) => ready && write(storage, options.key, 'palette', value));
        watch(locale, (value) => ready && write(storage, options.key, 'locale', value));
    });

    let disposed = false;
    function restore() {
        if (ready || disposed) {
            return;
        }
        // the saved values are assigned first, so what was saved is not overwritten by the defaults; saving starts after that
        // сначала присваиваются сохранённые значения, чтобы сохранённое не затёрлось значениями по умолчанию; сохранение после этого
        mode.value = pickMode(read(storage, options.key, 'mode'));
        palette.value = read(storage, options.key, 'palette') ?? options.palette ?? '';
        locale.value = pickLocale(read(storage, options.key, 'locale'), true);
        system.value = systemTaoMode();
        follow();
        ready = true;
    }
    if (deferred && instance) {
        onMounted(restore);
    }

    return {
        mode,
        resolvedMode,
        palette,
        locale,
        restore,
        dispose() {
            disposed = true;
            media?.removeEventListener?.('change', onSystem);
            scope.stop();
        },
    };
}
