import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { confirm } from '../src/confirm';
import { currentConfirm, resolveConfirm } from '../src/confirm/store';
import { toast } from '../src/toast';
import { dismissToasts, toastDefaults, toasts } from '../src/toast/store';

// v6: one object. `toast({...})` and `confirm({...})`; no chain, shown at once, a handle back.
// v6: один объект. `toast({...})` и `confirm({...})`; без цепочки, показ сразу, ручка в ответ.

beforeEach(() => {
    dismissToasts();
    resolveConfirm(false);
});

afterEach(() => {
    dismissToasts();
    resolveConfirm(false);
    document.body.innerHTML = '';
    toast.defaults({ timeout: 3000, position: 'topCenter' });
});

describe('toast({...})', () => {
    it('shows at once, with the options as given', () => {
        toast({ type: 'danger', title: 'Network', message: 'No connection', position: 'bottomRight', timeout: 1234, icon: 'tao-info' });
        const item = toasts.value[0]!;
        expect([item.type, item.title, item.message, item.position, item.timeout, item.icon]).toEqual(['danger', 'Network', 'No connection', 'bottomRight', 1234, 'tao-info']);
    });

    it('a kind that is given lives as long as its kind; one that is not as long as the default', () => {
        toast({ type: 'danger', message: 'a' });
        toast({ message: 'b' });
        toast.defaults({ timeout: 777 });
        toast({ message: 'c' });
        expect(toasts.value.map((t) => t.timeout)).toEqual([5000, 3000, 777]);
    });

    it('nothing to say, nothing shown', () => {
        toast({});
        toast({ type: 'success' });
        expect(toasts.value).toEqual([]);
    });

    it('the shortcuts are the same call with a type', () => {
        toast.success('Saved');
        toast.danger('Failed', { title: 'Oops' });
        toast.show('Plain');
        expect(toasts.value.map((t) => [t.type, t.message, t.title])).toEqual([
            ['success', 'Saved', ''],
            ['danger', 'Failed', 'Oops'],
            ['neutral', 'Plain', ''],
        ]);
    });

    it('the handle closes it, by the id given or by its own', () => {
        const own = toast.info('One');
        const given = toast.info('Two', { id: 'two' });
        expect(given.id).toBe('two');
        given.dismiss();
        expect(toasts.value.map((t) => t.message)).toEqual(['One']);
        own.dismiss();
        expect(toasts.value).toEqual([]);
    });

    it('toast.dismiss(id) finds the toast by the id the app gave it', () => {
        toast.info('A', { id: 'a' });
        toast.info('B', { id: 'b' });
        toast.dismiss('a');
        expect(toasts.value.map((t) => t.message)).toEqual(['B']);
    });

    it('replace puts a new one in the place of the one with the same id', () => {
        toast({ id: 'sync', loading: true, message: 'Syncing…' });
        toast.success('Synced', { id: 'sync', replace: true });
        expect(toasts.value.map((t) => [t.type, t.message, t.loading])).toEqual([['success', 'Synced', undefined]]);
    });

    it('a snackbar (an action, no title) has no cross unless asked', () => {
        toast.show('Deleted', { actions: [{ label: 'Undo', onClick: () => {} }] });
        toast.show('Deleted', { actions: [{ label: 'Undo', onClick: () => {} }], closable: true });
        expect(toasts.value.map((t) => t.closable)).toEqual([false, true]);
    });

    it('onClosed is told when it goes', () => {
        const onClosed = vi.fn();
        const handle = toast.info('x', { onClosed });
        handle.dismiss();
        expect(onClosed).toHaveBeenCalledTimes(1);
    });

    it('promise: loading, then the result in the same place', async () => {
        let done!: (v: number) => void;
        const p = new Promise<number>((resolve) => (done = resolve));
        toast.promise(p, { loading: 'Saving…', success: (n) => `Saved ${n}`, error: 'No' }, { id: 'save' });
        expect(toasts.value.map((t) => [t.type, t.message, t.loading])).toEqual([['neutral', 'Saving…', true]]);
        done(3);
        await p;
        await Promise.resolve();
        expect(toasts.value.map((t) => [t.type, t.message])).toEqual([['success', 'Saved 3']]);
    });

    it('the position default is the viewport the app asks for', () => {
        expect(toastDefaults.position).toBe('topCenter');
        toast.defaults({ position: 'bottomLeft' });
        toast.info('x');
        expect(toasts.value[0]!.position).toBe('bottomLeft');
    });
});

describe('confirm({...})', () => {
    it('asks at once and answers true for ok', async () => {
        const answer = confirm({ title: 'Delete?', message: 'No way back', ok: 'Delete', tone: 'danger' });
        const record = currentConfirm.value!;
        expect([record.title, record.message, record.okLabel, record.danger]).toEqual(['Delete?', 'No way back', 'Delete', true]);
        resolveConfirm(true);
        expect(await answer).toBe(true);
    });

    it('the string form is the same with a title', async () => {
        const answer = confirm('Save?', { ok: 'Save', cancel: 'Not now' });
        expect([currentConfirm.value!.title, currentConfirm.value!.okLabel, currentConfirm.value!.cancelLabel, currentConfirm.value!.danger]).toEqual(['Save?', 'Save', 'Not now', false]);
        resolveConfirm(false);
        expect(await answer).toBe(false);
    });

    it('nothing to ask is a false at once', async () => {
        expect(await confirm({})).toBe(false);
        expect(currentConfirm.value).toBeNull();
    });

    it('dismiss answers false', async () => {
        const answer = confirm('Sure?');
        confirm.dismiss();
        expect(await answer).toBe(false);
    });
});
