import { computed, ref } from 'vue';
import type { TaoToastDefaults, TaoToastPosition, TaoToastRecord } from './types';

export const TOAST_POSITIONS: TaoToastPosition[] = [
    'topRight',
    'topLeft',
    'topCenter',
    'bottomRight',
    'bottomLeft',
    'bottomCenter',
    'center',
];

export const toastDefaults: TaoToastDefaults = {
    position: 'topCenter',
    timeout: 3000,
    closable: true,
    progress: true,
    // no text of its own: the label of the close button comes from the locale in effect where the viewport stands (`toast.defaults({ closeLabel })` sets one)
    // своего текста нет: подпись кнопки закрытия берётся из локали там, где стоит viewport (`toast.defaults({ closeLabel })` задаёт свою)
    closeLabel: undefined,
    surface: 'glass',
};

export const toasts = ref<TaoToastRecord[]>([]);

export const toastsByPosition = computed(() => {
    const grouped = {} as Record<TaoToastPosition, TaoToastRecord[]>;

    for (const position of TOAST_POSITIONS) {
        grouped[position] = [];
    }

    for (const toast of toasts.value) {
        grouped[toast.position].push(toast);
    }

    return grouped;
});

export function configureToastDefaults(partial: Partial<TaoToastDefaults>) {
    Object.assign(toastDefaults, partial);
}

export function addToast(record: TaoToastRecord) {
    if (record.displayMode === 'once' && record.dedupeId) {
        const exists = toasts.value.some((item) => item.dedupeId === record.dedupeId);
        if (exists) {
            return;
        }
    }

    if (record.displayMode === 'replace' && record.dedupeId) {
        // in place, under the id of the one it replaces: «Saving…» turns into «Saved» where it stands, with no leave and
        // enter, and the item restarts its timer for the new content
        // на месте, под id заменяемого: «Сохраняю…» превращается в «Сохранено» там же, без ухода и появления, а элемент
        // перезапускает таймер под новое содержимое
        const index = toasts.value.findIndex((item) => item.dedupeId === record.dedupeId);
        if (index !== -1) {
            const kept = { ...record, id: toasts.value[index]!.id };
            toasts.value = toasts.value.filter((item, i) => i === index || item.dedupeId !== record.dedupeId).map((item) => (item.id === kept.id ? kept : item));
            return;
        }
    }

    toasts.value = [...toasts.value, record];
}

export function removeToast(id: string) {
    // a toast is found by its own id or by the `id` the app gave it (what `replace` and a handle use)
    const item = toasts.value.find((toast) => toast.id === id || toast.dedupeId === id);
    if (!item) {
        return;
    }

    toasts.value = toasts.value.filter((toast) => toast !== item);
    item.onClosed?.();
}

export function dismissToasts(id?: string) {
    if (id) {
        removeToast(id);
        return;
    }

    const items = toasts.value;
    toasts.value = [];
    items.forEach((item) => item.onClosed?.());
}

// The one viewport that draws the toasts: the first to claim it. A second one (a tag written by hand next to `<TaoHosts />`) draws
// nothing, or every toast would be on the screen twice.
// Единственный viewport, который рисует тосты: тот, кто первым его занял. Второй (тег, написанный руками рядом с `<TaoHosts />`)
// ничего не рисует, иначе каждый тост был бы на экране дважды.
let owner: symbol | null = null;

/** Takes the place of the viewport; `false` when another one has it. On the server nothing is held (one module serves every request). / Занять место viewport; `false`, если оно занято. */
export function claimToastViewport(who: symbol): boolean {
    if (typeof window === 'undefined') {
        return true;
    }
    if (owner === null || owner === who) {
        owner = who;
        return true;
    }
    return false;
}

export function releaseToastViewport(who: symbol) {
    if (owner === who) {
        owner = null;
    }
}

export function hasToastViewport() {
    return owner !== null;
}
