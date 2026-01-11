# Peak Point – Level 3 Frontend

This frontend is part of the **Peak Point** project and represents **Level 3** of the assignment.  
The focus of this level is on **data visualisation** using **maps and charts**, building on the existing CRUD functionality for peaks.

The application is implemented with **SvelteKit**, styled using **Bulma**, and follows the structure and patterns shown in the _donation-svelte_ example from the lecture.

---

## Tech Stack

- **SvelteKit** (client-side rendering for Level 3)
- **TypeScript**
- **Bulma** (UI styling)
- **Axios** (API communication)
- **Leaflet** (interactive maps)
- **svelte-frappe-charts** (charts)
- **Vitest + Testing Library** (selected component tests)

---

## Level 3 Goals

The goals of Level 3 were:

- Visualise peaks on an interactive map
- Group and filter data by categories
- Add meaningful charts based on existing data
- Keep the UI clean and simple
- Follow lecture examples and patterns

---

## Implemented Features

### Dashboard

A new **Dashboard page** (`/dashboard`) was added to visualise peaks:

- **Interactive Leaflet map**
  - Peaks are shown as markers
  - Categories are implemented as **map layers**
  - Layers can be toggled on/off
  - Clicking a marker selects the peak
  - Selecting a peak always zooms to a consistent level

- **Peak selection list**
  - Clean, minimal UI
  - Peaks grouped by categories
  - Categories are expandable / collapsible
  - List is scrollable inside its card
  - Selecting a peak updates the map and info panel

- **Peak info panel**
  - Shows details of the currently selected peak
  - Includes images (carousel), elevation, description and categories

- **Chart: Peaks per Category**
  - Bar chart showing how many peaks belong to each category
  - Implemented using `svelte-frappe-charts`
  - Dataset is computed from existing peak and category data

---

## Map Implementation

- Uses **Leaflet** with OpenStreetMap tiles
- Categories are implemented as **overlay layers**
- Markers are added per category
- A shared `moveTo(lat, lng, zoom)` function ensures consistent zoom when:
  - clicking a marker
  - selecting a peak from the list
  - refreshing the map

---

## Charts

- Implemented with **svelte-frappe-charts**
- Current chart:
  - **Peaks per Category** (bar chart)
- Chart datasets are computed in `peak-utils.ts`
- Charts update automatically when peak data changes

---

## Testing Strategy

Not all UI elements are tested on purpose.

### Tested

- Utility functions (e.g. dataset computation)
- Reusable UI components where interaction matters:
  - `PeakSelectionList`
  - `PeakCard`

This keeps the test suite realistic and focused, similar to the lecture examples.

---

## Running the Project

```bash
npm install
npm run dev

```
