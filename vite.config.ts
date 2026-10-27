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
