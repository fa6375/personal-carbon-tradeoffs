import { defineConfig } from 'vitest/config'

// Unit and component tests: no network and no Firebase. Emulator tests use vitest.emulator.config.ts.
// Component tests opt in to a browser-like DOM with a '// @vitest-environment jsdom' comment.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    environment: 'node',
  },
})
