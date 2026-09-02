export interface TaoConfirmDefaults {
    ok: string;
    cancel: string;
}

export interface TaoConfirmRecord {
    id: string;
    title: string;
    message: string;
    okLabel: string;
    cancelLabel: string;
    danger: boolean;
    resolve: (value: boolean) => void;
}

export interface TaoConfirmShortcutOptions {
    message?: string;
    ok?: string;
    cancel?: string;
    danger?: boolean;
}
