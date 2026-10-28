#!/usr/bin/env node
/**
 * Writes skills/taoui/references/components.md from the English prop tables of the showcase (showcase/propTables.en.js),
 * so the skill an AI assistant reads never drifts from the components: the tables are tested against the code.
 * tests/skill.test.ts fails when the file is not what this script writes (run `npm run skill`).
 *
 * Пишет справочник компонентов для skill из английских таблиц пропсов шоукейса: шпаргалка не расходится с кодом.
 * tests/skill.test.ts падает, если файл не совпадает с тем, что пишет скрипт (`npm run skill`).
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { propTablesEn } = await import(pathToFileURL(join(root, 'showcase/propTables.en.js')).href);

/** The markdown of the reference, the same text the test expects. / Markdown справочника. */
export function componentsMarkdown(tables) {
    const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const out = [
        '# TaoUI components: props, events, slots',
        '',
        'Generated from the showcase prop tables by `npm run skill`; do not edit by hand.',
        'A default "inherited" means the value comes from a context class on an ancestor (size, density).',
        '',
    ];
    for (const [section, groups] of Object.entries(tables)) {
        for (const group of groups) {
            out.push(`## ${group.title}`, '', `Showcase section: \`#${section}\``, '');
            if (group.rows?.length) {
                out.push('| Prop | Type | Default | Notes |', '|---|---|---|---|');
                for (const row of group.rows) {
                    out.push(`| \`${cell(row.name)}\` | \`${cell(row.type)}\` | ${cell(row.default)} | ${cell(row.note)} |`);
                }
                out.push('');
            }
            if (group.slots) {
                out.push(`**Slots, events, notes.** ${cell(group.slots)}`, '');
            }
        }
    }
    return `${out.join('\n').trimEnd()}\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
    const file = join(root, 'skills/taoui/references/components.md');
    writeFileSync(file, componentsMarkdown(propTablesEn));
    console.log(`written ${file}`);
}
