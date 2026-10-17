import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  // Relative asset paths: the built showcase can be dropped into any folder
  // (e.g. https://666.io/sandbox/taoui/) without rebuilding.
  base: './',
  resolve: {
    alias: {
      // The showcase reads the library straight from src/ and imports it
      // under its published name, so every example can be copied as is.
      '@1337exp/taoui': path.resolve(__dirname, '../src/index.ts'),
      vue: path.resolve(__dirname, 'node_modules/vue'),
    },
  },
})
