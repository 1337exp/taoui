import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import TaoCommandPalette from '../src/components/TaoCommandPalette.vue';
import type { TaoCommandItem } from '../src/commandPalette';

// 5.35.0: TaoCommandPalette, a dialog that searches a list of commands. / 5.35.0: окно поиска по списку команд.
// 5.36.0: the dialog is TaoCommandList in a window (the list has its own test). / 5.36.0: диалог — это TaoCommandList в окне.

const items: TaoCommandItem[] = [
    { id: 'new', label: 'New', group: 'File', shortcut: 'Ctrl+N' },
    { id: 'save', label: 'Save', group: 'File', shortcut: 'Ctrl+S' },
    { id: 'saveas', label: 'Save as…', group: 'File', disabled: true },
    { id: 'undo', label: 'Undo', group: 'Edit', shortcut: 'Ctrl+Z' },
    { id: 'fit', label: 'Zoom to fit', group: 'View', icon: 'tao-info', description: 'Show everything' },
];

const wrappers: VueWrapper[] = [];
function make(props: Record<string, unknown> = {}) {
    const events = { select: [] as string[], model: [] as boolean[] };
    const w = mount(TaoCommandPalette, {
        props: {
            modelValue: true,
            items,
            onSelect: (item: TaoCommandItem) => events.select.push(item.id),
            'onUpdate:modelValue': (open: boolean) => {
                events.model.push(open);
                void w.setProps({ modelValue: open });
            },
            ...props,
        } as never,
        attachTo: document.body,
    });
    wrappers.push(w);
    return { w, events };
}
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
    document.body.style.overflow = '';
});

const $ = <T extends Element = HTMLElement>(selector: string) => document.body.querySelector<T>(selector);
const $$ = (selector: string) => [...document.body.querySelectorAll<HTMLElement>(selector)];
const input = () => $<HTMLInputElement>('input')!;
const options = () => $$('[role="option"]');
const labels = () => options().map((o) => o.querySelector('.tao-command-list__label')?.textContent);
async function type(text: string) {
    input().value = text;
    input().dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
}
async function press(name: string, init: KeyboardEventInit = {}) {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init });
    input().dispatchEvent(event);
    await nextTick();
    return event;
}
const activeId = () => input().getAttribute('aria-activedescendant');

describe('TaoCommandPalette', () => {
    it('draws nothing while closed, and a named dialog with a combobox and a listbox when open', async () => {
        const { w } = make({ modelValue: false });
        expect($('[role="dialog"]')).toBeNull();
        await w.setProps({ modelValue: true });
        const dialog = $('[role="dialog"]')!;
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(dialog.getAttribute('aria-label')).toBe('Commands');
        expect(input().getAttribute('role')).toBe('combobox');
        expect(input().getAttribute('aria-controls')).toBe($('[role="listbox"]')!.id);
        expect(input().placeholder).toBe('Type a command…');
    });

    it('puts the focus in the field when it opens, with an empty query and the first command active', async () => {
        const { w } = make({ modelValue: false });
        await w.setProps({ modelValue: true });
        await nextTick();
        expect(document.activeElement).toBe(input());
        expect(input().value).toBe('');
        expect(activeId()).toBe(options()[0]!.id);
        expect(options()[0]!.getAttribute('aria-selected')).toBe('true');
    });

    it('an empty query lists everything under captions of its groups, with shortcuts', () => {
        make();
        expect(labels()).toEqual(['New', 'Save', 'Save as…', 'Undo', 'Zoom to fit']);
        expect($$('.tao-command-list__group').map((g) => g.textContent)).toEqual(['File', 'Edit', 'View']);
        expect($$('kbd').map((k) => k.textContent)).toEqual(['Ctrl+N', 'Ctrl+S', 'Ctrl+Z']);
        expect($('.tao-command-list__description')!.textContent).toBe('Show everything');
    });

    it('typing filters, lights the letters and names the group beside each row instead of captions', async () => {
        make();
        await type('sa');
        expect(labels()).toEqual(['Save', 'Save as…']);
        expect($$('mark').map((m) => m.textContent)).toEqual(['Sa', 'Sa']);
        expect($$('.tao-command-list__group')).toHaveLength(0);
        expect($$('.tao-command-list__where').map((g) => g.textContent)).toEqual(['File', 'File']);
    });

    it('a new query starts from the best row that can be picked', async () => {
        make();
        await press('ArrowDown');
        await type('save');
        expect(activeId()).toBe(options()[0]!.id);
        expect(options()[0]!.textContent).toContain('Save');
    });

    it('the arrows walk the rows that can be picked, wrap round, and skip a disabled one; Home and End go to the ends', async () => {
        make();
        const at = () => options().findIndex((o) => o.id === activeId());
        expect(at()).toBe(0);
        await press('ArrowDown');
        expect(at()).toBe(1);
        await press('ArrowDown'); // «Save as…» is disabled
        expect(at()).toBe(3);
        await press('ArrowUp');
        expect(at()).toBe(1);
        await press('End');
        expect(at()).toBe(4);
        await press('ArrowDown'); // wraps
        expect(at()).toBe(0);
        await press('ArrowUp'); // and back
        expect(at()).toBe(4);
        await press('Home');
        expect(at()).toBe(0);
    });

    it('Enter picks the active command, tells which, and closes', async () => {
        const { events } = make();
        await type('undo');
        await press('Enter');
        expect(events.select).toEqual(['undo']);
        expect(events.model).toEqual([false]);
        expect($('[role="dialog"]')).toBeNull();
    });

    it('a click picks a command; a disabled one and the empty list pick nothing', async () => {
        const { events } = make();
        options()[2]!.click(); // «Save as…», disabled
        await nextTick();
        expect(events.select).toEqual([]);
        expect($('[role="dialog"]')).not.toBeNull();
        options()[1]!.click();
        await nextTick();
        expect(events.select).toEqual(['save']);

        const second = make({ modelValue: true });
        await type('zzzz');
        await press('Enter');
        expect(second.events.select).toEqual([]);
    });

    it('the pointer over a row makes it active, a disabled row stays as it was', async () => {
        make();
        options()[3]!.dispatchEvent(new Event('pointermove', { bubbles: true }));
        await nextTick();
        expect(activeId()).toBe(options()[3]!.id);
        options()[2]!.dispatchEvent(new Event('pointermove', { bubbles: true }));
        await nextTick();
        expect(activeId()).toBe(options()[3]!.id);
        expect(options()[2]!.getAttribute('aria-disabled')).toBe('true');
    });

    it('Escape and a press on the backdrop close it, a press inside does not', async () => {
        const { events } = make();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await nextTick();
        expect(events.model).toEqual([false]);

        const again = make();
        const overlay = $('.tao-command-palette-overlay')!;
        $('.tao-command-palette')!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        $('.tao-command-palette')!.dispatchEvent(new Event('pointerup', { bubbles: true }));
        await nextTick();
        expect(again.events.model).toEqual([]);
        overlay.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        overlay.dispatchEvent(new Event('pointerup', { bubbles: true }));
        await nextTick();
        expect(again.events.model).toEqual([false]);
    });

    it('Tab does not leave the field, and a key during text composition is not taken', async () => {
        make();
        const tab = await press('Tab');
        expect(tab.defaultPrevented).toBe(true);
        const composing = await press('Enter', { isComposing: true } as never);
        expect(composing.defaultPrevented).toBe(false);
    });

    it('nothing found shows the text, in the language of the locale or the one passed', async () => {
        make();
        await type('zzzz');
        expect(options()).toHaveLength(0);
        expect($('.tao-command-list__empty')!.textContent).toContain('No commands found');
        expect(activeId()).toBeNull();

        wrappers.splice(0).forEach((w) => w.unmount());
        document.body.innerHTML = '';
        make({ emptyText: 'Пусто', placeholder: 'Команда', label: 'Палитра' });
        await type('zzzz');
        expect($('.tao-command-list__empty')!.textContent).toBe('Пусто');
        expect(input().placeholder).toBe('Команда');
        expect($('[role="dialog"]')!.getAttribute('aria-label')).toBe('Палитра');
    });

    it('a row can be drawn by the app (the item slot) and gets the item and whether it is active', async () => {
        const Host = defineComponent({
            setup() {
                const open = ref(true);
                return () =>
                    h(TaoCommandPalette, { modelValue: open.value, items, 'onUpdate:modelValue': (v: boolean) => (open.value = v) }, { item: ({ item, active }: { item: TaoCommandItem; active: boolean }) => h('b', { class: 'mine' }, `${item.id}:${active}`) });
            },
        });
        const w = mount(Host, { attachTo: document.body });
        wrappers.push(w as never);
        expect($$('.mine').map((e) => e.textContent)).toEqual(['new:true', 'save:false', 'saveas:false', 'undo:false', 'fit:false']);
    });

    it('by default it shows at most 50 rows', () => {
        make({ items: Array.from({ length: 80 }, (_, i) => ({ id: String(i), label: `Command ${i}` })) });
        expect(options()).toHaveLength(50);
    });

    it('opening again starts from an empty query', async () => {
        const { w } = make();
        await type('undo');
        await w.setProps({ modelValue: false });
        await w.setProps({ modelValue: true });
        await nextTick();
        expect(input().value).toBe('');
        expect(options()).toHaveLength(5);
    });

    it('a press that began inside the panel and ended on the backdrop does not close it', async () => {
        const { events } = make();
        $('.tao-command-palette')!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        $('.tao-command-palette-overlay')!.dispatchEvent(new Event('pointerup', { bubbles: true }));
        await nextTick();
        expect(events.model).toEqual([]);
    });

    it('a query of spaces is an empty one: groups as captions, no group beside the rows', async () => {
        make();
        await type('   ');
        expect($$('.tao-command-list__group')).toHaveLength(3);
        expect($$('.tao-command-list__where')).toHaveLength(0);
        expect(options()).toHaveLength(5);
    });

    it('limit caps the rows', async () => {
        make({ limit: 2 });
        expect(options()).toHaveLength(2);
    });

    it('locks the page scroll while open and gives it back', async () => {
        const { w } = make();
        expect(document.body.style.overflow).toBe('hidden');
        await w.setProps({ modelValue: false });
        await nextTick();
        expect(document.body.style.overflow).not.toBe('hidden');
    });

    // 5.37.0: modal and fullscreen. / 5.37.0: modal и fullscreen.
    it('is modal by default: the page is locked, the dialog says so', () => {
        make();
        expect($('[role="dialog"]')!.getAttribute('aria-modal')).toBe('true');
        expect($('.tao-command-palette-overlay')!.classList.contains('tao-command-palette-overlay--float')).toBe(false);
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('modal=false is a panel over a living page: no lock, no dimming class, a press outside closes it, inside does not', async () => {
        const { events } = make({ modal: false });
        expect($('[role="dialog"]')!.getAttribute('aria-modal')).toBe('false');
        expect($('.tao-command-palette-overlay')!.classList.contains('tao-command-palette-overlay--float')).toBe(true);
        expect(document.body.style.overflow).not.toBe('hidden');

        input().dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await nextTick();
        expect(events.model).toEqual([]);

        const page = document.createElement('button');
        document.body.append(page);
        page.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await nextTick();
        expect(events.model).toEqual([false]);
    });

    it('a modal palette is not closed by a press outside the panel handled as a dismiss, only by the backdrop', async () => {
        const { events } = make();
        const page = document.createElement('button');
        document.body.append(page);
        page.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await nextTick();
        expect(events.model).toEqual([]);
    });

    it('a panel that is not modal still closes on Escape', async () => {
        const { events } = make({ modal: false });
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await nextTick();
        expect(events.model).toEqual([false]);
    });

    it('fullscreen is the whole screen on a phone by default, always with true, never with false', () => {
        const overlay = () => $('.tao-command-palette-overlay')!.classList;
        make();
        expect(overlay().contains('tao-command-palette-overlay--fullscreen-narrow')).toBe(true);
        expect(overlay().contains('tao-command-palette-overlay--fullscreen')).toBe(false);
        wrappers.splice(0).forEach((w) => w.unmount());
        document.body.innerHTML = '';
        make({ fullscreen: true });
        expect(overlay().contains('tao-command-palette-overlay--fullscreen')).toBe(true);
        wrappers.splice(0).forEach((w) => w.unmount());
        document.body.innerHTML = '';
        make({ fullscreen: false });
        expect(overlay().contains('tao-command-palette-overlay--fullscreen')).toBe(false);
        expect(overlay().contains('tao-command-palette-overlay--fullscreen-narrow')).toBe(false);
    });

    it('attributes go to the panel, not to the overlay', () => {
        make({ class: 'mine', 'data-x': '1' });
        expect($('.tao-command-palette')!.classList.contains('mine')).toBe(true);
        expect($('.tao-command-palette')!.getAttribute('data-x')).toBe('1');
        expect($('.tao-command-palette-overlay')!.getAttribute('data-x')).toBeNull();
    });
});
