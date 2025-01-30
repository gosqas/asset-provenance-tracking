import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['test/**/*.{test,spec}.{js,ts}'],
    // Add ESM support
    sequence: {
      hooks: 'list'
    }
  },
})