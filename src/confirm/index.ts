import { createApp } from 'vue';
import TaoConfirmHost from '../components/TaoConfirmHost.vue';
import {
    configureConfirmDefaults,
    confirmDefaults,
    enqueueConfirm,
    hasConfirmHost,
    resolveConfirm,
} from './store';
import type { TaoConfirmDefaults, TaoConfirmOptions } from './types';

export type { TaoConfirmDefaults, TaoConfirmOptions, TaoConfirmRecord } from './types';

function isClient() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function nextConfirmId() {
    return `tao-confirm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

let hostedApp: ReturnType<typeof createApp> | null = null;

/**
 * An app that mounts `<TaoConfirmHost />` itself (in its own tree: the provided locale and plugins reach it) is the better way;
 * without one the dialog gets a host of its own on `document.body`, in a second app that reads the global locale.
 * Лучше, когда приложение само кладёт `<TaoConfirmHost />` в своё дерево; без этого у диалога свой хост на `document.body`,
 * во втором приложении, которое читает глобальную локаль.
 */
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

/** Asks now; the answer is `true` for the ok button and `false` for anything else (cancel, Escape, a second `dismiss`). Nothing to ask (no title and no message) or no `window`: `false`. */
function ask(options: TaoConfirmOptions): Promise<boolean> {
    const title = options.title ?? '';
    const message = options.message === undefined ? '' : String(options.message);
    if (!isClient() || (!title && !message)) {
        return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
        ensureConfirmHost();
        enqueueConfirm({
            id: nextConfirmId(),
            title,
            message,
            okLabel: options.ok ?? confirmDefaults.ok,
            cancelLabel: options.cancel ?? confirmDefaults.cancel,
            danger: options.tone === 'danger',
            surface: options.surface ?? confirmDefaults.surface,
            resolve,
        });
    });
}

export interface TaoConfirmApi {
    /** `await confirm({ title, message?, ok?, cancel?, tone?: 'danger', surface? })`. */
    (options: TaoConfirmOptions): Promise<boolean>;
    /** `await confirm('Delete it?', { message, tone: 'danger' })`. */
    (title: string, options?: Omit<TaoConfirmOptions, 'title'>): Promise<boolean>;
    defaults(partial: Partial<TaoConfirmDefaults>): TaoConfirmApi;
    /** Closes the dialog that is open with `false`. / Закрывает открытый диалог с `false`. */
    dismiss(): void;
}

function confirmFn(first: string | TaoConfirmOptions, options?: Omit<TaoConfirmOptions, 'title'>): Promise<boolean> {
    return ask(typeof first === 'string' ? { ...options, title: first } : first);
}

export const confirm: TaoConfirmApi = Object.assign(confirmFn as TaoConfirmApi, {
    defaults(partial: Partial<TaoConfirmDefaults>) {
        configureConfirmDefaults(partial);
        return confirm;
    },
    dismiss() {
        resolveConfirm(false);
    },
});
