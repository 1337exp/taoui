import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import primitives from '../src/styles/tokens/primitives.css?raw';

// Radius: one knob (`--tao-radius-base`), every step a whole pixel. A corner on a fractional pixel is painted with a soft,
// flickering edge, so no radius may be a bare product with a fraction.
// Радиус: одна ручка (`--tao-radius-base`), каждый шаг в целых пикселях. Угол на дробном пикселе рисуется мягким мерцающим
// краем, поэтому радиус нельзя считать дробным умножением без округления.

const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : /\.(vue|css)$/.test(e.name) ? [join(dir, e.name)] : []));

describe('radius', () => {
    it('the steps are counted from the base and rounded to a whole pixel', () => {
        expect(primitives).toMatch(/--tao-radius-base:\s*10px/);
        for (const step of ['sm', 'md', 'lg', 'xl']) {
            expect(primitives).toMatch(new RegExp(String.raw`--tao-radius-${step}:\s*round\(.*var\(--tao-radius-base\).*,\s*1px\)`));
        }
    });

    it('with the base of the kit the steps are the scale 6 / 10 / 14 / 18', () => {
        const base = 10;
        expect([0.6, 1, 1.4, 1.8].map((k) => Math.round(base * k))).toEqual([6, 10, 14, 18]);
    });

    it('whatever the base, a step is a whole number (round to 1px)', () => {
        for (let base = 4; base <= 24; base += 1) {
            for (const k of [0.6, 1, 1.4, 1.8]) {
                expect(Number.isInteger(Math.round(base * k))).toBe(true);
            }
        }
    });

    it('no component multiplies a radius by a fraction without round()', () => {
        const bad: string[] = [];
        for (const file of walk(join(__dirname, '..', 'src'))) {
            readFileSync(file, 'utf8')
                .split('\n')
                .forEach((line, i) => {
                    if (/radius[\w-]*\)?\s*\*\s*\d*\.\d+/.test(line) && !/round\(/.test(line) && !/tao-radius-base/.test(line)) {
                        bad.push(`${file}:${i + 1}: ${line.trim()}`);
                    }
                });
        }
        expect(bad).toEqual([]);
    });
});
