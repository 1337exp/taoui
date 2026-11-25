import { devWarning } from '../deprecate';
import { addToast, configureToastDefaults, dismissToasts, hasToastViewport, toastDefaults } from './store';
import type {
    TaoToastAction,
    TaoToastDefaults,
    TaoToastDisplayMode,
    TaoToastHandle,
    TaoToastOptions,
    TaoToastPosition,
    TaoToastPromiseTexts,
    TaoToastRecord,
    TaoToastType,
} from './types';

export type {
    TaoToastPromiseTexts,
    TaoToastAction,
    TaoToastDefaults,
    TaoToastDisplayMode,
    TaoToastHandle,
    TaoToastOptions,
    TaoToastPosition,
    TaoToastRecord,
    TaoToastType,
};

/** How long each kind stays, ms (an `error` that is not read in 3 s is lost, so danger is the longest). / Сколько живёт каждый вид, мс. */
const TYPE_TIMEOUT: Record<TaoToastType, number> = {
    success: 3000,
    danger: 5000,
    warning: 4000,
    info: 3000,
    neutral: 2500,
};

function isClient() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function nextToastId() {
    return `tao-toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

let warned = false;

/**
 * The toasts are drawn by the viewport in the tree of the app (`<TaoHosts />`, or `<TaoToastViewport />`): there it sees the locale
 * the app provides and the app's plugins. There is no second app on `document.body` any more. A toast shown before the viewport is
 * mounted waits in the store and appears with it; if none turns up in a second, a warning says where it is missing.
 * Тосты рисует viewport в дереве приложения (`<TaoHosts />` или `<TaoToastViewport />`): там он видит выданную приложением локаль и
 * плагины. Второго приложения на `document.body` больше нет. Тост, показанный до монтирования viewport, ждёт в хранилище и появится
 * вместе с ним; если за секунду viewport так и не появился, предупреждение говорит, чего не хватает.
 */
function expectToastViewport() {
    if (warned || hasToastViewport() || !isClient()) {
        return;
    }
    warned = true;
    setTimeout(() => {
        if (!hasToastViewport()) {
            devWarning('toast-no-host', 'toast(): no <TaoHosts /> (or <TaoToastViewport />) is mounted, so the toast is not shown. Put <TaoHosts /> once into the root of the app.');
        }
    }, 1000);
}

/** Shows a toast now and gives back a handle. Nothing happens on the server (no `window`): the handle is inert. */
function show(options: TaoToastOptions): TaoToastHandle {
    const recordId = nextToastId();
    const handle: TaoToastHandle = { id: options.id ?? recordId, dismiss: () => dismissToasts(handle.id) };
    const title = options.title ?? '';
    const message = options.message === undefined ? '' : String(options.message);
    if (!isClient() || (!title && !message)) {
        return handle;
    }

    const type = options.type ?? (options.loading ? 'neutral' : 'info');
    const actions = options.actions ?? [];
    const displayMode: TaoToastDisplayMode | undefined = options.replace ? 'replace' : options.once ? 'once' : undefined;
    const dedupeId = options.id ?? (displayMode ? `${type}:${title}:${message}` : undefined);

    expectToastViewport();

    const record: TaoToastRecord = {
        id: recordId,
        type,
        title,
        message,
        icon: options.icon ?? '',
        // an untyped toast lives as long as the app's default; a typed one as long as its kind
        timeout: options.loading ? 0 : (options.timeout ?? (options.type ? TYPE_TIMEOUT[type] : toastDefaults.timeout)),
        position: options.position ?? toastDefaults.position,
        // a snackbar (no title, an action) has no cross unless asked: next to the action it is a mistap waiting to happen
        // у snackbar (без заголовка, с действием) крестика нет, если не попросили: рядом с действием по нему промахиваются
        closable: options.closable !== undefined ? options.closable : title || !actions.length ? toastDefaults.closable : false,
        progress: options.progress ?? toastDefaults.progress,
        surface: options.surface ?? toastDefaults.surface,
        displayMode,
        dedupeId,
        actions,
        onClosed: options.onClosed,
        loading: options.loading,
    };
    addToast(record);
    return handle;
}

type Shortcut = (message: string, options?: Omit<TaoToastOptions, 'message' | 'type'>) => TaoToastHandle;

export interface TaoToastApi {
    /** `toast({ message, title?, type?, timeout?, position?, icon?, closable?, progress?, surface?, id?, once?, replace?, actions?, onClosed?, loading? })`. */
    (options: TaoToastOptions): TaoToastHandle;
    success: Shortcut;
    danger: Shortcut;
    warning: Shortcut;
    info: Shortcut;
    show: Shortcut;
    defaults(partial: Partial<TaoToastDefaults>): TaoToastApi;
    /** Closes the toast with this `id` (the one you gave, or the one the handle holds), or all of them. / Закрывает тост с этим `id` или все. */
    dismiss(id?: string): void;
    /**
     * A toast that follows a promise: `loading` while it runs, then `success` or `error` in its place. Returns the same
     * promise. `toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: (e) => `Not saved: ${e}` })`.
     * Тост, который следует за промисом: `loading`, пока он идёт, потом `success` или `error` на его месте. Возвращает
     * тот же промис.
     */
    promise<T>(promise: Promise<T>, texts: TaoToastPromiseTexts<T>, options?: Pick<TaoToastOptions, 'title' | 'position' | 'id'>): Promise<T>;
}

const kind =
    (type: TaoToastType): Shortcut =>
    (message, options) =>
        show({ ...options, message, type });

export const toast: TaoToastApi = Object.assign((options: TaoToastOptions) => show(options), {
    success: kind('success'),
    danger: kind('danger'),
    warning: kind('warning'),
    info: kind('info'),
    show: kind('neutral'),
    defaults(partial: Partial<TaoToastDefaults>) {
        configureToastDefaults(partial);
        return toast;
    },
    dismiss(id?: string) {
        dismissToasts(id);
    },
    promise<T>(promise: Promise<T>, texts: TaoToastPromiseTexts<T>, options?: Pick<TaoToastOptions, 'title' | 'position' | 'id'>) {
        const id = options?.id ?? nextToastId();
        const base = { id, replace: true, title: options?.title, position: options?.position };
        show({ ...base, loading: true, message: texts.loading });
        promise.then(
            (value) => show({ ...base, type: 'success', message: typeof texts.success === 'function' ? texts.success(value) : texts.success }),
            (error: unknown) => show({ ...base, type: 'danger', message: typeof texts.error === 'function' ? texts.error(error) : texts.error }),
        );
        return promise;
    },
});
