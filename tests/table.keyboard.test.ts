import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import TaoTable from '../src/components/TaoTable.vue';
import { tableRowTarget } from '../src/table';
// @ts-expect-error Vite `?raw` import: the component as text
import raw from '../src/components/TaoTable.vue?raw';

// 5.52.0: the rows of a `clickable` TaoTable are reachable and usable from the keyboard: one Tab stop, the arrows walk the rows,
// Enter and Space do what a click does.
// 5.52.0: строки `clickable` TaoTable доступны с клавиатуры: одна остановка Tab, стрелки ходят по строкам, Enter и Space делают то же, что клик.

const columns = [{ key: 'name', label: 'Name' }];
const rows = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }];

let wrapper: ReturnType<typeof mountTable> | undefined;
function mountTable(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
    const host = document.createElement('div');
    document.body.append(host);
    return mount(TaoTable, { props: { columns, rows, clickable: true, ...props }, slots, attachTo: host });
}
afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    document.body.innerHTML = '';
});

const trs = (w: ReturnType<typeof mountTable>) => w.findAll('tbody tr');
const stops = (w: ReturnType<typeof mountTable>) => trs(w).map((tr) => tr.attributes('tabindex'));

describe('TaoTable clickable: the Tab stop', () => {
    it('a table that is not clickable has no stops', () => {
        wrapper = mountTable({ clickable: false });
        expect(stops(wrapper)).toEqual([undefined, undefined, undefined]);
    });

    it('a clickable one is a single Tab stop: the first row, the others are reached by the arrows', () => {
        wrapper = mountTable();
        expect(stops(wrapper)).toEqual(['0', '-1', '-1']);
    });

    it('the stop follows the focus, also when it lands inside a row', async () => {
        wrapper = mountTable({}, { 'cell-name': '<button class="inner">go</button>' });
        await wrapper.findAll('.inner')[2]!.trigger('focusin');
        expect(stops(wrapper)).toEqual(['-1', '-1', '0']);
    });

    it('fewer rows than the stop: the last row is the stop', async () => {
        wrapper = mountTable();
        await trs(wrapper)[2]!.trigger('focusin');
        await wrapper.setProps({ rows: rows.slice(0, 2) });
        expect(stops(wrapper)).toEqual(['-1', '0']);
    });
});

describe('TaoTable clickable: the keys', () => {
    it('Enter and Space are a click: row-click with the row and its index; Space does not scroll the page', async () => {
        wrapper = mountTable();
        const row = trs(wrapper)[1]!;
        await row.trigger('keydown', { key: 'Enter' });
        const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
        row.element.dispatchEvent(space);
        expect(wrapper.emitted('row-click')).toEqual([[rows[1], 1], [rows[1], 1]]);
        expect(space.defaultPrevented).toBe(true);
    });

    it('a key inside a control of the row stays with that control', async () => {
        wrapper = mountTable({}, { 'cell-name': '<button class="inner">go</button>' });
        await wrapper.find('.inner').trigger('keydown', { key: 'Enter' });
        await wrapper.find('.inner').trigger('keydown', { key: 'ArrowDown' });
        expect(wrapper.emitted('row-click')).toBeUndefined();
        expect(document.activeElement).not.toBe(trs(wrapper)[1]!.element);
    });

    it('a table that is not clickable does nothing on a key', async () => {
        wrapper = mountTable({ clickable: false });
        await trs(wrapper)[0]!.trigger('keydown', { key: 'Enter' });
        expect(wrapper.emitted('row-click')).toBeUndefined();
    });

    it('a key with a modifier is left to the browser', async () => {
        wrapper = mountTable();
        await trs(wrapper)[0]!.trigger('keydown', { key: 'Enter', ctrlKey: true });
        await trs(wrapper)[0]!.trigger('keydown', { key: 'ArrowDown', altKey: true });
        expect(wrapper.emitted('row-click')).toBeUndefined();
        expect(stops(wrapper)).toEqual(['0', '-1', '-1']);
    });

    it('the arrows, Home and End walk the rows: the focus and the Tab stop move together, and stop at the ends', async () => {
        wrapper = mountTable();
        const at = () => trs(wrapper!).findIndex((tr) => tr.element === document.activeElement);
        (trs(wrapper)[0]!.element as HTMLElement).focus();
        const press = async (key: string) => trs(wrapper!)[at()]!.trigger('keydown', { key });
        await press('ArrowDown');
        expect([at(), stops(wrapper)]).toEqual([1, ['-1', '0', '-1']]);
        await press('End');
        expect(at()).toBe(2);
        await press('ArrowDown');
        expect(at()).toBe(2);
        await press('ArrowUp');
        expect(at()).toBe(1);
        await press('Home');
        expect([at(), stops(wrapper)]).toEqual([0, ['0', '-1', '-1']]);
        await press('ArrowUp');
        expect(at()).toBe(0);
    });

    it('other keys are not taken', async () => {
        wrapper = mountTable();
        const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
        trs(wrapper)[0]!.element.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
    });
});

describe('tableRowTarget', () => {
    it('the arrows step by one and stop at the ends, Home and End jump', () => {
        expect(tableRowTarget('ArrowDown', 0, 3)).toBe(1);
        expect(tableRowTarget('ArrowDown', 2, 3)).toBe(2);
        expect(tableRowTarget('ArrowUp', 2, 3)).toBe(1);
        expect(tableRowTarget('ArrowUp', 0, 3)).toBe(0);
        expect(tableRowTarget('Home', 2, 3)).toBe(0);
        expect(tableRowTarget('End', 0, 3)).toBe(2);
    });

    it('not a key of the walk, or no rows: -1', () => {
        expect(tableRowTarget('a', 0, 3)).toBe(-1);
        expect(tableRowTarget('PageDown', 0, 3)).toBe(-1);
        expect(tableRowTarget('End', 0, 0)).toBe(-1);
    });
});

describe('TaoTable clickable: the stylesheet', () => {
    it('shows the focus of a row inside its edge, where the box of the table does not cut it', () => {
        const css = (raw as string).match(/<style[^>]*>([\s\S]*)<\/style>/)![1]!.replace(/\/\*[\s\S]*?\*\//g, '');
        const rule = css.match(/\.tao-table--clickable tbody tr:focus-visible\s*\{([^}]*)\}/)?.[1] ?? '';
        expect(rule).toMatch(/outline:\s*2px solid var\(--tao-color-accent\)/);
        expect(rule).toMatch(/outline-offset:\s*-2px/);
    });
});
