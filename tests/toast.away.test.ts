import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TaoHosts from '../src/components/TaoHosts.vue';
import { toast } from '../src/toast';

// From the fourth review: the time of a toast stands while the user is away from the first moment (not only after a blur they saw), and
// a focus that leaves a toast while the user is away does not start the clock.
// Из четвёртого ревью: время тоста стоит, пока пользователь отсутствует, с первой секунды (не только после замеченного blur), а фокус,
// ушедший из тоста при отсутствии пользователя, часы не запускает.

const hosts: { unmount(): void }[] = [];
const host = () => {
    const w = mount(TaoHosts, { attachTo: document.body });
    hosts.push(w);
    return w;
};

afterEach(async () => {
    // a host that stays mounted keeps the drawing for itself: the next test would see no toast
    hosts.splice(0).forEach((w) => {
        try {
            w.unmount();
        } catch {
            // already gone with its toasts
        }
    });
    toast.dismiss();
    restoreDocument();
    await wait(60); // timers of the removed toasts run out before the next test
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

// plain property overrides, undone by deleting them: a spy on a getter of `document` restored by `restoreAllMocks` calls itself
// простые подмены свойства, снимаемые удалением: шпион на геттере `document`, восстановленный `restoreAllMocks`, вызывает сам себя
const setHidden = (value: boolean) => Object.defineProperty(document, 'hidden', { configurable: true, get: () => value });
const restoreDocument = () => {
    delete (document as unknown as Record<string, unknown>).hidden;
    delete (document as unknown as Record<string, unknown>).hasFocus;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const count = () => document.querySelectorAll('.tao-toast').length;

describe('a toast that appears while the user is away', () => {
    it('does not run out in a hidden tab, and runs when they come back', async () => {
        setHidden(true);
        host();
        toast({ message: 'Background', timeout: 120 });
        await wait(300);
        expect(count()).toBe(1);
        setHidden(false);
        document.dispatchEvent(new Event('visibilitychange'));
        await wait(300);
        expect(count()).toBe(0);
    });
});

describe('the focus leaves a toast while the user is away', () => {
    it('does not start the clock in the background', async () => {
        host();
        toast({ message: 'Held', timeout: 200, actions: [{ label: 'Undo', onClick: () => {} }] });
        await wait(80);
        const item = document.querySelector('.tao-toast') as HTMLElement;
        item.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        window.dispatchEvent(new Event('blur'));
        item.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
        await wait(400);
        expect(count()).toBe(1);
    });
});

describe('a window that has no focus but is seen', () => {
    it('does not hold a toast for ever: a visible page counts the time down', async () => {
        document.hasFocus = () => false;
        host();
        toast({ message: 'Seen', timeout: 120 });
        await wait(400);
        expect(count()).toBe(0);
    });
});
