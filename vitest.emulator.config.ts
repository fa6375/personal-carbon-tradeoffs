import { defineConfig } from 'vitest/config'

// Runs against the Firebase Auth and Firestore emulators (npm run test:emulator).
export default defineConfig({
  test: {
    include: ['tests/emulator/**/*.test.ts'],
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    // Load the rules-testing library as ESM so it shares the app's Firebase copy.
    server: { deps: { inline: ['@firebase/rules-unit-testing'] } },
    env: {
      VITE_FIREBASE_USE_EMULATOR: 'true',
      VITE_FIREBASE_EMULATOR_PROJECT_ID: 'demo-carbon-choices',
    },
  },
})
