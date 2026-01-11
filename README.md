# Peak Point – Frontend (SvelteKit)

This frontend is part of the **Peak Point** project and represents **Level 3 + Level 4** of the assignment.  
It builds on the CRUD features and focuses on **data visualisation (maps + charts)** and **OAuth login**.

The application is implemented with **SvelteKit**, styled using **Bulma**, and follows the structure and patterns shown in the *donation-svelte* example from the lecture.

---

## Tech Stack

- **SvelteKit** + **TypeScript**
- **Bulma** (styling)
- **Axios** (API calls)
- **Leaflet** + `leaflet.markercluster` (maps)
- **svelte-frappe-charts** (charts)
- **Vitest + Testing Library** (selected tests)

---

## Level 3 Goals

The goals of Level 3 were:

- Visualise peaks on an interactive map
- Group and filter data by categories
- Add meaningful charts based on existing data
- Keep the UI clean and simple
- Follow lecture examples and patterns

---

## Implemented Features (Level 3)

### Dashboard (`/dashboard`)

A new **Dashboard page** was added to visualise peaks:

- **Interactive Leaflet map**
  - Peaks are shown as markers
  - Categories are implemented as **map layers**
  - Layers can be toggled on/off
  - Clicking a marker selects the peak
  - Selecting a peak always zooms to a consistent level

- **Peak selection list**
  - Clean, minimal UI
  - Peaks grouped by categories
  - Categories expandable / collapsible
  - Scrollable inside its card
  - Selecting a peak updates the map and info panel

- **Peak info panel**
  - Shows details of the currently selected peak
  - Includes images (carousel), elevation, description and categories

- **Chart: Peaks per Category**
  - Bar chart showing how many peaks belong to each category
  - Implemented using `svelte-frappe-charts`
  - Dataset is computed from existing peak and category data

---

## Map Implementation (Level 3)

- Uses **Leaflet** with OpenStreetMap tiles
- Categories are implemented as **overlay layers**
- Markers are added per category
- A shared `moveTo(lat, lng, zoom)` function ensures consistent zoom when:
  - clicking a marker
  - selecting a peak from the list
  - refreshing the map

---

## Charts (Level 3)

- Implemented with **svelte-frappe-charts**
- Current chart:
  - **Peaks per Category** (bar chart)
- Chart datasets are computed in `peak-utils.ts`
- Charts update automatically when peak data changes

---

## Testing Strategy (Level 3)

Not all UI elements are tested on purpose.

### Tested
- Utility functions (e.g. dataset computation)
- Reusable UI components where interaction matters:
  - `PeakSelectionList`
  - `PeakCard`

This keeps the test suite realistic and focused, similar to the lecture examples.

---

## Level 4 Features

Level 4 adds **SSR**, **OAuth login** and extends visualisation with **richer maps + reports**.

### Server-Side Rendering (SSR)

Frontend was updated to use **SSR**:

- protected pages redirect on the server if no session exists 
- initial data for pages like **dashboard/maps/reports** is loaded server-side


### OAuth Login (GitHub + Google)

- Login via **GitHub** and **Google**
- OAuth flow is handled by the backend
- Frontend receives the session via `/oauth/callback`
- Works in production deployment (Netlify + Render)

### Maps Page (`/maps`)

A new page with multiple maps:

- **Overview map** with marker clustering
- **Focus map** (selected peak)
- **Nearby map** (peaks in radius)

Selecting a peak in list or map synchronises all maps.

### Reports Page (`/reports`)

A reports page with filters + multiple chart types:

- filters:
  - multiple categories
  - minimum elevation
- charts:
  - bar (peaks per category)
  - pie (elevation bands)
  - line (elevation distribution)

### Extra used Libraries (Level 4)

- `leaflet.markercluster`
- `@types/leaflet.markercluster`

---

## Deployment

- Netlify:
  `https://peak-point-svelte.netlify.app`

---

## Running the Project

```bash
npm install
npm run dev
