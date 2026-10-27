/**
 * One section of the app in TaoNav. The same data for every layout: a bottom bar, a rail, a drawer.
 * Один раздел приложения в TaoNav. Одни данные для всех видов: нижняя панель, рейка, боковая панель.
 */
export interface TaoNavItem {
    id: string;
    label: string;
    /** Icon name for TaoIcon (the bar and the rail show it above the label). / Имя иконки для TaoIcon. */
    icon?: string;
    /** A link: rendered as `<a href>`; without it a button. / Ссылка: рендерится как `<a href>`, без неё кнопка. */
    href?: string;
    /** A count (`3`, `'99+'`) or `true` for a dot. / Счётчик или `true` для точки. */
    badge?: number | string | boolean;
    disabled?: boolean;
}

/**
 * `bar` — a bottom bar for 3–5 sections, `rail` — a narrow side rail with icons, `drawer` — a side panel with labels,
 * `auto` — chosen by the width of TaoNav itself: bar below 600px, rail below 840px, drawer from 840px.
 * `bar` — нижняя панель на 3–5 разделов, `rail` — узкая боковая рейка с иконками, `drawer` — боковая панель с подписями,
 * `auto` — по ширине самого TaoNav: bar до 600px, rail до 840px, drawer от 840px.
 */
export type TaoNavLayout = 'auto' | 'bar' | 'rail' | 'drawer';
