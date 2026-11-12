/**
 * Loads demo data into the Firebase emulators. Started by `npm run demo`
 * (inside `firebase emulators:exec`), which also sets the emulator hosts.
 *
 * The demo password is never stored in the repository: set DEMO_PASSWORD, or
 * a random one is generated and printed below.
 */
import { randomBytes } from 'node:crypto'
import { createServer } from 'vite'

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error('Refusing to seed: start it with "npm run demo" so it runs against the Firebase emulators.')
  process.exit(1)
}

const password = process.env.DEMO_PASSWORD || randomBytes(9).toString('base64url')
const server = await createServer({ mode: 'emulator', server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
try {
  const { seedDemo } = await server.ssrLoadModule('/scripts/seedDemo.ts')
  const result = await seedDemo(password)
  console.log('\n────────────────────────────────────────────────────────')
  console.log(' Demo data loaded into the local Firebase emulators')
  console.log(`   ${result.activities} activities, ${result.comparisons} saved comparisons, 1 carbon plan`)
  console.log('   Sign in on the Account page with:')
  console.log(`     Email:    ${result.email}`)
  console.log(`     Password: ${password}`)
  console.log('────────────────────────────────────────────────────────\n')
} finally {
  await server.close()
}
process.exit(0)
