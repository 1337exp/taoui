import { describe, expect, it } from 'vitest';
import { matchCommands, mergeRanges, splitByRanges, type TaoCommandItem } from '../src/commandPalette';

// 5.35.0: the search of TaoCommandPalette. / 5.35.0: поиск TaoCommandPalette.

const item = (id: string, label: string, extra: Partial<TaoCommandItem> = {}): TaoCommandItem => ({ id, label, ...extra });
const ids = (items: readonly TaoCommandItem[], query: string, limit?: number) => matchCommands(items, query, limit).map((m) => m.item.id);

describe('matchCommands', () => {
    const commands = [item('save', 'Save'), item('saveas', 'Save as…'), item('open', 'Open'), item('export', 'Export JSON'), item('undo', 'Undo')];

    it('an empty query (or only spaces) returns everything as given, with nothing to light', () => {
        for (const q of ['', '   ']) {
            const all = matchCommands(commands, q);
            expect(all.map((m) => m.item.id)).toEqual(['save', 'saveas', 'open', 'export', 'undo']);
            expect(all.every((m) => m.score === 0 && m.ranges.length === 0)).toBe(true);
        }
    });

    it('the limit cuts the list, an empty one too', () => {
        expect(ids(commands, '', 2)).toEqual(['save', 'saveas']);
        expect(ids(commands, 'o', 1)).toHaveLength(1);
    });

    it('ranks the start of the label above the start of a word above any place above letters in order', () => {
        const list = [item('d', 'Reduce'), item('c', 'A dub'), item('b', 'Do it'), item('a', 'Dxuxo')];
        // «du»: «Reduce» holds it inside, «A dub» at the start of a word, «Do it» is not a hit for «du», «Dxuxo» has d…u in order
        expect(ids(list, 'du')).toEqual(['c', 'd', 'a']);
        expect(ids([item('x', 'Xdo'), item('y', 'Do')], 'do')).toEqual(['y', 'x']); // the start beats the inside
    });

    it('a word of the label starts after a space, a dot, a dash, an underscore, a slash or a colon', () => {
        for (const sep of [' ', '.', '-', '_', '/', ':']) {
            const [m] = matchCommands([item('2', 'xbbx'), item('1', `aa${sep}bb`)], 'bb'); // the inside is listed first: only the word start lifts «1»
            expect(m!.item.id, JSON.stringify(sep)).toBe('1');
        }
    });

    it('every word of the query must fit, in any order', () => {
        expect(ids(commands, 'json export')).toEqual(['export']);
        expect(ids(commands, 'save json')).toEqual([]);
        expect(ids(commands, 'as save')).toEqual(['saveas']);
    });

    it('letters in order with gaps still find a command; fewer gaps rank higher; a missing letter does not', () => {
        const list = [item('far', 'S a v e'), item('near', 'Save')];
        expect(ids(list, 'sve')).toEqual(['near', 'far']);
        expect(ids(commands, 'sv')).toContain('save');
        expect(ids(commands, 'zq')).toEqual([]);
        expect(ids([item('a', 'ab')], 'ba')).toEqual([]); // the order counts
    });

    it('the group, the description and the keywords find it, with nothing to light', () => {
        const list = [item('a', 'Write to disk', { keywords: ['save', 'store'] }), item('b', 'Open', { group: 'File', description: 'Pick a project' }), item('c', 'Other')];
        const [save] = matchCommands(list, 'save');
        expect(save!.item.id).toBe('a');
        expect(save!.ranges).toEqual([]);
        expect(ids(list, 'file')).toEqual(['b']);
        expect(ids(list, 'project')).toEqual(['b']);
        expect(ids(list, 'open file')).toEqual(['b']); // one word in the label, one in the group
        expect(ids(list, 'zzz')).toEqual([]);
    });

    it('a hit in the label beats a hit in the hidden fields, which beat letters in order', () => {
        const list = [item('hidden', 'Write', { keywords: ['export'] }), item('shown', 'Export')];
        expect(ids(list, 'export')).toEqual(['shown', 'hidden']);
        // inside the label (60) > hidden (30) > letters in order (under 20), whatever the order given
        expect(ids([item('hidden', 'Write', { keywords: ['ex'] }), item('inside', 'Next')], 'ex')).toEqual(['inside', 'hidden']);
        expect(ids([item('letters', 'E x'), item('hidden', 'Write', { keywords: ['ex'] })], 'ex')).toEqual(['hidden', 'letters']);
    });

    it('the inside of a label beats letters in order, whatever the order given', () => {
        expect(ids([item('letters', 'Dxuxo'), item('inside', 'Reduce')], 'du')).toEqual(['inside', 'letters']);
    });

    it('case does not matter, and ё is е', () => {
        expect(ids([item('1', 'Ёлка'), item('2', 'Берёза')], 'елка')).toEqual(['1']);
        expect(ids([item('1', 'Ёлка'), item('2', 'Берёза')], 'БЕРЕЗА')).toEqual(['2']);
        expect(ids([item('1', 'EXPORT')], 'export')).toEqual(['1']);
    });

    it('the lit stretches are positions in the original label and do not overlap', () => {
        const [m] = matchCommands([item('1', 'Export JSON for game')], 'json for');
        expect(m!.ranges).toEqual([[7, 11], [12, 15]]);
        const [n] = matchCommands([item('1', 'Save as')], 'save sa');
        expect(n!.ranges).toEqual([[0, 4]]); // «sa» also stands at the start of «save»: one stretch
        // two words on the same place are one stretch
        const [o] = matchCommands([item('1', 'Export')], 'exp port');
        expect(o!.ranges).toEqual([[0, 6]]);
    });

    it('a letter that lowercases to a different length keeps the positions right', () => {
        const [m] = matchCommands([item('1', 'İstanbul export')], 'export');
        expect(m!.ranges).toEqual([[9, 15]]);
    });

    it('the same score keeps the given order', () => {
        const list = [item('b', 'Zed'), item('a', 'Zen'), item('c', 'Zeb')];
        expect(ids(list, 'ze')).toEqual(['b', 'a', 'c']);
    });

    it('a disabled command is found like any other (the palette decides what to do with it)', () => {
        expect(ids([item('a', 'Save', { disabled: true })], 'save')).toEqual(['a']);
    });
});

describe('mergeRanges and splitByRanges', () => {
    it('joins touching and overlapping stretches, sorts them', () => {
        expect(mergeRanges([[5, 7], [0, 2], [2, 3], [6, 9]])).toEqual([[0, 3], [5, 9]]);
        expect(mergeRanges([])).toEqual([]);
        expect(mergeRanges([[0, 10], [2, 4]])).toEqual([[0, 10]]); // a stretch inside a bigger one does not shorten it
        expect(mergeRanges([[0, 2], [3, 5]])).toEqual([[0, 2], [3, 5]]); // a gap of one is a gap
    });

    it('cuts a label into lit and plain pieces', () => {
        expect(splitByRanges('Export JSON', [[0, 2], [7, 11]])).toEqual([
            { text: 'Ex', lit: true },
            { text: 'port ', lit: false },
            { text: 'JSON', lit: true },
        ]);
        expect(splitByRanges('Save', [])).toEqual([{ text: 'Save', lit: false }]);
        expect(splitByRanges('', [])).toEqual([{ text: '', lit: false }]);
        expect(splitByRanges('Save', [[0, 4]])).toEqual([{ text: 'Save', lit: true }]);
    });
});
