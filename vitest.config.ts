import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

// Separate from vite.config.ts: tests do not need the library build or d.ts generation.
// Отдельно от vite.config.ts: тестам не нужны сборка библиотеки и генерация d.ts.
export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'happy-dom',
        include: ['tests/**/*.test.ts'],
        // tests/tokens.test.ts reads the stylesheets as text (?raw); without this vitest returns them empty
        css: { include: [/src\/styles\/.*\.css/] },
    },
});
