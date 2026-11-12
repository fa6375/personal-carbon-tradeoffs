import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// Live test against the REAL Firebase project from .env.local (npm run test:live).
// It creates its own throw-away accounts and records and deletes them at the end.
export default defineConfig(({ mode }) => ({
  test: {
    include: ['tests/live/**/*.test.ts'],
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 60000,
    fileParallelism: false,
    env: { ...loadEnv(mode, process.cwd(), 'VITE_'), VITE_FIREBASE_USE_EMULATOR: 'false' },
  },
}))
