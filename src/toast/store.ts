import { computed, ref } from 'vue';
import { localeEn } from '../locale/en';
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
    closeLabel: localeEn.toast.closeLabel,
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
    const item = toasts.value.find((toast) => toast.id === id);
    if (!item) {
        return;
    }

    toasts.value = toasts.value.filter((toast) => toast.id !== id);
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

let viewportMounts = 0;

export function registerToastViewport() {
    viewportMounts += 1;
}

export function unregisterToastViewport() {
    viewportMounts = Math.max(0, viewportMounts - 1);
}

export function hasToastViewport() {
    if (viewportMounts > 0) {
        return true;
    }

    if (typeof document === 'undefined') {
        return false;
    }

    return Boolean(document.querySelector('[data-tao-toast-viewport]'));
}
