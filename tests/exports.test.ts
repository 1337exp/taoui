// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as lib from '../src/index';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const pkg = JSON.parse(read('package.json'));
const indexSource = read('src/index.ts');
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
    it('points the entry points at files the build produces', () => {
        expect(pkg.exports['.'].import).toMatch(/^\.\/dist\/index\./);
        expect(pkg.exports['./styles.css']).toBe('./dist/styles.css');
        expect(pkg.files).toContain('dist');
    });

    it('does not list nuxt as a dependency the library never imports', () => {
        const imported = readdirSync(join(root, 'src'), { recursive: true })
            .map(String)
            .filter((f: string) => /\.(ts|vue)$/.test(f))
            .some((f: string) => /from ['"]nuxt['"]/.test(read(join('src', f))));
        expect(imported).toBe(false);
    });
});
