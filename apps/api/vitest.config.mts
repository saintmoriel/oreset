import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: ['./tests/global-setup.ts'],
    setupFiles: ['./tests/setup.ts'],
    // Real-Postgres tests share one physical test database — running test
    // files in parallel would race each other's truncate/seed steps.
    fileParallelism: false,
    testTimeout: 15000,
  },
})
