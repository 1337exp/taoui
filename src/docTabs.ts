/**
 * Tabs of open documents (`TaoDocTabs`): the type of a tab and the arithmetic of moving one.
 * Вкладки открытых документов (`TaoDocTabs`): тип вкладки и арифметика перестановки.
 */

/** One tab of a document. / Одна вкладка документа. */
export interface TaoDocTab {
    /** What `v-model` holds: the id of the document. / Что хранит `v-model`: id документа. */
    value: string;
    label: string;
    /** The full name for a hint on hover (a path). / Полное имя для подсказки при наведении (путь). */
    title?: string;
    /** The document has changes that are not saved: a dot. / В документе есть несохранённые изменения: точка. */
    dirty?: boolean;
    /**
     * A preview: shown in italics, and the next preview replaces it (a click on a file opens one, a double click on the tab or
     * the app's own rule pins it). / Предпросмотр: курсивом, следующий предпросмотр занимает его место.
     */
    preview?: boolean;
    /** Can be closed. Default true. / Можно закрыть. По умолчанию да. */
    closable?: boolean;
}

/**
 * Where a tab ends up when it is moved: `from` is its place now, `over` the tab it is let go on, `after` whether it is the
 * right half of that tab. The answer is the index in the list once the moved tab is taken out and put back (what `moveItem`
 * of TaoUI's sortable lists does), or null when it would stay where it is.
 * Куда встанет вкладка при перестановке: `from` — её место сейчас, `over` — вкладка, над которой её отпустили, `after` — правая
 * ли это половина. Ответ — индекс в списке после того, как вкладку вынули и вставили (как `moveItem`), или null, если она
 * осталась бы на месте.
 */
export function moveTarget(from: number, over: number, after: boolean, count: number): number | null {
    if (from < 0 || over < 0 || from >= count || over >= count) return null;
    let to = over + (after ? 1 : 0);
    if (from < to) to--;
    return to === from ? null : to;
}
