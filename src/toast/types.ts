import type { TaoSurface } from '../surface';

export type TaoToastType = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export type TaoToastPosition =
    | 'topRight'
    | 'topLeft'
    | 'topCenter'
    | 'bottomRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'center';

export type TaoToastDisplayMode = 'once' | 'replace';

export interface TaoToastAction {
    label: string;
    onClick: () => void;
}

export interface TaoToastRecord {
    id: string;
    type: TaoToastType;
    title: string;
    message: string;
    icon: string;
    timeout: number;
    position: TaoToastPosition;
    closable: boolean;
    progress: boolean;
    surface: TaoSurface;
    displayMode?: TaoToastDisplayMode;
    dedupeId?: string;
    actions: TaoToastAction[];
    onClosed?: () => void;
    /** Work in progress: a spinner instead of the icon, no timeout. / Идёт работа: кольцо вместо иконки, без таймаута. */
    loading?: boolean;
}

/** The texts of `toast.promise`: a function gets the result or the error. / Тексты `toast.promise`. */
export interface TaoToastPromiseTexts<T> {
    loading: string;
    success: string | ((value: T) => string);
    error: string | ((error: unknown) => string);
}

export interface TaoToastDefaults {
    position: TaoToastPosition;
    timeout: number;
    closable: boolean;
    progress: boolean;
    /** Not set: the text of the locale in effect. / Не задан: текст действующей локали. */
    closeLabel?: string | undefined;
    /** `glass` by default; `flat` turns it off. / По умолчанию `glass`; `flat` выключает. */
    surface: TaoSurface;
}

/** What `toast({...})` takes: one object. `message` or `title` is needed, or nothing is shown. / Что берёт `toast({...})`: один объект. Нужен `message` или `title`, иначе ничего не покажется. */
export interface TaoToastOptions {
    message?: string;
    /** `info` by default; `neutral` has no colour. / По умолчанию `info`; `neutral` без цвета. */
    type?: TaoToastType;
    /** Work in progress: a spinner instead of the icon, no timeout; finish it with a toast of the same `id` and `replace`. / Идёт работа: кольцо вместо иконки, без таймаута. */
    loading?: boolean;
    title?: string;
    timeout?: number;
    position?: TaoToastPosition;
    icon?: string;
    closable?: boolean;
    progress?: boolean;
    surface?: TaoSurface;
    id?: string;
    once?: boolean;
    replace?: boolean;
    actions?: TaoToastAction[];
    onClosed?: () => void;
}

/** What `toast(...)` gives back: its id (the given one, else its own) and a way to close it. / Что отдаёт `toast(...)`: id и способ закрыть. */
export interface TaoToastHandle {
    id: string;
    dismiss(): void;
}
