export type TaoToastType = 'success' | 'error' | 'danger' | 'warning' | 'info' | 'neutral';

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
    displayMode?: TaoToastDisplayMode;
    dedupeId?: string;
    actions: TaoToastAction[];
    onClosed?: () => void;
}

export interface TaoToastDefaults {
    position: TaoToastPosition;
    timeout: number;
    closable: boolean;
    progress: boolean;
}

export interface TaoToastShortcutOptions {
    title?: string;
    timeout?: number;
    position?: TaoToastPosition;
    icon?: string;
    closable?: boolean;
    progress?: boolean;
    id?: string;
    once?: boolean;
    replace?: boolean;
    actions?: TaoToastAction[];
    onClosed?: () => void;
}
