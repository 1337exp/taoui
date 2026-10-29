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
    closeLabel: string;
    /** `glass` by default; `flat` turns it off. / По умолчанию `glass`; `flat` выключает. */
    surface: TaoSurface;
}

export interface TaoToastShortcutOptions {
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
