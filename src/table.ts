export type TaoTableAlign = 'left' | 'center' | 'right';

export interface TaoTableSort {
    key: string;
    dir: 'asc' | 'desc';
}

export interface TaoTableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
    key: string;
    label: string;
    align?: TaoTableAlign;
    width?: string | number;
    sortable?: boolean;
    value?: (row: T) => unknown;
}
