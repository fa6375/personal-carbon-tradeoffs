# Deliverable 2 — Requirements audit

| | |
|---|---|
| **Audited against** | *UX Deliverable 2 Implementation Template.docx* (Part A brief and Part B template, sections 1–13) |
| **Repository** | <https://github.com/fa6375/personal-carbon-tradeoffs> |
| **Code audited** | `main` at `1d052bda0a469ea0d09e4bba5ca3df3d8f762bdd` (merge of PR #8), pulled on 2026-11-12 at about 23:00 CET |
| **Deadline** | 2026-11-14 at 23:59 |
| **Method** | Read the code, configuration, tests and documentation; ran every test suite; used the running app in a browser against the real Firebase project (English, Croatian, German; 320 px, 640 px and desktop widths); ran axe-core in the real browser; queried GitHub for PRs, reviews, rulesets, issues, tags and collaborators. Everything below was observed in this audit unless it is marked **NOT VERIFIED**. |

This report changes no application code, Firebase settings or rules.

> **Status update, 2026-11-13.** The audit below describes `main` at `1d052bd`. Later commits on this branch (PR #9) fixed or documented the following. Everything marked done was checked in this session; the build, lint and test logs are in `docs/evidence/19a`–`19f`.
>
> | Audit item | Status now |
> |---|---|
> | Goals contrast 4.34:1 | **Fixed** (18d3363): hint uses `--color-text-muted`, measured 6.06:1; axe-core: 0 violations on every page and all 5 Goals steps |
> | German tab overflow at 320 px | **Fixed** (18d3363): no horizontal overflow at 320, 375 and 640 px in en, hr and de |
> | Croatian month case | **Fixed** (5cffb49): genitive month names (`formatMonthGenitive`) and rewritten hr strings |
> | `Intl.Collator` for sorting | **Done** (5cffb49): Breakdown table ties sorted with the locale's collation |
> | Per-user locale preference | **Done** (f04557a): `users/{uid}.locale` (en/hr/de), validated in `firestore.rules`, rules deployed to `personal-carbon-tradeoff` (rules only) |
> | Non-Latin script test | **Done** (1d9b96b): Croatian, Cyrillic and Arabic text stored and read back in the emulator tests |
> | Seed / demo data | **Done** (7e47321): `npm run demo` seeds a fictional account into the **emulator only**; it refuses to run against a real project. Nothing was written to the real project |
> | ERD and architecture diagram | **Done**: `docs/diagrams/` (Python source, SVG and PNG) |
> | README corrections | **Done**: team roles, Java 21+, testing libraries, demo section, attribution section, corrected accessibility claims |
> | Custom i18n module (brief §2.1) | **Not migrated.** A library migration of 903 keys × 3 locales two days before the deadline was judged too risky. Documented as a deviation in the README and Part B §6.2; issue #14 |
> | Ten-minute accessibility check | **Items 1–8 and 10 done** in the real browser. **Item 9 (screen reader) is PENDING**: issue #10 |
> | 200% browser zoom, reduced motion | Approximated with a 640 px viewport; real browser zoom and OS reduced-motion checks are **PENDING**: issues #11, #12 |
> | Native-speaker review (hr, de) | **PENDING**: issue #13 |
> | GitHub Issues | **Done**: #10–#17 |
> | Part B report | **Drafted**: `docs/Team02_UX_Deliverable2.docx` and `.pdf`. Fields that need a team member's own confirmation (team and topic number, weekly log W1–W3, §11 statements, AI declarations of Martin and Lazar, signatures, screen-reader result) are marked **PENDING** |
> | Release tag `v1.0-deliverable2` | **PENDING** until PR #9 is approved and merged: issue #17 |
> | Bundle size, password reset | Open: issues #15, #16 |
> | Weekly history W1–W3, empty review comments | **Cannot be fixed.** Explained honestly in Part B §8.5 and §9; no history was rewritten |

---

## A. Executive summary

**The application itself is in good shape.** All three Deliverable 1 feature areas (30 screens) run in one app. Data is stored per user in Cloud Firestore, protected by deployed Security Rules. The OpenStreetMap distance lookup works and handles its failure modes. The whole interface switches between English, Croatian and German. The automated test suites pass: build, lint, 162 unit/component tests, 17 emulator tests and 7 live tests.

**The grade risk is in the process and the evidence, not the code:**

1. **Weekly commit history (20 points: "Git history and teamwork").** The repository was created on **2026-11-09**. Every commit is dated between 9 and 12 November, but the development period started on **19.10.2026**. Weeks 1–3 have no commits from anyone. The brief says such a repository "will be graded as such". This cannot be fixed honestly; it can only be **explained honestly** in Part B §8.5 and §9. Backdating commits is academic dishonesty, so we must not do it.
2. **Pull request reviews.** All 8 PRs were approved with an **empty review body** and merged 1–6 minutes after being opened, some of them 4,000–14,000-line changes. The brief says this "counts as no review at all". The two PRs still open can get real reviews before the deadline.
3. **No GitHub Issues, no project board, no release tag.** All three are named in the brief. The tag (`v1.0-deliverable2`) is required for submission.
4. **The ten-minute accessibility check (F7) has not been done or documented.** There has also been no screen-reader walkthrough. In this audit, axe found **1 real contrast failure** in the real browser, and German text overflows at 320 px on one Tracking screen.
5. **Database evidence the brief requires is missing:** an ERD, seed/demo data a reviewer can load, a test with a non-Latin script, and a stored per-user locale preference.
6. **Part B (the PDF) has not been started.** It needs screenshots, diagrams, the screen map, a weekly log, individual statements and an AI declaration.
7. **i18n "do not write your own translation layer".** The project uses a small custom typed module (`src/i18n`) instead of a library. It is well tested and works, but it contradicts §2.1 of the brief, so the report must justify it.

**Overall:** the application is **close to ready**. The **submission is not ready**. With two days left, the realistic priorities are: the accessibility check and its report, the evidence screenshots and diagrams, the release tag, honest Part B text for the history gaps, and two small UI fixes.

---

## B. Requirements matrix

Status: **PASS** = verified in the implementation · **PARTIAL** = implemented but incomplete · **FAIL** = missing or not working · **NOT VERIFIED** = not enough evidence to confirm.

### Functional requirements (brief §2.2)

| Requirement | Status | Evidence | Missing work |
|---|---|---|---|
| **F1** Core journey end to end, no dead ends | **PASS** | Compare: start → transport → journey → priorities → results → breakdown → recommendation → what-if → save, completed in Croatian in the browser. Tracking: add/view/edit/delete. Goals: all 5 steps reached with real data. Saved comparisons reopen into Compare. | Visual fidelity to the Deliverable 1 wireframes is **NOT VERIFIED**: the wireframes are not in the repository (see §C). |
| **F2** Persistent data in own database | **PASS** | Cloud Firestore project `personal-carbon-tradeoff`, `(default)` database. Data survives a reload (checked in the browser) and is visible from a second client (`tests/emulator/repositories.test.ts`, `tests/live/real-firebase.test.ts`). | Persistence screenshots for Part B §4.4. |
| **F3** CRUD on the main entity, with confirmation | **PASS** | Activities: create (`ActivityEntry`), read (`ActivityHistory`, `ActivityDetails`), update (`EditActivity`), delete with a native `<dialog>` confirmation. Saved comparisons: create/list/open/delete with confirmation. Goal plan: autosave, plus "Delete saved plan" with confirmation. | None. |
| **F4** External REST API, real data used | **PASS** | Nominatim and OSRM give real distances (Zagreb → Samobor 25.6 km by car), which the user can put into the Compare and Tracking calculations. | Working and failure screenshots (Part B §5.5). The text sent to Nominatim (typed place names) must be declared (brief §5.1). |
| **F5** Three locales; dates, numbers, plurals | **PARTIAL** | `en`/`hr`/`de` (`src/i18n/locales`). Compare, Tracking, Goals, Account and Settings are fully translated in the browser. `<html lang>` changes; the choice persists after a reload. Croatian plurals (*3 aktivnosti*, *2 porcije*), `25,6 km`, `3,05 €`, `70 %`. Keys must match in all locales (TypeScript and tests). | (1) Custom translation layer instead of a library (brief §2.1). (2) Croatian month names in the wrong case in Goals (*"u razdoblju travanj 2027."*, *"od studeni 2026. do travanj 2027."*). (3) German overflow at 320 px on Tracking. (4) No locale-aware collation (`Intl.Collator` is not used anywhere). (5) Locale stored only in `localStorage`, not per user (brief §4). (6) No native-speaker check recorded for `de`/`hr`. |
| **F6** Loading, empty, error, offline states | **PASS** | Tracking: loading, then "database cannot be reached" with **Try again** after a 15 s timeout (seen in the browser in an earlier session). Empty states on Tracking and Saved. Offline banner and blocked saves (`src/test/uiStates.test.tsx`, 16 tests). Map lookup: every failure code (`routeService.test.ts`). Goals: load error and retry, save error and retry. | Screenshots of the offline and error states for Part B. |
| **F7** Accessibility baseline + ten-minute check | **FAIL** | Strong baseline: skip link, landmarks, labels, `aria-describedby` errors, a 2 px `:focus-visible` outline, `prefers-reduced-motion`, 44 px targets. axe on 27 screens in jsdom. In the **real browser this audit found 1 axe violation**: `color-contrast` on `.goals-stat--highlight .goals-stat__hint`, **4.33:1** (`#66726a` on `#e6f1ea`, 12 px). | The **ten-minute check is not done and not documented** (README says so). No screen reader task. No contrast measurement on real pages. Real 200% zoom not tested. Remaining issues not logged as GitHub issues. |

### Definition of done (brief §2.3)

| Requirement | Status | Evidence | Missing work |
|---|---|---|---|
| No hardcoded user-visible strings | **PASS** (sampled) | Full Compare, Tracking and Goals flows in Croatian showed no English text. A static search of `.tsx` files found no literal JSX text. English labels remain in `tracking/emissionFactors.ts`, but the UI uses `tracking/labels.ts` instead. Brand name "Carbon Choices" and course name stay untranslated on purpose. | Footer course title "ISTE.260 Designing the User Experience" is untranslated (acceptable as a proper name; state it). |
| Formatting through Intl, not concatenation | **PASS** | `src/i18n/format.ts` (`Intl.NumberFormat`, `DateTimeFormat`, `PluralRules`, units). | `Intl.RelativeTimeFormat` and `ListFormat` are not used. That's fine, but Part B §6.4 asks for relative time and a list of three items: write "not used in the product". |
| Merged through a PR reviewed by someone else | **PARTIAL** | Every PR has an approval from a different member, and the ruleset requires 1 approval. | Every review is an empty-bodied approval within minutes (see §E). |
| Keyboard operable, focus visible | **PARTIAL** | Spot check in the browser: Tab reaches links and buttons, the outline is `2px solid`, Enter activates; component tests cover the menu, dialogs and the skip link. | A full keyboard-only run of every feature has not been documented. |

### Database (brief §4)

| Requirement | Status | Evidence | Missing work |
|---|---|---|---|
| App owns its data (not browser storage) | **PASS** | Firestore; localStorage is only read for the one-time import. | — |
| Engine justified in one sentence | **PARTIAL** | README "Architecture" / "Database" explain it. | Write the one sentence in Part B §4.1. |
| Schema in the repository | **PARTIAL** | Firestore is schemaless. The schema is expressed in `firestore.rules` (field validation), the TypeScript types (`src/features/*/types.ts`) and the README "Database" table. | No migrations exist (none are needed for Firestore). Say so explicitly in §4.1 ("schema = rules + types; no migration tool"). |
| Seed / demo data a reviewer can load within minutes | **FAIL** | README: "there is no shared seed script". The real project has **0 user accounts** (checked with `firebase auth:export`), so a reviewer sees an empty app. | Add a seed path: a documented demo account with realistic activities, a saved comparison and a plan, or a seed script for the emulator. |
| ERD matching the code | **FAIL** | Not in the repository or the docs. | Draw it: `User 1—* Activity`, `User 1—* SavedComparison`, `User 1—0..1 GoalPlan` (embedded adjustments), with fields from the README table. |
| At least one relationship | **PASS** | Ownership by path: `users/{uid}/activities`, `/comparisons`, `/goalPlans/current`. | Show it in the ERD. |
| UTF-8; Croatian diacritics; one non-Latin script tested | **PARTIAL** | Croatian diacritics stored and read back (emulator and live tests: *"Trg bana Jelačića"*, *"Tramvaj do Trga bana Jelačića"*). | **No non-Latin script test** anywhere in `src/` or `tests/`; the brief requires one (e.g. Cyrillic or Arabic in a note). |
| Timestamps in UTC, converted for display | **PASS** | Firestore server timestamps, ISO strings in UTC, shown with `Intl.DateTimeFormat` in the user's locale. | — |
| Locale preference stored per user | **FAIL** | `carbon-choices.locale` in `localStorage` only (README states it). | Store `locale` on `users/{uid}`, or justify not doing so in Part B. |
| No credentials in the repository | **PASS** | `git log -p --all` has no API keys or private keys. `.env.local` is ignored and was never committed. `.env.example` is present. | — |

### External REST API (brief §5)

| Requirement | Status | Evidence | Missing work |
|---|---|---|---|
| Related to the topic, does work in the product | **PASS** | Distances feed the CO₂/cost/time calculations. | — |
| Key kept on a backend | **PASS (n/a)** | Nominatim and OSRM need no key. | Say "no key" in Part B §5.1. |
| Failure modes: network, timeout, 429, empty, malformed, 5xx, invalid key | **PASS** | `RouteError` codes `network`, `timeout`, `rate-limited`, `not-found`, `malformed`, `server-error`, `unauthorized` (401/403) — 10 unit tests in `routeService.test.ts`, all passing. Messages translated (`routing.errors.*`). | Screenshots of at least one failure state. |
| Caching and rate limits | **PASS** | 7-day cache (memory + `localStorage`), 1.1 s minimum gap per host, lookup only on button press (no autocomplete). | — |
| Attribution | **PASS** | "© OpenStreetMap contributors" with links in every lookup, translated. | — |
| Personal data sent, and why | **PARTIAL** | The typed start/destination text goes to Nominatim; coordinates go to OSRM. No account data is sent. | State this in Part B §5. |
| Works in every locale | **PARTIAL** | Place names come back in OSM's default/local language (no `accept-language` parameter is sent). | Document it as a known limitation, or pass the UI locale. |

### Internationalisation (brief §6)

| Requirement | Status | Evidence | Missing work |
|---|---|---|---|
| en + hr + a third locale | **PASS** | `de` (text expansion). | — |
| Mature i18n library (brief §2.1) | **FAIL** (as worded) | A custom typed module in `src/i18n`. | Justify in Part B §6.2, or accept the risk. |
| Resource files per locale, semantic keys | **PASS** | `locales/{en,hr,de}/{common,compare,goals,tracking}.ts`; keys like `tracking.activityCount`. Per-area files rather than one file per locale. | — |
| No sentence concatenation | **PASS** (sampled) | `RichText.tsx` and parameterised messages. | — |
| Missing key fallback (hr → en), visible in development | **PASS** | `translate.ts`: falls back to `en`, then to the key; `console.warn` in development; tests fail on a missing key. | — |
| `lang` changes; `dir` | **PASS / n/a** | `lang` verified. `dir` is not set, which is fine for LTR-only locales. | State "no RTL locale" in §6.7, and name the challenge handled instead (German text expansion). |
| Persisted locale, not from IP | **PASS** | localStorage, then browser language, then English. | — |
| Real plural rules | **PASS** | `Intl.PluralRules`; Croatian one/few/other verified in the UI. | §6.3 screenshot for 1, 2 and 5. |
| Locale-aware sorting | **FAIL** | No `Intl.Collator`/`localeCompare`. The app has few sorted name lists (saved comparisons sort by date). | Use `Intl.Collator` where text lists are sorted (e.g. the breakdown source table), or state that no list is sorted by name. |
| Text expansion | **PARTIAL** | German at 640 px: no overflow. **At 320 px Tracking's tab "Aufschlüsselung" overflows by about 7–28 px** (horizontal scroll). | Let `.tracking-tabs__button` wrap or shrink (the same fix already exists for Compare's tabs). |
| Fonts contain diacritics | **PASS** | System font stack; č ć đ š ž render. | — |
| Native-speaker check | **NOT VERIFIED** | Not documented. The Croatian month-case errors above show that a review is needed. | A Croatian speaker reads 10 screens; a German speaker (or a documented machine-check) for `de`. |

### Accessibility (brief §7)

| Requirement | Status | Evidence | Missing work |
|---|---|---|---|
| Semantic HTML, headings, lists, labels | **PASS** | Landmarks, real `<button>`/`<a>`, `<label for>`, `fieldset`/`legend`; axe found 0 violations on 6 of 7 pages in the real browser. | — |
| Image alt | **PASS** | 0 `<img>` elements; every `<svg>` icon is `aria-hidden`. | — |
| Errors linked to fields | **PASS** | `aria-invalid`, `aria-describedby`, `role="alert"` summaries, focus moves to the first invalid field. | — |
| Contrast ≥ 4.5:1 | **PARTIAL** | Token pairs pass (`styles.test.ts`). The real browser found **4.33:1** on Goals. | Fix that colour, then measure the main pages with a browser tool. The README claim "all text pairs ≥ 4.5:1" is not true on rendered pages. |
| Keyboard, focus, no traps | **PARTIAL** | Spot-checked and covered by tests. | Full keyboard-only pass, documented in §7.1. |
| Targets ≥ 24 px (44 px) | **PASS** (manual CSS review) | 44 px minimum heights throughout. | — |
| 200% zoom / 320 px | **PARTIAL** | 640 px (simulated 200%) passes in German; 320 px fails on Tracking in German (see above). | Fix it; test real browser zoom. |
| Reduced motion | **PASS** | 3 `prefers-reduced-motion` rule blocks. | — |
| Icon-only buttons named, live regions | **PASS** | Menu and priority buttons are named; `role="status"` regions. | — |
| **Ten-minute check performed and reported** | **FAIL** | Not performed (README "Known accessibility limitations"). | Run all 10 checks; record the results in Part B §7.1; log the open issues as GitHub issues. |
| Screen reader task | **FAIL** | None recorded. | One full task with VoiceOver (macOS) or NVDA. |

### Repository and teamwork (brief §3)

| Requirement | Status | Evidence | Missing work |
|---|---|---|---|
| Own accounts, real names | **PASS** | Faraj (fa6375), Martin (martinmudrinic), Lazar (lj7829). One of Lazar's commits uses a local email (`lumix@Lazars-MacBook-Pro.local`), and one merge commit shows the name `mm2945-rgb`. | Mention it in §8.5 if asked; it is still attributable. |
| Instructor `ar-rit` added | **PARTIAL** | Invitation is **pending**, not accepted. | Ask the instructor to accept, or confirm the repository is public (it is public). |
| README, `.gitignore`, `.env.example` | **PASS** | All present. | No license file (optional). |
| Protected `main` (PR + 1 approval) | **PASS** | Active ruleset "Protect main": `pull_request` (1 approval, stale reviews dismissed, last-push approval), `non_fast_forward`, `deletion`. | Screenshot of the ruleset. |
| Feature branches, short-lived | **PASS** | 8 feature branches, each merged within hours to days. | Delete the merged branches (optional tidiness). |
| Weekly commits from every member | **FAIL** | Repository created on 2026-11-09. All 15 non-merge commits are dated 2026-11-09 to 11-12; W1–W3 (19.10–08.11) have **0 commits** from anyone. | Cannot be fixed. Explain it honestly in §8.5 and §9; never backdate. Keep committing in W4 from all three members. |
| Real review conversation | **FAIL** | 8/8 reviews are approvals with an empty body; merged 1–6 minutes after opening. | Real review comments on any remaining PRs (including this one); describe the review practice honestly. |
| Issues, assignees, project board | **FAIL** | 0 issues, no board or milestones. | At minimum: log the accessibility issues and known bugs as issues and link them in Part B (§7.5, §10.2). |
| Release tag | **FAIL** | No tags. | Tag the submitted commit `v1.0-deliverable2`. |
| Readable commit messages | **PASS** | Conventional prefixes and imperative mood throughout. | — |

### README (brief §9.2)

| Requirement | Status | Evidence | Missing work |
|---|---|---|---|
| Three-sentence description + topic | **PASS** | README opening paragraph. | — |
| Team, GitHub usernames, feature areas | **PASS** | "Team Members" table. | Add each member's build responsibility (backend, i18n/a11y, documentation). |
| Stack and prerequisites with versions | **PASS** | "Technology Stack", "Prerequisites". | Add jsdom, Testing Library and axe-core (added in PR #8), and Java 21+ for the emulators. |
| Install, env vars, `.env.example` | **PASS** | "Getting Started", "Environment Variables". | — |
| Database creation, migrations, seed, start | **PARTIAL** | Firebase setup and rules deploy are documented; start command present. | **Seed data** is missing. |
| External API and key | **PASS** | "External API". | — |
| Locales and how to add one | **PASS** | "Internationalization" → "Adding a new language". | — |
| Known limitations incl. accessibility | **PASS** | "Known Limitations", "Known accessibility limitations". | Correct the contrast claim; add the findings of this audit. |
| Third-party attribution | **PARTIAL** | The stack table lists the libraries; OSM credit in the UI. | One explicit "Third-party code and libraries" line (brief §9.4). |

---

## C. Feature and wireframe comparison

The Deliverable 1 wireframes are **not in the repository** (no image, PDF or Figma files were found), so the visual comparison **cannot be verified** here. Every team member should compare their screens with their own wireframes and complete Part B §3.1 and §3.2. The table below is based on the code and the running app.

### Faraj Aliyev — Compare Everyday Choices (`#/compare`, `#/saved`)

| # | Wireframe screen | In the app | Status |
|---|---|---|---|
| 1 | Start | `CompareStart.tsx` | Implemented |
| 2 | Choose transport | `ChooseTransport.tsx` + `ModePicker.tsx` (6 modes, at least 2 required) | Implemented |
| 3 | Enter journey | `JourneyDetails.tsx` + optional OSM distance lookup | Implemented; **changed**: added map lookup |
| 4 | Set priorities | `SetPriorities.tsx` (0–3 per criterion) | Implemented |
| 5 | Comparison results | `ComparisonResults.tsx` (cards, bars, difference table) | Implemented |
| 6 | Detailed breakdown | `CalculationBreakdown.tsx` | Implemented |
| 7 | Recommended option | `RecommendedOption.tsx` | Implemented |
| 8 | Alternative scenario | `AlternativeScenario.tsx` ("What if" tab) | Implemented |
| 9 | Save comparison | `SaveComparison.tsx`; list on the separate **Saved comparisons** page | Implemented; **changed**: sign-in required to save; list split into its own page |
| 10 | Error screen | `CompareError.tsx` (missing/invalid input, failed calculation, not found, storage) | Implemented |

### Martin Mudrinić — Carbon Reduction Goals (`#/goals`)

The ten screens are **combined into five steps** (two screens per step page, except Summary).

| # | Wireframe screen | In the app | Status |
|---|---|---|---|
| 1 | Carbon budget setup | Step 1 — `BudgetSetup.tsx` | Implemented, **combined** with 2 |
| 2 | Personal carbon budget | Step 1 — `PersonalBudget.tsx` | Implemented, **combined** |
| 3 | Budget allocation by category | Step 2 — `BudgetAllocation.tsx` | Implemented, **combined** with 4; **changed**: 3 categories (goods & shopping dropped, to match Tracking) |
| 4 | Trade-off priorities | Step 2 — `TradeoffPriorities.tsx` | Implemented, **combined** |
| 5 | Monthly carbon plan | Step 3 — `MonthlyPlan.tsx` | Implemented, **combined** with 7 |
| 6 | Budget adjustment | Step 4 — `BudgetAdjustmentForm.tsx` | Implemented, **combined** with 8 and 9 |
| 7 | Reduction opportunities | Step 3 — `ReductionOpportunities.tsx` | Implemented (example ideas) |
| 8 | Goal progress | Step 4 — `GoalProgress.tsx` (uses Tracking data) | Implemented |
| 9 | Budget adjustment details | Step 4 — `AdjustmentDetails.tsx` | Implemented |
| 10 | Carbon budget summary | Step 5 — `BudgetSummary.tsx` | Implemented |

### Lazar Jovović — Personal Carbon Tracking (`#/tracking`)

| # | Wireframe screen | In the app | Status |
|---|---|---|---|
| 1 | Carbon Tracking Dashboard | "Dashboard" tab — `TrackingDashboard.tsx` | Implemented |
| 2 | Add Activity | `AddActivity.tsx` | Implemented |
| 3 | Transport Activity Entry | `ActivityEntry.tsx` + shared `ActivityForm.tsx` | Implemented; **changed**: optional map lookup |
| 4 | Food Activity Entry | same shared form | Implemented, **shares one form component** with 3 and 5 |
| 5 | Home Energy Entry | same shared form | Implemented, shares the form |
| 6 | Activity History | "History" tab — `ActivityHistory.tsx` (search, filters) | Implemented |
| 7 | Activity Details | `ActivityDetails.tsx` | Implemented |
| 8 | Edit Activity | `EditActivity.tsx` | Implemented |
| 9 | Carbon Emissions Breakdown | "Breakdown" tab — `EmissionsBreakdown.tsx` | Implemented |
| 10 | No Activities Recorded | `NoActivities.tsx` (empty state on three tabs) | Implemented |

**Missing screens:** none. All 30 are reachable in the UI.
**Screens added beyond the wireframes:** Home, Account (sign in, register, sign out, browser-data import), Saved comparisons list, Settings (language only), Not found, the sign-in gate on protected pages, and the offline banner. These must appear in the merged screen map (§3.1) as "new".
**Functionality without a UI:** deleting a user account (not offered, and not required); editing a saved comparison (deliberately not allowed). Nothing that the wireframes needed is UI-less.

---

## D. Technical audit

### Database (Firebase)

- **Auth:** email/password (`src/features/auth/authService.ts`). The session persists across reloads (Firebase IndexedDB persistence). Errors map to translated codes. There is no email verification, password reset or account deletion.
- **Collections (verified in code, rules and live tests):** `users/{uid}` (email, createdAt, updatedAt); `users/{uid}/activities/{id}`; `users/{uid}/comparisons/{id}`; `users/{uid}/goalPlans/current`. The README's field table matches the code.
- **Rules:** `firestore.rules` is deployed (live test: a second user is denied read, list and delete; a signed-out visitor is denied; invalid data and unknown collections are rejected). Every `allow` requires `request.auth.uid == uid`.
- **Reliability:** reads use `getDocFromServer` and `getDocsFromServer`, there is a 15 s timeout, the cache is never shown as an empty list, and Goals shows an error instead of a default plan if loading fails.
- **Gaps:** no ERD, no seed data, no per-user locale, no non-Latin test. The real project has 0 accounts, so a reviewer starting fresh sees empty screens.

### External API

| Endpoint | Sent | Used | UI |
|---|---|---|---|
| `GET https://nominatim.openstreetmap.org/search?q=…&format=jsonv2&limit=1` | Typed place text (≤ 200 characters), optional contact email | `lat`, `lon`, `display_name` | Compare "Enter journey"; Tracking transport form |
| `GET https://routing.openstreetmap.de/routed-{car,bike,foot}/route/v1/driving/{lon},{lat};{lon},{lat}?overview=false` | Coordinates only | `routes[0].distance`, `duration` | Same places; the distance fills the form when the user picks it |

The integration is in `src/features/routing/routeService.ts`, with a 10 s abort timeout, a per-host throttle (1.1 s), a 7-day cache, codes for every failure, and attribution. It is documented accurately in the README "External API" section. Limitations: public servers with no uptime guarantee; the place-name language is not localised; the first match only.

### Localisation

Described in §B. The implementation is solid: typed keys, three complete locales, plurals, Intl formatting, fallback, persistence and tests (21 i18n tests and 54 missing-key checks). Open points: library justification, Croatian month grammar, the German overflow at 320 px, no collator, no per-user locale, no native-speaker review.

### Accessibility

Good engineering baseline with automated coverage (axe in jsdom on 27 screens, keyboard tests, token contrast tests). Open points: the 10-minute check, the screen reader task, 1 contrast failure found in the real browser, the 320 px German overflow, real 200% zoom, and GitHub issues for what remains.

### Reliability and tests (run in this audit on `1d052bd`)

| Command | Result |
|---|---|
| `npm run build` | **Pass** (bundle 1,102 kB / 326 kB gzipped — size warning only) |
| `npm run lint` | **Pass**, no warnings |
| `npm test` | **Pass — 10 files, 162 tests** |
| `npm run test:emulator` | **Pass — 2 files, 17 tests** (Java 25 on this machine; firebase-tools needs Java 21+, which is why Martin could not run it) |
| `npm run test:live` | **Pass — 7 tests** against the real project. It uses only its own throw-away accounts; the project had 0 accounts before and after the run. |
| Browser (real project) | Compare flow (hr), Tracking create/history/breakdown (hr), Goals 5 steps (hr), save comparison, sign-up; axe on 7 pages; 320 px (de) and 640 px (de) checks; keyboard spot check. The audit's throw-away account and its 4 records were deleted afterwards. |

---

## E. GitHub and teamwork audit

**Pull requests** (all merged into `main`):

| PR | Title | Author | Approved by | Opened → merged | Size | Review comments |
|---|---|---|---|---|---|---|
| #1 | Frontend foundation + README | fa6375 | martinmudrinic | 9 Nov 22:35 → 22:40 | +4,859 | none |
| #2 | Carbon reduction goals | martinmudrinic | fa6375 | 9 Nov 23:05 → 23:06 | +2,938 | none |
| #3 | Personal carbon tracking | lj7829 | martinmudrinic | 9 Nov 23:52 → 23:53 | +3,181 | none |
| #4 | Compare Everyday Choices | fa6375 | martinmudrinic | 10 Nov 22:52 → 22:57 | +4,460 | none |
| #5 | Goals integration polish | martinmudrinic | fa6375 | 10 Nov 23:18 → 23:19 | +1,835 | none |
| #6 | Tracking state + cross-tab sync | lj7829 | fa6375 | 12 Nov 00:42 → 00:44 | +92 | none |
| #7 | Shared Firebase database + API | fa6375 | martinmudrinic | 12 Nov 21:00 → 21:12 | +14,338 | none |
| #8 | Localization + accessibility | martinmudrinic | fa6375 | 12 Nov 22:08 → 22:08 | +7,803 | none |

**Commits per member per week** (non-merge commits on `main`; weeks of the development period 19.10–14.11.2026):

| Week | Dates | Faraj | Martin | Lazar |
|---|---|---|---|---|
| W1 | 19.10–25.10 | 0 | 0 | 0 |
| W2 | 26.10–01.11 | 0 | 0 | 0 |
| W3 | 02.11–08.11 | 0 | 0 | 0 |
| W4 | 09.11–14.11 | 5 | 8 | 2 |
| **Total** | | **5** | **8** | **2** |

- **Repository created:** 2026-11-09T21:38Z. Any earlier work (Deliverable 1, planning) is not in this repository.
- **Branch model:** feature branches, PR into protected `main`, ruleset requiring 1 approval; no `develop` branch.
- **Issues / board / milestones:** none. **Tags:** none. **Instructor:** invitation pending.
- **Lazar's code contribution** in git is 2 commits (PRs #3 and #6). His assigned build role is documentation, which belongs in Part B and must be visible as commits, for example `docs/` files committed under his own account.
- **AI assistance:** the history does not show which code was AI-generated. This is a known fact from development: the Tracking feature in PR #3 was prepared with an AI assistant on Faraj's machine and handed to Lazar, and Faraj's PRs #1, #4 and #7 were also built with an AI assistant (Claude Code). These must be declared accurately in Part B §11 and §12, and every member must be able to explain their code (brief §9.4).

**What to write honestly (§8.5 and §9):** the repository was only set up in the last week, so weeks 1–3 have no repository activity; reviews were fast approvals without comments; workload was uneven (commit counts 5/8/2). Explain what each person did before 9 November (if anything verifiable exists, e.g. Deliverable 1 work, meetings), without inventing it.

---

## F. Documentation audit — Part B, sections 1–13

| § | Section | Evidence already available | Still needs writing | Needs screenshots/diagrams | Needs team verification |
|---|---|---|---|---|---|
| 1 | Team, product, repository | README intro, team table, repo URL | Identification table (team number, topic number, release tag, date); elevator demo path (suggested: Home → Account register → Tracking add activity → History → Compare with map lookup → Save → Saved list → Goals "From Carbon tracking" → language switch to Croatian) | — | Team/topic numbers |
| 2 | Architecture and technology | README "Architecture", "Technology Stack", "Project Structure" | §2.1 stack table with reasons; i18n row must say "custom module" and why | **Architecture diagram** (README ASCII sketch can be redrawn) | — |
| 3 | Wireframes to screens | §C of this report | §3.1 screen map (30 wireframes + new screens), §3.2 merged/changed list (Goals 10→5 steps, 3 categories, shared Tracking form, map lookup, sign-in gate) | **Screenshots** of the finished screens | Each member checks their own screens against their wireframes |
| 4 | Database | README "Database", "Security Rules", rules file, live test | §4.1 table (engine Cloud Firestore, schema = rules + types, no migrations, seed approach, UTF-8); one non-trivial operation (e.g. the import with duplicate skipping, or the goal-plan autosave) | **ERD**; **Firestore console screenshot** + the same data in the UI | Seed data must exist first |
| 5 | External API | README "External API", route service tests | §5.1–5.4 tables (endpoints above; data sent; no key; 1 req/s; 7-day cache; ~5 calls per lookup) | **Working** (distance found) and **failure** (e.g. offline or "place not found") screenshots | — |
| 6 | i18n / L10n | README "Internationalization", Martin's handover | §6.1 completeness and who checked; §6.2 (custom module, key count, fallback); §6.4 formatting table filled **from the running app**; §6.6 longest locale (German); §6.7 "no RTL; text expansion handled"; §6.8 cultural checks | **Plural screenshot** (1/2/5 in hr); **same screen in en/hr/de**; shortest vs longest locale | Native speakers for hr and de |
| 7 | Accessibility | Automated test results (axe, contrast tokens, keyboard tests) | §7.1 the ten-minute table — **only after doing the check**; §7.2 tools; §7.3 screen reader; §7.5 open issues with **issue links**; §7.6 inclusive decisions (e.g. never colour alone, plain-language estimates) | Contrast check result; a before/after of a fix | Whoever runs the check |
| 8 | Git history and teamwork | §E of this report, ruleset | §8.1 model; §8.3 commits table; §8.4 PR table; §8.5 honest account | Network graph; Insights → Contributors; ruleset screenshot | All three agree on §8.5 |
| 9 | Weekly progress log | Git history for W4 only | Log per week per member; W1–W3 honestly marked (no repository work, with the reason) | — | Each member writes their own rows |
| 10 | Testing and known issues | §D test results; README "Testing" and "Known Limitations" | §10.1 table; §10.2 known bugs with issue links; §10.3 next three things | Terminal screenshots of the test runs | — |
| 11 | Individual contributions | PR authorship | One block **written by each member** | — | Each member signs |
| 12 | AI usage declaration | Known use of Claude Code (Faraj; Tracking code handed to Lazar) and any tools Martin and Lazar used | Table: tool, used for, who, how verified | — | Each member declares their own |
| 13 | Submission checklist | — | Tick only what is true; export as `Team00_UX_Deliverable2.pdf` with the real team number | — | Team |

---

## G. Remaining tasks

### CRITICAL — must be done before submission

- [ ] **Tag the release** `v1.0-deliverable2` on the final `main` commit and push the tag. — *Faraj*
- [ ] **Run the ten-minute accessibility check** on the finished app, including **one screen-reader task** (VoiceOver on macOS is enough), and record all 10 rows for §7.1. — *Martin* (owns a11y), with *Lazar* writing it up
- [ ] **Log the open accessibility and known issues as GitHub Issues** (at minimum: Goals contrast 4.33:1, German overflow at 320 px, Croatian month case, no screen reader test if it is still open) and link them in §7.5 and §10.2. — *Martin*
- [ ] **Write Part B §8.5 and §9 honestly** about the repository starting on 9 November, the empty weeks W1–W3, the fast reviews and the uneven commit counts. No backdating. — *Lazar* drafts, all three agree
- [ ] **Seed/demo data**: a documented demo account (realistic, no real personal data) with activities, a saved comparison and a goal plan, or a seed script. Document it in the README. — *Faraj* (owns the database)
- [ ] **ERD** for Part B §4.2 that matches `users`, `activities`, `comparisons`, `goalPlans`. — *Faraj* draws, *Lazar* inserts
- [ ] **Complete Part B (all 13 sections) and export the PDF.** — *Lazar*
- [ ] **AI usage declaration (§12) and individual statements (§11)**, each written and signed by that member, accurately reflecting AI help. — *each member*
- [ ] **Instructor access**: make sure `ar-rit` accepts the pending invitation (the repository is public, so read access already works). — *Faraj*

### HIGH — important for grading

- [ ] Fix the **Goals contrast** (`.goals-stat--highlight .goals-stat__hint`, needs ≥ 4.5:1). — *Martin*
- [ ] Fix the **German text overflow at 320 px** in Tracking tabs (allow the tab label to wrap or shrink). — *Martin* (i18n) or *Lazar* (Tracking)
- [ ] Fix the **Croatian month grammar** in Goals (use phrasings that avoid inflecting the month, e.g. "do: travanj 2027.", or genitive forms). — *Martin*
- [ ] **Native-speaker check** of Croatian and German (10 screens each), and record who checked them in §6.1. — *Martin*
- [ ] **Real review comments** on every remaining PR (this one included): short, substantive, not instant approvals. — *all*
- [ ] **Justify the custom i18n module** in Part B §6.2 (typed keys, compile-time checks, Intl-based plurals), or note it as a known deviation. — *Martin*
- [ ] **Non-Latin script test** (e.g. a Cyrillic or Arabic note stored and read back), added to the emulator tests. — *Faraj*
- [ ] **Screenshots for Part B**: screens (§3.3), persistence (§4.4), API working and failing (§5.5), plurals and three locales (§6.3–6.6), contrast (§7.4), git graph and contributors (§8.2), test runs (§10). — *Lazar*, with each owner helping

### MEDIUM — documentation and evidence

- [ ] Create a few **GitHub Issues** for the remaining work and close them with the PRs that fix them (`Closes #n`). — *all*
- [ ] **Per-user locale preference**: store `locale` on `users/{uid}`, or explain in Part B why it is a device setting. — *Faraj* / *Martin*
- [ ] README: correct the contrast claim; add testing libraries (jsdom, Testing Library, axe-core) and **Java 21+** to the prerequisites; add a "third-party libraries and attribution" line; add each member's build role. — *Lazar*
- [ ] Document what is sent to Nominatim, and that place names come back in OSM's local language. — *Faraj*
- [ ] Fill the §6.4 formatting table with values copied from the running app (en/hr/de). — *Martin*
- [ ] Lazar commits his documentation work (Part B source, diagrams, screenshots folder) under his own account, so his contribution is visible in git. — *Lazar*

### LOW — optional

- [ ] Use `Intl.Collator` where text is sorted (e.g. the breakdown table, ties). — *Lazar*
- [ ] Pass the UI locale to Nominatim (`accept-language`). — *Faraj*
- [ ] Code-split Firebase to reduce the 1.1 MB bundle. — *Faraj*
- [ ] Add a LICENSE file; delete merged branches. — *Faraj*
- [ ] Optional deployment (Firebase Hosting free tier) and demo video. — *Faraj*

---

## H. Final readiness assessment

**Application: nearly ready.** Every functional requirement except F7 is met (F5 has gaps). All 30 wireframe screens are reachable, data persists in a secured database, the API does real work and fails gracefully, and the interface is fully translated into three languages. The fixes needed in the app are small: one contrast colour, one overflowing tab label, Croatian month phrasing, and optionally a per-user locale and a non-Latin test.

**Submission: not ready.** The Part B document is empty. The required accessibility check, ERD, seed data, release tag, GitHub issues and evidence screenshots do not exist yet. These can all be done by 14 November.

**What cannot be fixed:** the git history shows no repository work before 9 November, and the reviews have no comments. This will cost points in "Git history and teamwork" whatever happens now. The best remaining course is an honest, specific explanation in Part B §8.5 and §9, steady real commits from all three members until the deadline, and real review comments from now on. **Do not backdate or rewrite history**: the brief treats that as academic dishonesty.
