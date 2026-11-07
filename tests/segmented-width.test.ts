import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// 5.30.0: a TaoSegmented in a flex row beside a select (100% wide) was squeezed until its last option was cut off.
// 5.30.0: TaoSegmented в flex-ряду рядом с select (100% ширины) сжимался, пока последний вариант не обрезался.
const css = readFileSync(join(__dirname, '../src/components/TaoSegmented.vue'), 'utf8').replace(/\r\n/g, '\n');

describe('TaoSegmented keeps the width of its options in a flex row', () => {
    it('does not shrink, and a block one still fills its container', () => {
        expect(css).toMatch(/\.tao-segmented \{[^}]*flex: 0 0 auto;/);
        expect(css).toMatch(/\.tao-segmented--block \{[^}]*flex: 1 1 auto;[^}]*width: 100%;/);
    });
});
