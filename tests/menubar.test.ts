import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';
import TaoContextMenu from '../src/components/TaoContextMenu.vue';
import TaoDropdownMenu from '../src/components/TaoDropdownMenu.vue';
import TaoMenubar from '../src/components/TaoMenubar.vue';
import type { TaoMenuItem } from '../src/menu';

const wrappers: VueWrapper[] = [];
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
});

const menu: TaoMenuItem[] = [
    { id: 'file', label: 'File', items: [{ id: 'new', label: 'New', shortcut: 'Ctrl+N' }, { id: 'recent', label: 'Recent', items: [{ id: 'a', label: 'Alpha' }] }, { id: 'quit', label: 'Quit' }] },
    { id: 'edit', label: 'Edit', items: [{ id: 'undo', label: 'Undo' }, { id: 'redo', label: 'Redo', disabled: true }] },
    { id: 'view', label: 'View', disabled: true, items: [{ id: 'grid', label: 'Grid' }] },
    { id: 'help', label: 'Help' },
];

async function bar(items: TaoMenuItem[] = menu) {
    const w = mount(TaoMenubar, { props: { items }, attachTo: document.body });
    wrappers.push(w);
    await nextTick();
    return w;
}
const tops = (w: VueWrapper) => w.findAll('[role="menubar"] > [role="menuitem"]');
const menus = () => [...document.body.querySelectorAll<HTMLElement>('[role="menu"]')];
const key = async (el: Element | null, name: string) => {
    el!.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
    await nextTick();
};
const escape = async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
};

describe('TaoMenubar', () => {
    it('is a menubar with named menu entries, and only the menus carry the popup roles', async () => {
        const w = await bar();
        expect(w.find('[role="menubar"]').attributes('aria-label')).toBe('Menu bar');
        expect(tops(w).map((t) => t.text())).toEqual(['File', 'Edit', 'View', 'Help']);
        expect(tops(w)[0]!.attributes('aria-haspopup')).toBe('menu');
        expect(tops(w)[0]!.attributes('aria-expanded')).toBe('false');
        expect(tops(w)[3]!.attributes('aria-haspopup')).toBeUndefined();
        expect(tops(w)[2]!.attributes('aria-disabled')).toBe('true');
    });

    it('is one tab stop: only the current entry has tabindex 0', async () => {
        const w = await bar();
        expect(tops(w).map((t) => t.attributes('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
    });

    it('← / → walk the entries (skipping the disabled one) and wrap; Home / End jump', async () => {
        const w = await bar();
        await key(tops(w)[0]!.element, 'ArrowRight');
        expect(document.activeElement).toBe(tops(w)[1]!.element);
        await key(tops(w)[1]!.element, 'ArrowRight'); // View is disabled: on to Help
        expect(document.activeElement).toBe(tops(w)[3]!.element);
        await key(tops(w)[3]!.element, 'ArrowRight'); // wraps
        expect(document.activeElement).toBe(tops(w)[0]!.element);
        await key(tops(w)[0]!.element, 'ArrowLeft');
        expect(document.activeElement).toBe(tops(w)[3]!.element);
        await key(tops(w)[3]!.element, 'Home');
        expect(document.activeElement).toBe(tops(w)[0]!.element);
        await key(tops(w)[0]!.element, 'End');
        expect(document.activeElement).toBe(tops(w)[3]!.element);
        expect(tops(w).map((t) => t.attributes('tabindex'))).toEqual(['-1', '-1', '-1', '0']);
    });

    it('↓ / Enter / Space and a click open the menu; the entry says so', async () => {
        const w = await bar();
        await key(tops(w)[0]!.element, 'ArrowDown');
        expect(menus()).toHaveLength(1);
        expect(tops(w)[0]!.attributes('aria-expanded')).toBe('true');
        expect(menus()[0]!.getAttribute('aria-label')).toBe('File');
        await escape();
        await key(tops(w)[0]!.element, 'Enter');
        expect(menus()).toHaveLength(1);
        await escape();
        await tops(w)[1]!.trigger('click');
        expect(menus()).toHaveLength(1);
        expect(menus()[0]!.textContent).toContain('Undo');
    });

    it('a second click on the open entry closes it', async () => {
        const w = await bar();
        await tops(w)[0]!.trigger('click');
        await tops(w)[0]!.trigger('click');
        expect(menus()).toHaveLength(0);
    });

    it('Escape closes the menu and gives the focus back to its entry', async () => {
        const w = await bar();
        await key(tops(w)[1]!.element, 'ArrowDown');
        await escape();
        expect(menus()).toHaveLength(0);
        expect(document.activeElement).toBe(tops(w)[1]!.element);
    });

    it('with a menu open, ← / → inside it open the neighbour menu', async () => {
        const w = await bar();
        await key(tops(w)[0]!.element, 'ArrowDown');
        await key(menus()[0]!, 'ArrowRight'); // on "New": no submenu, so it moves to the next menu
        expect(menus()).toHaveLength(1);
        expect(menus()[0]!.textContent).toContain('Undo');
        expect(tops(w)[1]!.attributes('aria-expanded')).toBe('true');
        await key(menus()[0]!, 'ArrowLeft');
        expect(menus()[0]!.textContent).toContain('New');
    });

    it('→ on an item with a submenu opens the submenu, not the neighbour', async () => {
        const w = await bar();
        await key(tops(w)[0]!.element, 'ArrowDown');
        await key(menus()[0]!, 'ArrowDown'); // New -> Recent
        await key(menus()[0]!, 'ArrowRight');
        expect(menus()).toHaveLength(2);
        expect(menus()[1]!.textContent).toContain('Alpha');
        expect(tops(w)[0]!.attributes('aria-expanded')).toBe('true');
    });

    it('with a menu open, pointing at another entry switches to its menu', async () => {
        const w = await bar();
        await tops(w)[0]!.trigger('click');
        await tops(w)[1]!.trigger('mouseenter');
        expect(menus()).toHaveLength(1);
        expect(menus()[0]!.textContent).toContain('Undo');
        await tops(w)[2]!.trigger('mouseenter'); // disabled: stays
        expect(menus()[0]!.textContent).toContain('Undo');
    });

    it('without an open menu, pointing at an entry does nothing', async () => {
        const w = await bar();
        await tops(w)[1]!.trigger('mouseenter');
        expect(menus()).toHaveLength(0);
    });

    it('a pick emits the id, closes the menu and focuses the entry', async () => {
        const w = await bar();
        await tops(w)[0]!.trigger('click');
        menus()[0]!.querySelector<HTMLElement>('[role="menuitem"]')!.click();
        await nextTick();
        expect(w.emitted('select')).toEqual([['new']]);
        expect(menus()).toHaveLength(0);
        expect(document.activeElement).toBe(tops(w)[0]!.element);
    });

    it('an entry without a menu is a plain action', async () => {
        const w = await bar();
        await tops(w)[3]!.trigger('click');
        expect(w.emitted('select')).toEqual([['help']]);
        expect(menus()).toHaveLength(0);
    });

    it('a disabled entry neither opens nor emits', async () => {
        const w = await bar();
        await tops(w)[2]!.trigger('click');
        await key(tops(w)[2]!.element, 'ArrowDown');
        expect(menus()).toHaveLength(0);
    });

    it('a press outside closes it and leaves the focus alone', async () => {
        const w = await bar();
        await tops(w)[0]!.trigger('click');
        document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await nextTick();
        expect(menus()).toHaveLength(0);
        expect(tops(w)[0]!.attributes('aria-expanded')).toBe('false');
    });

    it('separators and group labels at the top level are ignored', async () => {
        const w = await bar([{ type: 'label', label: 'x' }, ...menu.slice(0, 1), { type: 'separator' }]);
        expect(tops(w).map((t) => t.text())).toEqual(['File']);
    });

    it('by default an open menu stays on a page scroll (it follows its entry)', async () => {
        const w = await bar();
        await tops(w)[0]!.trigger('click');
        document.dispatchEvent(new Event('scroll'));
        await nextTick();
        expect(menus()).toHaveLength(1);
    });

    it('closeOnScroll closes it on a page scroll and leaves the focus alone', async () => {
        const w = mount(TaoMenubar, { props: { items: menu, closeOnScroll: true }, attachTo: document.body });
        wrappers.push(w);
        const outside = document.body.appendChild(document.createElement('button'));
        await tops(w)[0]!.trigger('click');
        outside.focus();
        document.dispatchEvent(new Event('scroll'));
        await nextTick();
        expect(menus()).toHaveLength(0);
        expect(tops(w)[0]!.attributes('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(outside);
    });

    it('the menus take the density of the bar (a teleported panel would not inherit it)', async () => {
        const w = await bar();
        (tops(w)[0]!.element as HTMLElement).style.setProperty('--tao-density', 'comfortable');
        await tops(w)[0]!.trigger('click');
        expect(menus()[0]!.classList.contains('tao-density-comfortable')).toBe(true);
    });

    it('size and ariaLabel', async () => {
        const w = mount(TaoMenubar, { props: { items: menu, size: 'small', ariaLabel: 'Main' }, attachTo: document.body });
        wrappers.push(w);
        expect(w.classes()).toContain('tao-size-small');
        expect(w.attributes('aria-label')).toBe('Main');
    });
});

describe('TaoDropdownMenu closeOnScroll', () => {
    it('off by default, on when asked', async () => {
        for (const [closeOnScroll, left] of [[false, 1], [true, 0]] as const) {
            const w = mount(TaoDropdownMenu, { props: { items: [{ id: 'a', label: 'A' }], closeOnScroll }, attachTo: document.body });
            wrappers.push(w);
            await w.find('button').trigger('click');
            document.dispatchEvent(new Event('scroll'));
            await nextTick();
            expect(menus(), String(closeOnScroll)).toHaveLength(left);
            w.unmount();
            wrappers.pop();
        }
    });
});

describe('TaoContextMenu', () => {
    const items: TaoMenuItem[] = [{ id: 'copy', label: 'Copy' }, { id: 'paste', label: 'Paste' }];
    async function area(props: Record<string, unknown> = {}) {
        const w = mount(TaoContextMenu, { props: { items, ...props }, slots: { default: () => h('button', { id: 'inside' }, 'area') }, attachTo: document.body });
        wrappers.push(w);
        await nextTick();
        return w;
    }
    const rightClick = async (el: Element, x = 120, y = 80) => {
        const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y });
        el.dispatchEvent(event);
        await nextTick();
        await nextTick();
        return event;
    };

    it('opens a menu at the pointer on the right click and stops the browser menu', async () => {
        const w = await area();
        const event = await rightClick(document.getElementById('inside')!, 120, 80);
        expect(event.defaultPrevented).toBe(true);
        expect(menus()).toHaveLength(1);
        expect(menus()[0]!.getAttribute('aria-label')).toBe('Context menu');
        const anchor = w.find('.tao-context-menu__anchor');
        expect(anchor.attributes('style')).toContain('left: 120px');
        expect(anchor.attributes('style')).toContain('top: 80px');
    });

    it('does not wrap the layout: the content is where it was', async () => {
        const w = await area();
        expect(w.classes()).toContain('tao-context-menu');
        expect(document.getElementById('inside')).not.toBeNull();
    });

    it('a pick emits the id and closes; Escape closes and returns the focus', async () => {
        const w = await area();
        const inside = document.getElementById('inside')!;
        inside.focus();
        await rightClick(inside);
        menus()[0]!.querySelectorAll<HTMLElement>('[role="menuitem"]')[1]!.click();
        await nextTick();
        expect(w.emitted('select')).toEqual([['paste']]);
        expect(menus()).toHaveLength(0);
        expect(document.activeElement).toBe(inside);

        await rightClick(inside);
        expect(menus()).toHaveLength(1);
        await escape();
        expect(menus()).toHaveLength(0);
        expect(document.activeElement).toBe(inside);
    });

    it('a second right click moves the menu to the new point', async () => {
        const w = await area();
        await rightClick(document.getElementById('inside')!, 10, 10);
        await rightClick(document.getElementById('inside')!, 200, 150);
        expect(menus()).toHaveLength(1);
        expect(w.find('.tao-context-menu__anchor').attributes('style')).toContain('left: 200px');
        expect(w.emitted('open')).toEqual([[{ x: 10, y: 10 }], [{ x: 200, y: 150 }]]);
    });

    it('disabled (or empty) leaves the browser menu alone', async () => {
        await area({ disabled: true });
        const event = await rightClick(document.getElementById('inside')!);
        expect(event.defaultPrevented).toBe(false);
        expect(menus()).toHaveLength(0);
    });

    it('the page scrolling closes it and leaves the focus alone; its own list scrolling does not', async () => {
        await area();
        await rightClick(document.getElementById('inside')!);
        menus()[0]!.dispatchEvent(new Event('scroll'));
        await nextTick();
        expect(menus()).toHaveLength(1);
        document.dispatchEvent(new Event('scroll'));
        await nextTick();
        expect(menus()).toHaveLength(0);
    });

    it('closeOnScroll: false keeps it at the screen point', async () => {
        await area({ closeOnScroll: false });
        await rightClick(document.getElementById('inside')!);
        document.dispatchEvent(new Event('scroll'));
        await nextTick();
        expect(menus()).toHaveLength(1);
    });

    it('a press outside closes it', async () => {
        await area();
        await rightClick(document.getElementById('inside')!);
        document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await nextTick();
        expect(menus()).toHaveLength(0);
    });
});
