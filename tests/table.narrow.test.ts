import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoTable from '../src/components/TaoTable.vue';
// @ts-expect-error Vite `?raw` import: the component as text
import raw from '../src/components/TaoTable.vue?raw';

// 5.52.0: TaoTable in a narrow place: `stack` (cards by a container query), `minWidth` (sideways scroll), `nowrap` and `minWidth` of a column.
// 5.52.0: TaoTable в узком месте: `stack` (карточки контейнерным запросом), `minWidth` (прокрутка вбок), `nowrap` и `minWidth` колонки.

const columns = [
    { key: 'flag', label: 'Flag', nowrap: true },
    { key: 'note', label: 'Note', minWidth: 200, align: 'right' as const },
];
const rows = [{ flag: '--out', note: 'a folder' }];

describe('TaoTable stack', () => {
    it('without stack the markup is what it was: no roles, no labels, no container', () => {
        const w = mount(TaoTable, { props: { columns, rows } });
        expect(w.classes()).not.toContain('tao-table-wrap--stack');
        expect(w.find('table').attributes('role')).toBeUndefined();
        expect(w.find('td').attributes('data-label')).toBeUndefined();
        expect(w.find('td').attributes('role')).toBeUndefined();
    });

    it('with stack every cell knows its label, and the table keeps its roles when it turns into blocks', () => {
        const w = mount(TaoTable, { props: { columns, rows, stack: true } });
        expect(w.classes()).toContain('tao-table-wrap--stack');
        expect(w.find('table').classes()).toContain('tao-table--stack');
        expect(w.find('table').attributes('role')).toBe('table');
        expect(w.findAll('tr').every((tr) => tr.attributes('role') === 'row')).toBe(true);
        expect(w.findAll('th').map((th) => th.attributes('role'))).toEqual(['columnheader', 'columnheader']);
        expect(w.findAll('tbody td').map((td) => [td.attributes('role'), td.attributes('data-label')])).toEqual([
            ['cell', 'Flag'],
            ['cell', 'Note'],
        ]);
    });

    it('the header stays in the DOM: a screen reader still has the column names', () => {
        const w = mount(TaoTable, { props: { columns, rows, stack: true } });
        expect(w.findAll('thead th').map((th) => th.text())).toEqual(['Flag', 'Note']);
    });

    it('the empty row is a cell of the table too', () => {
        const w = mount(TaoTable, { props: { columns, rows: [], stack: true } });
        expect(w.find('tbody td').attributes('role')).toBe('cell');
        expect(w.find('tbody td').attributes('data-label')).toBeUndefined();
    });
});

describe('TaoTable minWidth and the columns', () => {
    it('minWidth goes to a private variable: a number is px, a string is as it is, none: no variable', () => {
        const table = (minWidth?: number | string) => mount(TaoTable, { props: { columns, rows, minWidth } }).find('table').element as HTMLElement;
        expect(table(640).style.getPropertyValue('--_tao-table-min')).toBe('640px');
        expect(table('40rem').style.getPropertyValue('--_tao-table-min')).toBe('40rem');
        expect(table().style.getPropertyValue('--_tao-table-min')).toBe('');
    });

    it('a column can be nowrap and have a minimum width; the alignment is a variable, not text-align', () => {
        const w = mount(TaoTable, { props: { columns, rows } });
        const [flagTh, noteTh] = w.findAll('th').map((th) => th.element as HTMLElement);
        expect(flagTh!.classList.contains('tao-table__nowrap')).toBe(true);
        expect(noteTh!.classList.contains('tao-table__nowrap')).toBe(false);
        expect(noteTh!.style.minWidth).toBe('200px');
        expect(noteTh!.style.getPropertyValue('--_tao-align')).toBe('right');
        expect(flagTh!.style.getPropertyValue('--_tao-align')).toBe('left');
        expect((w.findAll('tbody td')[1]!.element as HTMLElement).style.minWidth).toBe('200px');
        expect(noteTh!.style.textAlign).toBe('');
    });
});

describe('TaoTable stack: the stylesheet', () => {
    const css = (raw as string).match(/<style[^>]*>([\s\S]*)<\/style>/)![1]!.replace(/\/\*[\s\S]*?\*\//g, '');
    const block = css.slice(css.indexOf('@container tao-table (width < 600px)'));

    it('the container is the wrap, and only with stack', () => {
        expect(css).toMatch(/\.tao-table-wrap--stack\s*\{\s*container:\s*tao-table\s*\/\s*inline-size;/);
        expect(css.match(/container:/g)).toHaveLength(1);
    });

    it('under 600px the rows are blocks and the header is out of sight, not out of the DOM', () => {
        expect(block).toMatch(/\.tao-table--stack td\s*\{\s*display:\s*block;/);
        expect(block).toMatch(/\.tao-table--stack thead\s*\{[^}]*position:\s*absolute;[^}]*clip:/);
        expect(block).not.toMatch(/thead\s*\{[^}]*display:\s*none/);
    });

    it('the label is above the value, silent for a screen reader, and the minimum width does not hold the cards', () => {
        expect(block).toMatch(/td\[data-label\]::before\s*\{[^}]*content:\s*attr\(data-label\);[^}]*content:\s*attr\(data-label\)\s*\/\s*'';/);
        expect(block).toMatch(/\.tao-table--stack\s*\{\s*min-width:\s*0;/);
    });
});
