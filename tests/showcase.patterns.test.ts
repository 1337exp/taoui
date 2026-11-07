// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// @ts-expect-error a plain JS module of the showcase
import { accentBudget, patterns, templateOf } from '../showcase/guide/patterns/meta.js';
// @ts-expect-error a plain JS module of the build scripts
import { patternsMarkdown } from '../scripts/generate-patterns.mjs';
// @ts-expect-error Vite `?raw` import
import guideNav from '../showcase/books/guide.nav.js?raw';
// @ts-expect-error Vite `?raw` import
import guideSections from '../showcase/books/guide.sections.js?raw';

// The Guide's recommendations are data that two readers use: the page (live examples) and the AI assistants (a generated
// reference). This keeps them one thing: every pattern has both examples, the do really does what the rule says, the don't
// really breaks it, and the reference is what the script writes.
// Рекомендации Guide — данные для двух читателей: страницы (живые примеры) и ИИ-ассистентов (справочник из них).

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = join(root, 'showcase/guide/patterns');
const read = (name: string) => readFileSync(join(dir, name), 'utf8');

type Pattern = { id: string; title: Record<string, string>; when: Record<string, string>; rule: Record<string, string>; why: Record<string, string> };
const all = patterns as Pattern[];
const buttons = (code: string) => code.match(/<TaoButton\b[^>]*>/g) ?? [];

describe('Guide patterns', () => {
    it('every text is written in both languages', () => {
        for (const p of all) {
            for (const key of ['title', 'when', 'rule', 'why'] as const) {
                expect(p[key].en, `${p.id}.${key}.en`).toBeTruthy();
                expect(p[key].ru, `${p.id}.${key}.ru`).toBeTruthy();
            }
        }
        expect(accentBudget.rules.every((r: Record<string, string>) => r.en && r.ru)).toBe(true);
    });

    it('every pattern has a do and a don\'t example next to the meta, and ids are unique', () => {
        const ids = all.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) {
            expect(existsSync(join(dir, `${id}.good.vue`)), `${id}.good.vue`).toBe(true);
            expect(existsSync(join(dir, `${id}.bad.vue`)), `${id}.bad.vue`).toBe(true);
        }
    });

    it('the toolbar do keeps every button quiet; the don\'t leaves them accent-coloured', () => {
        const good = buttons(templateOf(read('toolbar.good.vue')));
        const bad = buttons(templateOf(read('toolbar.bad.vue')));
        expect(good.length).toBeGreaterThan(0);
        expect(good.every((tag) => tag.includes('variant="ghost"') && tag.includes('tone="neutral"') && tag.includes('aria-label='))).toBe(true);
        expect(bad.every((tag) => tag.includes('variant="ghost"') && !tag.includes('tone='))).toBe(true);
    });

    it('a footer has one primary button in the do and two in the don\'t', () => {
        const primary = (code: string) => buttons(code).filter((tag) => !/variant="(secondary|ghost|text)"/.test(tag)).length;
        expect(primary(templateOf(read('form-footer.good.vue')))).toBe(1);
        expect(primary(templateOf(read('form-footer.bad.vue')))).toBe(2);
    });

    it('a destructive do puts the danger on the button that destroys; the don\'t puts it on the safe one', () => {
        const good = buttons(templateOf(read('destructive.good.vue')));
        const bad = buttons(templateOf(read('destructive.bad.vue')));
        expect(good.find((tag) => tag.includes('tone="danger"'))).toContain('tao-trash');
        expect(bad.find((tag) => tag.includes('tone="danger"'))).not.toContain('tao-trash');
    });

    it('templateOf takes the template out and removes its indent', () => {
        expect(templateOf('<script setup>\nconst a = 1\n</script>\n\n<template>\n  <div>\n    <b />\n  </div>\n</template>\n')).toBe('<div>\n  <b />\n</div>');
    });

    it('is wired into the Guide: a menu entry and a page', () => {
        expect(guideNav).toContain("id: 'patterns'");
        expect(guideSections).toContain("'patterns': DemoPatterns");
    });

    it('the reference for assistants is exactly what `npm run skill` writes', () => {
        const file = readFileSync(join(root, 'skills/taoui/references/patterns.md'), 'utf8').replace(/\r\n/g, '\n');
        expect(file).toBe(patternsMarkdown());
    });

    it('SKILL.md points at it', () => {
        expect(readFileSync(join(root, 'skills/taoui/SKILL.md'), 'utf8')).toContain('references/patterns.md');
    });
});
