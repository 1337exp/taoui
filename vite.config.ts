import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { injectCssImports } from './scripts/viteInjectCssImports';
// @ts-expect-error a plain .mjs build script with no declarations
import { taoLayers } from './scripts/postcssTaoLayers.mjs';

// The package is unbundled ESM: one JS module per source module, and one CSS file per component, imported by the component. `index.js` is
// only named re-exports, `plugin.js` is the optional global registration, `styles.js` exists to produce the core stylesheet
// (`dist/styles/index.css`, which an app imports once). An app that imports `{ TaoButton }` gets the button and its CSS and nothing else.
// Пакет — несклеенный ESM: один JS-модуль на модуль исходников и один CSS-файл на компонент, который импортирует сам компонент. `index.js` —
// только именованные реэкспорты, `plugin.js` — необязательная глобальная регистрация, `styles.js` нужен, чтобы получить ядро стилей
// (`dist/styles/index.css`, его приложение подключает один раз). Приложение, импортирующее `{ TaoButton }`, получает кнопку и её CSS и ничего больше.
export default defineConfig({
    css: { postcss: { plugins: [taoLayers(resolve(__dirname, 'src'))] } },
    plugins: [
        vue(),
        injectCssImports(),
        dts({
            include: ['src/**/*.ts', 'src/**/*.vue'],
            outDir: 'dist',
            entryRoot: 'src',
            // One declaration file per module, as the JS is: no rolled-up file, so no API Extractor and no `Unable to follow symbol`.
            // По файлу деклараций на модуль, как и JS: без склеенного файла, а значит без API Extractor и «Unable to follow symbol».
            rollupTypes: false,
            // The emit of a generic component (TaoTable) reads `Awaited<typeof __VLS_setup>["props"]` of an optional parameter: under `strict`
            // that is an error, and a consumer's compiler (with skipLibCheck, as everyone has it) turns the props into `any`, so a wrong row
            // passes silently. It also uses `__VLS_OmitKeepDiscriminatedUnion` without declaring it (the language-core of this
            // vite-plugin-dts, 1.8, forgets it).
            // Вывод generic-компонента (TaoTable) читает `Awaited<typeof __VLS_setup>["props"]` необязательного параметра: при `strict` это
            // ошибка, и компилятор потребителя (с skipLibCheck, как у всех) делает props `any`, так что неверная строка проходит молча.
            // Он же использует `__VLS_OmitKeepDiscriminatedUnion` без объявления (так делает language-core этого vite-plugin-dts, 1.8).
            beforeWriteFile: (filePath, content) => {
                if (!content.includes('__VLS_setup')) {
                    return;
                }
                let fixed = content.replace(/(?<!NonNullable<)Awaited<typeof __VLS_setup>/g, 'NonNullable<Awaited<typeof __VLS_setup>>');
                if (fixed.includes('__VLS_OmitKeepDiscriminatedUnion<') && !fixed.includes('type __VLS_OmitKeepDiscriminatedUnion<')) {
                    const helper = 'type __VLS_OmitKeepDiscriminatedUnion<T, K extends keyof any> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;\n';
                    fixed = fixed.includes('\n//# sourceMappingURL=') ? fixed.replace(/\n\/\/# sourceMappingURL=/, `\n${helper}//# sourceMappingURL=`) : `${fixed}\n${helper}`;
                }
                return { filePath, content: fixed };
            },
        }),
    ],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                plugin: resolve(__dirname, 'src/plugin.ts'),
                styles: resolve(__dirname, 'src/styles.ts'),
            },
            formats: ['es'],
        },
        rollupOptions: {
            external: ['vue'],
            output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' },
        },
        // the oldest browsers the library supports (README, Browser support): JS and CSS are not lowered below this
        target: ['chrome130', 'edge130', 'safari18', 'firefox132'],
        cssTarget: ['chrome130', 'edge130', 'safari18', 'firefox132'],
        cssCodeSplit: true,
        cssMinify: true,
        sourcemap: true,
        minify: false,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
