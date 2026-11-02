import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// 5.23.0: the mark of the project: three SVG files in showcase/public/logo, drawn as paths (no font, no raster).
// 5.23.0: знак проекта: три SVG-файла в showcase/public/logo, нарисованы контурами (без шрифта и растра).

const dir = resolve(__dirname, '../showcase/public/logo');
const read = (name: string) => readFileSync(resolve(dir, name), 'utf8');
const FILES = ['logo-mark.svg', 'logo-mark-dark.svg', 'logo-mark-light.svg', 'favicon.svg'];

describe('logo files', () => {
    it.each(FILES)('%s is a titled SVG made of paths only', (name) => {
        const svg = read(name);
        expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="[^"]+"/);
        expect(svg).toMatch(/<title[^>]*>TaoUI<\/title>/);
        expect(svg).not.toMatch(/<text|<image|<script|font-family|href=/i);
    });

    it('the yellow of the mark is the orange of the kit', () => {
        const primitives = readFileSync(resolve(__dirname, '../src/styles/tokens/primitives.css'), 'utf8');
        const orange300 = primitives.match(/--tao-orange-300:\s*(#[0-9a-f]{6})/i)?.[1]?.toLowerCase();
        expect(orange300).toBeTruthy();
        expect(read('logo-mark-dark.svg').toLowerCase()).toContain(orange300);
        expect(read('favicon.svg').toLowerCase()).toContain(orange300);
    });

    it('the dark and the light mark are one drawing: the same paths, other colours', () => {
        const paths = (svg: string) => [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
        expect(paths(read('logo-mark-light.svg'))).toEqual(paths(read('logo-mark-dark.svg')));
        expect(read('logo-mark-light.svg')).not.toContain('#ffffff');
    });

    it('the neutral mark is the same drawing with an outline, for a background we do not choose', () => {
        const paths = (svg: string) => [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
        const neutral = read('logo-mark.svg');
        expect(paths(neutral)).toEqual(paths(read('logo-mark-dark.svg')));
        expect(neutral).toMatch(/stroke="#1a1a1a"/);
        expect(neutral).toMatch(/paint-order="stroke"/);
        expect(neutral).toContain('#ffffff');
    });

    it('the favicon is a square tile with no road markings (they are noise at 16px)', () => {
        const svg = read('favicon.svg');
        expect(svg).toContain('viewBox="0 0 64 64"');
        expect(svg).toContain('<rect');
        expect(svg).not.toMatch(/M458 565/);
    });
});

describe('where the mark is used', () => {
    it('both READMEs show the neutral mark with a plain <img> (npm ignores prefers-color-scheme, so a <picture> can hand it a mark that vanishes)', () => {
        for (const readme of ['README.md', 'README.ru.md']) {
            const text = readFileSync(resolve(__dirname, '..', readme), 'utf8');
            expect(text, readme).toContain('showcase/public/logo/logo-mark.svg');
            expect(text, readme).not.toContain('logo-mark-dark.svg');
            expect(text, readme).not.toContain('logo-mark-light.svg');
            expect(text, readme).not.toContain('<picture>');
            expect(existsSync(resolve(dir, 'logo-mark.svg'))).toBe(true);
        }
    });

    it('the showcase page has the favicon', () => {
        const html = readFileSync(resolve(__dirname, '../showcase/index.html'), 'utf8');
        expect(html).toContain('href="/logo/favicon.svg"');
        expect(existsSync(resolve(dir, 'favicon.svg'))).toBe(true);
    });
});
