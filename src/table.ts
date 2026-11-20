export type TaoTableAlign = 'left' | 'center' | 'right';

export interface TaoTableSort {
    key: string;
    dir: 'asc' | 'desc';
}

/**
 * A column. `T` is the type of a row: an interface or a class will do (the rows were `Record<string, unknown>[]`, which an interface
 * does not satisfy). Without `T` (`TaoTableColumn[]`) the column goes with rows of any type.
 * Колонка. `T` — тип строки: подойдёт и interface, и класс (строки были `Record<string, unknown>[]`, а interface к такому типу не
 * приводится). Без `T` (`TaoTableColumn[]`) колонка идёт с любыми строками.
 */
export interface TaoTableColumn<T extends object = any> {
    key: string;
    label: string;
    align?: TaoTableAlign;
    width?: string | number;
    sortable?: boolean;
    /** What the cell shows instead of `row[key]`. / Что показать в ячейке вместо `row[key]`. */
    value?(row: T): unknown;
}

/** A row key: the name of a field (`'id'`) or a function; a number or a string. / Ключ строки: имя поля или функция. */
export type TaoTableRowKey<T extends object = any> = string | ((row: T, index: number) => string | number);

/** The value of a cell: `column.value(row)`, else the field `row[column.key]`. / Значение ячейки: `column.value(row)`, иначе поле `row[column.key]`. */
export function tableCellValue<T extends object>(row: T, column: TaoTableColumn<T>): unknown {
    if (column.value) {
        return column.value(row);
    }
    return (row as Record<string, unknown>)[column.key];
}

/** The key of a row for `v-for`: the field `rowKey` names (a missing one: the index) or what the function returns. / Ключ строки для `v-for`. */
export function tableRowId<T extends object>(rowKey: TaoTableRowKey<T>, row: T, index: number): string | number {
    if (typeof rowKey === 'function') {
        return rowKey(row, index);
    }
    const key = (row as Record<string, unknown>)[rowKey];
    return key == null ? index : String(key);
}
