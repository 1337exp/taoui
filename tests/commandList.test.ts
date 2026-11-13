import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoCommandList from '../src/components/TaoCommandList.vue';
// @ts-expect-error Vite `?raw` import: the component as text, to read its styles
import rawSource from '../src/components/TaoCommandList.vue?raw';
import type { TaoCommandItem } from '../src/commandPalette';

// 5.36.0: TaoCommandList, the field and the list of TaoCommandPalette with no window around them.
// 5.36.0: TaoCommandList, поле и список TaoCommandPalette без окна вокруг.

const items: TaoCommandItem[] = [
    { id: 'new', label: 'New', group: 'File', shortcut: 'Ctrl+N' },
    { id: 'save', label: 'Save', group: 'File', shortcut: 'Ctrl+S' },
    { id: 'saveas', label: 'Save as…', group: 'File', disabled: true },
    { id: 'undo', label: 'Undo', group: 'Edit', shortcut: 'Ctrl+Z' },
    { id: 'fit', label: 'Zoom to fit', group: 'View', icon: 'tao-info', description: 'Show everything' },
];

const wrappers: VueWrapper[] = [];
function make(props: Record<string, unknown> = {}) {
    const events = { select: [] as string[], escape: 0 };
    const w = mount(TaoCommandList, {
        props: { items, onSelect: (item: TaoCommandItem) => events.select.push(item.id), onEscape: () => events.escape++, ...props } as never,
        attachTo: document.body,
    });
    wrappers.push(w);
    return { w, events };
}
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
});

const $ = <T extends Element = HTMLElement>(selector: string) => document.body.querySelector<T>(selector);
const $$ = (selector: string) => [...document.body.querySelectorAll<HTMLElement>(selector)];
const input = () => $<HTMLInputElement>('input')!;
const options = () => $$('[role="option"]');
async function press(name: string, init: KeyboardEventInit = {}) {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init });
    input().dispatchEvent(event);
    await nextTick();
    return event;
}
const source = (rawSource as string).replace(/\r\n/g, '\n');

describe('TaoCommandList', () => {
    it('is no dialog: a combobox and a listbox in the place where it is laid, nothing teleported, nothing locked', () => {
        const { w } = make();
        expect($('[role="dialog"]')).toBeNull();
        expect(w.element.classList.contains('tao-command-list')).toBe(true);
        expect(input().getAttribute('role')).toBe('combobox');
        expect(input().getAttribute('aria-controls')).toBe($('[role="listbox"]')!.id);
        expect(input().getAttribute('aria-activedescendant')).toBe(options()[0]!.id);
        expect(document.body.style.overflow).not.toBe('hidden');
    });

    it('puts no focus anywhere by itself, and into the field with autofocus', async () => {
        make();
        await nextTick();
        expect(document.activeElement).not.toBe(input());
        wrappers.splice(0).forEach((w) => w.unmount());
        document.body.innerHTML = '';
        make({ autofocus: true });
        await nextTick();
        expect(document.activeElement).toBe(input());
    });

    it('a pick tells which command and closes nothing; the list stays', async () => {
        const { events } = make();
        await press('ArrowDown');
        await press('Enter');
        expect(events.select).toEqual(['save']);
        expect(options()).toHaveLength(5);
        options()[3]!.click();
        expect(events.select).toEqual(['save', 'undo']);
    });

    it('a disabled row is skipped by the arrows and picks nothing', async () => {
        const { events } = make();
        await press('ArrowDown');
        await press('ArrowDown');
        expect(input().getAttribute('aria-activedescendant')).toBe(options()[3]!.id);
        options()[2]!.click();
        expect(events.select).toEqual([]);
    });

    it('Escape is told to the parent, and the list does not take the key', async () => {
        const { events } = make();
        const event = await press('Escape');
        expect(events.escape).toBe(1);
        expect(event.defaultPrevented).toBe(false);
    });

    it('can be focused and cleared from outside', async () => {
        const { w } = make();
        input().value = 'undo';
        input().dispatchEvent(new Event('input', { bubbles: true }));
        await nextTick();
        expect(options()).toHaveLength(1);
        (w.vm as unknown as { reset: () => void; focus: () => void }).reset();
        (w.vm as unknown as { reset: () => void; focus: () => void }).focus();
        await nextTick();
        expect(options()).toHaveLength(5);
        expect(document.activeElement).toBe(input());
    });

    it('class and style go to the root, the attributes of the field are the list\'s own', () => {
        const { w } = make({ class: 'mine', style: 'height: 200px' });
        expect(w.element.classList.contains('mine')).toBe(true);
        expect((w.element as HTMLElement).style.height).toBe('200px');
    });

    // 5.35.1: one scale for the field and the rows, a column for the icons, groups that do not pass for rows.
    // 5.35.1: одна шкала для поля и строк, колонка под иконки, группы, не похожие на строки.
    it('keeps a column for the icon while any row has one, and marks the rows that have it', () => {
        make();
        expect($('[role="listbox"]')!.classList.contains('has-icons')).toBe(true);
        const marked = options().filter((o) => o.classList.contains('has-icon'));
        expect(marked.map((o) => o.textContent)).toEqual([expect.stringContaining('Zoom to fit')]);
    });

    it('draws no icon column when no row has an icon', () => {
        make({ items: items.filter((i) => !i.icon) });
        expect($('[role="listbox"]')!.classList.contains('has-icons')).toBe(false);
    });

    it('the list sets its own text size and the field is on the same scale as the rows', () => {
        const root = /\.tao-command-list \{[^}]*\}/.exec(source)![0];
        expect(root).toContain('font-size: var(--tao-control-font-size)');
        const field = /\.tao-command-list__input \{[^}]*\}/.exec(source)![0];
        expect(field).toContain('--_row');
        expect(field).not.toMatch(/font-size/);
        const group = /\.tao-command-list__group \{[^}]*\}/.exec(source)![0];
        expect(group).toContain('text-transform: uppercase');
        expect(source).toMatch(/\.tao-command-list__group:not\(:first-child\) \{[^}]*border-top/);
    });

    // 5.35.2: the description is in the line of the label and never makes a row taller. / 5.35.2: описание в одной строке с подписью.
    it('the description stays in the line of the label and gives way first', () => {
        const text = /\.tao-command-list__text \{[^}]*\}/.exec(source)![0];
        expect(text).not.toContain('flex-direction: column');
        expect(/\.tao-command-list__description \{[^}]*\}/.exec(source)![0]).toContain('text-overflow: ellipsis');
        expect(/\.tao-command-list__label \{[^}]*\}/.exec(source)![0]).toContain('flex: none');
    });
});
