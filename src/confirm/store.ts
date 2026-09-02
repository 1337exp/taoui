import { ref } from 'vue';
import type { TaoConfirmDefaults, TaoConfirmRecord } from './types';

export const confirmDefaults: TaoConfirmDefaults = {
    ok: 'ОК',
    cancel: 'Отмена',
};

export const currentConfirm = ref<TaoConfirmRecord | null>(null);

const queue: TaoConfirmRecord[] = [];

export function configureConfirmDefaults(partial: Partial<TaoConfirmDefaults>) {
    Object.assign(confirmDefaults, partial);
}

function pump() {
    if (currentConfirm.value) {
        return;
    }

    currentConfirm.value = queue.shift() ?? null;
}

export function enqueueConfirm(record: TaoConfirmRecord) {
    queue.push(record);
    pump();
}

export function resolveConfirm(value: boolean) {
    const item = currentConfirm.value;
    if (!item) {
        return;
    }

    currentConfirm.value = null;
    item.resolve(value);
    pump();
}

let viewportMounts = 0;

export function registerConfirmHost() {
    viewportMounts += 1;
}

export function unregisterConfirmHost() {
    viewportMounts = Math.max(0, viewportMounts - 1);
}

export function hasConfirmHost() {
    if (viewportMounts > 0) {
        return true;
    }

    if (typeof document === 'undefined') {
        return false;
    }

    return Boolean(document.querySelector('[data-tao-confirm-host]'));
}
