/**
 * Writes skills/taoui/references/patterns.md from the recommendations of the Guide (showcase/guide/patterns/meta.js and the
 * example files beside it): what to use when and why, the accent budget, a do and a don't for every pattern. English only.
 * The same data draws the Guide page, so the page and the file an AI assistant reads never drift apart.
 * tests/showcase.patterns.test.ts fails when the file is not what this script writes (run `npm run skill`, which runs it).
 * No shebang on purpose: the test imports this file (see generate-skill.mjs).
 *
 * Пишет справочник шаблонов для skill из рекомендаций Guide (showcase/guide/patterns/meta.js и файлов-примеров рядом).
 * Те же данные рисуют страницу Guide, поэтому страница и файл, который читает ИИ, не расходятся.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'showcase/guide/patterns');
const { accentBudget, patterns, templateOf } = await import(pathToFileURL(join(dir, 'meta.js')).href);

/** The markdown of the patterns, the same text the test expects. / Markdown шаблонов. */
export function patternsMarkdown(read = (name) => readFileSync(join(dir, name), 'utf8')) {
    const out = [
        '# TaoUI patterns: what to use when, and why',
        '',
        'Generated from the Guide of the showcase (`showcase/guide/patterns/`) by `npm run skill`; do not edit by hand.',
        'Read it before you compose a screen. The page with the live examples: showcase `#patterns` (the Guide book).',
        'The examples use your own icons (`bold`, `italic`) registered with `registerTaoIcons`; `tao-*` icons are built in.',
        '',
        `## ${accentBudget.title.en}`,
        '',
        accentBudget.lead.en,
        '',
        ...accentBudget.rules.map((rule, i) => `${i + 1}. ${rule.en}`),
        '',
    ];
    for (const pattern of patterns) {
        out.push(
            `## ${pattern.title.en}`,
            '',
            `**When.** ${pattern.when.en}`,
            '',
            `**Rule.** ${pattern.rule.en}`,
            '',
            '**Do:**',
            '',
            '```vue',
            templateOf(read(`${pattern.id}.good.vue`)),
            '```',
            '',
            "**Don't:**",
            '',
            '```vue',
            templateOf(read(`${pattern.id}.bad.vue`)),
            '```',
            '',
            `**Why.** ${pattern.why.en}`,
            '',
        );
    }
    return `${out.join('\n').trimEnd()}\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
    const file = join(root, 'skills/taoui/references/patterns.md');
    writeFileSync(file, patternsMarkdown());
    console.log(`written ${file}`);
}
