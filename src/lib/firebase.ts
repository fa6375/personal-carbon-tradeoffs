/**
 * The single Firebase initialisation for Carbon Choices.
 *
 * Configuration comes from Vite environment variables (see .env.example).
 * The Firebase web config is public client configuration, but it is still
 * kept out of Git so each developer points the app at the right project.
 *
 * Every other module gets Firebase through getFirebase(); nothing else calls
 * initializeApp, so the app is never initialised twice.
 */
import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'

const env = import.meta.env

const config: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

const REQUIRED: (keyof FirebaseOptions)[] = ['apiKey', 'authDomain', 'projectId', 'appId']

/** Set VITE_FIREBASE_USE_EMULATOR=true to use the local Auth and Firestore emulators. */
const useEmulator = env.VITE_FIREBASE_USE_EMULATOR === 'true'

/** Names of required variables that are missing, for the "not configured" message. */
export const missingFirebaseConfig: string[] = useEmulator
  ? []
  : REQUIRED.filter((key) => !config[key]).map((key) => key)

export const isFirebaseConfigured = missingFirebaseConfig.length === 0

export interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  db: Firestore
}

let services: FirebaseServices | null = null

/** Returns the shared Firebase services, or null when the app is not configured. */
export function getFirebase(): FirebaseServices | null {
  if (!isFirebaseConfigured) return null
  if (services) return services

  const options: FirebaseOptions = useEmulator
    ? { ...config, apiKey: config.apiKey || 'demo-api-key', projectId: config.projectId || 'demo-carbon-choices' }
    : config
  const app = getApps().length ? getApp() : initializeApp(options)
  const auth = getAuth(app)
  const db = getFirestore(app)

  if (useEmulator) {
    const host = env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1'
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true })
    connectFirestoreEmulator(db, host, 8080)
  }

  services = { app, auth, db }
  return services
}
