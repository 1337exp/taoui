/**
 * One tab. `id` is what v-model holds, same as TaoSelectItem.
 * Одна вкладка. `id` — то, что хранит v-model, как у TaoSelectItem.
 */
export interface TaoTabItem {
    id: string;
    label: string;
    disabled?: boolean;
}
