/**
 * One tab. `value` is what v-model holds, same as TaoSelectOption.
 * Одна вкладка. `value` — то, что хранит v-model, как у TaoSelectOption.
 */
export interface TaoTabItem {
    value: string;
    label: string;
    disabled?: boolean;
}
