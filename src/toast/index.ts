import { createApp } from 'vue';
import TaoToastViewport from '../components/TaoToastViewport.vue';
import { addToast, configureToastDefaults, dismissToasts, hasToastViewport, toastDefaults } from './store';
import type {
    TaoToastAction,
    TaoToastDefaults,
    TaoToastDisplayMode,
    TaoToastPosition,
    TaoToastRecord,
    TaoToastShortcutOptions,
    TaoToastType,
} from './types';

export type {
    TaoToastAction,
    TaoToastDefaults,
    TaoToastDisplayMode,
    TaoToastPosition,
    TaoToastRecord,
    TaoToastShortcutOptions,
    TaoToastType,
};

const TYPE_TIMEOUT: Record<TaoToastType, number> = {
    success: 3000,
    error: 5000,
    danger: 5000,
    warning: 4000,
    info: 3000,
    neutral: 2500,
};

interface Draft {
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

function isClient() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function nextToastId() {
    return `tao-toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

let hostedApp: ReturnType<typeof createApp> | null = null;

function ensureToastViewport() {
    if (!isClient() || hasToastViewport()) {
        return;
    }

    const host = document.createElement('div');
    host.setAttribute('data-tao-toast-host', '');
    document.body.appendChild(host);
    hostedApp = createApp(TaoToastViewport);
    hostedApp.mount(host);
}

function flushDraft(draft: Draft) {
    if (!isClient()) {
        return;
    }

    if (!draft.title && !draft.message) {
        return;
    }

    const dedupeId =
        draft.dedupeId ??
        (draft.displayMode ? `${draft.type}:${draft.title}:${draft.message}` : undefined);

    ensureToastViewport();

    addToast({
        id: nextToastId(),
        type: draft.type,
        title: draft.title,
        message: draft.message,
        icon: draft.icon,
        timeout: draft.timeout,
        position: draft.position,
        closable: draft.closable,
        progress: draft.progress,
        displayMode: draft.displayMode,
        dedupeId,
        actions: draft.actions,
        onClosed: draft.onClosed,
    });
}

function createDraft(): Draft {
    return {
        type: 'info',
        title: '',
        message: '',
        icon: '',
        timeout: toastDefaults.timeout,
        position: toastDefaults.position,
        closable: toastDefaults.closable,
        progress: toastDefaults.progress,
        actions: [],
    };
}

export interface TaoToastBuilder {
    success(): TaoToastBuilder;
    error(): TaoToastBuilder;
    danger(): TaoToastBuilder;
    warning(): TaoToastBuilder;
    info(): TaoToastBuilder;
    show(): TaoToastBuilder;
    short(): TaoToastBuilder;
    timeout(ms: number): TaoToastBuilder;
    title(value: string): TaoToastBuilder;
    message(value: string): TaoToastBuilder;
    icon(name: string): TaoToastBuilder;
    position(value: TaoToastPosition): TaoToastBuilder;
    byCenter(): TaoToastBuilder;
    byTopLeft(): TaoToastBuilder;
    byTopRight(): TaoToastBuilder;
    byTopCenter(): TaoToastBuilder;
    byBottomLeft(): TaoToastBuilder;
    byBottomRight(): TaoToastBuilder;
    byBottomCenter(): TaoToastBuilder;
    closable(value?: boolean): TaoToastBuilder;
    progress(value?: boolean): TaoToastBuilder;
    id(value: string): TaoToastBuilder;
    once(): TaoToastBuilder;
    replace(): TaoToastBuilder;
    action(label: string, onClick: () => void): TaoToastBuilder;
    onClosed(fn: () => void): TaoToastBuilder;
}

function createBuilder(): TaoToastBuilder {
    const draft = createDraft();

    const ctx: TaoToastBuilder = {
        success() {
            draft.type = 'success';
            draft.timeout = TYPE_TIMEOUT.success;
            return ctx;
        },
        error() {
            draft.type = 'error';
            draft.timeout = TYPE_TIMEOUT.error;
            return ctx;
        },
        danger() {
            draft.type = 'danger';
            draft.timeout = TYPE_TIMEOUT.danger;
            return ctx;
        },
        warning() {
            draft.type = 'warning';
            draft.timeout = TYPE_TIMEOUT.warning;
            return ctx;
        },
        info() {
            draft.type = 'info';
            draft.timeout = TYPE_TIMEOUT.info;
            return ctx;
        },
        show() {
            draft.type = 'neutral';
            draft.timeout = TYPE_TIMEOUT.neutral;
            return ctx;
        },
        short() {
            draft.timeout = 1000;
            return ctx;
        },
        timeout(ms: number) {
            draft.timeout = ms;
            return ctx;
        },
        title(value: string) {
            draft.title = value;
            return ctx;
        },
        message(value: string) {
            draft.message = String(value);
            return ctx;
        },
        icon(name: string) {
            draft.icon = name;
            return ctx;
        },
        position(value: TaoToastPosition) {
            draft.position = value;
            return ctx;
        },
        byCenter() {
            draft.position = 'center';
            return ctx;
        },
        byTopLeft() {
            draft.position = 'topLeft';
            return ctx;
        },
        byTopRight() {
            draft.position = 'topRight';
            return ctx;
        },
        byTopCenter() {
            draft.position = 'topCenter';
            return ctx;
        },
        byBottomLeft() {
            draft.position = 'bottomLeft';
            return ctx;
        },
        byBottomRight() {
            draft.position = 'bottomRight';
            return ctx;
        },
        byBottomCenter() {
            draft.position = 'bottomCenter';
            return ctx;
        },
        closable(value = true) {
            draft.closable = value;
            return ctx;
        },
        progress(value = true) {
            draft.progress = value;
            return ctx;
        },
        id(value: string) {
            draft.dedupeId = value;
            return ctx;
        },
        once() {
            draft.displayMode = 'once';
            return ctx;
        },
        replace() {
            draft.displayMode = 'replace';
            return ctx;
        },
        action(label: string, onClick: () => void) {
            draft.actions = [...draft.actions, { label, onClick }];
            return ctx;
        },
        onClosed(fn: () => void) {
            draft.onClosed = fn;
            return ctx;
        },
    };

    // Тот самый flush: цепочка успевает собрать params в текущем тике.
    setTimeout(() => flushDraft(draft), 0);

    return ctx;
}

function shortcut(type: TaoToastType, message: string, options?: TaoToastShortcutOptions) {
    const builder = createBuilder();

    if (type === 'neutral') {
        builder.show();
    } else {
        builder[type]();
    }

    builder.message(message);

    if (options?.title) {
        builder.title(options.title);
    }
    if (options?.timeout !== undefined) {
        builder.timeout(options.timeout);
    }
    if (options?.position) {
        builder.position(options.position);
    }
    if (options?.icon) {
        builder.icon(options.icon);
    }
    if (options?.closable !== undefined) {
        builder.closable(options.closable);
    }
    if (options?.progress !== undefined) {
        builder.progress(options.progress);
    }
    if (options?.id) {
        builder.id(options.id);
    }
    if (options?.once) {
        builder.once();
    }
    if (options?.replace) {
        builder.replace();
    }
    if (options?.actions) {
        options.actions.forEach((action) => builder.action(action.label, action.onClick));
    }
    if (options?.onClosed) {
        builder.onClosed(options.onClosed);
    }

    return builder;
}

export interface TaoToastApi {
    (): TaoToastBuilder;
    success(message: string, options?: TaoToastShortcutOptions): TaoToastBuilder;
    error(message: string, options?: TaoToastShortcutOptions): TaoToastBuilder;
    danger(message: string, options?: TaoToastShortcutOptions): TaoToastBuilder;
    warning(message: string, options?: TaoToastShortcutOptions): TaoToastBuilder;
    info(message: string, options?: TaoToastShortcutOptions): TaoToastBuilder;
    show(message: string, options?: TaoToastShortcutOptions): TaoToastBuilder;
    defaults(partial: Partial<TaoToastDefaults>): TaoToastApi;
    byTopCenter(): TaoToastApi;
    byTopLeft(): TaoToastApi;
    byBottomLeft(): TaoToastApi;
    byBottomRight(): TaoToastApi;
    dismiss(id?: string): void;
}

export const toast: TaoToastApi = Object.assign(createBuilder, {
    success(message: string, options?: TaoToastShortcutOptions) {
        return shortcut('success', message, options);
    },
    error(message: string, options?: TaoToastShortcutOptions) {
        return shortcut('error', message, options);
    },
    danger(message: string, options?: TaoToastShortcutOptions) {
        return shortcut('danger', message, options);
    },
    warning(message: string, options?: TaoToastShortcutOptions) {
        return shortcut('warning', message, options);
    },
    info(message: string, options?: TaoToastShortcutOptions) {
        return shortcut('info', message, options);
    },
    show(message: string, options?: TaoToastShortcutOptions) {
        return shortcut('neutral', message, options);
    },
    defaults(partial: Partial<TaoToastDefaults>) {
        configureToastDefaults(partial);
        return toast;
    },
    byTopCenter() {
        configureToastDefaults({ position: 'topCenter' });
        return toast;
    },
    byTopLeft() {
        configureToastDefaults({ position: 'topLeft' });
        return toast;
    },
    byBottomLeft() {
        configureToastDefaults({ position: 'bottomLeft' });
        return toast;
    },
    byBottomRight() {
        configureToastDefaults({ position: 'bottomRight' });
        return toast;
    },
    dismiss(id?: string) {
        dismissToasts(id);
    },
});
