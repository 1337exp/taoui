#!/usr/bin/env node
/**
 * Consumer smoke test: packs the library, installs the tarball into a throwaway Vue + Vite project
 * (the way a real user does), imports it by its public paths and builds. Catches broken `exports`,
 * missing files, CSS that does not ship and peer-dependency trouble before a release.
 * It also records what a consumer pays: JS and CSS size for one component versus the whole entry.
 * Run after `npm run build`:  npm run smoke
 * Needs network access for `vue`, `vite` and `@vitejs/plugin-vue`.
 *
 * Проверка «глазами потребителя»: пакуем, ставим в чистый проект, собираем. Заодно меряет, сколько платит потребитель.
 */
import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'taoui-smoke-'));
const run = (cmd, cwd = dir) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' });
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

function build(name, appSource) {
    const project = join(dir, name);
    mkdirSync(join(project, 'src'), { recursive: true });
    writeFileSync(join(project, 'package.json'), JSON.stringify({ name, private: true, type: 'module' }));
    writeFileSync(join(project, 'vite.config.js'), "import vue from '@vitejs/plugin-vue';\nexport default { plugins: [vue()], build: { minify: true } };\n");
    writeFileSync(join(project, 'index.html'), '<div id="app"></div><script type="module" src="/src/main.js"></script>');
    writeFileSync(join(project, 'src/main.js'), "import { createApp } from 'vue';\nimport App from './App.vue';\nimport '@1337exp/taoui/styles.css';\ncreateApp(App).mount('#app');\n");
    writeFileSync(join(project, 'src/App.vue'), appSource);
    run(`npm install vue vite @vitejs/plugin-vue ${join(dir, tgz)}`, project);
    run('npx vite build', project);
    const assets = join(project, 'dist/assets');
    const files = readdirSync(assets).map((f) => ({ f, text: readFileSync(join(assets, f)) }));
    const sum = (ext) => files.filter((x) => x.f.endsWith(ext)).reduce((a, x) => ({ raw: a.raw + x.text.length, gz: a.gz + gzipSync(x.text).length }), { raw: 0, gz: 0 });
    return { js: sum('.js'), css: sum('.css'), cssText: files.filter((x) => x.f.endsWith('.css')).map((x) => x.text.toString()).join('\n') };
}

/**
 * The types the way a consumer's compiler sees them (skipLibCheck on, as everyone has it). A generic component (TaoTable) went through
 * the declaration emit once with `Awaited<typeof __VLS_setup>["props"]` and the props became `any`: a wrong row passed silently. So
 * a right file must compile, and a file with a wrong row, handler and slot must fail on exactly those lines.
 * Типы глазами компилятора потребителя. Generic-компонент (TaoTable) однажды ушёл в декларации с `Awaited<…>["props"]`, props стали
 * `any`, и неверная строка проходила молча. Верный файл должен собираться, файл с неверной строкой, обработчиком и слотом — падать.
 */
function checkTypes() {
    const project = join(dir, 'types');
    mkdirSync(join(project, 'src'), { recursive: true });
    writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'types', private: true, type: 'module' }));
    writeFileSync(
        join(project, 'tsconfig.json'),
        JSON.stringify({ compilerOptions: { target: 'ES2020', module: 'ESNext', moduleResolution: 'bundler', strict: true, skipLibCheck: true, noEmit: true, lib: ['ES2020', 'DOM'] }, include: ['src/*.vue'] }),
    );
    const head = `<script setup lang="ts">\nimport { TaoTable, type TaoTableColumn } from '@1337exp/taoui';\ninterface Flag { flag: string; n: number }\nconst rows: readonly Flag[] = [{ flag: '--a', n: 1 }];\nconst columns: TaoTableColumn[] = [{ key: 'flag', label: 'Flag' }];\n`;
    writeFileSync(join(project, 'src/Good.vue'), `${head}const open = (row: Flag) => row.n;\n</script>\n<template><TaoTable :columns="columns" :rows="rows" row-key="flag" @row-click="open"><template #cell-flag="{ row }">{{ row.flag.toUpperCase() }}</template></TaoTable></template>\n`);
    run(`npm install vue typescript vue-tsc ${join(dir, tgz)}`, project);
    run('npx vue-tsc --noEmit', project);

    writeFileSync(join(project, 'src/Good.vue'), '<template><p>x</p></template>\n');
    writeFileSync(join(project, 'src/Bad.vue'), `${head}const open = (row: { zzz: number }) => row.zzz;\n</script>\n<template><TaoTable :columns="columns" :rows="rows" @row-click="open"><template #cell="{ row }">{{ row.nope }}</template></TaoTable><TaoTable :columns="columns" :rows="3" /></template>\n`);
    let failed = '';
    try {
        run('npx vue-tsc --noEmit', project);
    } catch (error) {
        failed = String(error.stdout ?? '');
    }
    for (const mark of ["'nope'", "'zzz'", "'readonly any[]'"]) {
        if (!failed.includes(mark)) throw new Error(`the types of TaoTable let a wrong use pass: no error with ${mark}\n${failed}`);
    }
}

let tgz;
try {
    tgz = run('npm pack --silent --ignore-scripts --pack-destination .', root).trim().split('\n').pop();
    const packed = join(root, tgz);
    writeFileSync(join(dir, tgz), readFileSync(packed));
    rmSync(packed);

    const one = build('one', `<script setup>\nimport { TaoButton } from '@1337exp/taoui';\n</script>\n<template><TaoButton>Hi</TaoButton></template>\n`);
    const all = build('all', `<script setup>\nimport * as lib from '@1337exp/taoui';\nconst names = Object.keys(lib);\n</script>\n<template><p>{{ names.length }}</p></template>\n`);

    if (!one.cssText.includes('.tao-button')) throw new Error('built CSS lacks the button styles: styles.css did not ship');
    console.log(`one component : JS ${kb(one.js.raw)} (${kb(one.js.gz)} gzip), CSS ${kb(one.css.raw)} (${kb(one.css.gz)} gzip)`);
    console.log(`whole entry   : JS ${kb(all.js.raw)} (${kb(all.js.gz)} gzip), CSS ${kb(all.css.raw)} (${kb(all.css.gz)} gzip)`);
    console.log(`tarball       : ${kb(statSync(join(dir, tgz)).size)}`);
    checkTypes();
    console.log('smoke ok: tarball installed, public paths resolved, app built, CSS shipped, types of TaoTable checked');
} finally {
    rmSync(dir, { recursive: true, force: true });
}
