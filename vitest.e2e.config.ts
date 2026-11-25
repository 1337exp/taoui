import { defineConfig } from 'vitest/config';

// The real-browser tests: Chrome or Edge driven by playwright-core against the showcase (see e2e/). Separate from the unit tests, which run in
// happy-dom and see no layout. `npm run test:e2e`.
// Тесты в настоящем браузере: Chrome или Edge через playwright-core против витрины (см. e2e/). Отдельно от модульных тестов, которые
// идут в happy-dom и не видят вёрстки. `npm run test:e2e`.
export default defineConfig({
    test: {
        environment: 'node',
        include: ['e2e/**/*.e2e.ts'],
        testTimeout: 30000,
        hookTimeout: 60000,
        fileParallelism: false,
    },
});
