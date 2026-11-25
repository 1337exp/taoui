import type { TaoSurface } from '../surface';

export interface TaoConfirmDefaults {
    ok: string;
    cancel: string;
    /** `glass` by default; `flat` turns it off. / По умолчанию `glass`; `flat` выключает. */
    surface: TaoSurface;
}

export interface TaoConfirmRecord {
    id: string;
    title: string;
    message: string;
    okLabel: string;
    cancelLabel: string;
    danger: boolean;
    surface: TaoSurface;
    resolve: (value: boolean) => void;
}

/** What `confirm({...})` takes: one object. `title` or `message` is needed, or the answer is `false` at once. / Что берёт `confirm({...})`: один объект. Нужен `title` или `message`. */
export interface TaoConfirmOptions {
    title?: string;
    message?: string;
    ok?: string;
    cancel?: string;
    /** `danger` paints the ok button as a destructive one (a deletion). / `danger` красит кнопку подтверждения как разрушающую (удаление). */
    tone?: 'accent' | 'danger';
    surface?: TaoSurface;
}
