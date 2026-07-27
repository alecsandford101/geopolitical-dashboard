# GeoPulse

A React dashboard for tracking **market-impacting geopolitical events** — an interactive world map plus a filterable, searchable event feed.

Built with Vite + React 18 and react-leaflet. Currently runs on mock data; designed to swap in a live feed with a one-file change.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Features

- **World map** (react-leaflet + CartoDB dark tiles) — one marker per event; marker size and color encode severity. Click a marker or a feed card and the map flies to it and opens its popup.
- **Filter & search** — free-text search (title, description, place, affected markets) plus category, severity, and region dropdowns. Reset clears everything.
- **Event feed** — cards sorted by severity then date, showing category, severity, location, and the markets each event touches.
- **Stat tiles** — live counts (events shown, high/critical, regions affected, top category) that respond to the active filters.

## Project structure

```
src/
  main.jsx              app entry (imports Leaflet + global CSS)
  App.jsx               state, filtering, stats; composes the UI
  index.css             all styles (dark, colorblind-safe palette)
  config/constants.js   CATEGORIES, SEVERITY, SEV_ORDER
  data/events.js        mock event data  ← replace this to go live
  components/
    Header.jsx  StatsRow.jsx  Filters.jsx
    WorldMap.jsx  EventList.jsx  EventCard.jsx
```

## Going live with real data

Every event follows this shape:

```js
{
  id, title, category, severity,   // severity: Low | Medium | High | Critical
  date,                            // 'YYYY-MM-DD'
  region, place, lat, lng,
  desc,
  markets,                         // e.g. ['Oil', 'EUR/USD']
}
```

To use a real source, replace `src/data/events.js` with a `fetch()` that maps the
provider's response into that shape. Good options:

- **GDELT** — free, no key, global news events with geo-coordinates (recommended starting point).
- **ACLED** — curated conflict/political-violence data (free API key).
- **NewsAPI** — headlines you classify/geocode yourself (free tier available).

`category` must be one of the keys in `config/constants.js` (`CATEGORIES`); add or
rename categories there and the filters and map colors update automatically.
