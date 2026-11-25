/**
 * One tool of a workbench: a button on a rail that opens a panel (a file tree, a terminal, an inspector). The same data for the left, the right
 * and the bottom rail.
 * Один инструмент рабочей области: кнопка на рейке, которая открывает панель (дерево файлов, терминал, инспектор). Одни данные для левой,
 * правой и нижней рейки.
 */
export interface TaoWorkbenchTool {
    id: string;
    /** The name: the hint of the button and the title of the panel. / Имя: подсказка кнопки и заголовок панели. */
    label: string;
    /** An icon name for `TaoIcon`. / Имя иконки для `TaoIcon`. */
    icon?: string;
    /** The key that does the same, shown in the hint (`Alt+1`). / Клавиша, которая делает то же, показана в подсказке (`Alt+1`). */
    shortcut?: string;
    /** A count, a text, or `true` for a dot. / Счётчик, текст или `true` для точки. */
    badge?: number | string | boolean;
    /** What a screen reader says about the badge. / Что о значке говорит скринридер. */
    badgeLabel?: string;
    disabled?: boolean;
}

/** The side of a rail. / Сторона рейки. */
export type TaoWorkbenchSide = 'left' | 'right' | 'bottom';

/** The tool a press opens: the open one closes, any other takes its place. / Инструмент, который открывает нажатие: открытый закрывается, другой занимает его место. */
export function toggleTool(current: string | null | undefined, id: string): string | null {
    return current === id ? null : id;
}

/**
 * The region the focus moves to with F6 (Shift+F6 backwards), going round the ring. `current` is the index of the region that holds the focus,
 * or -1 when none does: forward then goes to the first, backward to the last.
 * Область, на которую фокус идёт по F6 (Shift+F6 назад), по кругу. `current` — индекс области с фокусом или -1, если фокуса нет ни в одной:
 * вперёд идём на первую, назад на последнюю.
 */
export function nextRegion(count: number, current: number, delta: 1 | -1): number {
    if (count <= 0) {
        return -1;
    }
    if (current < 0) {
        return delta === 1 ? 0 : count - 1;
    }
    return (current + delta + count) % count;
}
