import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        vue(),
        dts({
            include: ['src/**/*.ts', 'src/**/*.vue'],
            outDir: 'dist',
            rollupTypes: true,
            // A generic component (TaoTable) is emitted with `__VLS_OmitKeepDiscriminatedUnion` in its props and without the line that
            // declares it (the language-core of this vite-plugin-dts, 1.8, forgets it), and API Extractor stops on "Unable to follow symbol".
            // Generic-компонент (TaoTable) пишется с `__VLS_OmitKeepDiscriminatedUnion` в props, но без строки с его объявлением
            // (так делает language-core этого vite-plugin-dts, 1.8), и API Extractor падает на "Unable to follow symbol".
            // The same emit reads `Awaited<typeof __VLS_setup>["props"]` of an optional parameter: under `strict` that is an error, and a
            // consumer's compiler (with skipLibCheck, as everyone has it) turns the props into `any`, so a wrong row passes silently.
            // Тот же вывод читает `Awaited<typeof __VLS_setup>["props"]` необязательного параметра: при `strict` это ошибка, и компилятор
            // потребителя (с skipLibCheck, как у всех) делает props `any`, так что неверная строка проходит молча.
            beforeWriteFile: (filePath, content) => {
                if (!content.includes('__VLS_setup')) {
                    return;
                }
                let fixed = content.replace(/(?<!NonNullable<)Awaited<typeof __VLS_setup>/g, 'NonNullable<Awaited<typeof __VLS_setup>>');
                if (fixed.includes('__VLS_OmitKeepDiscriminatedUnion<') && !fixed.includes('type __VLS_OmitKeepDiscriminatedUnion<')) {
                    const helper = 'type __VLS_OmitKeepDiscriminatedUnion<T, K extends keyof any> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;\n';
                    fixed = fixed.replace(/\n\/\/# sourceMappingURL=/, `\n${helper}//# sourceMappingURL=`);
                }
                return { filePath, content: fixed };
            },
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: () => 'index.js',
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.css')) {
                        return 'styles.css';
                    }
                    return assetInfo.name ?? '[name][extname]';
                },
            },
        },
        // the oldest browsers the library supports (README, Browser support): JS and CSS are not lowered below this
        target: ['chrome111', 'edge111', 'safari16.4', 'firefox128'],
        cssTarget: ['chrome111', 'edge111', 'safari16.4', 'firefox128'],
        cssCodeSplit: false,
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
