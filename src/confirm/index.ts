import { createApp } from 'vue';
import TaoConfirmHost from '../components/TaoConfirmHost.vue';
import {
    configureConfirmDefaults,
    confirmDefaults,
    enqueueConfirm,
    hasConfirmHost,
    resolveConfirm,
} from './store';
import type { TaoConfirmDefaults, TaoConfirmShortcutOptions } from './types';

export type { TaoConfirmDefaults, TaoConfirmRecord, TaoConfirmShortcutOptions } from './types';

interface Draft {
    title: string;
    message: string;
    okLabel: string;
    cancelLabel: string;
    danger: boolean;
}

function isClient() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function nextConfirmId() {
    return `tao-confirm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

let hostedApp: ReturnType<typeof createApp> | null = null;

function ensureConfirmHost() {
    if (!isClient() || hasConfirmHost()) {
        return;
    }

    const host = document.createElement('div');
    host.setAttribute('data-tao-confirm-root', '');
    document.body.appendChild(host);
    hostedApp = createApp(TaoConfirmHost);
    hostedApp.mount(host);
}

function createDraft(): Draft {
    return {
        title: '',
        message: '',
        okLabel: confirmDefaults.ok,
        cancelLabel: confirmDefaults.cancel,
        danger: false,
    };
}

export interface TaoConfirmBuilder extends PromiseLike<boolean> {
    title(value: string): TaoConfirmBuilder;
    message(value: string): TaoConfirmBuilder;
    ok(label: string): TaoConfirmBuilder;
    cancel(label: string): TaoConfirmBuilder;
    danger(value?: boolean): TaoConfirmBuilder;
}

function createBuilder(): TaoConfirmBuilder {
    const draft = createDraft();
    let settle: (value: boolean) => void = () => undefined;
    const promise = new Promise<boolean>((resolve) => {
        settle = resolve;
    });

    const ctx: TaoConfirmBuilder = {
        title(value: string) {
            draft.title = value;
            return ctx;
        },
        message(value: string) {
            draft.message = String(value);
            return ctx;
        },
        ok(label: string) {
            draft.okLabel = label;
            return ctx;
        },
        cancel(label: string) {
            draft.cancelLabel = label;
            return ctx;
        },
        danger(value = true) {
            draft.danger = value;
            return ctx;
        },
        then(onFulfilled, onRejected) {
            return promise.then(onFulfilled, onRejected);
        },
    };

    // Тот же flush, что у toast: цепочка собирает params, тик позже — показ.
    setTimeout(() => {
        if (!isClient() || (!draft.title && !draft.message)) {
            settle(false);
            return;
        }

        ensureConfirmHost();
        enqueueConfirm({
            id: nextConfirmId(),
            title: draft.title,
            message: draft.message,
            okLabel: draft.okLabel,
            cancelLabel: draft.cancelLabel,
            danger: draft.danger,
            resolve: settle,
        });
    }, 0);

    return ctx;
}

function applyOptions(builder: TaoConfirmBuilder, options?: TaoConfirmShortcutOptions) {
    if (!options) {
        return builder;
    }

    if (options.message) {
        builder.message(options.message);
    }
    if (options.ok) {
        builder.ok(options.ok);
    }
    if (options.cancel) {
        builder.cancel(options.cancel);
    }
    if (options.danger) {
        builder.danger(true);
    }

    return builder;
}

export interface TaoConfirmApi {
    (): TaoConfirmBuilder;
    (title: string, options?: TaoConfirmShortcutOptions): TaoConfirmBuilder;
    defaults(partial: Partial<TaoConfirmDefaults>): TaoConfirmApi;
    dismiss(): void;
}

function confirmFn(title?: string, options?: TaoConfirmShortcutOptions): TaoConfirmBuilder {
    const builder = createBuilder();

    if (title) {
        builder.title(title);
    }

    return applyOptions(builder, options);
}

export const confirm: TaoConfirmApi = Object.assign(confirmFn, {
    defaults(partial: Partial<TaoConfirmDefaults>) {
        configureConfirmDefaults(partial);
        return confirm;
    },
    dismiss() {
        resolveConfirm(false);
    },
});
