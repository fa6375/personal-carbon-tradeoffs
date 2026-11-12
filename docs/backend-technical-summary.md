# Shared backend: technical summary for the Deliverable 2 report

This summary describes what branch `feature/shared-backend-database-api` implements, for the team's written report. The README has the full details and setup steps (sections *Architecture*, *Firebase Setup*, *Database*, *Security Rules*, *Importing Data Saved in the Browser*, *External API* and *Testing*).

## What was built

| Area | Implementation | Main files |
|---|---|---|
| Firebase initialisation | One modular Firebase app created from `VITE_FIREBASE_*` environment variables; optional local emulators | `src/lib/firebase.ts`, `.env.example` |
| Authentication | Firebase Auth with email and password: register, sign in, sign out, session kept after reload (Firebase's default IndexedDB persistence), profile document `users/{uid}` | `src/features/auth/*`, `src/pages/AccountPage.tsx` |
| Protected areas | Carbon tracking, Carbon goals and Saved comparisons show a sign-in form when signed out; Home and Compare work without an account; saving a comparison asks to sign in | `src/features/auth/RequireAuth.tsx`, `src/App.tsx` |
| Database | Cloud Firestore in project `personal-carbon-tradeoff`, all data under `users/{uid}` | repositories below |
| Tracking CRUD | create, read, list (newest first), update, delete, live listener for changes from other tabs and devices | `src/features/tracking/firestoreActivityRepository.ts`, `useActivities.ts` |
| Compare CRUD | save, list, get, delete (saved comparisons are not edited) | `src/features/compare/firestoreComparisonRepository.ts` |
| Goals CRUD | the plan (goal, budget, allocation, priorities, ideas, adjustments) is created on the first change, loaded on sign-in, updated automatically, and can be deleted | `src/features/goals/goalPlanRepository.ts`, `goalPlanSync.ts`, `components/GoalPlanSyncBar.tsx` |
| Security | Rules allow only the owner, validate fields and ranges, fix `createdAt`, and deny everything else | `firestore.rules` |
| Import | One-time, user-started import of activities and comparisons saved in `localStorage`; no duplicates, nothing deleted | `src/features/account/localImport.ts`, `LocalImportPanel.tsx` |
| External API | OpenStreetMap Nominatim (geocoding) + OSRM (car, bike and walking distance) in Compare and Tracking; throttled to 1 request per second, cached for 7 days, with attribution and error codes | `src/features/routing/*` |
| Errors | `DataError`, `AuthError` and `RouteError` with stable codes; English text in one file per area for translation | `src/lib/dataErrors.ts`, `errorMessages.ts`, `auth/authMessages.ts`, `routing/routeMessages.ts` |
| Tests | Vitest unit tests and emulator tests for rules and repositories | `src/**/*.test.ts`, `tests/emulator/*` |

## Key decisions and reasons

- **Firestore with ownership by path** (`users/{uid}/activities`, `/comparisons`, `/goalPlans/current`). One short rule protects all of a user's data, and every query reads one user's sub-collection.
- **No server code.** Security Rules enforce access, and the chosen API needs no secret key, so Cloud Functions (paid Blaze plan) are not needed.
- **Emissions are calculated, not stored**, with the one shared table of illustrative factors (`src/features/tracking/emissionFactors.ts`), so Compare, Tracking and Goals always agree.
- **The repository interfaces from Deliverable 1 were kept**, so the screens of all three features did not have to be rewritten.
- **No misleading states.** Reads go to the server, and an offline device shows "The database cannot be reached" with **Try again** instead of an empty list. Goals shows an error, not a default plan, if the saved plan cannot be loaded.

## Tests that were run (results at the time of the pull request)

- `npm test`: 17 unit tests passed.
- `npm run test:emulator`: 17 emulator tests passed (10 rules tests and 7 repository/auth tests).
- `npm run build` and `npm run lint`: passed.
- Manual check in the browser against the emulators:
  - registration and sign-in errors;
  - import, and re-import without duplicates;
  - adding, editing and deleting an activity, with the data kept after a reload;
  - Goals reading the tracked activity;
  - saving, opening and deleting a comparison;
  - Goals saving automatically and deleting the plan;
  - a second user seeing none of the first user's data;
  - the "database cannot be reached" state;
  - no horizontal scrolling at 375 px.
- One live distance lookup against the public services (Zagreb to Samobor: 25.6 km by car).

## Not done / limitations

- The real Firebase project was not used during development: the web config was not available on the developer's machine. Everything was tested against the emulators. The rules still have to be published (`npm run deploy:rules`, which needs a Firebase login).
- No email verification, password reset or account deletion.
- Cost and time figures, emission factors and the Goals sample values are illustrative, not verified data.
- Localisation is not implemented; the error codes are ready to be translated.
- No automated browser (UI) tests.
