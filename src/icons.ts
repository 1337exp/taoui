import { shallowReactive } from 'vue';

/**
 * Built-in icons: 24x24, a 2px round stroke, `currentColor`, so an icon follows the text colour and the font size.
 * They live under the reserved prefix `tao-` (`<TaoIcon name="tao-check" />`), so they never clash with the names of
 * your own icon font (`name="check"` still means `icon-check` of your font) or with icons you register.
 *
 * Встроенные иконки: 24x24, обводка 2px со скруглениями, `currentColor`: иконка следует цвету и размеру текста.
 * Живут под зарезервированной приставкой `tao-` (`<TaoIcon name="tao-check" />`), поэтому не пересекаются с именами
 * вашего шрифта (`name="check"` по-прежнему значит `icon-check` из вашего шрифта) и с зарегистрированными иконками.
 */
export interface TaoIconDef {
    /** The inner markup of the `<svg>` (paths, circles). Trusted: it is written by the library or by your app. / Внутренняя разметка `<svg>`. */
    body: string;
    /** `0 0 24 24` unless the icon is drawn on another grid. / `0 0 24 24`, если не другая сетка. */
    viewBox?: string;
    /**
     * Only straight horizontal and vertical lines through the middle (a plus, a minus). Scaled down, such a line falls
     * between two pixels and goes soft; with `grid` it is drawn 2 screen pixels wide and snapped to the pixel grid.
     * Только прямые линии через середину (плюс, минус). При уменьшении такая линия ложится между пикселями и мылится;
     * с `grid` она рисуется шириной 2 экранных пикселя и привязывается к пиксельной сетке.
     */
    grid?: boolean;
}

/** Prefix of the built-in icon names. / Приставка имён встроенных иконок. */
export const TAO_ICON_PREFIX = 'tao-';

const dot = (cx: number, cy: number, r = 1.4) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none"/>`;

const builtin: Record<string, TaoIconDef> = {
    check: { body: '<path d="M5 12.5l4.5 4.5L19 7.5"/>' },
    close: { body: '<path d="M6 6l12 12M18 6L6 18"/>' },
    plus: { body: '<path d="M12 5v14M5 12h14"/>', grid: true },
    minus: { body: '<path d="M5 12h14"/>', grid: true },
    'chevron-up': { body: '<path d="M6 15l6-6 6 6"/>' },
    'chevron-down': { body: '<path d="M6 9l6 6 6-6"/>' },
    'chevron-left': { body: '<path d="M15 6l-6 6 6 6"/>' },
    'chevron-right': { body: '<path d="M9 6l6 6-6 6"/>' },
    'arrow-up': { body: '<path d="M12 19V5M6 11l6-6 6 6"/>' },
    'arrow-down': { body: '<path d="M12 5v14M6 13l6 6 6-6"/>' },
    search: { body: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>' },
    eye: { body: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>' },
    'eye-off': { body: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/>' },
    'more-vertical': { body: dot(12, 5) + dot(12, 12) + dot(12, 19) },
    'more-horizontal': { body: dot(5, 12) + dot(12, 12) + dot(19, 12) },
    grip: { body: dot(9, 6) + dot(15, 6) + dot(9, 12) + dot(15, 12) + dot(9, 18) + dot(15, 18) },
    play: { body: '<path d="M7.5 5v14l11-7z" fill="currentColor"/>' },
    pause: { body: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/>' },
    'skip-back': { body: '<path d="M19 5.5v13L9.5 12z" fill="currentColor"/><path d="M6 5.5v13"/>' },
    copy: { body: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2h3"/>' },
    calendar: { body: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>' },
    info: { body: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/>' + dot(12, 7.8, 1.1) },
    'alert-triangle': { body: '<path d="M12 4L2.8 19.5h18.4z"/><path d="M12 10v4.5"/>' + dot(12, 17.2, 1.1) },
    'x-circle': { body: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>' },
    circle: { body: '<circle cx="12" cy="12" r="7.5"/>' },
    'circle-dashed': { body: '<circle cx="12" cy="12" r="7.5" stroke-dasharray="24 12"/>' },
    'check-circle': { body: '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.8L16 9.5"/>' },
    folder: { body: '<path d="M3.5 7a2 2 0 012-2h4l2 2.5h7a2 2 0 012 2V17a2 2 0 01-2 2h-13a2 2 0 01-2-2z"/>' },
    file: { body: '<path d="M14 3.5H7.5A1.5 1.5 0 006 5v14a1.5 1.5 0 001.5 1.5h9A1.5 1.5 0 0018 19V7.5z"/><path d="M14 3.5v4h4"/>' },
};

/** Icons registered by the app, by any name that does not start with `tao-`. / Иконки приложения под любым именем без `tao-`. */
const registered = shallowReactive<Record<string, TaoIconDef>>({});

/**
 * Registers your own SVG icons: `registerTaoIcons({ rocket: { body: '<path d="..."/>' } })`, then `<TaoIcon name="rocket" />`.
 * The names must not start with `tao-`: that prefix belongs to the built-in set.
 * Регистрирует ваши SVG-иконки. Имена не должны начинаться с `tao-`: приставка принадлежит встроенному набору.
 */
export function registerTaoIcons(icons: Record<string, TaoIconDef>) {
    for (const [name, def] of Object.entries(icons)) {
        if (name.startsWith(TAO_ICON_PREFIX)) {
            throw new Error(`[TaoUI] registerTaoIcons: "${name}" starts with the reserved prefix "${TAO_ICON_PREFIX}"`);
        }
        registered[name] = def;
    }
}

/** The SVG definition behind a name, or undefined: then TaoIcon falls back to the `icon-<name>` font class. / Описание SVG или undefined. */
export function resolveTaoIcon(name: string): TaoIconDef | undefined {
    return name.startsWith(TAO_ICON_PREFIX) ? builtin[name.slice(TAO_ICON_PREFIX.length)] : registered[name];
}

/** Names of the built-in icons, with the prefix. / Имена встроенных иконок с приставкой. */
export const taoIconNames = Object.keys(builtin).map((name) => TAO_ICON_PREFIX + name);
