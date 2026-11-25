import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import TaoHosts from '../src/components/TaoHosts.vue';
import TaoToastViewport from '../src/components/TaoToastViewport.vue';
import { confirm } from '../src/confirm';
import { confirmDefaults, currentConfirm } from '../src/confirm/store';
import { createTaoLocale, localeEn, localeKey, localeRu, setTaoLocale } from '../src/locale';
import { toast } from '../src/toast';
import { dismissToasts, toastDefaults } from '../src/toast/store';

// toast() and confirm() draw in <TaoHosts />, in the tree of the app: they read the locale the app provides, there is no second app
// on document.body, and a second host draws nothing.
// toast() и confirm() рисуют в <TaoHosts />, в дереве приложения: читают выданную приложением локаль, второго приложения на
// document.body нет, а второй хост ничего не рисует.

const mounted: ReturnType<typeof mount>[] = [];
const put = (component: object, provide?: Record<symbol, unknown>) => {
    const wrapper = mount(component as never, { attachTo: document.body, global: { provide: provide as never } });
    mounted.push(wrapper);
    return wrapper;
};
const inRu = { [localeKey as symbol]: createTaoLocale(localeRu) };

afterEach(async () => {
    confirm.dismiss();
    confirm.dismiss();
    dismissToasts();
    mounted.splice(0).forEach((wrapper) => wrapper.unmount());
    setTaoLocale(localeEn);
    confirmDefaults.ok = undefined;
    confirmDefaults.cancel = undefined;
    toastDefaults.closeLabel = undefined;
    document.body.innerHTML = '';
    vi.useRealTimers();
});

const buttons = () => [...document.querySelectorAll<HTMLElement>('[data-tao-confirm-cancel], [data-tao-confirm-ok]')].map((el) => el.textContent?.trim());

describe('confirm() in <TaoHosts />', () => {
    it('says OK / Cancel in the locale of the tree the host stands in, not the global one', async () => {
        put(TaoHosts, inRu);
        void confirm('Delete?');
        await Promise.resolve();
        await new Promise((r) => setTimeout(r));
        expect(buttons()).toEqual([localeRu.confirm.cancel, localeRu.confirm.ok]);
    });

    it('follows the global locale when the tree provides none, and switches with it', async () => {
        put(TaoHosts);
        setTaoLocale(localeRu);
        void confirm('Delete?');
        await new Promise((r) => setTimeout(r));
        expect(buttons()).toEqual([localeRu.confirm.cancel, localeRu.confirm.ok]);
    });

    it('a text given by the call or by confirm.defaults wins over any locale', async () => {
        put(TaoHosts, inRu);
        confirm.defaults({ ok: 'Yes' });
        void confirm('Delete?', { cancel: 'Not now' });
        await new Promise((r) => setTimeout(r));
        expect(buttons()).toEqual(['Not now', 'Yes']);
    });

    it('waits for a host that is mounted later and then asks', async () => {
        const answer = confirm('Later?');
        expect(currentConfirm.value?.title).toBe('Later?');
        expect(document.querySelector('[data-tao-confirm-host]')).toBeNull();
        put(TaoHosts);
        await new Promise((r) => setTimeout(r));
        expect(document.querySelectorAll('[data-tao-confirm-host]')).toHaveLength(1);
        confirm.dismiss();
        expect(await answer).toBe(false);
    });

    it('makes no second app on document.body', async () => {
        void confirm('Alone?');
        expect(document.querySelector('[data-tao-confirm-root]')).toBeNull();
    });
});

describe('toast() in <TaoHosts />', () => {
    it('the cross says "close" in the locale of the tree', async () => {
        put(TaoHosts, inRu);
        toast({ message: 'Saved', timeout: 0 });
        await new Promise((r) => setTimeout(r));
        expect(document.querySelector('.tao-toast__close, [aria-label]')?.getAttribute('aria-label') ?? '').toBeTruthy();
        const labels = [...document.querySelectorAll('.tao-toast [aria-label]')].map((el) => el.getAttribute('aria-label'));
        expect(labels).toContain(localeRu.toast.closeLabel);
    });

    it('toast.defaults({ closeLabel }) wins over the locale', async () => {
        put(TaoHosts, inRu);
        toast.defaults({ closeLabel: 'Bye' });
        toast({ message: 'Saved', timeout: 0 });
        await new Promise((r) => setTimeout(r));
        const labels = [...document.querySelectorAll('.tao-toast [aria-label]')].map((el) => el.getAttribute('aria-label'));
        expect(labels).toContain('Bye');
    });

    it('a toast shown before the host is mounted waits and appears with it', async () => {
        toast({ message: 'Early', timeout: 0 });
        expect(document.querySelector('[data-tao-toast-host]')).toBeNull();
        expect(document.querySelectorAll('.tao-toast')).toHaveLength(0);
        put(TaoHosts);
        await new Promise((r) => setTimeout(r));
        expect(document.querySelectorAll('.tao-toast')).toHaveLength(1);
    });

    it('warns once in a second when no host turns up (confirm() the same)', async () => {
        // fresh modules: the warning is once per page, earlier tests have used it up
        vi.resetModules();
        const fresh = await import('../src/toast');
        const freshConfirm = await import('../src/confirm');
        vi.useFakeTimers();
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        fresh.toast({ message: 'Nobody sees this', timeout: 0 });
        void freshConfirm.confirm('Nobody sees this');
        vi.advanceTimersByTime(1100);
        const texts = warn.mock.calls.map(([text]) => String(text));
        expect(texts.some((t) => t.includes('toast()') && t.includes('<TaoHosts />'))).toBe(true);
        expect(texts.some((t) => t.includes('confirm()') && t.includes('<TaoHosts />'))).toBe(true);
        warn.mockRestore();
    });
});

describe('one host draws, a second one draws nothing', () => {
    it('two <TaoHosts /> show each toast once', async () => {
        const App = defineComponent({ render: () => [h(TaoHosts), h(TaoHosts)] });
        put(App);
        toast({ message: 'Once', timeout: 0 });
        await new Promise((r) => setTimeout(r));
        expect(document.querySelectorAll('.tao-toast')).toHaveLength(1);
    });

    it('a viewport written by hand next to <TaoHosts /> draws nothing', async () => {
        const App = defineComponent({ render: () => [h(TaoHosts), h(TaoToastViewport)] });
        put(App);
        toast({ message: 'Once', timeout: 0 });
        await new Promise((r) => setTimeout(r));
        expect(document.querySelectorAll('.tao-toast')).toHaveLength(1);
    });

    it('the place is free again when the host goes away, and the next one draws', async () => {
        const first = put(TaoHosts);
        first.unmount();
        mounted.pop();
        put(TaoHosts);
        toast({ message: 'Again', timeout: 0 });
        await new Promise((r) => setTimeout(r));
        expect(document.querySelectorAll('.tao-toast')).toHaveLength(1);
    });
});
