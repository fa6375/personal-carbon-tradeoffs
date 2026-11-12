# Carbon Choices

Carbon Choices is a mobile-first web application that helps people understand and manage the environmental impact of their everyday decisions. It brings three feature areas together in one product: comparing everyday choices, setting carbon reduction goals and tracking personal carbon emissions. It implements the **Personal Carbon Trade-Offs** topic for **ISTE.260 – Designing the User Experience**, Deliverable 2.

> **Status:** early development. All three feature areas are integrated in one app with **Firebase Authentication** (email and password) and **Cloud Firestore** as the shared database: activities, saved comparisons and carbon plans are stored per user and survive a reload. Journey distances can be looked up with **OpenStreetMap** (Nominatim + OSRM). Emission, cost and time figures are illustrative estimates. The interface is available in **English, Croatian and German**. See [Current Development Status](#current-development-status).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Team Members](#team-members)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Firebase Setup](#firebase-setup)
- [Database](#database)
- [Security Rules](#security-rules)
- [Importing Data Saved in the Browser](#importing-data-saved-in-the-browser)
- [External API](#external-api)
- [Testing](#testing)
- [Internationalization](#internationalization)
- [Accessibility](#accessibility)
- [Development Workflow](#development-workflow)
- [Current Development Status](#current-development-status)
- [Known Limitations](#known-limitations)
- [Third-party libraries and attribution](#third-party-libraries-and-attribution)

---

## Project Overview

Most everyday decisions with a carbon cost, such as how to get to university, what to eat or how to heat a home, are made without any clear information about their impact. When that information does exist, it is usually presented on its own, separated from the things people actually weigh up, like money and time.

Carbon Choices addresses this by:

- showing the carbon impact of everyday choices **next to** their cost and time, so trade-offs are visible rather than hidden;
- letting users set reduction goals and a carbon budget they can realistically follow;
- letting users record their activities and see how their emissions develop over time.

The application is designed mobile-first and is delivered as a responsive web application, which the course brief allows for topics targeting mobile, provided it is designed for and demonstrated at phone width.

| | |
|---|---|
| **Course** | ISTE.260 – Designing the User Experience |
| **Deliverable** | Deliverable 2 – Implementation of the application (team) |
| **Team** | Team 2 |
| **Topic** | Personal Carbon Trade-Offs |
| **Repository** | <https://github.com/fa6375/personal-carbon-tradeoffs> |

---

## Features

Each feature area comes from one team member's Deliverable 1 wireframes. All three must work together as one coherent application.

**Legend:** ✅ Implemented · 🚧 In progress · 📋 Planned

### 1. Compare Everyday Choices — *Faraj Aliyev*

Compares ways of making the same journey (walking, cycling, bus, train, car and electric car) by CO₂ emissions, financial cost and travel time, and recommends the option that best matches the user's own priorities.

The feature is at `#/compare` ("Compare journeys" in the navigation), with saved comparisons at `#/saved` ("Saved comparisons"). It implements the ten screens from Faraj's Deliverable 1 wireframes:

| # | Screen | Where it is |
|---|---|---|
| 1 | Start | Opening screen of `#/compare` — `CompareStart.tsx` |
| 2 | Choose transport | Step 1 — `ChooseTransport.tsx` + `ModePicker.tsx` |
| 3 | Enter journey | Step 2 — `JourneyDetails.tsx` |
| 4 | Set priorities | Step 3 — `SetPriorities.tsx` + `PriorityFields.tsx` |
| 5 | Comparison results | "Results" tab — `ComparisonResults.tsx` |
| 6 | Detailed breakdown | "Breakdown" tab — `CalculationBreakdown.tsx` |
| 7 | Recommended option | "Recommendation" tab — `RecommendedOption.tsx` |
| 8 | Alternative scenario | "What if" tab — `AlternativeScenario.tsx` |
| 9 | Save comparison | "Save" tab — `SaveComparison.tsx`; list at `#/saved` — `SavedComparisonList.tsx` |
| 10 | Error | Shown for missing or invalid information, failed calculations, a missing saved comparison or unreadable storage — `CompareError.tsx` |

**User journey:** Start → choose at least two transport options → enter the start, destination, one-way distance and number of people → set how much CO₂, cost and time matter (not important / a little / important / very important) → results → breakdown, recommendation or a "what if" scenario → save → reopen later from Saved comparisons.

| Functionality | Status |
|---|---|
| Choosing 2–6 transport options | ✅ |
| Journey form with validation next to each field (accepts `12.5` and `12,5`; distance 0–1000 km; 1–9 people; start and destination must differ) and a warning when walking or cycling is impractical for the distance | ✅ |
| Priorities for CO₂, cost and travel time (0–3 each, at least one above 0) | ✅ |
| Results: cards per option, "lowest CO₂ / cheapest / fastest" badges (ties included), side-by-side bars and a table of differences from the recommended option | ✅ |
| Detailed breakdown: each formula with the actual numbers, the assumptions per option and the scoring table | ✅ |
| Recommendation calculated from the scores and priorities, with reasons, trade-offs and the next best option | ✅ |
| Alternative scenario: change distance, people, options and priorities, see the result recalculated live next to the current one, then apply or discard | ✅ |
| Saving a comparison (name, date, options, journey, priorities, results and recommendation), listing, reopening and deleting with confirmation | ✅ Stored in Cloud Firestore (`users/{uid}/comparisons`); saving asks the user to sign in |
| Loading, empty, success and error states | ✅ |
| Looking up the journey distance (car, bike, on foot) with OpenStreetMap | ✅ Optional; typing the distance always works — see [External API](#external-api) |
| Real fares, timetables or traffic-based travel times | 📋 Not planned for now — cost and time stay illustrative |

> **How the comparison is calculated** (`src/features/compare/calculate.ts` and `transportOptions.ts`). All results are **per person**:
>
> - **CO₂ (kg CO₂e)** = distance × emission factor ÷ people in the car (car and electric car only). The emission factors are reused from Personal Carbon Tracking (`src/features/tracking/emissionFactors.ts`), so both features give the same answer for the same trip.
> - **Cost (EUR)** = fixed cost + distance × cost per km, shared by people in the car for cars. Public transport is one ticket each. Car costs include fuel or charging and parking only, not purchase, insurance or maintenance.
> - **Travel time (min)** = distance ÷ average speed × 60 + fixed overhead (walking to a stop and waiting, locking a bike, parking).
> - **Scores:** for each criterion, best option = 100%, worst = 0%, others in between. **Overall match** = Σ(priority × score) ÷ Σ(priority). The highest overall match is recommended; ties go to lower emissions, then shorter time.
>
> Cost, speed and overhead values are **illustrative assumptions** chosen to show trade-offs, not verified fares, timetables or traffic data. Every screen with figures labels them as estimates, and the breakdown screen lists each assumption.

### 2. Carbon Reduction Goals & Recommendations — *Martin Mudrinic*

Helps users turn "I want to lower my emissions" into a plan they can follow. The user sets a monthly carbon budget from their current emissions, shares it across the same categories used in Carbon tracking (transport, food, home energy), ranks the trade-offs that matter to them (emissions, cost, time, comfort) and gets reduction ideas ordered by those priorities. During the month they see their progress against the current month's target, adjust the budget when plans change and review a summary of the whole plan.

The feature is at `#/goals` ("Carbon goals" in the navigation). It groups the ten screens from Martin's Deliverable 1 design into five steps, shown as a step bar; every step can be opened directly, and Back/Next buttons move through them in order.

| # | Screen | Step | Component |
|---|---|---|---|
| 1 | Carbon budget setup | 1. Set up | `BudgetSetup.tsx` |
| 2 | Personal carbon budget | 1. Set up | `PersonalBudget.tsx` |
| 3 | Budget allocation by category | 2. Allocate | `BudgetAllocation.tsx` |
| 4 | Trade-off priorities | 2. Allocate | `TradeoffPriorities.tsx` |
| 5 | Monthly carbon plan | 3. Plan | `MonthlyPlan.tsx` |
| 7 | Reduction opportunities | 3. Plan | `ReductionOpportunities.tsx` |
| 8 | Goal progress | 4. Track | `GoalProgress.tsx` |
| 6 | Budget adjustment | 4. Track | `BudgetAdjustmentForm.tsx` |
| 9 | Budget adjustment details | 4. Track | `AdjustmentDetails.tsx` |
| 10 | Carbon budget summary | 5. Summary | `BudgetSummary.tsx` |

#### Main user journey

1. **Budget setup (screens 1–2).** The user chooses where their current monthly emissions come from: *From Carbon tracking* (the total of activities recorded in the last 30 days), *Enter my own estimate* (10–5000 kg CO₂e, validated, split across categories in the same proportions as the sample) or *Use the sample value* (550 kg CO₂e). They pick a reduction goal (10–30%), a timeframe (3, 6 or 12 months) and a start month. The personal budget screen shows the resulting monthly budget, the reduction, the goal month and the first month's target.
2. **Category allocation (screen 3).** Sliders share the budget between transport, food and home energy. Each category shows its share in kg, what it is now and how much it has to come down. The total is checked: if it is not 100%, the screen says how much is missing or over, and later steps show a warning with a "Fix allocation" button. "Match my current split" sets the shares to match current emissions.
3. **Trade-off priorities (screen 4).** The user puts four priorities in order with up/down buttons. The screen immediately names the recommendation that now comes first.
4. **Monthly carbon planning (screen 5).** The budget steps down by the same amount each month from current emissions to the final budget. The table marks the current month and, on wider screens, shows each category's share per month; a list below shows the category budgets for the month that applies now on every screen size.
5. **Reduction opportunities (screen 7).** Eight example ideas, ordered by a simple rule: ideas in categories that still need cutting first, then by the user's top priority, with ties broken by the next priority. Each idea shows its estimated monthly saving, the example amounts behind it, and its cost, time, comfort and effort trade-offs. "Add to plan" adds it, and a coverage panel shows how much of each category's needed cut the chosen ideas cover. A link opens Compare to check a specific journey.
6. **Progress tracking (screen 8).** Compares emissions so far this month with **this month's target** from the monthly plan (not the final budget), overall and per category, as a percentage used with a marker for how much of the month has passed. Each bar has a status: *On track*, *Ahead of pace* (usage more than 5 percentage points ahead of the calendar) or *Over budget*. It uses the activities recorded in Carbon tracking this month; if there are none, it shows a clearly labelled sample month and a link to record an activity. Loading and error states (with "Try again") are shown while Tracking data is read.
7. **Budget adjustments (screens 6 and 9).** The user can either move percentage points of the budget from one category to another (the total stays the same) or change the reduction goal (1–90%), which changes the whole monthly budget and every value that depends on it. Both are validated, with errors next to the field, and take an optional reason. The details screen lists every adjustment, newest first, with the values before and after, the change in kg and the category budgets before and after.
8. **Summary (screen 10).** Monthly budget, goal and starting point, timeframe, this month's target, allocation, priorities, planned changes with their estimated savings, and number of adjustments. "Edit" links return to the relevant step, "Keep going" links open Carbon tracking and Compare, and "Start over" asks for confirmation before clearing the plan.

#### Where the figures come from

| Figure | Source |
|---|---|
| Current monthly emissions | Carbon tracking (last 30 days), the user's own estimate, or a sample value — the interface always says which |
| Emissions so far this month (progress) | Carbon tracking (this calendar month); a labelled sample month if nothing is recorded |
| Savings of reduction ideas | Calculated with `calculateEmissions` from `src/features/tracking/emissionFactors.ts`, the same illustrative factors used by Carbon tracking and Compare, applied to example monthly amounts shown on each card (e.g. "about 170 km a month driven alone in a petrol car made by bus instead") |
| Budget, monthly targets, category budgets, percentages | Budget arithmetic in `src/features/goals/budget.ts`, derived from the plan so every screen updates when a value changes. Amounts are kept to 0.1 kg and category budgets always add up to the total |

Goals only *reads* Tracking data through Tracking's existing `useActivities` hook and `stats.ts` helpers; it does not change the Tracking feature or define its own emission factors.

#### Data storage

The plan (goal, budget settings, allocation, priorities, chosen ideas and adjustment history) is stored in Cloud Firestore as one document per user, `users/{uid}/goalPlans/current` (`goalPlanRepository.ts`). `goalPlanSync.ts` loads it into the existing in-memory store (`goalPlanStore.ts`) when the user signs in and saves every change automatically a moment later; a status line on the Goals page says whether changes are saved, and offers "Try saving again" and "Delete saved plan" (with confirmation). If the plan cannot be loaded, the page shows an error with "Try again" instead of a default plan. Goal progress is not stored: it is calculated from the activities in Carbon tracking. The current step is kept in memory only.

| Functionality | Status |
|---|---|
| Budget setup with three baseline sources, validation of the user's own estimate | ✅ |
| Personal monthly budget and first-month target | ✅ |
| Allocation across the three Tracking categories, with a 100% check and warning on later steps | ✅ |
| Trade-off priorities that change the order of recommendations | ✅ |
| Monthly plan with the current month marked and category budgets per month | ✅ |
| Reduction opportunities with savings from the shared emission factors, category filter, coverage of the needed cut | ✅ Example ideas and example amounts |
| Goal progress against this month's target, using Carbon tracking data | ✅ Sample month when nothing is tracked |
| Budget adjustment: move between categories or change the goal, with validation | ✅ |
| Budget adjustment details with before/after values | ✅ |
| Carbon budget summary with links back to each step and to Tracking and Compare | ✅ |
| Plan kept while moving between pages | ✅ |
| Saving the plan and adjustments in the database (create, read, update, delete) | ✅ Cloud Firestore, saved automatically |
| Step within Carbon goals in the URL | 📋 Planned — reloading returns to step 1 |
| Emission data or recommendations from an external API | 📋 Planned |

### 3. Personal Carbon Tracking — *Lazar Jovovic*

Lets users record everyday activities (transport, food and home energy), see an estimate of the emissions of each one, and follow how their emissions add up over time and by category.

The feature is at `#/tracking` ("Carbon tracking" in the navigation). It implements the ten screens from Lazar's Deliverable 1 wireframes:

| # | Screen | Where it is |
|---|---|---|
| 1 | Carbon Tracking Dashboard | "Dashboard" tab — `TrackingDashboard.tsx` |
| 2 | Add Activity | "Add activity" button — `AddActivity.tsx` |
| 3 | Transport Activity Entry | Add activity → Transport — `ActivityEntry.tsx` + `ActivityForm.tsx` |
| 4 | Food Activity Entry | Add activity → Food — `ActivityEntry.tsx` + `ActivityForm.tsx` |
| 5 | Home Energy Entry | Add activity → Home energy — `ActivityEntry.tsx` + `ActivityForm.tsx` |
| 6 | Activity History | "History" tab — `ActivityHistory.tsx` |
| 7 | Activity Details | Select any activity — `ActivityDetails.tsx` |
| 8 | Edit Activity | "Edit activity" on the details screen — `EditActivity.tsx` |
| 9 | Carbon Emissions Breakdown | "Breakdown" tab — `EmissionsBreakdown.tsx` |
| 10 | No Activities Recorded | Shown on Dashboard, History and Breakdown when nothing is recorded — `NoActivities.tsx` |

| Functionality | Status |
|---|---|
| Recording transport, food and home energy activities, with a live emissions estimate while typing | ✅ |
| Form validation with error messages next to each field (accepts `12.5` and `12,5`) | ✅ |
| Activity history, newest first, with text search, category filter and period filter | ✅ |
| Activity details with a step-by-step explanation of the estimate | ✅ |
| Editing an activity | ✅ |
| Deleting an activity with a confirmation dialog | ✅ |
| Dashboard: emissions this month, daily average, last 7 days, largest source, this month by category, recent activities | ✅ Updates when activities change |
| Emissions breakdown by category and by source for the last 7 days, last 30 days, this month or all time | ✅ Updates when activities change |
| Loading, error (with "Try again") and empty states | ✅ |
| Saving activities in the project database | ✅ Cloud Firestore (`users/{uid}/activities`), with live updates across tabs and devices |
| Looking up a trip's distance with OpenStreetMap on the transport form | ✅ Optional |
| Emission factors from an external API or verified dataset | 📋 Planned — illustrative factors for now (see below) |
| Sharing tracked emissions with Carbon goals as the real baseline | ✅ Read by Carbon goals for its baseline and progress (no change to Tracking) |

> **How emissions are estimated:** every result is calculated in `src/features/tracking/emissionFactors.ts` with one method: transport = distance × factor ÷ people in the vehicle (cars and motorbikes only), food = servings × factor, home energy = kWh × factor ÷ household size. The factors are **illustrative** rounded averages, not values from a verified dataset, and the interface labels every result as an estimate. They are meant to be replaced by an emission-factor API or dataset.

### Shared application foundation

| Functionality | Status |
|---|---|
| Application shell: sidebar on desktop, hamburger menu on mobile | ✅ |
| Home dashboard with introduction, three information cards and "How it works" | ✅ |
| Settings page with the language choice, and a "Page not found" page | ✅ |
| Reusable UI components and design tokens | ✅ |
| Navigation entry for Goals (`#/goals`) | ✅ |
| Navigation entry for Tracking (`#/tracking`) | ✅ |
| Account page (`#/account`): sign in, create an account, sign out, import browser data | ✅ |
| Sign-in required for Carbon tracking, Carbon goals and Saved comparisons | ✅ Home and Compare work without an account; saving a comparison asks to sign in |
| Language selection (English, Croatian, German) in the sidebar, mobile menu and Settings | ✅ Saved in the browser; see [Internationalization](#internationalization) |
| App-wide offline notice; offline-aware saving in Tracking, Goals, Compare and sign-in | ✅ |

> Navigation currently contains Home, Compare journeys, Saved comparisons, Carbon goals, Carbon tracking, Account and Settings.

---

## Team Members

| Name | GitHub | Feature area (Deliverable 1) | Main responsibility in the build |
|---|---|---|---|
| Faraj Aliyev | [@fa6375](https://github.com/fa6375) | Compare Everyday Choices | Frontend foundation, Compare feature, shared backend (Firebase Auth, Firestore, rules, CRUD), external API, integration |
| Martin Mudrinić | [@martinmudrinic](https://github.com/martinmudrinic) | Carbon Reduction Goals & Recommendations | Goals feature, localization (en/hr/de), accessibility and shared UI states |
| Lazar Jovović | [@lj7829](https://github.com/lj7829) | Personal Carbon Tracking | Tracking feature, documentation, final report and evidence collection |

---

## Technology Stack

Versions are taken from `package.json` and the installed `node_modules`.

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 19.3.1 | UI library |
| [React DOM](https://react.dev/) | 19.3.1 | Rendering React in the browser |
| [TypeScript](https://www.typescriptlang.org/) | 6.0.3 | Static typing |
| [Vite](https://vite.dev/) | 8.3.7 | Development server and production build |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | 6.3.0 | React support for Vite |
| [ESLint](https://eslint.org/) | 10.14.0 | Linting |
| [typescript-eslint](https://typescript-eslint.io/) | 8.72.2 | TypeScript rules for ESLint |
| eslint-plugin-react-hooks / eslint-plugin-react-refresh | see `package.json` | React-specific lint rules |
| Plain CSS with custom properties | — | Styling (no UI or CSS framework) |
| [Firebase JS SDK](https://firebase.google.com/docs/web/setup) (modular) | 12.19.0 | Authentication and Cloud Firestore |
| [Vitest](https://vitest.dev/) | 4.1.12 | Unit and integration tests |
| [@firebase/rules-unit-testing](https://firebase.google.com/docs/rules/unit-tests) | 5.0.2 | Security Rules tests |
| [jsdom](https://github.com/jsdom/jsdom) | 26.1.0 | Browser-like DOM for component tests |
| [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) / [@testing-library/dom](https://testing-library.com/docs/dom-testing-library/intro) | 16.3.3 / 10.4.2 | Rendering and querying components in tests |
| [axe-core](https://github.com/dequelabs/axe-core) | 4.14.0 | Automated accessibility checks in tests |
| [firebase-tools](https://github.com/firebase/firebase-tools) | 15.36.0 | Local emulators and deploying rules (dev dependency, run with `npx firebase` or the npm scripts) |

Notes:

- There is **no router library**. Navigation uses a small hash-based router in `src/hooks/useHashRoute.ts` (routes: `#/`, `#/compare`, `#/saved`, `#/goals`, `#/tracking`, `#/account`, `#/settings`).
- There is **no custom backend server**: the browser talks to Firebase directly, and Firestore Security Rules enforce who may read and write what. Localization uses a small typed module in `src/i18n` with `Intl` for plurals and formatting, instead of an i18n library.
- `package.json` pins `@firebase/app` and `@firebase/app-compat` through `overrides`. Without it npm installed two copies of `@firebase/app`, and Firebase Auth and Firestore failed with "Component … has not been registered".
- The router ignores a query part in the hash, so `#/compare?saved=<id>` opens the Compare page with a saved comparison (used by Saved comparisons). The address is reset to `#/compare` once it has opened.

### Prerequisites

| Tool | Version |
|---|---|
| [Node.js](https://nodejs.org/) | `^20.19.0` or `>=22.12.0` (required by Vite 8) |
| npm | Included with Node.js (developed with npm 10.8.2) |
| Git | Any recent version |
| Java (JDK) | 21 or newer — only for the Firebase emulators (`npm run demo`, `npm run test:emulator`); firebase-tools 15 refuses older Java |

---

## Project Structure

```text
personal-carbon-tradeoffs/
├── public/
│   └── favicon.svg            # App icon
├── src/
│   ├── components/            # Reusable UI components, each with its own CSS file
│   │   ├── Button.tsx         #   <button> with the shared button styles (Button.css)
│   │   ├── ButtonLink.tsx     #   Link styled as a button (styles in Button.css)
│   │   ├── EmptyState.tsx     #   Placeholder / empty-state panel
│   │   ├── Footer.tsx
│   │   ├── Icon.tsx           #   Inline SVG icon set
│   │   ├── InfoCard.tsx
│   │   ├── LanguageSelect.tsx #  Language picker (sidebar, mobile menu, Settings)
│   │   ├── Logo.tsx
│   │   ├── MobileHeader.tsx   #   Top bar + hamburger menu (below 960px)
│   │   ├── NavList.tsx        #   Navigation links shared by sidebar and mobile menu
│   │   ├── OfflineBanner.tsx  #   App-wide "you are offline / back online" notice
│   │   ├── PageHeader.tsx
│   │   ├── SectionHeading.tsx
│   │   └── Sidebar.tsx        #   Desktop navigation (960px and wider)
│   ├── data/                  # Static content and configuration
│   │   ├── homeContent.ts     #   Text for the home dashboard
│   │   └── navigation.ts      #   Navigation items and route mapping
│   ├── i18n/                  # Localization: translate, plurals, language choice, Intl formatters
│   │   ├── locales/           #   en/, hr/, de/ — messages split into common, compare, goals, tracking
│   │   ├── i18n.test.ts       #   Completeness, plurals and formatting tests
│   │   └── localeStore.test.ts #  Saved language, browser default, <html lang>
│   ├── test/                  # Component tests (jsdom + Testing Library + axe-core)
│   │   ├── accessibility.test.tsx # axe scans, keyboard, dialogs, language switching, missing keys
│   │   ├── uiStates.test.tsx  #   Loading, empty, error and offline states
│   │   └── dom.ts             #   Test helpers and small stand-ins for browser APIs jsdom lacks
│   ├── features/              # Feature-specific code, one folder per feature area
│   │   └── account/           #   Shared: import of data saved in the browser (localImport.ts, LocalImportPanel.tsx)
│   │   └── auth/              #   Shared: Firebase Auth service, AuthProvider, sign-in form, RequireAuth gate
│   │   └── routing/           #   Shared: OpenStreetMap distance lookup (routeService.ts, RouteDistanceLookup.tsx)
│   │   └── compare/           #   Compare Everyday Choices (Faraj)
│   │       ├── components/    #     One component per screen, plus CompareUi.tsx, ModePicker.tsx, PriorityFields.tsx
│   │       ├── calculate.ts   #     CO₂/cost/time estimates, scoring and recommendation
│   │       ├── transportOptions.ts # ILLUSTRATIVE cost, speed and overhead per option (CO₂ factors from tracking)
│   │       ├── criteria.ts    #     The three criteria and priority levels
│   │       ├── comparisonRepository.ts # Repository interface; old localStorage reader kept for the import
│   │       ├── firestoreComparisonRepository.ts # Saved comparisons in Firestore
│   │       ├── useComparisonRepository.ts # The signed-in user's repository
│   │       ├── useSavedComparisons.ts # Loading/error state and delete for the saved list
│   │       ├── validation.ts  #     Journey form values and validation
│   │       ├── format.ts      #     kg CO₂e, EUR, duration, date and plural formatting (Intl, English)
│   │       ├── types.ts       #     TypeScript types for the feature
│   │       └── compare.css    #     Styles for the feature
│   │   └── goals/             #   Carbon Reduction Goals & Recommendations (Martin)
│   │       ├── components/    #     One component per screen, plus GoalsUi.tsx building blocks
│   │       ├── budget.ts      #     Budget arithmetic, monthly targets, savings, ranking, pace
│   │       ├── format.ts      #     kg CO₂e, month and plural formatting (Intl, English)
│   │       ├── goalPlanReducer.ts # Pure state changes for the plan, including adjustments
│   │       ├── goalPlanStore.ts #   In-memory store for the plan and current step
│   │       ├── goalPlanRepository.ts # The plan in Firestore (users/{uid}/goalPlans/current)
│   │       ├── goalPlanSync.ts #    Loads the plan on sign-in and saves changes automatically
│   │       ├── trackedEmissions.ts # Read-only summary of Carbon tracking activities
│   │       ├── sampleData.ts  #     Categories, priorities, example ideas and TEMPORARY sample values
│   │       ├── stages.ts      #     The five steps and the screens they contain
│   │       ├── types.ts       #     TypeScript types for the feature
│   │       └── goals.css      #     Styles for the feature
│   │   └── tracking/          #   Personal Carbon Tracking (Lazar)
│   │       ├── components/    #     One component per screen, plus TrackingUi.tsx building blocks
│   │       ├── activityRepository.ts # Repository interface; old localStorage reader kept for the import
│   │       ├── firestoreActivityRepository.ts # Activities in Firestore, with a live listener
│   │       ├── useActivities.ts #   Live list, loading/error state and create/update/delete for screens
│   │       ├── emissionFactors.ts # ILLUSTRATIVE emission factors and the calculation method
│   │       ├── stats.ts       #     Totals, periods and groupings for dashboard/breakdown
│   │       ├── validation.ts  #     Form values, validation and conversion to activities
│   │       ├── format.ts      #     kg CO₂e, date and plural formatting (Intl, English)
│   │       ├── categoryIcons.ts #   Icon for each activity category
│   │       ├── types.ts       #     TypeScript types for the feature
│   │       └── tracking.css   #     Styles for the feature
│   ├── lib/
│   │   ├── firebase.ts        # The single Firebase initialisation (from VITE_FIREBASE_* variables)
│   │   ├── dataErrors.ts      # DataError with stable codes, Firestore error mapping, timeouts
│   │   ├── errorMessages.ts   # English text for every data error code (translate here)
│   │   └── firestoreValues.ts # Timestamp helpers
│   ├── hooks/
│   │   └── useHashRoute.ts    # Minimal hash-based routing
│   ├── layouts/
│   │   └── AppLayout.tsx      # App shell: skip link, navigation, main area, footer
│   ├── pages/                 # One component per screen
│   │   ├── HomePage.tsx
│   │   ├── ComparePage.tsx    #   Compare journeys: steps, tabs and the Compare screens
│   │   ├── SavedPage.tsx      #   Saved comparisons list
│   │   ├── GoalsPage.tsx      #   Carbon goals: step navigation and the Goals screens
│   │   ├── TrackingPage.tsx   #   Carbon tracking: tabs and the Tracking screens
│   │   ├── AccountPage.tsx    #   Sign in / create account / sign out / import
│   │   ├── SettingsPage.tsx   #   Placeholder
│   │   ├── NotFoundPage.tsx
│   │   └── PlaceholderPage.tsx #   Shared template for unbuilt sections
│   ├── styles/
│   │   ├── tokens.css         # Design tokens: colours, spacing, type, radii, shadows
│   │   ├── base.css           # Reset, base elements, focus styles, reduced motion
│   │   └── index.css          # Global stylesheet entry point
│   ├── types/                 # Shared TypeScript types
│   ├── App.tsx                # Chooses the page for the current route
│   └── main.tsx               # Application entry point
├── docs/                      # Deliverable 2 report (DOCX/PDF), requirements audit, diagrams/ (ERD, architecture), evidence/ (screenshots, test logs)
├── scripts/                   # seed-demo.mjs + seedDemo.ts: demo data for the local emulators (npm run demo)
├── tests/emulator/            # Rules and repository tests that run against the Firebase emulators
├── tests/live/                # Opt-in test against the real Firebase project (npm run test:live)
├── firestore.rules            # Cloud Firestore Security Rules
├── firestore.indexes.json     # Firestore indexes (none needed yet)
├── firebase.json              # Firebase CLI config: rules file and emulator ports
├── .firebaserc                # Default Firebase project: personal-carbon-tradeoff
├── .env.example               # Environment variables to copy into .env.local
├── vitest.config.ts           # Unit tests
├── vitest.emulator.config.ts  # Emulator tests
├── index.html                 # HTML entry point
├── eslint.config.js           # ESLint configuration
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript project references
├── tsconfig.app.json          # TypeScript settings for src/
├── tsconfig.node.json         # TypeScript settings for config files
└── package.json               # Scripts and dependencies
```

**Conventions**

- Colours, spacing and typography are defined once in `src/styles/tokens.css`; components use these variables instead of hard-coded values.
- Each component keeps its CSS file next to it, so team members can work on different features without editing the same files.
- New screens go in `src/pages/` and are registered in `src/data/navigation.ts` and `src/App.tsx`.
- Every user-visible text goes through `t()` from `src/i18n` (see [Internationalization](#internationalization)); add new texts to all three languages.
- Code that belongs to only one feature area goes in `src/features/<feature>/`, so each team member mostly edits their own folder. Changes to shared files (navigation, routing, `App.tsx`, shared components) should stay small and be mentioned in the Pull Request.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/fa6375/personal-carbon-tradeoffs.git
```

```bash
cd personal-carbon-tradeoffs
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Copy `.env.example` to `.env.local` and fill in the Firebase web app config (see [Firebase Setup](#firebase-setup)):

```bash
cp .env.example .env.local
```

**Quickest way to see the app with data (no Firebase account needed):** run `npm run demo` (needs Java 21+). See [Demo / seed data](#database).

Without `.env.local` the app still runs, but Carbon tracking, Carbon goals, Saved comparisons and Account show "Database not configured". To work without the real project, use the local emulators instead (see [Testing](#testing)).

### 4. Start the development server

```bash
npm run dev
```

Vite prints the local address, by default <http://localhost:5173>.

### 5. Build for production

```bash
npm run build
```

This type-checks the project (`tsc -b`) and writes the production build to `dist/`. To preview the build locally:

```bash
npm run preview
```

### 6. Run ESLint

```bash
npm run lint
```

### Available scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Start the development server with hot reload |
| `npm run build` | `tsc -b && vite build` | Type-check and create a production build in `dist/` |
| `npm run preview` | `vite preview` | Serve the production build locally |
| `npm run lint` | `eslint .` | Lint all TypeScript and TSX files |
| `npm test` | `vitest run` | Unit tests (no network, no Firebase) |
| `npm run test:emulator` | `firebase emulators:exec … vitest run --config vitest.emulator.config.ts` | Starts the Auth and Firestore emulators, runs the rules and repository tests, stops the emulators (needs Java) |
| `npm run demo` | `firebase emulators:exec --ui … "node scripts/seed-demo.mjs && vite --mode emulator"` | **Reviewer demo**: starts the local emulators, loads realistic demo data, prints a demo sign-in and starts the app (Java 21+) |
| `npm run emulators` | `firebase emulators:start --only auth,firestore …` | Runs the emulators for manual testing with `VITE_FIREBASE_USE_EMULATOR=true` |
| `npm run test:live` | `vitest run --config vitest.live.config.ts` | 7 tests against the **real** project from `.env.local`: creates two throw-away accounts, checks Auth, CRUD for all three features and the deployed rules, then deletes everything it created |
| `npm run deploy:rules` | `firebase deploy --only firestore:rules --project personal-carbon-tradeoff` | Publishes **only** `firestore.rules` to the real project's `(default)` database (needs `npx firebase login` first) |

---

## Environment Variables

Copy `.env.example` to `.env.local`. Vite reads `.env.local` automatically, and Git ignores it (`.gitignore` ignores `*.local`, `.env` and `.env.*`, except `.env.example`).

| Variable | Required | Purpose |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase web app config, e.g. `personal-carbon-tradeoff.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | `personal-carbon-tradeoff` |
| `VITE_FIREBASE_STORAGE_BUCKET` | No | Firebase web app config (storage is not used) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | No | Firebase web app config |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase web app config |
| `VITE_FIREBASE_USE_EMULATOR` | No | `true` connects to the local Auth (9099) and Firestore (8080) emulators instead of the real project |
| `VITE_FIREBASE_EMULATOR_HOST` | No | Emulator host, default `127.0.0.1` |
| `VITE_GEOCODER_URL` | No | Nominatim-compatible geocoder, default `https://nominatim.openstreetmap.org` |
| `VITE_ROUTER_URL` | No | OSRM server laid out like routing.openstreetmap.de (`/routed-car`, `/routed-bike`, `/routed-foot`), default `https://routing.openstreetmap.de` |
| `VITE_NOMINATIM_EMAIL` | No | Contact email sent to Nominatim, as its usage policy recommends |

The Firebase web config is **not a secret**: it identifies the project to the browser, and every visitor's browser receives it. Access to data is protected by Firebase Authentication and the [Security Rules](#security-rules). Even so, the real values are kept out of Git, so each developer chooses which project they point at. Service-account keys and other server credentials must **never** be added to this repository or to any `VITE_` variable, because everything in a `VITE_` variable ends up in the browser bundle. The app needs none.

---

## Architecture

```text
Browser (React + Vite)
 ├── src/lib/firebase.ts ─── one Firebase app ──► Firebase Authentication (email + password)
 │                                            └─► Cloud Firestore  (protected by firestore.rules)
 ├── AuthProvider ── current user (uid) ──► every repository works only under users/{uid}
 ├── Repositories (one per feature, same interfaces the screens already used)
 │     tracking/firestoreActivityRepository.ts   users/{uid}/activities
 │     compare/firestoreComparisonRepository.ts  users/{uid}/comparisons
 │     goals/goalPlanRepository.ts + goalPlanSync users/{uid}/goalPlans/current
 └── routing/routeService.ts ──► Nominatim (places) + OSRM (route distances), public OpenStreetMap services
```

- **No custom backend.** The app is a static site. Firebase Authentication identifies the user, and Firestore Security Rules decide what each user may read and write, so no server code is needed. The external API needs no secret key, so it is called from the browser too (see [External API](#external-api)). Cloud Functions, which need the paid Blaze plan, are not used.
- **Same interfaces, new storage.** The screens still use the repository interfaces from Deliverable 1 (`ActivityRepository`, `ComparisonRepository`), now implemented with Firestore, so the screens and calculations did not have to change. `useActivities` keeps its old return shape, so Carbon goals still reads Tracking data exactly as before.
- **Structured errors.** Data code throws `DataError` with a stable code (`not-signed-in`, `permission-denied`, `unavailable`, `timeout`, `not-found`, `invalid-data`, `quota-exceeded`, …). Auth uses `AuthError` codes, and the route service uses `RouteError` codes. The English text for each code lives in one file per area (`src/lib/errorMessages.ts`, `src/features/auth/authMessages.ts`, `src/features/routing/routeMessages.ts`), ready to be translated.
- **Shared calculations.** There is one set of emission factors, in `src/features/tracking/emissionFactors.ts`. Compare (`compare/transportOptions.ts`) and Goals (`goals/sampleData.ts`) both read it, and a unit test checks that Compare and Tracking give the same CO₂ for the same trip. The factors are illustrative rounded averages, not a verified dataset (see each feature's section).

---

## Firebase Setup

The team uses the existing Firebase project **`personal-carbon-tradeoff`** with the web app **Carbon Choices Web**. Do not create a new project.

1. **Get the web config.** In the [Firebase console](https://console.firebase.google.com/) → `personal-carbon-tradeoff` → ⚙ Project settings → General → Your apps → *Carbon Choices Web* → SDK setup and configuration → Config. Copy each value into `.env.local` (see [Environment Variables](#environment-variables)). `measurementId` is not needed: the app does not use Google Analytics.
2. **Authentication.** Build → Authentication → Sign-in method: **Email/Password** must be enabled (it is). Users register in the app on the Account page or on any page that needs an account. Email verification and password reset are not implemented.
3. **Firestore.** Build → Firestore Database. The database already exists. Publish the rules from this repository (it must not stay in test mode):

   ```bash
   npx firebase login
   ```

   ```bash
   npm run deploy:rules
   ```

   This publishes only `firestore.rules` to the `(default)` Firestore database of `personal-carbon-tradeoff` (set in `.firebaserc` and in the script); nothing else in the project is changed. Check the target project in the command output. No composite indexes are needed (every query orders a single collection by one field), so `firestore.indexes.json` is empty and is not deployed by this script.

   **Status:** the rules in this repository were deployed to `personal-carbon-tradeoff` on 2026-11-12 ("released rules firestore.rules to cloud.firestore"). Deploy again whenever `firestore.rules` changes.
4. **Run the app** with `npm run dev`, create an account on the Account page, and add an activity. It appears in Firestore under `users/<your uid>/activities`.

---

## Database

The single shared database is **Cloud Firestore** in `personal-carbon-tradeoff`. All user data lives under the user's own document, so ownership is part of the path and one rule protects all of it:

```text
users/{uid}                                   profile
users/{uid}/activities/{activityId}           Personal Carbon Tracking
users/{uid}/comparisons/{comparisonId}        Compare Everyday Choices (saved comparisons)
users/{uid}/goalPlans/current                 Carbon Reduction Goals (the user's plan)
```

| Document | Fields |
|---|---|
| `users/{uid}` | `email`, optional `locale` (`en`, `hr` or `de` — the user's language), `createdAt`, `updatedAt`. Created the first time the user signs in. |
| `activities/{id}` | `date` (`"YYYY-MM-DD"`, the user's local day), `note` (≤ 120 characters), `details` (one of: `{category: "transport", mode, distanceKm, passengers}`, `{category: "food", item, servings}`, `{category: "home", source, kwh, householdSize}`), `createdAt`, `updatedAt`, optional `importedFrom: "localStorage"` |
| `comparisons/{id}` | `name`, `input` (`modes`, `journey` {`from`, `to`, `distanceKm`, `passengers`}, `priorities` {`emissions`, `cost`, `time`} 0–3), `options` (snapshot of each option's `emissionsKg`, `costEur`, `timeMinutes`, `overallScore`), `recommended`, `createdAt`, `updatedAt`, optional `importedFrom` |
| `goalPlans/current` | `baseline` {`source`, `amounts` per category, optional `takenAt`}, `reductionPercent`, `durationMonths`, `startMonth` (`"YYYY-MM"`), `allocation` (percent per category), `priorities` (ordered), `selectedOpportunityIds`, `adjustments` (history, newest first), `schemaVersion` (1), `createdAt`, `updatedAt` |

Why this structure:

- **Ownership by path.** A user can only reach `users/{their uid}/…`, which keeps the rules short and easy to check. Every query reads one user's sub-collection, so no `userId` field or extra index is needed.
- **Emissions are calculated, not stored.** An activity stores what the user entered. Its emissions, the dashboard totals, the breakdown and the goal progress are calculated from it with the shared factors, so changing a factor never leaves stale numbers in the database.
- **One plan document.** The goal, budget, allocation, priorities and adjustments are always read and changed together, and the adjustment history stays small (the rules allow at most 200 entries). Separate `goals`/`budgets` collections would split one object and duplicate data. Adjustments store their before/after values because they are a history.
- **Saved comparisons are snapshots.** They keep their input, so the app recalculates them when opened, plus the results at the time of saving. They are not edited after saving.
- **Timestamps** are Firestore server timestamps (UTC). The app shows them as ISO strings and formats them in the user's locale. `date` is the user's local calendar day, as before.
- **Text** is stored as UTF-8, so Croatian characters (č, ć, ž, š, đ) work. This is covered by the tests.

**Data access** is in one repository per feature. Reads use the server (`getDocFromServer`/`getDocsFromServer`), and Tracking's live listener ignores cache-only snapshots until the server has answered once. This way an offline device shows "The database cannot be reached" with **Try again** instead of a misleading empty list. Every call has a timeout (15 s), after which a `timeout` error is shown.

**Demo / seed data.** Data in the real project is private to each account, so demo data is loaded into the **local Firebase emulators**, never into the real project:

```bash
npm run demo
```

This starts the Auth and Firestore emulators (with the Emulator UI at <http://127.0.0.1:4000>), runs `scripts/seed-demo.mjs`, and starts the app in emulator mode. Open the address Vite prints (usually <http://localhost:5173>), then sign in on the **Account** page with the email and password printed in the terminal. The account `demo@carbon-choices.test` gets 25 activities over the last month (transport, food, home energy, notes in English and Croatian), 2 saved comparisons and a 6-month carbon plan with one budget adjustment. The data is fictional, and no real person is involved. The password is generated at random each time, or you can set `DEMO_PASSWORD`. Nothing is written to `personal-carbon-tradeoff`: the seed script refuses to run unless the emulators are running, and in emulator mode the app ignores the real project settings. Emulator data is deleted when the command stops. `scripts/seedDemo.ts` uses the app's own repositories and calculations, so the demo data always matches the schema and the rules.

---

## Security Rules

`firestore.rules` is in the repository and is published with `npm run deploy:rules`. The rules:

- allow a signed-in user to read, create, update and delete **only** documents under `users/{their uid}`;
- deny everything else, including listing `users` and any other top-level collection;
- check the shape of every write: allowed fields only, known categories, modes, food items and energy sources, number ranges that match the app's validation (for example distance 0.1–20000 km, 1–9 people, note ≤ 120 characters, priorities 0–3 with at least one above 0, reduction 0–100%), `date` and `startMonth` formats, and list sizes;
- require `createdAt` to stay the same and `updatedAt` to be the server time on every update. On create, timestamps may not be in the future, which allows imported records to keep their original dates;
- allow only `goalPlans/current`, and do not allow saved comparisons to be edited after saving.

There is no `allow read, write: if true` anywhere. The rules are covered by 10 automated tests (see [Testing](#testing)).

---

## Importing Data Saved in the Browser

Before the database existed, Tracking and Compare saved data in the browser's `localStorage` (`carbon-choices.tracking.activities.v1`, `carbon-choices.compare.comparisons.v1`). The app no longer writes there, but it reads those keys to offer a one-time import (`src/features/account/localImport.ts`):

1. After signing in, a box on Carbon tracking and Saved comparisons, and always on the Account page, shows how many activities and comparisons this browser holds.
2. **Import into my account** copies them to Firestore. Each record keeps its id as the document id, and ids already in the account are skipped, so importing twice never creates duplicates. Batches of up to 450 writes are used.
3. Nothing is deleted from the browser. A small marker (`carbon-choices.import.v1:<uid>`) remembers that this user has imported, so the box is not shown again on Tracking and Saved. The Account page still offers **Import again**.
4. If the import fails, the error is shown, nothing is removed, and the user can try again. Damaged or unreadable local data is reported instead of being imported.

---

## External API

**Selected:** OpenStreetMap services for **journey distances**, in `src/features/routing/routeService.ts`:

| Service | Used for | Request |
|---|---|---|
| [Nominatim](https://nominatim.org/release-docs/latest/api/Search/) (`nominatim.openstreetmap.org`) | Turning the typed start and destination into coordinates | `GET /search?q=…&format=jsonv2&limit=1` |
| [OSRM](https://project-osrm.org/docs/v5.24.0/api/) on the FOSSGIS servers (`routing.openstreetmap.de`) | Driving, cycling and walking route distance | `GET /routed-car|routed-bike|routed-foot/route/v1/driving/{lon},{lat};{lon},{lat}?overview=false` |

**Why this API:** both Compare and Tracking asked the user to type a distance they often do not know. The distance drives every CO₂, cost and time figure, so a real route distance makes the results more meaningful. In **Compare** (Enter journey screen), "Look up distance" uses the start and destination already typed. In **Tracking** (transport form), there is a small optional From/To lookup. Both show which places were found, so the user can check them, and the car, bike and walking distances. The user chooses which distance to use, and typing a distance always remains possible. Route times from OSRM are shown for information but are not used in the calculations. Bus and train figures keep their existing illustrative method, because there is no verified public transport data source.

**No API key and no backend needed.** Both services are free and keyless, so they are called from the browser. No secret exists that would need hiding in a server function, so Cloud Functions (Blaze plan) are not needed.

**Usage policies and attribution** ([Nominatim policy](https://operations.osmfoundation.org/policies/nominatim/), [FOSSGIS routing terms](https://routing.openstreetmap.de/about.html)):

- at most **one request per second** to each host, with requests queued (`minIntervalMs` 1100 ms);
- **no autocomplete or search-as-you-type**: a lookup runs only when the user presses the button;
- results are **cached** in memory and in `localStorage` for 7 days (`carbon-choices.routes.v1:*`), so a repeated journey makes no requests;
- the browser's `Referer` identifies the app, and an optional contact email can be set with `VITE_NOMINATIM_EMAIL`;
- every lookup shows "Places and routes © OpenStreetMap contributors", linking to the ODbL copyright page, and names Nominatim and OSRM;
- these are public services **without guaranteed availability**, which the interface says. For heavy use, point `VITE_GEOCODER_URL` and `VITE_ROUTER_URL` at a self-hosted or commercial instance.

**Error handling.** Each failure becomes a `RouteError` with a code and a plain-language message in `routeMessages.ts`, which suggests typing the distance instead:

| Situation | Code |
|---|---|
| No answer within 10 s (request aborted) | `timeout` |
| Network failure or offline | `network` |
| HTTP 429 | `rate-limited` |
| HTTP 5xx | `server-error` |
| HTTP 401/403 (for example a misconfigured provider that needs a key) | `unauthorized` |
| HTTP 400 or another 4xx | `bad-request` |
| Place not found (empty result) | `not-found`, naming the start or destination |
| OSRM `NoRoute` for every profile | `no-route` (a single missing profile is just shown as "no route found") |
| Response that is not JSON or has the wrong shape or values | `malformed` |
| Empty input, input over 200 characters, or the same place twice | `invalid-input` |

Emission factors still come from the illustrative table in `src/features/tracking/emissionFactors.ts`. An emission-factor API (for example Climatiq or Carbon Interface) would need a secret key, and therefore a server function on the Blaze plan, so it is not included.

---

## Internationalization

The whole interface is available in three languages:

| Locale | Language | Notes |
|---|---|---|
| `en` | English | Source language and fallback |
| `hr` | Croatian (Hrvatski) | Three plural forms (one / few / other) |
| `de` | German (Deutsch) | Third project language |

Everything people see is translated: navigation, the home page, Compare, Saved comparisons, Carbon goals, Carbon tracking, Account and sign-in, Settings, buttons, labels and hints, validation messages, confirmation dialogs, loading, empty, error and offline messages, database, sign-in and map-service errors, and the labels and live announcements used by screen readers. User-entered data (notes, place names, comparison names) and technical identifiers are not translated.

### How it works

The localization system is a small, typed module in `src/i18n` (no extra library):

| File | Purpose |
|---|---|
| `locales/en/*.ts` | English messages, split by area: `common` (shell, errors, auth, account, map lookup, home), `compare`, `goals`, `tracking` |
| `locales/hr/*.ts`, `locales/de/*.ts` | Croatian and German messages with exactly the same keys. Each file is typed as `MessageShape<typeof en…>`, so **a missing or extra key is a TypeScript error** and `npm run build` fails |
| `translate.ts` | Looks up a key, fills in `{placeholders}` (numbers are formatted for the language) and chooses plural forms with `Intl.PluralRules` |
| `localeStore.ts` | Current language: reads the saved choice, falls back to the browser language, saves changes and keeps `<html lang>` in sync |
| `format.ts` | `Intl` formatters for numbers, kg CO₂e, percentages, euro amounts, dates, months and durations |
| `index.ts` | `useI18n()` for components and `t()` / `format()` for code outside React |
| `RichText.tsx` | Puts elements (for example `<strong>` or links) into a translated sentence, so word order can differ between languages |

In a component:

```tsx
const { t, format } = useI18n()
t('nav.compare')                               // "Compare journeys" / "Usporedba putovanja" / "Wege vergleichen"
t('tracking.activityCount', { count: 3 })      // "3 activities" / "3 aktivnosti" / "3 Aktivitäten"
format.currency(3.2)                           // "€3.20" / "3,20 €" / "3,20 €"
```

Plural messages are objects with `Intl.PluralRules` categories, for example `{ one: '{count} aktivnost', few: '{count} aktivnosti', other: '{count} aktivnosti' }`. Croatian always needs `one`, `few` and `other`; English and German need `one` and `other`.

**Switching languages** updates the interface immediately without a reload: `App` reads the language, so the whole page re-renders and keeps what the user has typed. Errors and validation messages are stored as codes or keys, not as text, so they also change language.

**Errors from the services** keep their stable codes from PR #7 (`DataError`, `AuthError`, `RouteError`). `dataErrorText()` in `src/lib/errorMessages.ts`, `authErrorText()` and `routeErrorMessage()` turn a code into text in the current language. The English defaults in `errorMessages.ts` are still used as `Error.message` for logs and tests.

### Choosing and remembering the language

- The language selector is at the bottom of the sidebar (desktop), in the menu (mobile) and on the Settings page. Each language is written in its own language and marked with its `lang`.
- The choice is saved in this browser's `localStorage` (`carbon-choices.locale`) and used on every later visit.
- With no saved choice, the first supported browser language (`navigator.languages`, e.g. `hr-HR` → Croatian) is used; otherwise English.
- `<html lang>` and the page title always follow the selected language, and the change is announced to screen readers in the new language.
- **Signed in:** the language is also saved in the user's profile (`users/{uid}.locale`, `src/features/account/localePreference.ts`). On sign-in, a language saved in the profile is applied; a profile without one gets the language currently in use, so nothing the user chose is overwritten. Every later change in the selector is saved to the profile too, so the language follows the user to other devices. Signed-out visitors keep using the per-browser choice. If the profile cannot be reached, the per-browser choice still works.
- Croatian month names are inflected where the sentence needs it (genitive: *do travnja 2027.*, *od studenoga 2026. do travnja 2027.*). `formatMonthGenitive()` in `src/features/goals/format.ts` takes the genitive form from `Intl.DateTimeFormat`. Sentences that would need the locative case were rephrased.
- Lists sorted by text (for example sources with equal emissions on the Tracking breakdown) use `Intl.Collator` for the current language.

### Adding or changing translations

1. Find the key in `src/i18n/locales/en/<area>.ts` (for example `goals.setup.title`).
2. Change the text in `en`, `hr` and `de`. Keep every `{placeholder}` in all three languages.
3. For a new text: add the key to `en`, use it with `t('area.key')`, then add it to `hr` and `de`. TypeScript reports where it is missing.
4. Run `npm test`: `src/i18n/i18n.test.ts` checks that all languages have the same keys and placeholders, that no text is empty and that Croatian has all three plural forms. `src/test/accessibility.test.tsx` renders the main screens in Croatian and German and fails if a key is missing at run time.

### Adding a new language

1. Add the code to `Locale` in `src/i18n/types.ts` and to `SUPPORTED_LOCALES` in `src/i18n/localeStore.ts`.
2. Copy `src/i18n/locales/de` to a new folder (for example `locales/it`), translate every file and rename the exported constant in its `index.ts`.
3. Register it in `src/i18n/locales/index.ts` and add its name to `language.names` in all locales.
4. Check the plural categories of the language (`new Intl.PluralRules('it').resolvedOptions().pluralCategories`) and provide each one.
5. Run `npm run build` and `npm test`.

---

## Accessibility

The project targets **WCAG 2.2 level AA**, as required by the course brief.

### Already implemented in the shared foundation

- Semantic HTML landmarks: `header`, `nav` (labelled "Main"), `main`, `aside`, `footer`, and section headings in order.
- A "Skip to main content" link as the first focusable element.
- Full keyboard navigation with a visible focus outline.
- The mobile menu button has an accessible name and `aria-expanded` / `aria-controls`; <kbd>Esc</kbd> closes the menu and returns focus to the button.
- The current page is marked with `aria-current="page"` and is indicated by more than colour alone (a bar beside the active link).
- After navigation, focus moves to the new page's main heading and the document title is updated.
- Decorative icons are hidden from assistive technology (`aria-hidden="true"`).
- Interactive targets are at least 44 × 44 px.
- Responsive layout down to a 320 px viewport without horizontal scrolling.
- `prefers-reduced-motion` is respected.
- Text colours were chosen to meet the 4.5:1 contrast ratio.

### In the Goals feature

- Form controls have visible labels; radio groups use `fieldset` and `legend`.
- The budget setup and budget adjustment forms show errors next to the field, link them with `aria-describedby` and set `aria-invalid`; the adjustment form moves focus to the first invalid field.
- Results that change while the user works (allocation total, adjustment confirmation, priority reordering, ideas added, loading) are announced through `role="status"` live regions; problems (allocation not 100%, Tracking data that cannot be read) use `role="alert"`.
- Progress bars use `role="progressbar"` with a text value; status badges use a symbol and text, not colour alone.
- The current step is marked with `aria-current="step"`, and focus moves to the new step when the step changes.
- Checked in the browser at 320 px, 375 px, 768 px and 1024 px wide with no horizontal page scrolling; on narrow screens the monthly table hides the per-category columns and the same values are listed below it.
- A script check on every step found no unlabelled form controls, buttons without a name, duplicate ids, broken `aria-describedby`/`aria-labelledby` references or skipped heading levels. This is not a full WCAG audit: there has been no screen reader test and contrast was not measured with a tool.

### In the Tracking feature

- Every form control has a visible `<label>`; hints and errors are linked with `aria-describedby`, invalid fields get `aria-invalid`, and on submit focus moves to the first invalid field with an error summary announced as an alert.
- The live emissions estimate, history result count and "saved/deleted" confirmations are announced through `role="status"` live regions.
- Delete confirmation uses the native `<dialog>` element: focus starts on Cancel, <kbd>Esc</kbd> cancels, and focus returns to the Delete button.
- When the user moves between tracking screens, focus moves to the new screen's heading.
- Categories are shown with an icon and text, never colour alone; bars use `role="progressbar"` with a text value; the breakdown table has a caption and column/row headers.
- Checked in the browser at 320 px, 768 px and 1024 px wide with no horizontal scrolling.

### In the Compare feature

- Transport options are real checkboxes and priorities are radio groups, each inside a `fieldset` with a `legend`; selection is shown with a tick or filled border, not colour alone.
- Journey and save forms have visible labels, hints and errors linked with `aria-describedby`, `aria-invalid` on invalid fields, an error summary announced as an alert, and focus moved to the first invalid field.
- The current setup step uses `aria-current="step"` and the current result tab `aria-current="page"` (with an underline); focus moves to the new screen's heading when the screen changes, and confirmations are announced through a `role="status"` live region.
- Bars have a text alternative with the value; tables have captions and row/column headers; transport options are always shown with an icon and a name.
- Deleting a saved comparison uses the native `<dialog>` with focus on Cancel and <kbd>Esc</kbd> to cancel.
- Checked in the browser at 320 px, 375 px and about 1000 px wide with no horizontal page scrolling (wide tables scroll inside their own box).

### Localization, accessibility and UI states (whole app)

- The language selector is a labelled native `<select>`; each option is marked with its own `lang`, and the change is announced in a `role="status"` region. `<html lang>` follows the selected language.
- Every form in the app marks required fields in the label ("required" / "obavezno" / "Pflichtfeld") and with `required`; errors are linked to their fields with `aria-describedby` and `aria-invalid`, and form errors are announced with `role="alert"`.
- Confirmation dialogs (Tracking, Compare, Goals) use the native `<dialog>`: focus starts on Cancel, <kbd>Esc</kbd> cancels (but not while a delete is running), and each dialog now has its own ids, so two dialogs never share labels.
- Links that open in a new tab (map credits) say so to screen readers.
- An app-wide connection notice (`role="status"`) says when the browser goes offline and when it is back online.
- Loading, saving and errors are announced through live regions; save buttons are disabled while saving and repeated clicks are ignored.

### Accessibility testing performed

| Check | How | Result |
|---|---|---|
| Automated rules | `axe-core` on 27 rendered screens (app shell, home, settings, not found, sign-in and registration, all Tracking forms and states, all ten Goals screens, all Compare screens) in `src/test/accessibility.test.tsx` | No violations (colour contrast is excluded there because jsdom cannot compute colours; see the next row) |
| Contrast | `src/styles/styles.test.ts` computes WCAG contrast ratios from the design tokens. In addition, axe-core 4.14 was run **in a real browser** (Chrome) on every page and all five Goals steps on 2026-11-12 | The browser run first found one failure: the hint text in the highlighted Goals stat measured **4.34:1** (`#66726a` on `#e6f1ea`, 12 px). Fixed by using the muted text colour, which measures **6.06:1**. After the fix the browser run reports 0 violations |
| Keyboard | Tests: skip link is the first focusable element and moves focus to the main content; the menu button has a name and `aria-expanded`, <kbd>Esc</kbd> closes the menu and returns focus; dialogs focus Cancel and cancel with <kbd>Esc</kbd>; the first invalid field receives focus | Pass |
| Focus visible and reduced motion | `styles.test.ts` checks the 2 px `:focus-visible` outline, that no stylesheet removes it, and the `prefers-reduced-motion` rules | Pass |
| Touch targets | Reviewed in CSS: buttons, links styled as buttons, tabs, steps and the menu button are at least 44 × 44 px | Pass (manual review) |
| 320 px and long text | In the browser at 320 px, every page and the whole Compare flow in English, Croatian and German | No horizontal scrolling (wide tables scroll inside their own box) |
| 200% zoom | Simulated with a 640 px wide viewport (a 1280 px window at 200%), all pages in English, Croatian and German | No horizontal scrolling or clipped text. Real browser zoom (⌘ + / Ctrl +) still to be confirmed by a team member |
| Keyboard-only task | In a real browser, the whole Compare journey was completed using only Tab, Space, the arrow keys and Enter; the delete dialog was opened and closed with Enter and Esc | Pass: the 2 px focus outline was visible on every control; focus returned to the Delete button after Esc |

### Known accessibility limitations

- The ten-minute accessibility check (brief Section 7.3) is recorded in the Deliverable 2 report (`docs/Team02_UX_Deliverable2.pdf`, Part B §7). Checks 1–8 and 10 were performed in a real browser on 2026-11-12. **Check 9, the screen reader walkthrough, is pending** until a team member completes it with VoiceOver or NVDA.
- Colour contrast was measured with axe-core in the browser, not with a separate colour-picker tool on disabled and placeholder states.
- 200% zoom was simulated with a 640 px viewport; real browser zoom has not been confirmed on every page.
- `prefers-reduced-motion` is handled in CSS (the spinners stop) but was only checked in the stylesheet, not with the operating-system setting turned on.
- Component tests run in jsdom, which does not do layout; the `<dialog>` focus trap itself is provided by the browser and was not tested there.
- The app has not had a full WCAG 2.2 AA audit, so it does not claim full conformance.

---

## Testing

| Command | What it runs | Needs |
|---|---|---|
| `npm test` | 166 tests (11 files). Unit tests: the route service (success, empty result, malformed responses, network failure, timeout, HTTP 429/5xx/401/400, NoRoute, caching with expiry, throttling), data error mapping and timeouts, credential validation, shared emission factors in Compare and Tracking, and import ids. Localization: same keys and placeholders in all languages, Croatian plurals, `Intl` formatting, saved language and `<html lang>`. Component tests (jsdom): axe-core on 27 screens, every screen rendered in Croatian and German without missing keys, language switching, keyboard and dialog behaviour, loading/empty/error/offline states. CSS checks: focus outline, reduced motion, contrast | Nothing |
| `npm run test:emulator` | 20 tests against the Auth and Firestore emulators with the real `firestore.rules`: 10 rules tests (owners can read and write their data; other users and signed-out visitors cannot read, list, write or delete; invalid activities, comparisons, plans and profiles are rejected; `createdAt` is fixed; saved comparisons cannot be edited) plus 1 for the profile `locale` field; and 9 tests of the app's own auth service and repositories, including Croatian, Cyrillic and Arabic text stored and read back, and the profile language preference (register, profile document, sign out, wrong password, duplicate email, sign in; activity create/read/update/list/delete, persistence seen from a second client, live updates, access to another user's data refused; comparison save/list/get/delete; plan create/update/load/delete keeping `createdAt`; import twice without duplicates) | Java 21+ (firebase-tools 15 refuses older Java), and network access the first time to download the emulators |

The emulators use the demo project id `demo-carbon-choices`, so `npm test` and `npm run test:emulator` never touch the real database. Only `npm run test:live` uses the real project. It needs `.env.local`, creates two accounts named `carbon-choices-test-…@example.com`, and deletes them and all their records at the end. It does not read or change anyone else's data.

**Running the app against the emulators** (no real Firebase project needed):

```bash
npm run emulators
```

In a second terminal:

```bash
VITE_FIREBASE_USE_EMULATOR=true npm run dev
```

---

## Development Workflow

- `main` is the protected branch. Nobody pushes directly to `main`.
- Each developer works on a feature branch with a descriptive name, for example `feature/compare-journeys` or `fix/mobile-menu-focus`.
- Changes are submitted to `main` through a Pull Request.
- At least one other team member reviews a Pull Request before it is merged.
- Commit messages are written in the imperative and describe the change, for example `feat: add journey comparison form`.

### Example: working on a feature

These commands are examples only.

Update your local `main`:

```bash
git checkout main
```

```bash
git pull origin main
```

Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

Commit your work:

```bash
git add .
```

```bash
git commit -m "feat: describe your change"
```

Push the branch to GitHub:

```bash
git push -u origin feature/your-feature-name
```

Then open a Pull Request on GitHub against `main` and request a review from a teammate.

---

## Current Development Status

| Area | Status |
|---|---|
| Project setup (React, TypeScript, Vite, ESLint) | ✅ Done |
| Shared frontend foundation: layout, navigation, home dashboard, reusable components, design tokens | ✅ Done (merged into `main` through Pull Request #1) |
| Compare Everyday Choices | ✅ All ten screens work (Pull Request #4); saved comparisons are stored in Firestore; distances can be looked up with OpenStreetMap; figures use illustrative factors and assumptions |
| Carbon Reduction Goals & Recommendations | ✅ All ten screens work and use Carbon tracking data (baseline, progress) and its emission factors; the plan is saved in Firestore automatically; sample values only when nothing is tracked |
| Personal Carbon Tracking | ✅ All ten screens work (Pull Requests #3 and #6), with full create/read/update/delete in Firestore and live updates; emissions use illustrative factors |
| Authentication (email and password) | ✅ Firebase Authentication |
| Database | ✅ Cloud Firestore with Security Rules, deployed to `personal-carbon-tradeoff` and verified with `npm run test:live` |
| External REST API | ✅ OpenStreetMap Nominatim + OSRM for journey distances |
| Internationalization (en, hr, de) | ✅ Whole interface, plurals, `Intl` formatting, saved language choice |
| Accessibility | 🚧 Improvements and automated checks done (axe-core, keyboard, contrast, 320 px, simulated 200% zoom); screen reader walkthrough and the course's accessibility check still to do |
| Loading, empty, error and offline states | ✅ In every feature, with translated messages and retry |
| Automated tests | ✅ Vitest unit, localization and component tests (jsdom) and emulator tests for rules and repositories; no end-to-end browser tests |

---

## Known Limitations

- Settings only offers the language choice so far.
- Compare uses one distance for all options (typed, or chosen from the OpenStreetMap lookup) and illustrative cost, speed and waiting-time assumptions, not real fares, timetables or traffic. Car costs leave out purchase, insurance and maintenance.
- The distance lookup uses free public OpenStreetMap services with no uptime guarantee and a one-request-per-second limit. It looks up one place per field (the best match), so an ambiguous name can find the wrong place; the found names are shown so the user can check.
- The comparison in progress and the screen within Compare journeys are not part of the URL, so reloading or leaving the page returns to the start screen (saved comparisons can be reopened).
- Carbon tracking emission estimates use illustrative factors, not a verified dataset or API.
- The screen within Carbon tracking (for example an activity's details) is not part of the URL, so reloading returns to the dashboard and the browser Back button leaves the feature.
- Carbon goals shows a labelled sample starting point and sample month until the user records activities in Carbon tracking. A baseline taken from Carbon tracking is a snapshot: choose "From Carbon tracking" again to refresh it.
- The reduction ideas in Carbon goals are fixed examples written for the prototype. Their savings use example amounts and illustrative emission factors, not the user's own habits, and they are not personalised advice.
- Carbon goals uses only the three Tracking categories (transport, food, home energy); goods and shopping are not covered.
- Each user has one carbon plan; there is no history of earlier plans other than the adjustment list.
- The step within Carbon goals is not part of the URL, so reloading returns to step 1.
- All emissions, cost and travel-time figures are illustrative estimates; only the route distances come from an external service.
- Changes to `firestore.rules` take effect only after `npm run deploy:rules` (needs a Firebase login with access to the project).
- No email verification, password reset or account deletion in the app.
- Offline use is limited: Firestore keeps its cache in memory only, so a page reload while offline shows "The database cannot be reached". Writes made while the connection drops are queued by Firestore, but the app reports a timeout after 15 s if the server has not confirmed them.
- The production bundle is about 1.1 MB (325 kB gzipped), mainly the Firebase SDK and the messages for all three languages; it is not split by page or language yet.
- The language choice is saved per browser and, when signed in, in the user's profile. Data that users type (notes, place names, comparison names) is shown as entered, not translated. OpenStreetMap place names come back in the browser's language (Nominatim uses the browser's `Accept-Language` header), not necessarily the language chosen in the app.
- Localization uses a small custom module (`src/i18n`) instead of an established i18n library. This deviates from brief §2.1, which recommends a library, and the decision is explained in the report (Part B §6.2).
- The Croatian and German translations were written for this project and have not yet been reviewed by a native speaker outside the team.
- Routing is hash-based (`#/compare`), so URLs contain a `#`.
- There are component tests in jsdom but no end-to-end tests in a real browser; the screens were also checked by hand.
- No dark mode.
- The font falls back to the system font; Inter is used only if it is already installed on the device.
- The accessibility items listed under [Known accessibility limitations](#known-accessibility-limitations) are still open.
- No license file has been added to the repository.

## Third-party libraries and attribution

The application uses these open-source libraries; their licences are in `node_modules/<package>/LICENSE`:

- [React](https://react.dev/) and React DOM (MIT): user interface.
- [Firebase JavaScript SDK](https://firebase.google.com/docs/web/setup) (Apache-2.0): Authentication and Cloud Firestore.
- [Vite](https://vite.dev/) and @vitejs/plugin-react (MIT): development server and build.
- [TypeScript](https://www.typescriptlang.org/) (Apache-2.0), [ESLint](https://eslint.org/) and typescript-eslint (MIT): type checking and linting.
- Testing: [Vitest](https://vitest.dev/) (MIT), [@firebase/rules-unit-testing](https://firebase.google.com/docs/rules/unit-tests) and [firebase-tools](https://github.com/firebase/firebase-tools) (Apache-2.0 / MIT), [jsdom](https://github.com/jsdom/jsdom) and [Testing Library](https://testing-library.com/) (MIT), [axe-core](https://github.com/dequelabs/axe-core) (MPL-2.0).

External data: place search by [Nominatim](https://nominatim.org/) and routes by [OSRM](https://project-osrm.org/) on the FOSSGIS servers. Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the Open Database License; the app shows this credit wherever the data appears.

Emission factors, costs and speeds in `src/features/tracking/emissionFactors.ts` and `src/features/compare/transportOptions.ts` are illustrative values written for this project, not copied from a dataset.

AI assistance (Claude Code) was used during development; the declaration is in the Deliverable 2 report, Part B §12.
