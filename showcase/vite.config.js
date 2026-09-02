import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@tao/ui': path.resolve(__dirname, '../src/index.ts'),
      vue: path.resolve(__dirname, 'node_modules/vue'),
    },
  },
})
