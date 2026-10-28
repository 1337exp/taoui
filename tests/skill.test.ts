// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as lib from '../src/index';
import { taoPalettes } from '../src/palettes';
// @ts-expect-error a plain JS module of the showcase
import { propTablesEn } from '../showcase/propTables.en.js';
// @ts-expect-error a plain JS module of the build scripts
import { componentsMarkdown } from '../scripts/generate-skill.mjs';

// The skill an AI assistant reads (skills/taoui) must not drift from the library: the reference is generated, every
// exported component and palette is named, every token it names exists.
// Skill для ИИ-ассистента не должен расходиться с библиотекой.

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const skill = read('skills/taoui/SKILL.md');
const reference = read('skills/taoui/references/components.md');
const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry);
        return statSync(full).isDirectory() ? walk(full) : [full];
    });
const styles = walk(join(root, 'src/styles'))
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');

describe('skills/taoui', () => {
    it('has the frontmatter a skill needs: a name and a description that says when to use it', () => {
        const front = /^---\n([\s\S]*?)\n---/.exec(skill.replace(/\r\n/g, '\n'))?.[1] ?? '';
        expect(front).toMatch(/^name: taoui$/m);
        const description = /^description: (.+)$/m.exec(front)?.[1] ?? '';
        expect(description).toContain('Use when');
        expect(description.length).toBeLessThan(1024);
    });

    it('the component reference is exactly what `npm run skill` writes from the prop tables', () => {
        expect(reference.replace(/\r\n/g, '\n')).toBe(componentsMarkdown(propTablesEn));
    });

    it('names every exported component (in SKILL.md or the reference)', () => {
        const components = Object.keys(lib).filter((name) => /^Tao[A-Z]/.test(name) && typeof (lib as Record<string, unknown>)[name] === 'object');
        expect(components.length).toBeGreaterThan(60);
        const missing = components.filter((name) => !new RegExp(`\\b${name}\\b`).test(skill + reference));
        expect(missing).toEqual([]);
    });

    it('names every ready palette', () => {
        for (const palette of taoPalettes) {
            expect(skill, palette.name).toContain(`\`${palette.name}\``);
        }
    });

    it('every --tao-* token it names exists in the stylesheets', () => {
        const named = [...new Set([...skill.matchAll(/--tao-[a-z0-9-]+/g)].map((m) => m[0]))];
        expect(named.length).toBeGreaterThan(3);
        const unknown = named.filter((token) => !styles.includes(`${token}:`));
        expect(unknown).toEqual([]);
    });

    it('ships with the package', () => {
        expect(JSON.parse(read('package.json')).files).toContain('skills');
    });
});
