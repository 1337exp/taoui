import { mount } from '@vue/test-utils';
import { describe, expect, expectTypeOf, it } from 'vitest';
import TaoTable from '../src/components/TaoTable.vue';
import { tableCellValue, tableRowId, type TaoTableColumn } from '../src/table';

// 5.52.0: TaoTable is generic: rows of an interface, `readonly` arrays, the row typed in the handlers and the slots.
// The type checks run in `npm run type-check` (this file is in its include): a line that stops compiling fails it.
// 5.52.0: TaoTable обобщённый: строки-interface, `readonly`-массивы, тип строки в обработчиках и слотах.
// Проверки типов идут в `npm run type-check` (этот файл в его include): строка, которая перестала собираться, роняет его.

// an interface, not a type alias: it has no index signature, so it was not a `Record<string, unknown>`
interface Flag {
    flag: string;
    note: string;
    n: number;
}

const flags: readonly Flag[] = [
    { flag: '--out', note: 'a folder', n: 1 },
    { flag: '--seed', note: 'a number', n: 2 },
];

describe('TaoTable types', () => {
    it('takes rows of an interface and a readonly array, and shows them', () => {
        const columns = [
            { id: 'flag', label: 'Flag' },
            { id: 'note', label: 'Note' },
        ] as const;
        const w = mount(TaoTable, { props: { columns, rows: flags, rowKey: 'flag' } });
        expect(w.findAll('tbody tr')).toHaveLength(2);
        expect(w.find('tbody tr td').text()).toBe('--out');
    });

    it('a column of the same row type reads the row; the row of the handler is typed', async () => {
        const columns: TaoTableColumn<Flag>[] = [{ id: 'n2', label: 'Twice', value: (row) => row.n * 2 }];
        let got: Flag | undefined;
        const w = mount(TaoTable, {
            props: { columns, rows: flags, clickable: true, onRowClick: (row: Flag) => (got = row) },
        });
        expect(w.find('tbody td').text()).toBe('2');
        await w.find('tbody tr').trigger('click');
        expect(got?.flag).toBe('--out');
        expectTypeOf(columns[0]!.value).parameter(0).toEqualTypeOf<Flag>();
    });

    it('a shared `TaoTableColumn[]` (no row type) goes to any table', () => {
        const shared: TaoTableColumn[] = [{ id: 'flag', label: 'Flag' }];
        const w = mount(TaoTable, { props: { columns: shared, rows: flags } });
        expect(w.findAll('tbody tr')).toHaveLength(2);
    });

    it('a row key can be a function of the typed row', () => {
        expectTypeOf(tableRowId<Flag>).parameter(0).toEqualTypeOf<string | ((row: Flag, index: number) => string | number)>();
    });
});

describe('tableCellValue and tableRowId', () => {
    const row: Flag = { flag: '--out', note: 'x', n: 3 };

    it('the cell is the field of the key, or what `value` returns', () => {
        expect(tableCellValue(row, { id: 'flag', label: 'F' })).toBe('--out');
        expect(tableCellValue(row, { id: 'twice', label: 'T', value: (r: Flag) => r.n * 2 })).toBe(6);
        expect(tableCellValue(row, { id: 'nope', label: 'N' })).toBeUndefined();
    });

    it('the row id is the field the key names (as a string), the index when there is none, or the function result', () => {
        expect(tableRowId('n', row, 0)).toBe('3');
        expect(tableRowId('id', row, 7)).toBe(7);
        expect(tableRowId((r: Flag, i) => `${r.flag}-${i}`, row, 2)).toBe('--out-2');
    });
});
