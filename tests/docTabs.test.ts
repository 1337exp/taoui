import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TaoDocTabs from '../src/components/TaoDocTabs.vue';
// @ts-expect-error Vite `?raw` import: the component as text, to read its styles
import rawSource from '../src/components/TaoDocTabs.vue?raw';
import { moveTarget, type TaoDocTab } from '../src/docTabs';

// 5.38.0: TaoDocTabs, the tabs of open documents. / 5.38.0: вкладки открытых документов.

describe('moveTarget', () => {
    it('куда встанет вкладка: вперёд, назад, на месте', () => {
        // индексы после того, как вкладку вынули и вставили
        expect(moveTarget(0, 2, false, 4)).toBe(1); // перед третьей, значит между второй и третьей: после выемки это место 1
        expect(moveTarget(0, 2, true, 4)).toBe(2);
        expect(moveTarget(3, 1, false, 4)).toBe(1);
        expect(moveTarget(3, 1, true, 4)).toBe(2);
        expect(moveTarget(1, 1, false, 4)).toBeNull();
        expect(moveTarget(1, 1, true, 4)).toBeNull();
        expect(moveTarget(1, 0, true, 4)).toBeNull(); // «после первой» это и есть второе место
        expect(moveTarget(1, 2, false, 4)).toBeNull(); // «перед третьей» это то же место
        expect(moveTarget(0, 3, true, 4)).toBe(3); // в самый конец
        expect(moveTarget(3, 0, false, 4)).toBe(0); // в самое начало
    });

    it('негодные номера дают null', () => {
        expect(moveTarget(-1, 0, false, 3)).toBeNull();
        expect(moveTarget(0, -1, false, 3)).toBeNull();
        expect(moveTarget(3, 0, false, 3)).toBeNull();
        expect(moveTarget(0, 3, false, 3)).toBeNull();
    });

    it('результат совпадает с тем, что делает вынуть и вставить', () => {
        const list = ['a', 'b', 'c', 'd', 'e'];
        for (let from = 0; from < 5; from++) {
            for (let over = 0; over < 5; over++) {
                for (const after of [false, true]) {
                    const to = moveTarget(from, over, after, 5);
                    if (to === null) continue;
                    const moved = [...list];
                    const [item] = moved.splice(from, 1);
                    moved.splice(to, 0, item!);
                    // вкладка встала рядом с той, над которой её отпустили, с нужной стороны
                    const target = list[over]!;
                    const at = moved.indexOf(target);
                    if (target !== item) expect(moved.indexOf(item!)).toBe(after ? at + 1 : at - 1);
                }
            }
        }
    });
});

const tabs: TaoDocTab[] = [
    { value: 'a', label: 'Взрыв', title: 'effects/boom.fx.json' },
    { value: 'b', label: 'Огонь', dirty: true },
    { value: 'c', label: 'Лист', preview: true },
    { value: 'd', label: 'Закреплённая', closable: false },
];

const wrappers: VueWrapper[] = [];
function make(props: Record<string, unknown> = {}) {
    const events: { name: string; args: unknown[] }[] = [];
    const log = (name: string) => (...args: unknown[]) => events.push({ name, args });
    const w = mount(TaoDocTabs, {
        props: {
            modelValue: 'a',
            items: tabs,
            'onUpdate:modelValue': (v: string) => {
                events.push({ name: 'update', args: [v] });
                void w.setProps({ modelValue: v });
            },
            onChange: log('change'),
            onClose: log('close'),
            onPin: log('pin'),
            onReorder: log('reorder'),
            onMenu: log('menu'),
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
});

const tabEls = () => [...document.body.querySelectorAll<HTMLElement>('[role="tab"]')];
const names = (events: { name: string }[]) => events.map((e) => e.name);
async function key(el: Element, name: string, init: KeyboardEventInit = {}) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }));
    await nextTick();
}

describe('TaoDocTabs', () => {
    it('is a tablist of tabs named by the row and the document, the active one selected and the only Tab stop', () => {
        make({ controls: 'view-1' });
        expect(document.body.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Open documents');
        expect(tabEls().map((t) => t.textContent!.replace(/[×●]|unsaved changes/g, '').trim())).toEqual(['Взрыв', 'Огонь', 'Лист', 'Закреплённая']);
        expect(tabEls().map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false', 'false']);
        expect(tabEls().map((t) => t.tabIndex)).toEqual([0, -1, -1, -1]);
        expect(tabEls()[0]!.getAttribute('aria-controls')).toBe('view-1');
        expect(tabEls()[1]!.getAttribute('aria-controls')).toBeNull();
        expect(tabEls()[0]!.title).toBe('effects/boom.fx.json');
    });

    it('with no active tab (no document open) the first one is the way in by Tab', () => {
        make({ modelValue: '' });
        expect(tabEls().map((t) => t.tabIndex)).toEqual([0, -1, -1, -1]);
        expect(tabEls().every((t) => t.getAttribute('aria-selected') === 'false')).toBe(true);
    });

    it('a click selects: update and change; a click on the active one says only update', async () => {
        const { events } = make();
        tabEls()[1]!.click();
        await nextTick();
        expect(events).toEqual([
            { name: 'update', args: ['b'] },
            { name: 'change', args: ['b'] },
        ]);
        events.length = 0;
        tabEls()[1]!.click();
        await nextTick();
        expect(names(events)).toEqual(['update']);
    });

    it('the arrows walk the tabs round, Home and End go to the ends, and the focus follows', async () => {
        const { events } = make();
        await key(tabEls()[0]!, 'ArrowRight');
        expect(events.at(-2)).toEqual({ name: 'update', args: ['b'] });
        await nextTick();
        expect(document.activeElement).toBe(tabEls()[1]);
        await key(tabEls()[1]!, 'ArrowLeft');
        await key(tabEls()[0]!, 'ArrowLeft'); // wraps
        expect(events.filter((e) => e.name === 'update').map((e) => e.args[0])).toEqual(['b', 'a', 'd']);
        await key(tabEls()[3]!, 'Home');
        await key(tabEls()[0]!, 'End');
        expect(events.filter((e) => e.name === 'update').map((e) => e.args[0]).slice(-2)).toEqual(['a', 'd']);
    });

    it('closing: the cross, the middle button and Delete ask the app to close; a tab that cannot be closed has no cross and ignores both', async () => {
        const { events } = make();
        tabEls()[1]!.querySelector('button')!.click();
        await nextTick();
        expect(events).toEqual([{ name: 'close', args: ['b'] }]); // the cross does not also select the tab
        events.length = 0;

        const mid = new MouseEvent('auxclick', { button: 1, bubbles: true, cancelable: true });
        tabEls()[2]!.dispatchEvent(mid);
        expect(events).toEqual([{ name: 'close', args: ['c'] }]);
        expect(mid.defaultPrevented).toBe(true);
        events.length = 0;

        await key(tabEls()[0]!, 'Delete');
        expect(events).toEqual([{ name: 'close', args: ['a'] }]);
        events.length = 0;

        expect(tabEls()[3]!.querySelector('button')).toBeNull();
        await key(tabEls()[3]!, 'Delete');
        tabEls()[3]!.dispatchEvent(new MouseEvent('auxclick', { button: 1, bubbles: true }));
        tabEls()[3]!.dispatchEvent(new MouseEvent('auxclick', { button: 2, bubbles: true }));
        tabEls()[0]!.dispatchEvent(new MouseEvent('auxclick', { button: 2, bubbles: true }));
        expect(events).toEqual([]);
    });

    it('a preview tab is in italics and is pinned by a double click or Enter; a pinned one is not', async () => {
        const { events } = make();
        expect(tabEls().map((t) => t.classList.contains('is-preview'))).toEqual([false, false, true, false]);
        tabEls()[2]!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        tabEls()[0]!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        await key(tabEls()[2]!, 'Enter');
        await key(tabEls()[0]!, 'Enter');
        expect(events.filter((e) => e.name === 'pin')).toEqual([
            { name: 'pin', args: ['c'] },
            { name: 'pin', args: ['c'] },
        ]);
    });

    it('the unsaved dot is drawn and read aloud', () => {
        make();
        const dirty = tabEls()[1]!;
        expect(dirty.querySelector('.tao-doc-tabs__dot')).not.toBeNull();
        expect(dirty.textContent).toContain('unsaved changes');
        expect(tabEls()[0]!.querySelector('.tao-doc-tabs__dot')).toBeNull();
        expect(tabEls()[0]!.textContent).not.toContain('unsaved');
    });

    it('Alt and the arrows move the tab: reorder(from, to), nothing at the ends', async () => {
        const { events } = make();
        await key(tabEls()[1]!, 'ArrowRight', { altKey: true });
        await key(tabEls()[1]!, 'ArrowLeft', { altKey: true });
        await key(tabEls()[0]!, 'ArrowLeft', { altKey: true }); // already first
        await key(tabEls()[3]!, 'ArrowRight', { altKey: true }); // already last
        expect(events.filter((e) => e.name === 'reorder')).toEqual([
            { name: 'reorder', args: [1, 2] },
            { name: 'reorder', args: [1, 0] },
        ]);
        expect(events.filter((e) => e.name === 'update')).toEqual([]); // moving does not select
    });

    it('dragging a tab onto another asks for reorder with the side it was let go on', async () => {
        const { events } = make();
        const over = tabEls()[2]!;
        over.getBoundingClientRect = () => ({ left: 100, width: 100, right: 200, top: 0, bottom: 30, height: 30, x: 100, y: 0, toJSON: () => ({}) }) as DOMRect;
        const dt = { effectAllowed: '', setData: vi.fn() } as unknown as DataTransfer;
        const fire = (el: Element, type: string, clientX = 0) => {
            const e = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
            Object.assign(e, { dataTransfer: dt, clientX });
            el.dispatchEvent(e);
            return e;
        };
        fire(tabEls()[0]!, 'dragstart');
        const dragOver = fire(over, 'dragover', 180); // the right half: the place between this tab and the next one
        expect(dragOver.defaultPrevented).toBe(true);
        await nextTick();
        expect(tabEls()[3]!.classList.contains('drop-before')).toBe(true); // drawn at the left edge of the next tab
        expect(over.classList.contains('drop-after')).toBe(false);
        fire(over, 'dragover', 120); // the left half: the place between the previous tab and this one
        await nextTick();
        expect(over.classList.contains('drop-before')).toBe(true);
        expect(tabEls()[3]!.classList.contains('drop-before')).toBe(false);
        fire(over, 'dragover', 180);
        await nextTick();
        fire(over, 'drop');
        await nextTick();
        expect(events.filter((e) => e.name === 'reorder')).toEqual([{ name: 'reorder', args: [0, 2] }]);
        expect(over.classList.contains('drop-after')).toBe(false);
        expect(tabEls()[0]!.classList.contains('is-dragging')).toBe(false);
    });

    // 5.38.2: one place between two tabs is one mark. / 5.38.2: одно место между двумя вкладками — одна метка.
    it('the place between two tabs is drawn once, at the left edge of the right one, whichever of the two the pointer is over', async () => {
        make();
        const rect = (left: number) => ({ left, width: 100, right: left + 100, top: 0, bottom: 30, height: 30, x: left, y: 0, toJSON: () => ({}) }) as DOMRect;
        tabEls().forEach((el, i) => (el.getBoundingClientRect = () => rect(i * 100)));
        const dt = { effectAllowed: '', setData: vi.fn() } as unknown as DataTransfer;
        const fire = (el: Element, type: string, clientX = 0) => {
            const e = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
            Object.assign(e, { dataTransfer: dt, clientX });
            el.dispatchEvent(e);
        };
        const marked = () => tabEls().map((el, i) => (el.classList.contains('drop-before') ? `before ${i}` : el.classList.contains('drop-after') ? `after ${i}` : '')).filter(Boolean);

        fire(tabEls()[0]!, 'dragstart');
        fire(tabEls()[1]!, 'dragover', 190); // the right half of the second tab
        await nextTick();
        expect(marked()).toEqual(['before 2']);
        fire(tabEls()[2]!, 'dragover', 210); // the left half of the third: the same place
        await nextTick();
        expect(marked()).toEqual(['before 2']);
        fire(tabEls()[3]!, 'dragover', 390); // the right half of the last one: the end of the row
        await nextTick();
        expect(marked()).toEqual(['after 3']);
        fire(tabEls()[0]!, 'dragover', 90); // the place the dragged tab already has is no place to drop: no mark
        fire(tabEls()[1]!, 'dragover', 110);
        await nextTick();
        expect(marked()).toEqual([]);
    });

    it('a drag that did not start here, or ends on the same place, asks for nothing', async () => {
        const { events } = make();
        const fire = (el: Element, type: string, clientX = 0) => {
            const e = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
            Object.assign(e, { dataTransfer: null, clientX });
            el.dispatchEvent(e);
            return e;
        };
        const stray = fire(tabEls()[1]!, 'dragover');
        expect(stray.defaultPrevented).toBe(false); // a file from outside is not ours to take
        fire(tabEls()[1]!, 'drop');
        fire(tabEls()[1]!, 'dragstart');
        tabEls()[1]!.getBoundingClientRect = () => ({ left: 0, width: 100, right: 100, top: 0, bottom: 30, height: 30, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
        fire(tabEls()[1]!, 'dragover', 10);
        fire(tabEls()[1]!, 'drop');
        await nextTick();
        expect(events.filter((e) => e.name === 'reorder')).toEqual([]);
    });

    it('a right click and the menu key ask for the app menu and stop the browser one', async () => {
        const { events } = make();
        const click = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
        tabEls()[1]!.dispatchEvent(click);
        expect(click.defaultPrevented).toBe(true);
        await key(tabEls()[2]!, 'ContextMenu');
        await key(tabEls()[0]!, 'F10', { shiftKey: true });
        await key(tabEls()[0]!, 'F10');
        expect(events.filter((e) => e.name === 'menu').map((e) => e.args[0])).toEqual(['b', 'c', 'a']);
    });

    it('the active tab is brought into view by scrolling the row itself, never the page', async () => {
        const { w } = make();
        const list = document.body.querySelector<HTMLElement>('[role="tablist"]')!;
        const tab = tabEls()[2]!;
        const spy = vi.fn();
        tab.scrollIntoView = spy; // it would scroll every ancestor, the page among them
        list.getBoundingClientRect = () => ({ left: 100, right: 300, top: 0, bottom: 36, width: 200, height: 36, x: 100, y: 0, toJSON: () => ({}) });
        tab.getBoundingClientRect = () => ({ left: 280, right: 380, top: 0, bottom: 36, width: 100, height: 36, x: 280, y: 0, toJSON: () => ({}) });
        await w.setProps({ modelValue: 'c' });
        await nextTick();
        await nextTick();
        expect(list.scrollLeft).toBe(80); // the right edge of the tab met the right edge of the row
        expect(spy).not.toHaveBeenCalled();

        const last = tabEls()[3]!;
        last.getBoundingClientRect = () => ({ left: 60, right: 160, top: 0, bottom: 36, width: 100, height: 36, x: 60, y: 0, toJSON: () => ({}) });
        await w.setProps({ modelValue: 'd' });
        await nextTick();
        await nextTick();
        expect(list.scrollLeft).toBe(40); // and back: the left edge of the tab met the left edge of the row
    });

    // 5.38.1: a polish of the first version. / 5.38.1: доводка первой версии.
    it('draws the cross as an icon and the unsaved dot as a shape, with no text glyph in the tab', () => {
        make();
        const dirty = tabEls()[1]!;
        const dot = dirty.querySelector('.tao-doc-tabs__dot')!;
        expect(dot.textContent).toBe('');
        expect(dirty.querySelector('.tao-sr-only')!.textContent).toBe('unsaved changes');
        const cross = dirty.querySelector('.tao-doc-tabs__close')!;
        expect(cross.querySelector('svg')).not.toBeNull();
        for (const el of tabEls()) expect(el.textContent).not.toMatch(/[×●]/);
    });

    it('is draggable only when the app listens to reorder and there is more than one tab', async () => {
        make();
        expect(tabEls().map((t) => t.getAttribute('draggable'))).toEqual(['true', 'true', 'true', 'true']);
        wrappers.splice(0).forEach((w) => w.unmount());
        document.body.innerHTML = '';

        const events: string[] = [];
        mount(TaoDocTabs, { props: { modelValue: 'a', items: tabs, onClose: () => events.push('close') } as never, attachTo: document.body });
        expect(tabEls().map((t) => t.getAttribute('draggable'))).toEqual(['false', 'false', 'false', 'false']);
        const alt = new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true });
        tabEls()[1]!.dispatchEvent(alt);
        expect(alt.defaultPrevented).toBe(false); // Alt + arrow is the browser's «back» when the tab cannot be moved
        document.body.innerHTML = '';

        make({ items: [tabs[0]!] });
        expect(tabEls().map((t) => t.getAttribute('draggable'))).toEqual(['false']);
    });

    it('the row keeps the sideways swipe to itself, and a finger always sees the cross', () => {
        const source = (rawSource as string).replace(/\r\n/g, '\n');
        expect(/\.tao-doc-tabs__list \{[^}]*\}/.exec(source)![0]).toContain('overscroll-behavior-x: contain');
        expect(source).toMatch(/@media \(hover: none\) \{\s*\.tao-doc-tabs__close \{\s*opacity: 1;/);
    });

    it('the wheel scrolls the row sideways only when it overflows and the wheel is vertical', () => {
        make();
        const list = document.body.querySelector<HTMLElement>('[role="tablist"]')!;
        Object.defineProperty(list, 'scrollWidth', { value: 500, configurable: true });
        Object.defineProperty(list, 'clientWidth', { value: 200, configurable: true });
        const down = new WheelEvent('wheel', { deltaY: 40, bubbles: true, cancelable: true });
        list.dispatchEvent(down);
        expect(list.scrollLeft).toBe(40);
        expect(down.defaultPrevented).toBe(true);

        const sideways = new WheelEvent('wheel', { deltaX: 60, deltaY: 5, bubbles: true, cancelable: true });
        list.dispatchEvent(sideways);
        expect(sideways.defaultPrevented).toBe(false);

        Object.defineProperty(list, 'scrollWidth', { value: 100, configurable: true }); // all fits
        const fits = new WheelEvent('wheel', { deltaY: 40, bubbles: true, cancelable: true });
        list.dispatchEvent(fits);
        expect(fits.defaultPrevented).toBe(false);
    });

    it('texts come from the locale and can be passed; the item slot draws the label', () => {
        make({ label: 'Документы', closeLabel: 'Убрать', dirtyLabel: 'не сохранён' });
        expect(document.body.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Документы');
        expect(tabEls()[0]!.querySelector('button')!.getAttribute('aria-label')).toBe('Убрать Взрыв');
        expect(tabEls()[1]!.textContent).toContain('не сохранён');

        const w = mount(TaoDocTabs, { props: { modelValue: 'a', items: tabs }, slots: { label: '<b class="mine">{{ params.tab.label }}</b>' }, attachTo: document.body });
        wrappers.push(w);
        expect(document.body.querySelectorAll('.mine').length).toBeGreaterThan(0);
    });

    it('an empty list is an empty tablist', () => {
        make({ items: [], modelValue: '' });
        expect(tabEls()).toHaveLength(0);
        expect(document.body.querySelector('[role="tablist"]')).not.toBeNull();
    });
});
