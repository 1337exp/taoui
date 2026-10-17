import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { propTables } from '../showcase/propTables.js';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { propTablesEn } from '../showcase/propTables.en.js';

interface Row {
    name: string;
    type: string;
    default: string;
    note: string;
}
interface Table {
    title: string;
    kind?: string;
    rows: Row[];
    slots?: string;
}
type Tables = Record<string, Table[]>;

const ru = propTables as Tables;
const en = propTablesEn as Tables;
const CYRILLIC = /[А-Яа-яЁё]/;

describe('showcase prop tables: English overlay', () => {
    it('has the same sections as the Russian source', () => {
        expect(Object.keys(en)).toEqual(Object.keys(ru));
    });

    for (const id of Object.keys(ru)) {
        it(`keeps the structure of "${id}"`, () => {
            const source = ru[id];
            const overlay = en[id];
            expect(overlay).toBeDefined();
            expect(overlay).toHaveLength(source.length);

            source.forEach((table, t) => {
                const copy = overlay[t];
                // a title is translated only when it is Russian
                if (!CYRILLIC.test(table.title)) expect(copy.title).toBe(table.title);
                expect(copy.kind).toBe(table.kind);
                expect(Boolean(copy.slots)).toBe(Boolean(table.slots));
                expect(copy.rows.map((row) => row.name)).toEqual(table.rows.map((row) => row.name));

                table.rows.forEach((row, i) => {
                    // types stay byte for byte too, apart from the one prose "type" ("то же")
                    if (!CYRILLIC.test(row.type)) expect(copy.rows[i].type).toBe(row.type);
                    // defaults stay byte for byte, unless they hold Russian text
                    if (!CYRILLIC.test(row.default)) expect(copy.rows[i].default).toBe(row.default);
                    expect(Boolean(copy.rows[i].note)).toBe(Boolean(row.note));
                });
            });
        });
    }

    it('has no Cyrillic left in the overlay', () => {
        const left: string[] = [];
        for (const [id, tables] of Object.entries(en)) {
            for (const table of tables) {
                const texts = [table.title, table.slots ?? '', ...table.rows.flatMap((row) => [row.type, row.default, row.note])];
                if (texts.some((text) => CYRILLIC.test(text))) left.push(`${id}/${table.title}`);
            }
        }
        expect(left).toEqual([]);
    });
});
