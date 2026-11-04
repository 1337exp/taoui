import { computed, inject, provide, shallowRef, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import { configureConfirmDefaults } from '../confirm/store';
import { configureToastDefaults } from '../toast/store';
import { localeEn } from './en';
import type { TaoLocale, TaoLocaleOverrides, TaoText } from './types';

export { localeRu } from './ru';
export { localeEn } from './en';
export type { TaoLocale, TaoLocaleOverrides, TaoPluralForms, TaoText } from './types';
export { detectTaoLanguage, matchTaoLanguage, parseAcceptLanguage } from './detect';

const current = shallowRef<TaoLocale>(localeEn);

/**
 * A locale provided to a subtree (or to a whole app on the server): components read it before the global one.
 * Локаль, выданная поддереву (или всему приложению на сервере): компоненты читают её раньше глобальной.
 */
export const localeKey: InjectionKey<Readonly<Ref<TaoLocale>>> = Symbol('taoLocale');

/** The active locale. / Активная локаль. */
export function taoLocale(): TaoLocale {
    return current.value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function merge<T>(base: T, overrides: unknown): T {
    if (!isPlainObject(base) || !isPlainObject(overrides)) {
        return (overrides === undefined ? base : overrides) as T;
    }
    const out: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(overrides)) {
        if (value !== undefined) {
            out[key] = merge(base[key], value);
        }
    }
    return out as T;
}

/**
 * Sets the language of built-in texts: a whole locale (`localeRu`) or a few keys on top of `base`
 * (English by default). Works at any moment: components already on the page switch at once.
 *
 * Задаёт язык встроенных текстов: целую локаль (`localeRu`) или несколько ключей поверх `base`
 * (по умолчанию английской). Работает в любой момент: уже показанные компоненты переключаются сразу.
 */
export function setTaoLocale(locale: TaoLocaleOverrides, base: TaoLocale = localeEn) {
    current.value = merge(base, locale);
    configureToastDefaults({ closeLabel: current.value.toast.closeLabel });
    configureConfirmDefaults({ ok: current.value.confirm.ok, cancel: current.value.confirm.cancel });
}

/** A locale value made of a whole locale or a few keys on top of `base`. / Значение локали: целая или несколько ключей поверх `base`. */
export function createTaoLocale(locale: TaoLocaleOverrides, base: TaoLocale = localeEn): Readonly<Ref<TaoLocale>> {
    return shallowRef(merge(base, locale));
}

/**
 * Gives the components below the calling one another language, without touching the global one:
 * `provideTaoLocale(localeRu)` in the setup of a bilingual block.
 * Даёт компонентам ниже другой язык, не трогая глобальный: `provideTaoLocale(localeRu)` в setup двуязычного блока.
 */
export function provideTaoLocale(locale: TaoLocaleOverrides, base: TaoLocale = localeEn) {
    provide(localeKey, createTaoLocale(locale, base));
}

/**
 * The locale in effect for the calling component: the provided one, otherwise the global one. Call it from `setup`.
 * Действующая локаль для вызывающего компонента: выданная или глобальная. Вызывать из `setup`.
 */
export function useTaoLocale(): ComputedRef<TaoLocale> {
    const provided = inject(localeKey, null);
    return computed(() => (provided ?? current).value);
}

/**
 * Texts of one component: a prop passed by hand wins, otherwise the active locale.
 * Reactive — switching the locale updates components that are already on the page.
 * Тексты одного компонента: переданный проп главнее, иначе активная локаль.
 * Реактивно — смена локали обновляет уже смонтированные компоненты.
 */
export function useLocaleText<K extends Exclude<keyof TaoLocale, 'code'>>(
    props: object,
    section: K,
): ComputedRef<TaoLocale[K]> {
    const locale = useTaoLocale();
    return computed(() => {
        const base = locale.value[section] as Record<string, unknown>;
        const own = props as Record<string, unknown>;
        const out: Record<string, unknown> = { ...base };
        for (const key of Object.keys(base)) {
            if (own[key] !== undefined) {
                out[key] = own[key];
            }
        }
        return out as TaoLocale[K];
    });
}

/**
 * Puts the values into a text: `'Слайд {n} из {count}'` + `{ n: 1, count: 5 }`. A text may also be plural forms: the form is
 * chosen by the number `count` (or `n`) in `values` and the plural rules of `code` (the language of the locale in effect by
 * default). A plain string is used as it is for every number.
 * Подставляет значения в текст. Текст может быть и формами множественного числа: форма выбирается по числу `count`
 * (или `n`) в `values` и правилам множественного числа языка `code` (по умолчанию язык действующей локали).
 * Обычная строка берётся как есть для любого числа.
 */
export function formatText(template: TaoText, values: Record<string, string | number>, code?: string): string {
    const text = typeof template === 'string' ? template : pluralForm(template, Number(values.count ?? values.n), code ?? current.value.code);
    return text.replace(/\{(\w+)\}/g,(match, key: string) => (key in values ? String(values[key]) : match));
}

/** The form for a number; `other` when the number is not a number or the form is missing. / Форма для числа; `other`, если это не число или формы нет. */
function pluralForm(forms: Exclude<TaoText, string>, n: number, code: string): string {
    if (!Number.isFinite(n)) {
        return forms.other;
    }
    let category: Intl.LDMLPluralRule = 'other';
    try {
        category = new Intl.PluralRules(code).select(n);
    } catch {
        // a tag that Intl does not know: the form for everything else / тег, которого Intl не знает: форма «для остального»
    }
    return forms[category] ?? forms.other;
}
