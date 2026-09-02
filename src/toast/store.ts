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
    closeLabel: 'Закрыть уведомление',
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
        toasts.value = toasts.value.filter((item) => item.dedupeId !== record.dedupeId);
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
