// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as lib from '../src/index';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const pkg = JSON.parse(read('package.json'));
const indexSource = read('src/index.ts');
const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry: string) => {
        const full = join(dir, entry);
        return statSync(full).isDirectory() ? walk(full) : [full];
    });
const componentFiles = readdirSync(join(root, 'src/components'))
    .filter((f) => f.endsWith('.vue'))
    .map((f) => f.slice(0, -4));

// Every public file path and entry point is a promise to users; these tests keep the promise visible.
// Каждый публичный путь — обещание пользователям; тесты делают его заметным.

describe('public entry', () => {
    it('every component file is exported by name from the entry', () => {
        // sub-components that are used inside others and are not meant to be public
        const internal = new Set(['TaoSliderBase', 'TaoToastItem']);
        const missing = componentFiles.filter((name: string) => !internal.has(name) && !(name in lib));
        expect(missing).toEqual([]);
    });

    it('every exported component is also registered by the plugin', () => {
        const registered = new Set([...indexSource.matchAll(/^\s+(Tao[A-Za-z]+),$/gm)].map((m) => m[1]));
        const exported = Object.keys(lib).filter((k) => /^Tao[A-Z]/.test(k) && k !== 'TaoUI');
        expect(exported.filter((name) => !registered.has(name))).toEqual([]);
    });

    it('the plugin installs every component under its own name', () => {
        const registered: string[] = [];
        lib.TaoUI.install!({ component: (name: string) => registered.push(name) } as never);
        for (const name of ['TaoButton', 'TaoSelect', 'TaoModal']) expect(registered).toContain(name);
        expect(new Set(registered).size).toBe(registered.length);
    });
});

describe('package.json', () => {
    it('is ESM only: one default entry, no CommonJS, no main / module', () => {
        expect(pkg.type).toBe('module');
        expect(pkg.exports['.']).toEqual({ types: './dist/index.d.ts', default: './dist/index.js' });
        expect(pkg.main).toBeUndefined();
        expect(pkg.module).toBeUndefined();
        expect(JSON.stringify(pkg.exports)).not.toMatch(/require|\.cjs/);
        expect(read('vite.config.ts')).toMatch(/formats:\s*\['es'\]/);
    });

    it('exports the stylesheet and the raw style files, and ships them', () => {
        expect(pkg.exports['./styles.css']).toBe('./dist/styles.css');
        expect(pkg.exports['./styles/*']).toBe('./src/styles/*');
        expect(pkg.exports['./palettes.css']).toBe('./src/styles/palettes/index.css');
        expect(pkg.files).toEqual(expect.arrayContaining(['dist', 'src/styles', 'CHANGELOG.md']));
    });

    it('marks only CSS as a side effect, so unused components can be dropped by a bundler', () => {
        expect(pkg.sideEffects).toEqual(['**/*.css']);
    });

    it('does not list nuxt, which the library never imports', () => {
        expect(pkg.peerDependencies).toEqual({ vue: expect.any(String) });
        expect(pkg.peerDependenciesMeta).toBeUndefined();
        const imported = readdirSync(join(root, 'src'), { recursive: true })
            .map(String)
            .filter((f: string) => /\.(ts|vue)$/.test(f))
            .some((f: string) => /from ['"]nuxt['"]/.test(read(join('src', f))));
        expect(imported).toBe(false);
    });

    it('states the browsers it supports, and the build targets the same ones', () => {
        expect(pkg.browserslist).toEqual(['chrome >= 111', 'edge >= 111', 'safari >= 16.4', 'firefox >= 128']);
        expect(read('vite.config.ts')).toContain("target: ['chrome111', 'edge111', 'safari16.4', 'firefox128']");
    });

    it('the style entry imports every layer that exists', () => {
        const index = read('src/styles/index.css');
        const base = join(root, 'src/styles');
        const files = walk(base).map((f) => f.slice(base.length + 1).split('\\').join('/'));
        // date-popup.css belongs to the date components, the entry itself is not imported by itself
        // palettes/ are opt-in files (`@1337exp/taoui/palettes.css`), not part of the core stylesheet
        const layers = files.filter((f) => f !== 'index.css' && f !== 'date-popup.css' && !f.startsWith('palettes/'));
        expect(layers.filter((f) => !index.includes(`./${f}`))).toEqual([]);
    });
});
