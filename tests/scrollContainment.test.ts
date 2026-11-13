import { afterEach, describe, expect, it } from 'vitest';
import { lockBodyScroll, unlockBodyScroll } from '../src/bodyScroll';

// 5.37.2: the wheel at the end of a scrolling panel stays in the panel; a locked page does not shift sideways.
// 5.37.2: колесо в конце прокручиваемой панели остаётся в ней; запертая страница не сдвигается вбок.

const sources = (import.meta as unknown as { glob: (p: string, o: object) => unknown }).glob('../src/components/*.vue', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const source = (name: string) => (Object.entries(sources).find(([file]) => file.endsWith(`/${name}.vue`))![1] as string).replace(/\r\n/g, '\n');

/** The body of the first rule whose selector is exactly `selector`. / Тело первого правила с этим селектором. */
function rule(css: string, selector: string) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(css);
    return match ? match[1]! : null;
}

describe('a scrolling panel keeps the wheel at its end', () => {
    // floating panels and the content of dialogs: both axes / плавающие панели и содержимое окон: обе оси
    const both: Array<[string, string]> = [
        ['TaoSelect', '.tao-select__list'],
        ['TaoCombobox', '.tao-combobox__list'],
        ['TaoPresetInput', '.tao-preset-input__panel'],
        ['TaoMenu', '.tao-menu'],
        ['TaoPopover', '.tao-popover__panel'],
        ['TaoToolbar', '.tao-toolbar__menu'],
        ['TaoDrawer', '.tao-drawer__content'],
        ['TaoModal', '.tao-modal__content'],
        ['TaoModal', '.tao-modal-overlay--fullscreen .tao-modal__content'],
        ['TaoModal', '.tao-modal-overlay--fullscreen-narrow .tao-modal__content'],
        ['TaoCommandList', '.tao-command-list__list'],
    ];
    it.each(both)('%s %s has overscroll-behavior: contain', (name, selector) => {
        const body = rule(source(name), selector);
        expect(body, `${name}: no rule ${selector}`).not.toBeNull();
        expect(body).toMatch(/overscroll-behavior:\s*contain/);
    });

    // an in-page scroller that goes sideways: the vertical wheel goes on to the page, the sideways one does not turn into
    // the back gesture / блок страницы с боковой прокруткой: вертикальное колесо уходит в страницу, боковое не жест «назад»
    it('a table scrolls sideways without the back gesture, and still lets the page scroll', () => {
        const body = rule(source('TaoTable'), '.tao-table-wrap')!;
        expect(body).toMatch(/overscroll-behavior-x:\s*contain/);
        expect(body).not.toMatch(/overscroll-behavior:\s*contain/);
    });
});

describe('locking the page scroll', () => {
    const root = document.documentElement;
    const innerWidth = window.innerWidth;
    afterEach(() => {
        while (document.body.style.overflow === 'hidden') unlockBodyScroll();
        Object.defineProperty(window, 'innerWidth', { value: innerWidth, configurable: true });
        delete (root as unknown as { clientWidth?: number }).clientWidth;
        root.style.removeProperty('scrollbar-gutter');
    });
    const setBar = (inner: number, client: number) => {
        Object.defineProperty(window, 'innerWidth', { value: inner, configurable: true });
        Object.defineProperty(root, 'clientWidth', { value: client, configurable: true });
    };

    it('keeps the place of a classic scrollbar while locked, and gives it back', () => {
        setBar(1000, 985);
        lockBodyScroll();
        expect(document.body.style.overflow).toBe('hidden');
        expect(root.style.getPropertyValue('scrollbar-gutter')).toBe('stable');
        unlockBodyScroll();
        expect(document.body.style.overflow).toBe('');
        expect(root.style.getPropertyValue('scrollbar-gutter')).toBe('');
    });

    it('reserves nothing when the page has no scrollbar (a short page, or an overlay scrollbar)', () => {
        setBar(1000, 1000);
        lockBodyScroll();
        expect(root.style.getPropertyValue('scrollbar-gutter')).toBe('');
        unlockBodyScroll();
    });

    it('two locks are one: the gutter goes back with the last unlock, and a value of the app is kept', () => {
        setBar(1000, 985);
        root.style.setProperty('scrollbar-gutter', 'stable both-edges');
        lockBodyScroll();
        lockBodyScroll();
        unlockBodyScroll();
        expect(root.style.getPropertyValue('scrollbar-gutter')).toBe('stable');
        unlockBodyScroll();
        expect(root.style.getPropertyValue('scrollbar-gutter')).toBe('stable both-edges');
    });
});
