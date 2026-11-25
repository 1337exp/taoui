// `@1337exp/taoui/plugin`: registers EVERY component globally (`app.use(TaoUI)`) and sets the language of the built-in texts.
// It is a separate entry on purpose: the root entry is only named exports, so an app that imports `{ TaoButton }` pays for the button and its
// CSS, and an app that installs this plugin pays for the whole kit (that is the price of global registration, measured: ~364 KB JS and ~238 KB CSS).
// `@1337exp/taoui/plugin`: регистрирует ВСЕ компоненты глобально (`app.use(TaoUI)`) и задаёт язык встроенных текстов.
// Это отдельный вход намеренно: корневой вход — только именованные экспорты, поэтому приложение, которое импортирует `{ TaoButton }`, платит за
// кнопку и её CSS, а приложение с этим плагином платит за весь набор (цена глобальной регистрации, измерена: ~364 КБ JS и ~238 КБ CSS).
import type { Component, Plugin } from 'vue';
import * as kit from './index';
import { createTaoLocale, localeKey, setTaoLocale, type TaoLocale, type TaoLocaleOverrides } from './locale';

export interface TaoUIOptions {
    /**
     * Language of built-in texts: `localeRu` (or any other), or a few keys on top of English (the default).
     * Язык встроенных текстов: `localeRu` (или любая другая) или несколько ключей поверх английской (по умолчанию).
     */
    locale?: TaoLocale | TaoLocaleOverrides;
}

/** Every component the kit exports: an object with a `setup` or a `render` (a function, a number or a locale is not one). / Каждый экспортируемый компонент: объект с `setup` или `render` (функция, число или локаль — нет). */
function isComponent(value: unknown): value is Component & { name?: string } {
    return typeof value === 'object' && value !== null && ('setup' in value || 'render' in value);
}

const components: [string, Component & { name?: string }][] = [];
for (const [name, value] of Object.entries(kit) as [string, unknown][]) {
    if (/^Tao[A-Z]/.test(name) && isComponent(value)) {
        components.push([name, value]);
    }
}

export const TaoUI: Plugin<[TaoUIOptions?]> = {
    install(app, options: TaoUIOptions = {}) {
        if (options.locale) {
            if (typeof window === 'undefined') {
                // on the server the process is shared by every request: the language belongs to this app only
                app.provide(localeKey, createTaoLocale(options.locale));
            } else {
                setTaoLocale(options.locale);
            }
        }
        for (const [name, component] of components) {
            app.component(component.name || name, component);
        }
    },
};

export default TaoUI;
