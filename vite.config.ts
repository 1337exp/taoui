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
            name: 'TaoUI',
            fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
        },
        rollupOptions: {
            external: ['vue', 'nuxt'],
            output: {
                globals: {
                    vue: 'Vue',
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.css')) {
                        return 'styles.css';
                    }
                    return assetInfo.name ?? '[name][extname]';
                },
            },
        },
        cssCodeSplit: false,
        sourcemap: true,
        minify: false,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
