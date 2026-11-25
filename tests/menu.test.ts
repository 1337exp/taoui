import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import TaoDropdownMenu from '../src/components/TaoDropdownMenu.vue';
import TaoIcon from '../src/components/TaoIcon.vue';
import TaoModal from '../src/components/TaoModal.vue';
import TaoSelect from '../src/components/TaoSelect.vue';
import { openLayerCount } from '../src/layers';
import type { TaoMenuItem } from '../src/menu';

const wrappers: VueWrapper[] = [];
function mountMenu(items: TaoMenuItem[]) {
    const w = mount(TaoDropdownMenu, { props: { items }, attachTo: document.body });
    wrappers.push(w);
    return w;
}
describe('TaoDropdownMenu dots', () => {
    const trigger = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) =>
        mount(TaoDropdownMenu, { props: { items: [{ id: 'a', label: 'A' }], ...props }, slots: slots as never }).find('button');
    // the dots of an upright icon share one x, of a lying one one y / у стоячих точек один x, у лежачих один y
    const centres = (button: ReturnType<typeof trigger>, axis: 'cx' | 'cy') => button.findAll('circle').map((c) => c.attributes(axis));

    it('three dots stand upright by default and lie down with dots="horizontal"', () => {
        const upright = trigger();
        expect(new Set(centres(upright, 'cx')).size).toBe(1);
        expect(new Set(centres(upright, 'cy')).size).toBe(3);
        const lying = trigger({ dots: 'horizontal' });
        expect(new Set(centres(lying, 'cy')).size).toBe(1);
        expect(new Set(centres(lying, 'cx')).size).toBe(3);
    });

    it('the #icon slot wins over dots', () => {
        const button = trigger({ dots: 'horizontal' }, { icon: () => h('i', { class: 'mine' }) });
        expect(button.find('.mine').exists()).toBe(true);
        expect(button.find('circle').exists()).toBe(false);
    });
});

afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
    document.body.style.overflow = '';
});

const $$ = (selector: string) => [...document.body.querySelectorAll<HTMLElement>(selector)];
const menus = () => $$('[role="menu"]');
const names = (el?: Element) => [...(el ?? document.body).querySelectorAll('[role^="menuitem"]')].map((i) => i.textContent?.trim());

function key(target: Element | null, name: string, init: KeyboardEventInit = {}) {
    target!.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }));
    return nextTick();
}
function escape() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return nextTick();
}
const open = async (w: VueWrapper) => {
    await w.find('button').trigger('click');
    await nextTick();
};

const tree: TaoMenuItem[] = [
    { id: 'new', label: 'New', shortcut: 'Ctrl+N' },
    { id: 'open', label: 'Open recent', items: [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }] },
    { type: 'separator' },
    { id: 'off', label: 'Disabled', disabled: true },
    { id: 'save', label: 'Save' },
];

describe('TaoMenu', () => {
    it('renders items with a separator and a shortcut, and marks the disabled one', async () => {
        const w = mountMenu(tree);
        await open(w);
        expect(names(menus()[0])).toEqual(['NewCtrl+N', 'Open recent', 'Disabled', 'Save']);
        expect($$('[role="separator"]')).toHaveLength(1);
        expect($$('[role="menuitem"]')[0]!.getAttribute('aria-keyshortcuts')).toBe('Ctrl+N');
        expect($$('[aria-disabled="true"]')).toHaveLength(1);
    });

    it('arrows skip the disabled item and the separator; Home / End jump; aria-activedescendant follows', async () => {
        const w = mountMenu(tree);
        await open(w);
        const menu = menus()[0]!;
        const active = () => document.getElementById(menu.getAttribute('aria-activedescendant')!)!.textContent;
        await key(menu, 'ArrowDown'); // New -> Open recent
        await key(menu, 'ArrowDown'); // Open recent -> Save (skips the separator and Disabled)
        expect(active()).toContain('Save');
        await key(menu, 'Home');
        expect(active()).toContain('New');
        await key(menu, 'End');
        await key(menu, 'Enter');
        expect(w.emitted('select')!.map((e) => (e[0] as { id: string }).id)).toEqual(['save']);
    });

    it('type-ahead jumps to the item that starts with the typed letter', async () => {
        const w = mountMenu(tree);
        await open(w);
        const menu = menus()[0]!;
        await key(menu, 's');
        await key(menu, 'Enter');
        expect(w.emitted('select')!.map((e) => (e[0] as { id: string }).id)).toEqual(['save']);
    });

    it('a disabled item cannot be picked by click', async () => {
        const w = mountMenu(tree);
        await open(w);
        $$('[aria-disabled="true"]')[0]!.click();
        expect(w.emitted('select')).toBeUndefined();
        expect(menus()).toHaveLength(1);
    });

    it('ArrowRight opens the submenu as a second menu; Enter in it picks and closes the whole tree', async () => {
        const w = mountMenu(tree);
        await open(w);
        const root = menus()[0]!;
        await key(root, 'ArrowDown');
        await key(root, 'ArrowRight');
        expect(menus()).toHaveLength(2);
        expect(root.querySelector('[aria-haspopup="menu"]')!.getAttribute('aria-expanded')).toBe('true');
        await key(menus()[1]!, 'ArrowDown');
        await key(menus()[1]!, 'Enter');
        expect(w.emitted('select')!.map((e) => (e[0] as { id: string }).id)).toEqual(['b']);
        expect(menus()).toHaveLength(0);
    });

    it('Escape closes the submenu first, the menu on the next press, and returns focus to the button', async () => {
        const w = mountMenu(tree);
        await open(w);
        await key(menus()[0]!, 'ArrowDown');
        await key(menus()[0]!, 'ArrowRight');
        expect(menus()).toHaveLength(2);
        await escape();
        expect(menus()).toHaveLength(1);
        await escape();
        expect(menus()).toHaveLength(0);
        expect(document.activeElement).toBe(w.find('button').element);
    });

    it('ArrowLeft closes only the submenu', async () => {
        const w = mountMenu(tree);
        await open(w);
        await key(menus()[0]!, 'ArrowDown');
        await key(menus()[0]!, 'ArrowRight');
        await key(menus()[1]!, 'ArrowLeft');
        expect(menus()).toHaveLength(1);
    });

    it('a press inside the submenu is not outside; a press elsewhere closes the whole tree', async () => {
        const w = mountMenu(tree);
        await open(w);
        await key(menus()[0]!, 'ArrowDown');
        await key(menus()[0]!, 'ArrowRight');
        menus()[1]!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await nextTick();
        expect(menus()).toHaveLength(2);
        document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await nextTick();
        expect(menus()).toHaveLength(0);
    });

    it('Tab closes the menu', async () => {
        const w = mountMenu(tree);
        await open(w);
        await key(menus()[0]!, 'Tab');
        expect(menus()).toHaveLength(0);
    });

    it('checkbox and radio items carry their role and aria-checked, and are picked like others', async () => {
        const w = mountMenu([
            { type: 'checkbox', id: 'grid', label: 'Grid', checked: true },
            { type: 'checkbox', id: 'snap', label: 'Snap', checked: false },
            { type: 'label', label: 'Mode' },
            { type: 'radio', id: 'm1', group: 'mode', label: 'Move', checked: true },
            { type: 'radio', id: 'm2', group: 'mode', label: 'Rotate', checked: false },
        ]);
        await open(w);
        expect($$('[role="menuitemcheckbox"]').map((el) => el.getAttribute('aria-checked'))).toEqual(['true', 'false']);
        expect($$('[role="menuitemradio"]').map((el) => el.getAttribute('aria-checked'))).toEqual(['true', 'false']);
        expect(names()).toEqual(['Grid', 'Snap', 'Move', 'Rotate']); // the label is not an item
        $$('[role="menuitemradio"]')[1]!.click();
        expect(w.emitted('select')!.map((e) => (e[0] as { id: string }).id)).toEqual(['m2']);
    });

    it('ArrowDown on the closed button opens the menu', async () => {
        const w = mountMenu(tree);
        await key(w.find('button').element, 'ArrowDown');
        expect(menus()).toHaveLength(1);
    });
});

describe('layers', () => {
    it('Escape goes to the top layer only: a Select inside a Modal closes first', async () => {
        const modalOpen = ref(true);
        const Host = defineComponent({
            setup: () => () =>
                h(
                    TaoModal as never,
                    { modelValue: modalOpen.value, 'onUpdate:modelValue': (v: boolean) => (modalOpen.value = v) },
                    { default: () => h(TaoSelect as never, { items: [{ id: 'a', label: 'A' }] }) },
                ),
        });
        const w = mount(Host, { attachTo: document.body });
        wrappers.push(w as unknown as VueWrapper);
        await nextTick();
        document.body.querySelector<HTMLElement>('[role="combobox"]')!.click();
        await nextTick();
        expect(document.body.querySelector('[role="listbox"]')).not.toBeNull();

        await escape();
        expect(document.body.querySelector('[role="listbox"]')).toBeNull();
        expect(modalOpen.value).toBe(true);

        await escape();
        expect(modalOpen.value).toBe(false);
    });

    it('closed layers leave nothing on the stack', async () => {
        const w = mountMenu(tree);
        await open(w);
        expect(openLayerCount()).toBeGreaterThan(0);
        w.unmount();
        wrappers.pop();
        expect(openLayerCount()).toBe(0);
    });
});
