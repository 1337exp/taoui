import { ref } from 'vue';
import type { TaoConfirmDefaults, TaoConfirmRecord } from './types';

// no texts of their own: the buttons say what the locale in effect where the host stands says (`confirm.defaults({ ok })` sets one)
// своих текстов нет: кнопки говорят то, что говорит локаль там, где стоит хост (`confirm.defaults({ ok })` задаёт свой)
export const confirmDefaults: TaoConfirmDefaults = {
    ok: undefined,
    cancel: undefined,
    surface: 'glass',
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

// The one host that asks: the first to claim it (a second one draws nothing). / Единственный хост, который спрашивает: первый занявший (второй ничего не рисует).
let owner: symbol | null = null;

export function claimConfirmHost(who: symbol): boolean {
    if (typeof window === 'undefined') {
        return true;
    }
    if (owner === null || owner === who) {
        owner = who;
        return true;
    }
    return false;
}

export function releaseConfirmHost(who: symbol) {
    if (owner === who) {
        owner = null;
    }
}

export function hasConfirmHost() {
    return owner !== null;
}
