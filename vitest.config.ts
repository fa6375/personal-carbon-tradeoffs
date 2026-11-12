import { defineConfig } from 'vitest/config'

// Unit tests: no network and no Firebase. Emulator tests use vitest.emulator.config.ts.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
