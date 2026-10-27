/** One line of TaoChecklist. / Одна строка TaoChecklist. */
export interface TaoChecklistItem {
    value: string | number;
    label: string;
    /** A second, quieter line. / Вторая, тихая строка. */
    description?: string;
    disabled?: boolean;
}
