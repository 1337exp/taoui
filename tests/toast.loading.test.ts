import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoToastItem from '../src/components/TaoToastItem.vue';
import { toast } from '../src/toast';
import { addToast, dismissToasts, toasts } from '../src/toast/store';
import type { TaoToastRecord } from '../src/toast/types';

// 5.8: a toast for work in progress, which turns into its result in place.
// 5.8: тост для работы в процессе, который на месте превращается в результат.

const record = (over: Partial<TaoToastRecord> = {}): TaoToastRecord => ({
    id: 'a',
    type: 'info',
    title: '',
    message: 'Hi',
    icon: '',
    timeout: 3000,
    position: 'topCenter',
    closable: false,
    progress: false,
    surface: 'flat',
    actions: [],
    ...over,
});

beforeEach(() => {
    vi.useFakeTimers();
    dismissToasts();
});

afterEach(() => {
    dismissToasts();
    vi.useRealTimers();
    document.body.innerHTML = '';
});

describe('replace by id', () => {
    it('takes the place and the id of the one it replaces, so it changes where it stands', () => {
        addToast(record({ id: 'one', dedupeId: 'save', message: 'Saving…' }));
        addToast(record({ id: 'other', message: 'Something else' }));
        addToast(record({ id: 'two', dedupeId: 'save', displayMode: 'replace', message: 'Saved' }));
        expect(toasts.value.map((t) => [t.id, t.message])).toEqual([
            ['one', 'Saved'],
            ['other', 'Something else'],
        ]);
    });

    it('without a match it is simply added', () => {
        addToast(record({ id: 'x', dedupeId: 'save', displayMode: 'replace' }));
        expect(toasts.value.map((t) => t.id)).toEqual(['x']);
    });
});

describe('the loading toast', () => {
    it('loading() shows a spinner, says it is busy, and never times out', async () => {
        toast().loading().message('Saving…');
        vi.advanceTimersByTime(0);
        const item = toasts.value[0]!;
        expect(item.loading).toBe(true);
        expect(item.timeout).toBe(0);
        const w = mount(TaoToastItem, { props: { toast: item } });
        expect(w.find('.tao-toast__spinner').exists()).toBe(true);
        expect(w.attributes('aria-busy')).toBe('true');
        vi.advanceTimersByTime(60_000);
        expect(toasts.value).toHaveLength(1);
    });

    it('the item restarts its timer when it is replaced in place', async () => {
        const first = record({ id: 'k', timeout: 0, loading: true });
        toasts.value = [first];
        const w = mount(TaoToastItem, { props: { toast: first } });
        vi.advanceTimersByTime(10_000);
        const done = record({ id: 'k', timeout: 3000, message: 'Saved' });
        toasts.value = [done];
        await w.setProps({ toast: done });
        expect(w.find('.tao-toast__spinner').exists()).toBe(false);
        vi.advanceTimersByTime(2900);
        expect(toasts.value).toHaveLength(1);
        vi.advanceTimersByTime(200);
        expect(toasts.value).toHaveLength(0);
    });
});

describe('toast.promise', () => {
    it('loading while it runs, then success in the same place; it returns the promise', async () => {
        let resolve!: (v: number) => void;
        const p = new Promise<number>((r) => (resolve = r));
        const returned = toast.promise(p, { loading: 'Saving…', success: (n) => `Saved ${n}`, error: 'Not saved' });
        expect(returned).toBe(p);
        vi.advanceTimersByTime(0);
        expect(toasts.value.map((t) => [t.message, t.loading])).toEqual([['Saving…', true]]);
        const id = toasts.value[0]!.id;
        resolve(3);
        await p;
        await nextTick();
        vi.advanceTimersByTime(0);
        expect(toasts.value.map((t) => [t.id, t.type, t.message, t.loading])).toEqual([[id, 'success', 'Saved 3', undefined]]);
    });

    it('a rejection turns it into an error', async () => {
        const p = Promise.reject(new Error('offline'));
        toast.promise(p, { loading: 'Saving…', success: 'Saved', error: (e) => `Not saved: ${(e as Error).message}` }).catch(() => {});
        vi.advanceTimersByTime(0);
        await Promise.resolve();
        await Promise.resolve();
        vi.advanceTimersByTime(0);
        expect(toasts.value.map((t) => [t.type, t.message])).toEqual([['danger', 'Not saved: offline']]);
    });
});
