# Carbon Choices

Carbon Choices is a mobile-first web application that helps people understand and manage the environmental impact of their everyday decisions. It brings three feature areas together in one product: comparing everyday choices, setting carbon reduction goals and tracking personal carbon emissions. It implements the **Personal Carbon Trade-Offs** topic for **ISTE.260 – Designing the User Experience**, Deliverable 2.

> **Status:** early development. The shared frontend shell is in place; the three feature areas, the database, the external API integration and localisation are not implemented yet. See [Current Development Status](#current-development-status).

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

Compare transportation alternatives for the same journey based on:

- CO₂ emissions
- financial cost
- travel time

| Functionality | Status |
|---|---|
| Navigation entry and placeholder page (`#/compare`) | ✅ |
| Entering a journey | 📋 |
| Side-by-side comparison of transport options (CO₂, cost, time) | 📋 |
| Saving comparisons and viewing saved comparisons | 📋 (placeholder page at `#/saved`) |

### 2. Carbon Reduction Goals & Recommendations — *Martin Mudrinic*

| Functionality | Status |
|---|---|
| Setting carbon reduction goals | 📋 |
| Managing a carbon budget | 📋 |
| Allocating the budget across categories | 📋 |
| Monitoring progress towards goals | 📋 |
| Recommendations for reducing emissions | 📋 |

### 3. Personal Carbon Tracking — *Lazar Jovovic*

| Functionality | Status |
|---|---|
| Recording everyday activities (transportation, food, home energy) | 📋 |
| Calculating and tracking the emissions of recorded activities | 📋 |
| Viewing tracked emissions over time | 📋 |

### Shared application foundation

| Functionality | Status |
|---|---|
| Application shell: sidebar on desktop, hamburger menu on mobile | ✅ |
| Home dashboard with introduction, three information cards and "How it works" | ✅ |
| Placeholder pages for Compare journeys, Saved comparisons and Settings, and a "Page not found" page | ✅ |
| Reusable UI components and design tokens | ✅ |
| Navigation entries for Goals and Tracking | 📋 Not added yet |
| Settings (including language selection) | 📋 (placeholder page at `#/settings`) |

> Navigation currently contains Home, Compare journeys, Saved comparisons and Settings. Entries for the Goals and Tracking feature areas will be added when those areas are implemented.

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

- There is **no router library**. Navigation uses a small hash-based router in `src/hooks/useHashRoute.ts` (routes: `#/`, `#/compare`, `#/saved`, `#/settings`).
- There is **no backend, database, i18n library or test framework** installed yet.

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
│   ├── hooks/
│   │   └── useHashRoute.ts    # Minimal hash-based routing
│   ├── layouts/
│   │   └── AppLayout.tsx      # App shell: skip link, navigation, main area, footer
│   ├── pages/                 # One component per screen
│   │   ├── HomePage.tsx
│   │   ├── ComparePage.tsx    #   Placeholder
│   │   ├── SavedPage.tsx      #   Placeholder
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

**Current state:** no database has been chosen or implemented. The application stores no data.

When the database is implemented, this section will document:

- the chosen database engine and the reason for choosing it;
- how to create the database;
- how to run migrations (the schema will be kept in the repository);
- how to load seed data for reviewers.

---

## External API

Deliverable 2 requires integration with at least one external REST API whose data is genuinely related to the topic and does real work in the product (for example, providing emission factors, exchange rates or location data), not only decorative content. The integration must handle failure states such as network errors, timeouts, rate limits and empty results, and API keys must be kept out of client-side code.

**Current state:** no external API has been selected or connected. All content currently shown in the application is static placeholder text, and no emissions, cost or travel-time values are calculated.

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

**Current state: localization is not implemented.** The interface is English only, strings are currently written directly in components and in `src/data/homeContent.ts`, no i18n library is installed, and there is no language switcher. `index.html` sets `lang="en"`.

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

### Not done yet

- The course's ten-minute accessibility check (Section 7.3 of the brief) has not been performed.
- No automated accessibility scan or screen reader walkthrough has been recorded.
- Contrast ratios have not been formally measured with a checking tool.
- 200% zoom has not been tested.
- Forms, error messages and live regions do not exist yet, so they have not been tested.

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
| Shared frontend foundation: layout, navigation, home dashboard, reusable components, design tokens | ✅ Done (on branch `feature/frontend-setup`, not yet merged into `main`) |
| Compare Everyday Choices | 📋 Planned — placeholder page only |
| Carbon Reduction Goals & Recommendations | 📋 Planned — not started in code |
| Personal Carbon Tracking | 📋 Planned — not started in code |
| Database | 📋 Planned |
| External REST API | 📋 Planned |
| Internationalization (en, hr, third locale) | 📋 Planned |
| Accessibility testing and report | 📋 Planned |
| Automated tests | 📋 Planned |

---

## Known Limitations

- None of the three feature areas is functional yet; Compare journeys, Saved comparisons and Settings show "not available yet" pages.
- There are no navigation entries or pages for Carbon Reduction Goals or Personal Carbon Tracking.
- No data is stored, and nothing persists between sessions.
- No external API is connected; the app shows no real emissions, cost or travel-time data.
- The interface is English only, and user-visible strings are not externalised.
- Routing is hash-based (`#/compare`), so URLs contain a `#`.
- There are no automated tests.
- No dark mode.
- The font falls back to the system font; Inter is used only if it is already installed on the device.
- The accessibility items listed under [Not done yet](#not-done-yet) have not been verified.
- No license file has been added to the repository.
