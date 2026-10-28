import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import TaoDrawer from '../src/components/TaoDrawer.vue';
import TaoModal from '../src/components/TaoModal.vue';
import { resolveTaoIcon, taoIconNames } from '../src/icons';
// @ts-expect-error Vite `?raw` import: the component source as text
import drawerSource from '../src/components/TaoDrawer.vue?raw';
// @ts-expect-error Vite `?raw` import: the component source as text
import modalSource from '../src/components/TaoModal.vue?raw';

// 5.5: what a phone interface needs: a bottom sheet, a full-screen modal, the everyday app icons.
// 5.5: что нужно телефонному интерфейсу: нижний лист, модалка во весь экран, повседневные иконки приложения.

afterEach(() => {
    document.body.innerHTML = '';
});

describe('TaoDrawer side="bottom"', () => {
    it('is a sheet: its class and the grip; a side drawer has no grip', () => {
        mount(TaoDrawer, { props: { modelValue: true, side: 'bottom', title: 'Filters' }, attachTo: document.body });
        expect(document.querySelector('.tao-drawer--bottom')).not.toBeNull();
        expect(document.querySelector('.tao-drawer__grip')?.getAttribute('aria-hidden')).toBe('true');
        expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true');
        document.body.innerHTML = '';
        mount(TaoDrawer, { props: { modelValue: true, title: 'Filters' }, attachTo: document.body });
        expect(document.querySelector('.tao-drawer__grip')).toBeNull();
    });

    it('in the stylesheet: as tall as its content up to 90%, above the safe area, rises from below', () => {
        expect(drawerSource).toMatch(/\.tao-drawer--bottom \.tao-drawer__panel \{[^}]*max-height: 90dvh;[^}]*padding-bottom: env\(safe-area-inset-bottom/);
        expect(drawerSource).toMatch(/\.tao-drawer-bottom-enter-from \.tao-drawer__panel,\s*\.tao-drawer-bottom-leave-to \.tao-drawer__panel \{[^}]*translateY\(100%\)/);
    });
});

describe('TaoModal fullscreen', () => {
    it('true and narrow add their class; the default adds none', () => {
        mount(TaoModal, { props: { modelValue: true, fullscreen: true }, attachTo: document.body });
        expect(document.querySelector('.tao-modal-overlay--fullscreen')).not.toBeNull();
        document.body.innerHTML = '';
        mount(TaoModal, { props: { modelValue: true, fullscreen: 'narrow' }, attachTo: document.body });
        expect(document.querySelector('.tao-modal-overlay--fullscreen-narrow')).not.toBeNull();
        expect(document.querySelector('.tao-modal-overlay--fullscreen')).toBeNull();
        document.body.innerHTML = '';
        mount(TaoModal, { props: { modelValue: true }, attachTo: document.body });
        expect(document.querySelector('[class*="fullscreen"]')).toBeNull();
    });

    it('narrow is the same page below 600px of the viewport (the modal lives in body)', () => {
        expect(modalSource).toMatch(/@media \(width < 600px\) \{[\s\S]*\.tao-modal-overlay--fullscreen-narrow \.tao-modal \{[^}]*height: 100%/);
        expect(modalSource).toMatch(/\.tao-modal-overlay--fullscreen \.tao-modal__content \{[^}]*overflow-y: auto/);
    });
});

describe('the app icons', () => {
    it.each(['settings', 'edit', 'trash', 'bell', 'tag', 'repeat', 'undo', 'redo'])('tao-%s is built in', (name) => {
        expect(taoIconNames).toContain(`tao-${name}`);
        expect(resolveTaoIcon(`tao-${name}`)?.body).toBeTruthy();
    });

    it('40 built in, as the docs say', () => {
        expect(taoIconNames).toHaveLength(40);
    });
});
