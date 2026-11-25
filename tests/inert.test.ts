import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoConfirmHost from '../src/components/TaoConfirmHost.vue';
import TaoDrawer from '../src/components/TaoDrawer.vue';
import TaoModal from '../src/components/TaoModal.vue';
import { confirm } from '../src/confirm';

// The page behind a dialog is inert (a modal layer: `TaoModal`, `TaoDrawer`, `confirm()`): `aria-modal` alone is a hint that the keyboard
// and some screen readers ignore.
// Страница за диалогом inert (модальный слой: `TaoModal`, `TaoDrawer`, `confirm()`): одного `aria-modal` мало, клавиатура и часть
// скринридеров его не слушаются.

const mounted: { unmount(): void }[] = [];
afterEach(() => {
    confirm.dismiss();
    mounted.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
});

function page() {
    document.body.innerHTML = '<div id="app"><button id="behind">behind</button></div><aside id="side"></aside><div data-tao-toast-viewport id="toasts"></div>';
}
const flush = async () => {
    await nextTick();
    await nextTick();
};
const inert = (id: string) => document.getElementById(id)!.hasAttribute('inert');
const open = async (component: object, props: Record<string, unknown> = {}) => {
    const w = mount(component as never, { props: { modelValue: true, ...props } as never, slots: { default: () => 'content' }, attachTo: document.body });
    mounted.push(w);
    await flush();
    return w as unknown as { setProps(props: Record<string, unknown>): Promise<void> };
};

describe.each([['TaoModal', TaoModal], ['TaoDrawer', TaoDrawer]] as const)('%s', (_name, Component) => {
    it('makes the rest of the page inert while open, not the dialog, not the toasts; frees it on close', async () => {
        page();
        const w = await open(Component);
        expect(inert('app')).toBe(true);
        expect(inert('side')).toBe(true);
        expect(inert('toasts')).toBe(false);
        const dialog = document.querySelector('[role="dialog"]')!;
        for (let node: Element | null = dialog; node && node !== document.body; node = node.parentElement) {
            expect(node.hasAttribute('inert')).toBe(false);
        }
        await w.setProps({ modelValue: false });
        await flush();
        expect(inert('app')).toBe(false);
        expect(inert('side')).toBe(false);
    });

    it('an element that was inert before stays inert after the dialog closes', async () => {
        page();
        document.getElementById('side')!.setAttribute('inert', '');
        const w = await open(Component);
        await w.setProps({ modelValue: false });
        await flush();
        expect(inert('side')).toBe(true);
        expect(inert('app')).toBe(false);
    });
});

describe('two dialogs', () => {
    it('the page is freed only when the last one closes', async () => {
        page();
        const a = await open(TaoModal);
        const b = await open(TaoDrawer);
        expect(inert('app')).toBe(true);
        await b.setProps({ modelValue: false });
        await flush();
        expect(inert('app')).toBe(true);
        await a.setProps({ modelValue: false });
        await flush();
        expect(inert('app')).toBe(false);
    });
});

describe('confirm()', () => {
    it('the page is inert under the question and free after the answer', async () => {
        page();
        const w = mount(TaoConfirmHost, { attachTo: document.body });
        mounted.push(w);
        const answer = confirm('Sure?');
        await flush();
        expect(inert('app')).toBe(true);
        expect(inert('toasts')).toBe(false);
        expect(document.querySelector('[role="alertdialog"]')!.closest('[inert]')).toBeNull();
        confirm.dismiss();
        await answer;
        await flush();
        expect(inert('app')).toBe(false);
    });
});

describe('review 3: two dialogs in the same turn, and the scrim of confirm()', () => {
    it('two dialogs opened in one turn do not make each other inert', async () => {
        page();
        const a = mount(TaoModal as never, { props: { modelValue: true } as never, slots: { default: () => 'a' }, attachTo: document.body });
        const b = mount(TaoDrawer as never, { props: { modelValue: true } as never, slots: { default: () => 'b' }, attachTo: document.body });
        mounted.push(a, b);
        await flush();
        const dialogs = [...document.querySelectorAll('[role="dialog"]')];
        expect(dialogs).toHaveLength(2);
        // the top one (opened last) is fully usable; the one under it is inert; the page is inert
        expect(dialogs[1]!.closest('[inert]')).toBeNull();
        expect(inert('app')).toBe(true);
    });

    it('the scrim of confirm() is not inert: a click on it answers false', async () => {
        page();
        const w = mount(TaoConfirmHost, { attachTo: document.body });
        mounted.push(w);
        const answer = confirm('Sure?');
        await flush();
        const scrim = document.querySelector('.tao-confirm__overlay') as HTMLElement;
        expect(scrim.closest('[inert]')).toBeNull();
        scrim.click();
        expect(await answer).toBe(false);
    });
});
