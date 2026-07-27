// Loads live events from the static events.json produced at build time by
// scripts/fetch-events.js. Same-origin fetch (no CORS, no rate limits for visitors).
// Returns { events, generatedAt } on success, or null so the caller can fall back
// to the bundled mock data.

export async function loadEvents() {
  try {
    // BASE_URL is '/geopolitical-dashboard/' on Pages, '/' in dev.
    const res = await fetch(`${import.meta.env.BASE_URL}events.json`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (!data || !Array.isArray(data.events) || data.events.length === 0) return null

    // Guard against malformed rows; keep only events with usable coordinates.
    const events = data.events.filter(
      (e) => typeof e.lat === 'number' && typeof e.lng === 'number' && e.category && e.severity,
    )
    if (events.length === 0) return null

    return { events, generatedAt: data.generatedAt || null }
  } catch {
    return null
  }
}
