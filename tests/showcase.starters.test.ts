// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// @ts-expect-error a plain JS module of the showcase
import { starters } from '../showcase/guide/starters/meta.js';
// @ts-expect-error a plain JS module of the build scripts
import { startersMarkdown } from '../scripts/generate-starters.mjs';
// @ts-expect-error Vite `?raw` import
import guideNav from '../showcase/books/guide.nav.js?raw';
// @ts-expect-error Vite `?raw` import
import guideSections from '../showcase/books/guide.sections.js?raw';

// The starters of the Guide are files people copy as is to begin a project, and data two readers use (the page and the AI
// assistants). This holds the promise of the section: a starter stands on the public API only, every decision is written
// in both languages, and the reference for assistants is what the script writes.
// Каркасы Guide копируют как есть, чтобы начать проект; это и данные для двух читателей. Тест держит обещание раздела:
// каркас стоит только на публичном API, каждое решение написано на двух языках, справочник — то, что пишет скрипт.

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = join(root, 'showcase/guide/starters');
const read = (name: string) => readFileSync(join(dir, name), 'utf8');

type Text = Record<'en' | 'ru', string>;
type Starter = { id: string; title: Text; when: Text; file: Text; decisions: Text[] };
const all = starters as Starter[];

describe('Guide starters', () => {
    it('every text is written in both languages, and ids are unique', () => {
        expect(all.length).toBeGreaterThan(0);
        expect(new Set(all.map((s) => s.id)).size).toBe(all.length);
        for (const s of all) {
            for (const key of ['title', 'when', 'file'] as const) {
                expect(s[key].en && s[key].ru, `${s.id}.${key}`).toBeTruthy();
            }
            expect(s.decisions.length, s.id).toBeGreaterThan(2);
            expect(s.decisions.every((d) => d.en && d.ru), s.id).toBe(true);
        }
    });

    it('every starter is a Vue file next to the meta that stands on the public API only', () => {
        for (const s of all) {
            expect(existsSync(join(dir, `${s.id}.vue`)), `${s.id}.vue`).toBe(true);
            const source = read(`${s.id}.vue`);
            expect(source, `${s.id}: reaches into a component`).not.toMatch(/:deep\(\s*\.tao-/);
            expect(source, `${s.id}: reads a private variable`).not.toMatch(/var\(--_/);
            expect(source, `${s.id}: imports the kit by its published name`).toContain("from '@1337exp/taoui'");
            expect(source, `${s.id}: hex colour`).not.toMatch(/#[0-9a-f]{3,8}\b/i);
        }
    });

    it('the app shell fills the window, keeps one accent action and quiet counters', () => {
        const source = read('app-shell.vue');
        expect(source).toMatch(/<TaoNav\b[^>]*\sfill\b/);
        expect(source).toMatch(/<TaoNav\b[^>]*badge-tone="neutral"/);
        // the main action of the navigation is one button (the empty state has an action of its own, in the page)
        const action = /<TaoNav\b[\s\S]*?<template #action>([\s\S]*?)<\/template>/.exec(source)?.[1] ?? '';
        expect(action.match(/<TaoButton\b/g)).toHaveLength(1);
        expect(action).not.toMatch(/variant="/);
        // the project chip under it is a block dropdown that folds by the public variable, not by reaching into the menu
        expect(action).toMatch(/<TaoDropdownMenu\b[^>]*\sblock\b/);
        expect(source).toMatch(/\.shell-chip__text \{[^}]*max-width: calc\(\(1 - var\(--tao-nav-compact\)\)/);
        expect(source).not.toContain('tao-dropdown-menu__');
        expect(source).toContain('class="tao-nav__action-label"');
        // the phone header follows the bar of TaoNav: the same container and breakpoint, no JavaScript
        expect(source).toContain('@container tao-nav (width < 600px)');
        expect(source).not.toMatch(/matchMedia|innerWidth/);
    });

    it('the list and the item: measured on an outer box, laid out on the inner one, quiet actions, a way back', () => {
        const source = read('list-detail.vue');
        // a container query cannot ask an element about its own width: the room and the grid are two boxes
        expect(source).toMatch(/\.ld-room \{\s*container: list-detail \/ inline-size;/);
        expect(source).toContain('@container list-detail (width < 640px)');
        expect(source).not.toMatch(/\.ld-room \{[^}]*grid-template-columns/);
        expect(source).toMatch(/<TaoList\b[^>]*\sroving\b/);
        expect(source).toMatch(/<TaoListItem\b[\s\S]*?\sclickable\b[\s\S]*?:selected=/);
        const buttons = source.match(/<TaoButton\b[^>]*>/g) ?? [];
        expect(buttons.length).toBeGreaterThan(2);
        expect(buttons.every((tag) => tag.includes('variant="ghost"') && tag.includes('aria-label='))).toBe(true);
        expect(buttons.find((tag) => tag.includes('tao-trash'))).toContain('tone="danger"');
        expect(source).not.toMatch(/matchMedia|innerWidth/);
    });

    it('every starter is its own entry of the Guide menu, in the group Starters, with its own page', () => {
        expect(guideNav).toContain("id: 'starters'");
        for (const s of all) {
            expect(guideNav, s.id).toContain(`id: 'starter-${s.id}'`);
            expect(guideSections, s.id).toMatch(new RegExp(`'starter-${s.id}': DemoStarter\\w+,`));
            expect(guideSections, s.id).toContain(`starterPage('${s.id}')`);
        }
    });

    it('the reference for assistants is exactly what `npm run skill` writes, and SKILL.md points at it', () => {
        const file = readFileSync(join(root, 'skills/taoui/references/starters.md'), 'utf8').replace(/\r\n/g, '\n');
        expect(file).toBe(startersMarkdown());
        expect(readFileSync(join(root, 'skills/taoui/SKILL.md'), 'utf8')).toContain('references/starters.md');
    });
});
