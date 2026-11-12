# Localization, accessibility and UI states — handover

Author: Martin Mudrinić · Branch: `feature/localization-accessibility` · Base: `main` at `dc3df15` (after PR #7)

This note is for Lazar, for the Deliverable 2 report. It covers requirements **F5 (localization)**, **F6 (loading, empty, error and offline states)** and **F7 (accessibility)**. More detail is in the README sections [Internationalization](../README.md#internationalization), [Accessibility](../README.md#accessibility) and [Testing](../README.md#testing).

## What was implemented

### F5 — Localization

- Supported languages: **English (`en`, source and fallback), Croatian (`hr`), German (`de`)**. No third language had been chosen before, so German was added as requested.
- A small typed localization module in `src/i18n` (no extra library): messages in `src/i18n/locales/{en,hr,de}/{common,compare,goals,tracking}.ts`.
- **The whole interface is translated**: navigation, home, Compare (all ten screens), Saved comparisons, Carbon goals (all ten screens), Carbon tracking (all ten screens), Account, sign-in and registration, Settings, buttons, labels, hints, placeholders, validation messages, confirmation dialogs, notifications, loading/empty/error/offline messages, database/sign-in/map errors, and screen-reader-only text.
- Plurals use `Intl.PluralRules`; Croatian has the three forms one/few/other everywhere (for example *1 aktivnost, 3 aktivnosti, 5 aktivnosti*; *1 spremljena usporedba, 3 spremljene usporedbe, 5 spremljenih usporedbi*).
- Numbers, kg CO₂e, percentages, euro amounts, dates, months and durations use `Intl` in the current language (*€3.20* / *3,20 €*; *46%* / *46 %*).
- Language selector in the sidebar, the mobile menu and Settings; each language is shown in its own language.
- The choice is saved in `localStorage` (`carbon-choices.locale`) and used after reloads and in later sessions. Without a saved choice the browser language is used, otherwise English.
- `<html lang>` and the page title follow the language; switching updates the page immediately, without a reload and without losing typed input. Errors and validation messages are stored as codes/keys, so they switch language too.
- Missing translations are caught three times: TypeScript (each language file must have exactly the English keys, so `npm run build` fails), unit tests (keys, placeholders, plural forms), and component tests that render the screens in Croatian and German and fail on any missing key.
- Backend error classes from PR #7 are unchanged; their codes (`DataError`, `AuthError`, `RouteError`) are translated with `dataErrorText()`, `authErrorText()` and `routeErrorMessage()`.

### F6 — Loading, empty, error and offline states

- **App-wide offline notice** (`OfflineBanner`): says when the browser is offline and announces when it is back online.
- **Saving while offline is not attempted**: Tracking add/edit/delete, Compare save and delete, sign-in/registration, the browser-data import and the map lookup stop with a clear translated message and keep the user's input. No success is shown before the database confirms.
- **Goals autosave** waits while offline ("changes are kept on this page and will be saved when you are back online"), retries automatically when the connection returns, and has a "Try saving again" button. A failed plan load also retries when back online.
- **Errors** show translated text for the PR #7 error codes, with a "Try again" action where it makes sense (Tracking list, Saved comparisons, Goals plan load and save, Goals progress, map lookup). Failed saves keep everything the user typed.
- **Loading**: existing indicators are translated and announced with `role="status"`; save buttons are disabled while saving and repeated clicks are ignored.
- **Empty states**: Tracking (no activities, with "Add your first activity"), Saved comparisons (with "Compare a journey"), Goals (no adjustments; sample month with "Record an activity" when nothing is tracked).

### F7 — Accessibility (target WCAG 2.2 AA)

- Language: `<html lang>` follows the selection; options in the language selector have their own `lang`.
- Forms: required fields marked in the label and with `required`; errors linked with `aria-describedby` and `aria-invalid`, announced with `role="alert"`, focus moved to the first invalid field (sign-in form improved; Tracking, Goals and Compare forms checked).
- Dialogs: native `<dialog>` with focus on Cancel and <kbd>Esc</kbd> to cancel; **fixed duplicate ids** (each dialog and the Compare mode picker now get unique ids).
- Icon-only buttons have translated accessible names (menu button, priority up/down buttons).
- External links (map credits) announce that they open in a new tab.
- Status messages, loading and connection changes use live regions.
- Existing strengths kept: skip link, landmarks, visible 2 px focus outline, 44 × 44 px targets, `prefers-reduced-motion`, information never by colour alone.
- Bug fixed during testing: the Tracking loading message had lost its default text.

## Files changed

126 files in total: 124 on the branch (relative to `main`) plus this handover document and `README.md`. **Created**:

- `src/i18n/` — `index.ts`, `translate.ts`, `localeStore.ts`, `format.ts`, `types.ts`, `RichText.tsx`, `locales/index.ts`, `locales/en.ts`, and `locales/{en,hr,de}/{index,common,compare,goals,tracking}.ts`
- `src/components/LanguageSelect.tsx/.css`, `src/components/OfflineBanner.tsx/.css`, `src/hooks/useOnlineStatus.ts`, `src/features/tracking/labels.ts`
- Tests: `src/i18n/i18n.test.ts`, `src/i18n/localeStore.test.ts`, `src/test/accessibility.test.tsx`, `src/test/uiStates.test.tsx`, `src/test/dom.ts`, `src/styles/styles.test.ts`
- `docs/localization-accessibility-summary.md` (this file)

**Modified**:

- Shell and pages: `App.tsx`, `layouts/AppLayout.tsx`, `components/{ConfirmDialog,Footer,Logo,MobileHeader,NavList,Sidebar}.tsx` (+ `MobileHeader.css`, `Sidebar.css`), `data/{homeContent,navigation}.ts`, `types/navigation.ts`, `pages/{Account,Compare,Goals,Home,NotFound,Placeholder,Saved,Settings,Tracking}Page.tsx`, `pages/PlaceholderPage.css`
- Shared services (text only, no behaviour change): `lib/errorMessages.ts`, `features/auth/{AuthForm,RequireAuth}.tsx`, `features/auth/{authMessages.ts,auth.css}`, `features/account/LocalImportPanel.tsx`, `features/routing/{RouteDistanceLookup.tsx,routeMessages.ts}`
- Tracking (Lazar): all 11 components, `format.ts`, `stats.ts` (adds a `source` id for translated names), `useActivities.ts` (error code instead of English text), `validation.ts` (message keys instead of text)
- Goals (Martin): all 13 components, `format.ts`, `goalPlanSync.ts` (offline handling, error codes), `goals.css`, `sampleData.ts`, `stages.ts`, `trackedEmissions.ts`
- Compare (Faraj): all 13 components, `calculate.ts` (translation keys added next to the English error messages), `criteria.ts`, `format.ts`, `transportOptions.ts` (texts only), `types.ts`, `useSavedComparisons.ts`, `validation.ts`, `compare.css`
- Config and docs: `package.json`, `package-lock.json` (dev dependencies jsdom, @testing-library/react, @testing-library/dom, axe-core), `vitest.config.ts` (also runs `.tsx` tests), `README.md`

**Not changed**: Firebase Authentication and Firestore setup (`lib/firebase.ts`), all repositories, the Firestore data structure, `firestore.rules`, the emission factors and all calculations (`emissionFactors.ts`, the numbers in `transportOptions.ts`, `calculate.ts` logic, Goals `budget.ts`), the OpenStreetMap integration (`routeService.ts`), emulator and live tests. `.env.local` is not committed.

## Tests executed and actual results

Run on this branch on 2026-11-12:

| Command | Result |
|---|---|
| `npm test` | **Passed — 10 test files, 162 tests.** The 17 tests that existed before still pass; 145 are new: 21 localization, 90 accessibility/component (27 axe scans, 54 missing-translation checks in hr and de, 9 keyboard/dialog/language tests), 15 UI-state, 19 CSS/contrast |
| `npm run build` | **Passed** (`tsc -b` and `vite build`) |
| `npm run lint` | **Passed** (no errors, no warnings) |
| `npm run test:emulator` | **Not run — failed to start**: `firebase-tools no longer supports Java version before 21`. This computer only has Java 1.8. Needs a JDK 21+ installed, then run again. This branch does not change the repositories, rules or emulator tests. |
| `npm run test:live` | Not run (needs `.env.local` with the real Firebase project; not part of this task) |

Manual checks in the browser (dev server, without Firebase configuration):

- Language switching from the sidebar and the mobile menu; `<html lang>`, page title and navigation changed immediately; the language was kept after a real page reload; no console errors.
- 320 px wide: every page and the whole Compare flow (start → transport → journey → priorities → all result tabs) in English, Croatian and German — no horizontal scrolling.
- 640 px wide (equivalent to a 1280 px window at 200% zoom), main pages in German — no horizontal scrolling or clipped text.
- Tracking, Goals and Saved comparisons need Firebase; without `.env.local` they show the translated "Database not configured" message. Their screens were tested with the component tests instead of live data.

## Remaining limitations

- `npm run test:emulator` must be re-run on a machine with Java 21+.
- No screen reader walkthrough yet; the course's ten-minute accessibility check (brief Section 7.3) is not done yet.
- Contrast was computed for the design tokens and status colours, not measured on every rendered element; 200% zoom was simulated with a narrow window.
- jsdom does not do layout, so axe colour contrast is checked separately, and the browser's own `<dialog>` focus trap was not tested there.
- Croatian and German were translated for the project and should be read once by a native speaker.
- The language choice is stored per browser, not in the Firebase account.
- This is not a full WCAG 2.2 AA audit, so the app does not claim full conformance.

## Evidence to capture for the final report

1. **Language switching**: screenshots of the home page in English, Croatian and German (desktop), and the mobile menu with the language selector open.
2. **Persistence**: choose Croatian, reload the page, screenshot showing it is still Croatian; DevTools → Application → Local Storage showing `carbon-choices.locale = hr`; Elements panel showing `<html lang="hr">`.
3. **Croatian plurals**: Tracking history with 1, 3 and 5 activities (*1 aktivnost / 3 aktivnosti / 5 aktivnosti*), or Goals "Vrijeme do cilja" with *3 mjeseca / 6 mjeseci*.
4. **Locale formatting**: a Compare result in English and German showing *€3.20* vs *3,20 €* and the date format on Saved comparisons.
5. **Offline**: DevTools → Network → Offline: the offline banner, a Tracking save that is blocked with the message and the input kept, and the Goals bar "changes will be saved when you are back online"; then Online and the "back online" notice.
6. **Error with retry**: e.g. Saved comparisons or Goals with the network offline during load, showing the translated error and "Try again".
7. **Empty states**: Tracking with no activities; Saved comparisons with none.
8. **Accessibility**: keyboard-only run through one flow (visible focus ring, skip link, menu with <kbd>Esc</kbd>, a delete dialog with <kbd>Esc</kbd>); a Lighthouse or axe DevTools report of one page per feature; ideally a short NVDA or VoiceOver check of a form error and the language change announcement.
9. **Mobile**: 320 px screenshots of a long German screen (e.g. Compare results) without horizontal scrolling.
10. **Test output**: terminal screenshot of `npm test` (162 passed), `npm run build` and `npm run lint`; and, after installing Java 21+, `npm run test:emulator`.
