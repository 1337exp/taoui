import { computed, shallowRef, type ComputedRef } from 'vue';
import { configureConfirmDefaults } from '../confirm/store';
import { configureToastDefaults } from '../toast/store';
import { localeRu } from './ru';
import type { TaoLocale, TaoLocaleOverrides } from './types';

export { localeRu } from './ru';
export { localeEn } from './en';
export type { TaoLocale, TaoLocaleOverrides } from './types';

const current = shallowRef<TaoLocale>(localeRu);

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
 * Sets the language of built-in texts: a whole locale (`localeEn`) or a few keys on top of `base`
 * (Russian by default). Works at any moment: components already on the page switch at once.
 *
 * Задаёт язык встроенных текстов: целую локаль (`localeEn`) или несколько ключей поверх `base`
 * (по умолчанию русской). Работает в любой момент: уже показанные компоненты переключаются сразу.
 */
export function setTaoLocale(locale: TaoLocaleOverrides, base: TaoLocale = localeRu) {
    current.value = merge(base, locale);
    configureToastDefaults({ closeLabel: current.value.toast.closeLabel });
    configureConfirmDefaults({ ok: current.value.confirm.ok, cancel: current.value.confirm.cancel });
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
    return computed(() => {
        const base = current.value[section] as Record<string, unknown>;
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

/** `'Слайд {n} из {count}'` + `{ n: 1, count: 5 }`. */
export function formatText(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
