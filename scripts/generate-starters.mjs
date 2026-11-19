/**
 * Writes skills/taoui/references/starters.md from the starters of the Guide (showcase/guide/starters/meta.js and the Vue
 * files beside it): whole screens to begin a project from, the decisions each makes and why, and the whole file. English
 * only. The same data draws the Guide page, so the page and the file an AI assistant reads never drift apart.
 * tests/showcase.starters.test.ts fails when the file is not what this script writes (run `npm run skill`, which runs it).
 * No shebang on purpose: the test imports this file (see generate-skill.mjs).
 *
 * Пишет справочник каркасов для skill из каркасов Guide (showcase/guide/starters/meta.js и Vue-файлов рядом): целые экраны,
 * с которых начинают проект, их решения с причинами и файл целиком. Те же данные рисуют страницу Guide.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'showcase/guide/starters');
const { starters } = await import(pathToFileURL(join(dir, 'meta.js')).href);

/** The markdown of the starters, the same text the test expects. / Markdown каркасов. */
export function startersMarkdown(read = (name) => readFileSync(join(dir, name), 'utf8')) {
    const out = [
        '# TaoUI starters: whole screens to begin a project from',
        '',
        'Generated from the Guide of the showcase (`showcase/guide/starters/`) by `npm run skill`; do not edit by hand.',
        'Start a new app from the starter that fits instead of composing the shell from scratch, and keep its decisions unless',
        'the app has a reason not to. The page with the starters live: showcase `#starters` (the Guide book).',
        'A starter uses the public API only: no `:deep(.tao-…)`, no private `--_…` variables of a component.',
        '',
    ];
    for (const starter of starters) {
        out.push(
            `## ${starter.title.en}`,
            '',
            `**When.** ${starter.when.en}`,
            '',
            '**Why it is built this way:**',
            '',
            ...starter.decisions.map((decision, i) => `${i + 1}. ${decision.en}`),
            '',
            `**The file.** ${starter.file.en}`,
            '',
            '```vue',
            read(`${starter.id}.vue`).replace(/\r\n/g, '\n').trim(),
            '```',
            '',
        );
    }
    return `${out.join('\n').trimEnd()}\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
    const file = join(root, 'skills/taoui/references/starters.md');
    writeFileSync(file, startersMarkdown());
    console.log(`written ${file}`);
}
