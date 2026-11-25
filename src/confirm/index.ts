import { devWarning } from '../deprecate';
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

let warned = false;

/**
 * The dialog is drawn by the host in the tree of the app (`<TaoHosts />`, or `<TaoConfirmHost />`): the provided locale and the plugins
 * reach it. No second app on `document.body` any more; a question asked before the host is mounted waits for it, and a warning says
 * what is missing if none turns up in a second.
 * Диалог рисует хост в дереве приложения (`<TaoHosts />` или `<TaoConfirmHost />`): выданная локаль и плагины до него доходят.
 * Второго приложения на `document.body` больше нет; вопрос, заданный до монтирования хоста, ждёт его, а предупреждение говорит,
 * чего не хватает, если за секунду хост не появился.
 */
function expectConfirmHost() {
    if (warned || hasConfirmHost() || !isClient()) {
        return;
    }
    warned = true;
    setTimeout(() => {
        if (!hasConfirmHost()) {
            devWarning('confirm-no-host', 'confirm(): no <TaoHosts /> (or <TaoConfirmHost />) is mounted, so the question is not shown and stays unanswered. Put <TaoHosts /> once into the root of the app.');
        }
    }, 1000);
}

/** Asks now; the answer is `true` for the ok button and `false` for anything else (cancel, Escape, a second `dismiss`). Nothing to ask (no title and no message) or no `window`: `false`. */
function ask(options: TaoConfirmOptions): Promise<boolean> {
    const title = options.title ?? '';
    const message = options.message === undefined ? '' : String(options.message);
    if (!isClient() || (!title && !message)) {
        return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
        expectConfirmHost();
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
