import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      clearMocks: true,
      mockReset: true,
      restoreMocks: true,
      fileParallelism: false,
      sequence: {
        concurrent: false,
      },
      coverage: {
        provider: 'v8',
        reportsDirectory: 'coverage',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/App.tsx', 'src/config/**/*.ts', 'src/pages-routing.ts'],
        thresholds: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  }),
)
