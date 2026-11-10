# Carbon Choices

Carbon Choices is a mobile-first web application that helps people understand and manage the environmental impact of their everyday decisions. It brings three feature areas together in one product: comparing everyday choices, setting carbon reduction goals and tracking personal carbon emissions. It implements the **Personal Carbon Trade-Offs** topic for **ISTE.260 – Designing the User Experience**, Deliverable 2.

> **Status:** early development. All three feature areas are integrated in one app. Compare Everyday Choices and Personal Carbon Tracking work with illustrative estimates and data stored temporarily in the browser; Carbon Reduction Goals & Recommendations works with temporary sample data. The database, the external API integration and localisation are not implemented yet. See [Current Development Status](#current-development-status).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Team Members](#team-members)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [External API](#external-api)
- [Internationalization](#internationalization)
- [Accessibility](#accessibility)
- [Development Workflow](#development-workflow)
- [Current Development Status](#current-development-status)
- [Known Limitations](#known-limitations)

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
| Saving a comparison (name, date, options, journey, priorities, results and recommendation), listing, reopening and deleting with confirmation | ✅ Stored in this browser's `localStorage` |
| Loading, empty, success and error states | ✅ |
| Saving comparisons in the project database | 📋 Planned — see [Database](#database) |
| Real routes, distances, fares or travel times from an external API | 📋 Planned — the user enters the distance; nothing is looked up |

> **How the comparison is calculated** (`src/features/compare/calculate.ts` and `transportOptions.ts`). All results are **per person**:
>
> - **CO₂ (kg CO₂e)** = distance × emission factor ÷ people in the car (car and electric car only). The emission factors are reused from Personal Carbon Tracking (`src/features/tracking/emissionFactors.ts`), so both features give the same answer for the same trip.
> - **Cost (EUR)** = fixed cost + distance × cost per km, shared by people in the car for cars. Public transport is one ticket each. Car costs include fuel or charging and parking only, not purchase, insurance or maintenance.
> - **Travel time (min)** = distance ÷ average speed × 60 + fixed overhead (walking to a stop and waiting, locking a bike, parking).
> - **Scores:** for each criterion, best option = 100%, worst = 0%, others in between. **Overall match** = Σ(priority × score) ÷ Σ(priority). The highest overall match is recommended; ties go to lower emissions, then shorter time.
>
> Cost, speed and overhead values are **illustrative assumptions** chosen to show trade-offs, not verified fares, timetables or traffic data. Every screen with figures labels them as estimates, and the breakdown screen lists each assumption.

### 2. Carbon Reduction Goals & Recommendations — *Martin Mudrinic*

Helps users turn "I want to lower my emissions" into a plan they can follow. The user sets a monthly carbon budget with a reduction goal and timeframe, shares that budget across categories (transport, food, home energy, goods & shopping), ranks the trade-offs that matter to them (emissions, cost, time, comfort) and gets reduction ideas ordered by those priorities. During the month they can see their progress against the budget, move budget between categories when needed and review a summary of the whole plan.

The feature is at `#/goals` ("Carbon goals" in the navigation). It groups the ten screens from Martin's Deliverable 1 sketches into five steps:

| Step | Deliverable 1 screens |
|---|---|
| 1. Set up | Carbon budget setup · Personal carbon budget |
| 2. Allocate | Budget allocation by category · Trade-off priorities |
| 3. Plan | Monthly carbon plan · Reduction opportunities |
| 4. Track | Goal progress · Budget adjustment · Budget adjustment details |
| 5. Summary | Carbon budget summary |

| Functionality | Status |
|---|---|
| Setting a reduction goal (10–30%), timeframe (3, 6 or 12 months) and start month | ✅ Interactive, sample baseline |
| Personal monthly carbon budget derived from the goal | ✅ Interactive, sample baseline |
| Allocating the budget across four categories, with a check that it adds up to 100% | ✅ |
| Ranking trade-off priorities (emissions, cost, time, comfort) | ✅ |
| Monthly plan that steps the budget down evenly over the timeframe | ✅ |
| Reduction opportunities ordered by the user's priorities, with category filter and "Add to plan" | ✅ Sample recommendations |
| Goal progress for the current month, overall and per category | ✅ Sample usage data |
| Budget adjustment between categories, with validation and an optional reason | ✅ |
| Budget adjustment details (before/after allocation for each adjustment) | ✅ |
| Carbon budget summary | ✅ |
| Saving plans and adjustments (create, read, update, delete in the database) | 📋 Planned — the plan is kept in memory and is lost on reload |
| Real baseline and progress from Personal Carbon Tracking | 📋 Planned |
| Emission savings for recommendations from an external API | 📋 Planned |

> **Sample data:** every emission figure in this feature (current monthly emissions, emissions used so far this month, and the saving for each recommendation) is a placeholder defined in `src/features/goals/sampleData.ts` and labelled "Sample data" in the interface. The feature only does budget arithmetic on these numbers (percentages, sums, monthly targets); it does not calculate emissions.

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
| Saving activities in the project database | 📋 Planned — activities are kept in this browser's `localStorage` for now (see [Database](#database)) |
| Emission factors from an external API or verified dataset | 📋 Planned — illustrative factors for now (see below) |
| Sharing tracked emissions with Carbon goals as the real baseline | 📋 Planned |

> **How emissions are estimated:** every result is calculated in `src/features/tracking/emissionFactors.ts` with one method: transport = distance × factor ÷ people in the vehicle (cars and motorbikes only), food = servings × factor, home energy = kWh × factor ÷ household size. The factors are **illustrative** rounded averages, not values from a verified dataset, and the interface labels every result as an estimate. They are meant to be replaced by an emission-factor API or dataset.

### Shared application foundation

| Functionality | Status |
|---|---|
| Application shell: sidebar on desktop, hamburger menu on mobile | ✅ |
| Home dashboard with introduction, three information cards and "How it works" | ✅ |
| Placeholder page for Settings, and a "Page not found" page | ✅ |
| Reusable UI components and design tokens | ✅ |
| Navigation entry for Goals (`#/goals`) | ✅ |
| Navigation entry for Tracking (`#/tracking`) | ✅ |
| Settings (including language selection) | 📋 (placeholder page at `#/settings`) |

> Navigation currently contains Home, Compare journeys, Saved comparisons, Carbon goals, Carbon tracking and Settings.

---

## Team Members

| Name | GitHub | Feature area |
|---|---|---|
| Faraj Aliyev | [@fa6375](https://github.com/fa6375) | Compare Everyday Choices |
| Martin Mudrinic | _to be added_ | Carbon Reduction Goals & Recommendations |
| Lazar Jovovic | _to be added_ | Personal Carbon Tracking |

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

Notes:

- There is **no router library**. Navigation uses a small hash-based router in `src/hooks/useHashRoute.ts` (routes: `#/`, `#/compare`, `#/saved`, `#/goals`, `#/tracking`, `#/settings`).
- There is **no backend, database, i18n library or test framework** installed yet.
- Personal Carbon Tracking and Compare Everyday Choices added **no new dependencies**.
- The router ignores a query part in the hash, so `#/compare?saved=<id>` opens the Compare page with a saved comparison (used by Saved comparisons). The address is reset to `#/compare` once it has opened.

### Prerequisites

| Tool | Version |
|---|---|
| [Node.js](https://nodejs.org/) | `^20.19.0` or `>=22.12.0` (required by Vite 8) |
| npm | Included with Node.js (developed with npm 10.8.2) |
| Git | Any recent version |

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
│   │   ├── Logo.tsx
│   │   ├── MobileHeader.tsx   #   Top bar + hamburger menu (below 960px)
│   │   ├── NavList.tsx        #   Navigation links shared by sidebar and mobile menu
│   │   ├── PageHeader.tsx
│   │   ├── SectionHeading.tsx
│   │   └── Sidebar.tsx        #   Desktop navigation (960px and wider)
│   ├── data/                  # Static content and configuration
│   │   ├── homeContent.ts     #   Text for the home dashboard
│   │   └── navigation.ts      #   Navigation items and route mapping
│   ├── features/              # Feature-specific code, one folder per feature area
│   │   └── compare/           #   Compare Everyday Choices (Faraj)
│   │       ├── components/    #     One component per screen, plus CompareUi.tsx, ModePicker.tsx, PriorityFields.tsx
│   │       ├── calculate.ts   #     CO₂/cost/time estimates, scoring and recommendation
│   │       ├── transportOptions.ts # ILLUSTRATIVE cost, speed and overhead per option (CO₂ factors from tracking)
│   │       ├── criteria.ts    #     The three criteria and priority levels
│   │       ├── comparisonRepository.ts # Saved comparisons (TEMPORARY localStorage implementation)
│   │       ├── useSavedComparisons.ts # Loading/error state and delete for the saved list
│   │       ├── validation.ts  #     Journey form values and validation
│   │       ├── format.ts      #     kg CO₂e, EUR, duration, date and plural formatting (Intl, English)
│   │       ├── types.ts       #     TypeScript types for the feature
│   │       └── compare.css    #     Styles for the feature
│   │   └── goals/             #   Carbon Reduction Goals & Recommendations (Martin)
│   │       ├── components/    #     One component per screen, plus GoalsUi.tsx building blocks
│   │       ├── budget.ts      #     Budget arithmetic (shares, monthly targets, ranking)
│   │       ├── format.ts      #     kg CO₂e and month formatting
│   │       ├── goalPlanReducer.ts # In-memory plan state (useReducer)
│   │       ├── sampleData.ts  #     TEMPORARY sample data, clearly marked
│   │       ├── stages.ts      #     The five steps and the screens they contain
│   │       ├── types.ts       #     TypeScript types for the feature
│   │       └── goals.css      #     Styles for the feature
│   │   └── tracking/          #   Personal Carbon Tracking (Lazar)
│   │       ├── components/    #     One component per screen, plus TrackingUi.tsx building blocks
│   │       ├── activityRepository.ts # Data-access layer (TEMPORARY localStorage implementation)
│   │       ├── useActivities.ts #   Loading/error state and create/update/delete for screens
│   │       ├── emissionFactors.ts # ILLUSTRATIVE emission factors and the calculation method
│   │       ├── stats.ts       #     Totals, periods and groupings for dashboard/breakdown
│   │       ├── validation.ts  #     Form values, validation and conversion to activities
│   │       ├── format.ts      #     kg CO₂e, date and plural formatting (Intl, English)
│   │       ├── categoryIcons.ts #   Icon for each activity category
│   │       ├── types.ts       #     TypeScript types for the feature
│   │       └── tracking.css   #     Styles for the feature
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

### 3. Start the development server

```bash
npm run dev
```

Vite prints the local address, by default <http://localhost:5173>.

### 4. Build for production

```bash
npm run build
```

This type-checks the project (`tsc -b`) and writes the production build to `dist/`. To preview the build locally:

```bash
npm run preview
```

### 5. Run ESLint

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

---

## Environment Variables

**No environment variables are required at the moment.** The application currently runs entirely in the browser and does not connect to any backend, database or external service.

Environment variables will be needed once the backend, database and external API are integrated (for example, a database connection string or an API key). When that happens:

- they will be documented in this section;
- a `.env.example` file with empty values will be committed;
- real values will only be kept in local `.env` files, which are excluded from Git (`*.local` is already listed in `.gitignore`; the `.env` pattern will be added when needed).

API keys, passwords, tokens and other secrets must **never** be committed to the repository.

---

## Database

Persistent storage in the application's own database is a requirement of Deliverable 2: data created by the user must survive a restart, and the main entities must support create, read, update and delete from the interface.

**Current state:** no database has been chosen or implemented. The carbon plan in the Goals feature is held in memory only and resets when the page is reloaded.

Personal Carbon Tracking reads and writes activities only through the `ActivityRepository` interface in `src/features/tracking/activityRepository.ts`. Its current implementation is a **temporary stand-in**: activities are saved in the browser's `localStorage` under the key `carbon-choices.tracking.activities.v1`. This means:

- activities survive a page reload, but only in that browser on that device;
- clearing site data deletes them, and they are not shared between users or devices;
- this does **not** meet the brief's database requirement.

Compare Everyday Choices works the same way: saved comparisons go only through the `ComparisonRepository` interface in `src/features/compare/comparisonRepository.ts`, whose current implementation stores them in `localStorage` under `carbon-choices.compare.comparisons.v1`, with the same limitations. The data model is `SavedComparison` in `src/features/compare/types.ts`: id, name, saved date, the input (options, journey and priorities) and a snapshot of the results and recommendation. The comparison currently being worked on is held in memory only.

The data model the database will need for this feature is the `Activity` type in `src/features/tracking/types.ts`: an id, a date, an optional note, created/updated timestamps, and category-specific details (transport mode, distance and people; food item and servings; or energy source, kWh and household size). When the backend exists, an API-backed `ActivityRepository` can replace the local one without changing the screens.

When the database is implemented, this section will document:

- the chosen database engine and the reason for choosing it;
- how to create the database;
- how to run migrations (the schema will be kept in the repository);
- how to load seed data for reviewers.

---

## External API

Deliverable 2 requires integration with at least one external REST API whose data is genuinely related to the topic and does real work in the product (for example, providing emission factors, exchange rates or location data), not only decorative content. The integration must handle failure states such as network errors, timeouts, rate limits and empty results, and API keys must be kept out of client-side code.

**Current state:** no external API has been selected or connected. The Goals feature shows temporary sample emission figures from `src/features/goals/sampleData.ts`. Personal Carbon Tracking calculates emission estimates from illustrative factors in `src/features/tracking/emissionFactors.ts`; an emission-factor API (for example Climatiq or Carbon Interface, both listed in the course brief) is a candidate for replacing them. Compare Everyday Choices reuses those factors and calculates cost and travel time from illustrative assumptions in `src/features/compare/transportOptions.ts`; the user enters the distance, because no route or fare service is connected.

When an API is integrated, this section will document which service is used, what it is used for, and how to obtain a key if one is required.

---

## Internationalization

The application must support at least three locales:

| Locale | Requirement |
|---|---|
| English (`en`) | Required — source language and fallback |
| Croatian (`hr`) | Required |
| Third language | Required — not chosen yet |

The brief also requires that every user-visible string is externalised, that plurals, dates, numbers and currencies use locale-aware formatting, that the HTML `lang` attribute follows the selected locale, and that the chosen locale persists across reloads.

**Current state: localization is not implemented.** The interface is English only, strings are currently written directly in components, in `src/data/homeContent.ts`, in `src/features/goals/`, `src/features/tracking/` and `src/features/compare/` (numbers, currency, dates and plurals in these features already go through `Intl` formatters in their `format.ts`, fixed to English), no i18n library is installed, and there is no language switcher. `index.html` sets `lang="en"`.

How to add a new locale will be documented here once the i18n setup is in place.

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
- The budget adjustment form shows errors next to the field, links them with `aria-describedby`, sets `aria-invalid` and moves focus to the first invalid field.
- Results that change while the user works (allocation total, adjustment confirmation, priority reordering) are announced through `role="status"` live regions.
- Progress bars use `role="progressbar"` with a text value; status badges use a symbol and text, not colour alone.
- The current step is marked with `aria-current="step"`, and focus moves to the new step when the step changes.
- Checked in the browser at 320 px, 375 px and 1280 px wide with no horizontal scrolling.

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

### Not done yet

- The course's ten-minute accessibility check (Section 7.3 of the brief) has not been performed.
- No automated accessibility scan or screen reader walkthrough has been recorded.
- Contrast ratios have not been formally measured with a checking tool.
- 200% zoom has not been tested.
- The forms, error messages and live regions in the Goals, Tracking and Compare features have not been tested with a screen reader.

Results will be recorded here and in the Deliverable 2 document as testing is carried out.

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
| Compare Everyday Choices | 🚧 In progress — all ten screens work, including saving, reopening and deleting comparisons; comparisons are stored temporarily in the browser and figures use illustrative factors and assumptions |
| Carbon Reduction Goals & Recommendations | 🚧 In progress — all ten screens are interactive (merged into `main` through Pull Request #2) with sample data; no saving yet |
| Personal Carbon Tracking | 🚧 In progress — all ten screens work (merged into `main` through Pull Request #3), with full create/read/update/delete; activities are stored temporarily in the browser and emissions use illustrative factors |
| Database | 📋 Planned |
| External REST API | 📋 Planned |
| Internationalization (en, hr, third locale) | 📋 Planned |
| Accessibility testing and report | 📋 Planned |
| Automated tests | 📋 Planned |

---

## Known Limitations

- Settings shows a "not available yet" page.
- Saved comparisons are stored in the browser's `localStorage`, not in a database: they stay on one device and are lost if site data is cleared. If that data is damaged, the app shows an error but cannot repair it; clearing site data is the only fix for now.
- Compare uses distances entered by the user and illustrative cost, speed and waiting-time assumptions, not real routes, fares, timetables or traffic. Car costs leave out purchase, insurance and maintenance.
- The comparison in progress and the screen within Compare journeys are not part of the URL, so reloading or leaving the page returns to the start screen (saved comparisons can be reopened).
- Carbon tracking stores activities in the browser's `localStorage`, not in a database: data stays on one device and is lost if site data is cleared.
- Carbon tracking emission estimates use illustrative factors, not a verified dataset or API.
- The screen within Carbon tracking (for example an activity's details) is not part of the URL, so reloading returns to the dashboard and the browser Back button leaves the feature.
- Carbon goals does not yet use the emissions recorded in Carbon tracking.
- Carbon goals works with temporary sample data only: the current emissions, this month's usage and the recommendation savings are placeholders, not measurements or calculations.
- A carbon plan in Carbon goals is not stored and resets when the page is reloaded.
- The step within Carbon goals is not part of the URL, so reloading returns to step 1.
- No external API is connected; all emissions, cost and travel-time figures are illustrative estimates, not real data.
- The interface is English only, and user-visible strings are not externalised.
- Routing is hash-based (`#/compare`), so URLs contain a `#`.
- There are no automated tests.
- No dark mode.
- The font falls back to the system font; Inter is used only if it is already installed on the device.
- The accessibility items listed under [Not done yet](#not-done-yet) have not been verified.
- No license file has been added to the repository.
