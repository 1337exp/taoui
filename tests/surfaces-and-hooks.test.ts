import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoDrawer from '../src/components/TaoDrawer.vue';
import TaoDropdownMenu from '../src/components/TaoDropdownMenu.vue';
import TaoModal from '../src/components/TaoModal.vue';
import TaoNav from '../src/components/TaoNav.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import modalSource from '../src/components/TaoModal.vue?raw';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import surfaceCss from '../src/styles/contexts/surface.css?raw';

// 5.15.0: the dialog panels take your class and a surface; the modal scrolls its content; neutral nav counters; a compact
// dropdown button. / панели окон берут ваш класс и поверхность; окно прокручивает содержимое; нейтральные счётчики меню;
// компактная кнопка выпадающего меню.

const wrappers: VueWrapper[] = [];
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
});
const keep = <T extends VueWrapper>(w: T) => (wrappers.push(w), w);
const lf = (s: string) => s.replace(/\r\n/g, '\n');

describe('TaoModal panel', () => {
    it('class, style and attributes reach the dialog panel, not the overlay; surface puts its class there', async () => {
        keep(mount(TaoModal, { props: { modelValue: true, title: 'Note', surface: 'grain' }, attrs: { class: 'mine', style: 'color: red', 'data-testid': 'note' }, attachTo: document.body }));
        await nextTick();
        const panel = document.querySelector('.tao-modal')!;
        const overlay = document.querySelector('.tao-modal-overlay')!;
        expect(panel.classList.contains('mine')).toBe(true);
        expect(panel.classList.contains('tao-surface-grain')).toBe(true);
        expect(panel.getAttribute('data-testid')).toBe('note');
        expect((panel as HTMLElement).style.color).toBe('red');
        expect(overlay.classList.contains('mine')).toBe(false);
        expect(overlay.hasAttribute('data-testid')).toBe(false);
    });

    it('the content scrolls, not the dialog, so the footer stays; the panel colour is published', () => {
        const css = lf(modalSource as string);
        expect(css).toMatch(/\n\.tao-modal \{[^}]*--tao-modal-bg: var\(--tao-surface-fill, var\(--tao-color-surface-raised\)\);[^}]*overflow: hidden;/);
        expect(css).toMatch(/\n\.tao-modal__content \{[^}]*overflow-y: auto;/);
    });
});

describe('TaoDrawer panel', () => {
    it('class and attributes reach the panel; surface puts its class there', async () => {
        keep(mount(TaoDrawer, { props: { modelValue: true, title: 'Filters', surface: 'glass' }, attrs: { class: 'mine', 'data-testid': 'f' }, attachTo: document.body }));
        await nextTick();
        const panel = document.querySelector('.tao-drawer__panel')!;
        expect(panel.classList.contains('mine')).toBe(true);
        expect(panel.classList.contains('tao-surface-glass')).toBe(true);
        expect(panel.getAttribute('data-testid')).toBe('f');
        expect(document.querySelector('.tao-drawer')!.classList.contains('mine')).toBe(false);
    });
});

describe('grain and more contrast', () => {
    it('the grain goes when more contrast is asked', () => {
        expect(lf(surfaceCss as string)).toMatch(/@media \(prefers-contrast: more\) \{\s*\.tao-surface-grain \{\s*--tao-surface-image: none;/);
    });
});

describe('TaoNav badgeTone', () => {
    const items = [
        { id: 'a', label: 'Soon', icon: 'tao-circle', badge: 7 },
        { id: 'b', label: 'Archive', icon: 'tao-circle', badge: 12 },
    ];
    it('neutral marks the root; accent is the default', () => {
        expect(keep(mount(TaoNav, { props: { items, modelValue: 'a', badgeTone: 'neutral' } })).classes()).toContain('tao-nav--badges-neutral');
        expect(keep(mount(TaoNav, { props: { items, modelValue: 'a' } })).classes()).not.toContain('tao-nav--badges-neutral');
    });
});

describe('TaoDropdownMenu button', () => {
    it('size makes it a square of that control size; tabbable: false takes it out of the Tab order', () => {
        const sized = keep(mount(TaoDropdownMenu, { props: { size: 'small', tabbable: false } })).find('button');
        expect(sized.classes()).toEqual(expect.arrayContaining(['tao-size-small', 'tao-dropdown-menu__button--sized']));
        expect(sized.attributes('tabindex')).toBe('-1');
        const plain = keep(mount(TaoDropdownMenu)).find('button');
        expect(plain.classes()).not.toContain('tao-dropdown-menu__button--sized');
        expect(plain.attributes('tabindex')).toBeUndefined();
    });
});
