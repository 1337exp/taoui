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

export interface TaoConfirmShortcutOptions {
    message?: string;
    ok?: string;
    cancel?: string;
    danger?: boolean;
    surface?: TaoSurface;
}
