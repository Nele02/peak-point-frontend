# Peak Point – Frontend (SvelteKit)

This frontend is part of the **Peak Point** project for the _Advanced Full Stack Development_ module.  
It is the **SvelteKit implementation** of the app and covers **Level 3–5** of the assignment.

The goal of the frontend was to extend the basic CRUD application with:

- **data visualisation (maps + charts)**
- **SSR + OAuth login**
- Level 5 DevOps / testing extras like CI and unit tests

The project follows the structure and patterns from the lecture examples (especially _donation-svelte_).

---

## Live Demo

- Deployed Frontend (Netlify):  
  `https://peak-point-svelte.netlify.app`

- Backend (Render):  
  `https://peak-point.onrender.com`

---

## Tech Stack

- **SvelteKit** + **TypeScript**
- **Bulma** (styling)
- **Axios** (API calls)
- **Leaflet** (maps)
- `leaflet.markercluster` (marker clustering)
- **svelte-frappe-charts** (charts)
- **Vitest + @testing-library/svelte + jsdom** (unit tests)
- `qrcode` (QR codes for 2FA setup)

---

## Levels Overview

### Level 3 (Visualisation / Dashboard)

- interactive map with layers for categories
- chart: peaks per category
- peak selection list + peak info panel

### Level 4 (SSR + OAuth + richer reports)

- SSR (protected pages + server-side loading)
- OAuth login (GitHub + Google)
- multiple maps per page + richer chart types

### Level 5 (extras)

- marker clustering (overview map)
- frontend unit tests
- frontend CI pipeline (lint/tests/build)
- frontend deployment on Netlify

---

# Level 3 Features

## Dashboard (`/dashboard`)

The dashboard focuses on showing peaks visually:

### Interactive Map

- Leaflet map with OpenStreetMap tiles
- markers for peaks
- **category layers** as Leaflet overlays
- clicking a marker selects the peak
- selecting a peak always uses consistent zoom via helper functions

### Peak Selection

- peaks grouped by category
- collapsible category sections
- selecting an item synchronises map + peak info panel

### Peak Info Panel

- name, elevation, description
- categories
- image carousel (multiple images per peak)

### Chart: Peaks per Category

- bar chart showing distribution of peaks across categories
- dataset is computed from peaks + categories data

---

# Level 4 Features

## Server-Side Rendering (SSR)

The frontend uses SSR in a practical way:

- protected pages redirect on the server if no session exists
- initial page data is loaded in `+page.server.ts` (faster UX and less client-side fetching)
- categories/peaks are loaded in parallel via `Promise.all(...)`

## OAuth Login (GitHub + Google)

- OAuth flow is handled by the backend (Hapi Bell)
- frontend redirects to backend OAuth endpoints (`/api/oauth/github`, `/api/oauth/google`)
- backend redirects back to `/oauth/callback` with session values
- production-ready flow (Netlify + Render)

## Maps Page (`/maps`)

- page contains multiple maps:
  - overview map
  - focus map (selected peak)
  - nearby map (peaks inside radius)
- selecting a peak syncs all maps and the UI

## Reports Page (`/reports`)

Reports page provides filters + multiple chart types:

- filters:
  - select multiple categories
  - minimum elevation
- charts:
  - bar chart (peaks per category)
  - pie chart (elevation bands)
  - line chart (distribution)

---

# Level 5 Features

## Marker Clustering (Maps)

For the overview map I added marker clustering:

- implemented using `leaflet.markercluster`
- prevents marker overlap when zoomed out
- makes map more readable and faster

In the reusable map component I switch between:

- normal `layerGroup` (no clustering)
- `markerClusterGroup` (clustering)

This is controlled with a `clusterMarkers` prop.

## Frontend Unit Tests

Unit tests were added to keep the test suite realistic:

### Test Setup

- **Vitest** = test runner
- **Testing Library** = component rendering + interaction
- **jsdom** = browser-like DOM so Svelte components can be tested

### What is tested?

- **utility functions** (dataset calculations, filtering logic)
- a few **UI components** where it makes sense (forms + feedback messages)

### What is not tested?

- Leaflet map rendering itself (heavy + plugin based, better suited for E2E testing)

---

## CI + Deployment

### CI Pipeline (Frontend)

Netlify automatically deploys on changes to `main`, so I added a CI pipeline to prevent broken deploys:

- lint
- unit tests
- build

### Deployment

- Netlify deploys automatically from the `main` branch
- environment variables are configured in Netlify for API base URL and Cloudinary settings

---

## Running locally

```bash
npm install
npm run dev
```
