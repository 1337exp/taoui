/**
 * The search of a command palette: which commands answer a query, in what order, and which letters to light up.
 * Pure functions, no DOM: `TaoCommandPalette` draws the result, an app can reuse it for any list it filters by typing.
 * Поиск палитры команд: какие команды отвечают на запрос, в каком порядке и какие буквы подсветить.
 * Чистые функции без DOM: `TaoCommandPalette` рисует результат, приложение может взять их для любого списка с фильтром.
 */

/** A command in the palette. / Команда в палитре. */
export interface TaoCommandItem {
    id: string;
    label: string;
    /** The group it is listed under (`File`, `View`); shown as a caption. / Группа, под которой она стоит. */
    group?: string;
    /** The shortcut as the user reads it (`Ctrl+S`, `⌘S`). / Сочетание клавиш в том виде, как его читает человек. */
    shortcut?: string;
    /** An icon name. / Имя иконки. */
    icon?: string;
    /** A line under the label. / Строка под подписью. */
    description?: string;
    /** More words that find it, though they are not shown (`save` for «Write to disk»). / Слова, по которым команду тоже находят. */
    keywords?: readonly string[];
    /** Shown, but cannot be picked now. / Показана, но сейчас выбрать нельзя. */
    disabled?: boolean;
}

/** An answer to a query: the item, how well it fits, and the stretches of its label to highlight. / Ответ на запрос. */
export interface TaoCommandMatch {
    item: TaoCommandItem;
    score: number;
    /** `[from, to)` in `item.label`, sorted and not overlapping. / `[от, до)` в `item.label`, по порядку и без пересечений. */
    ranges: [number, number][];
}

/** How a letter is compared: case, and `ё` as `е`. / Как сравниваются буквы: без регистра, `ё` как `е`. */
// letter by letter and only where the length stays: the lit stretches are positions in the original label
// по одной букве и только там, где длина не меняется: подсвеченные отрезки это места в исходной подписи
const fold = (text: string) =>
    text.replace(/[^]/g, (ch) => {
        const lower = ch.toLowerCase();
        const same = lower.length === ch.length ? lower : ch;
        return same === 'ё' ? 'е' : same;
    });

const SCORE = { prefix: 100, wordStart: 80, substring: 60, hidden: 30, subsequence: 20 } as const;

/** Joins stretches that touch or overlap into the fewest stretches. / Склеивает касающиеся и пересекающиеся отрезки. */
export function mergeRanges(ranges: readonly [number, number][]): [number, number][] {
    const sorted = [...ranges].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const out: [number, number][] = [];
    for (const [from, to] of sorted) {
        const last = out[out.length - 1];
        if (last && from <= last[1]) last[1] = Math.max(last[1], to);
        else out.push([from, to]);
    }
    return out;
}

/** The score of one word of the query against the label, with the letters it lit. null: it does not fit. */
function matchWord(label: string, word: string): { score: number; ranges: [number, number][] } | null {
    const at = label.indexOf(word);
    if (at === 0) return { score: SCORE.prefix, ranges: [[0, word.length]] };
    // a word of the label starts here: after a space, a dot, a dash, a slash or a colon / слово подписи начинается здесь
    for (let i = label.indexOf(word); i >= 0; i = label.indexOf(word, i + 1)) {
        if (/[\s.\-_/:]/.test(label[i - 1] ?? '')) return { score: SCORE.wordStart, ranges: [[i, i + word.length]] };
    }
    if (at > 0) return { score: SCORE.substring, ranges: [[at, at + word.length]] };

    // the letters in order, with gaps: `sv` finds «Save»; the fewer the gaps, the better / буквы по порядку с пропусками
    const ranges: [number, number][] = [];
    let from = 0;
    let gaps = 0;
    let previous = -2;
    for (const letter of word) {
        const next = label.indexOf(letter, from);
        if (next < 0) return null;
        if (next !== previous + 1) gaps++;
        ranges.push([next, next + 1]);
        previous = next;
        from = next + 1;
    }
    return { score: Math.max(1, SCORE.subsequence - gaps), ranges: mergeRanges(ranges) };
}

/**
 * Filters and ranks. The query is words separated by spaces and every word must fit: the start of the label scores
 * highest, then the start of a word in it, then any place in it, then the letters in order with gaps; a word found only in
 * the hidden fields (group, description, keywords) still keeps the command, with nothing to highlight. An empty query
 * returns everything in the given order. The same score keeps the given order.
 * Фильтрует и ранжирует. Запрос это слова через пробел, и подойти должно каждое: выше всего начало подписи, потом начало
 * слова в ней, потом любое место, потом буквы по порядку с пропусками; слово, найденное только в скрытых полях (группа,
 * описание, слова), команду оставляет, но подсвечивать нечего. Пустой запрос отдаёт всё как есть. Равный счёт держит порядок.
 */
export function matchCommands(items: readonly TaoCommandItem[], query: string, limit = Infinity): TaoCommandMatch[] {
    const words = fold(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return items.slice(0, limit).map((item) => ({ item, score: 0, ranges: [] }));

    const found: TaoCommandMatch[] = [];
    items.forEach((item) => {
        const label = fold(item.label);
        const hidden = fold([item.group ?? '', item.description ?? '', ...(item.keywords ?? [])].join(' '));
        let score = 0;
        const ranges: [number, number][] = [];
        for (const word of words) {
            const hit = matchWord(label, word);
            if (hit) {
                score += hit.score;
                ranges.push(...hit.ranges);
            } else if (hidden.includes(word)) {
                score += SCORE.hidden;
            } else {
                return;
            }
        }
        found.push({ item, score, ranges: mergeRanges(ranges) });
    });
    // `sort` is stable, so the same score keeps the given order / `sort` устойчива, равный счёт держит порядок
    return found.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Cuts a label into pieces, lit or not, for drawing. / Режет подпись на куски, подсвеченные и нет, для отрисовки. */
export function splitByRanges(label: string, ranges: readonly [number, number][]): { text: string; lit: boolean }[] {
    const parts: { text: string; lit: boolean }[] = [];
    let at = 0;
    for (const [from, to] of ranges) {
        if (from > at) parts.push({ text: label.slice(at, from), lit: false });
        parts.push({ text: label.slice(from, to), lit: true });
        at = to;
    }
    if (at < label.length) parts.push({ text: label.slice(at), lit: false });
    return parts.length ? parts : [{ text: label, lit: false }];
}
