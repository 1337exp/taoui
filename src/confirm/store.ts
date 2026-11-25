import { ref } from 'vue';
import { createHostSlot } from '../primitives/hostSlot';
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
// When the owner goes away the next host in line asks what is open (`currentConfirm` stays in the store). / Когда владелец уходит, следующий в очереди хост спрашивает открытое (`currentConfirm` остаётся в хранилище).
const slot = createHostSlot();

export const claimConfirmHost = slot.claim;
export const releaseConfirmHost = slot.release;
/** Reactive: does this host ask now? / Реактивно: спрашивает ли этот хост сейчас? */
export const isConfirmHostOwner = slot.isOwner;
export const hasConfirmHost = slot.has;
