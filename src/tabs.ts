interface TaoTabBase {
    label: string;
    disabled?: boolean;
}

/**
 * One tab. `value` is what v-model holds, same as TaoSelectOption; `key` is the deprecated name.
 * Одна вкладка. `value` — то, что хранит v-model, как у TaoSelectOption; `key` — устаревшее имя.
 */
export type TaoTabItem = TaoTabBase &
    (
        | { value: string; key?: never }
        | {
              /** @deprecated Use `value`. / Используйте `value`. */
              key: string;
              value?: never;
          }
    );

export function tabValue(tab: TaoTabItem): string {
    return (tab.value ?? tab.key) as string;
}
