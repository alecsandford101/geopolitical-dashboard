// The event influence network.
//
// Two events are "connected" when their market / asset exposure overlaps — i.e.
// they move some of the same instruments, which is exactly what it means for two
// geopolitical events to affect each other here. Edge strength = how many assets
// they share; direction runs from the earlier event to the later one (influence
// propagates forward in time). Works for both the specific-ticker mock data and
// the coarse category-bucket markets of the live GDELT feed (where, e.g., "Oil"
// links Conflict↔Energy and "FX" links Monetary Policy↔Trade↔Sanctions).
//
// Two kinds of link fall out of this naturally:
//   • same-category  → the "same situation" cluster (shares all its assets)
//   • cross-category → a spillover: the two domains touch through a shared asset
// The cross-category links are the more revealing "how they affect each other"
// story, so the picker guarantees them room before filling with the cluster.

const norm = (s) => String(s).trim().toLowerCase()

// Assets shared by two events (case-insensitive; preserves a's labels/order).
export function sharedMarkets(a, b) {
  const setB = new Set((b.markets || []).map(norm))
  const out = []
  for (const m of a.markets || []) if (setB.has(norm(m))) out.push(m)
  return out
}

// The strongest connections for the selected event, within `events`.
// Returns [{ event, shared, weight, sameCat, sameRegion, laterId }], draw-ordered
// strongest-last so heavier links paint on top. `laterId` is whichever endpoint
// is later in time — the node the influence arrow points toward.
export function connectionsFor(selectedId, events, max = 8) {
  if (selectedId == null || !Array.isArray(events)) return []
  const sel = events.find((e) => e.id === selectedId)
  if (!sel) return []

  const all = []
  for (const e of events) {
    if (e.id === sel.id) continue
    const shared = sharedMarkets(sel, e)
    if (shared.length === 0) continue
    const sameCat = e.category === sel.category
    const sameRegion = Boolean(e.region && e.region === sel.region)
    // A shared asset is the base unit of strength; co-location nudges it up.
    const weight = shared.length + (sameRegion ? 0.5 : 0)
    const selDate = sel.date || ''
    const eDate = e.date || ''
    // Later date is the target; ties point toward the other event.
    const laterId = eDate > selDate ? e.id : eDate < selDate ? sel.id : e.id
    all.push({ event: e, shared, weight, sameCat, sameRegion, laterId })
  }

  const byWeight = (a, b) =>
    b.weight - a.weight ||
    b.shared.length - a.shared.length ||
    (b.event.date || '').localeCompare(a.event.date || '')

  const cross = all.filter((l) => !l.sameCat).sort(byWeight)
  const same = all.filter((l) => l.sameCat).sort(byWeight)

  // Reserve room for spillovers first (at least a few, up to whatever the cluster
  // leaves free), then fill with the same-situation cluster — capped at `max` so
  // a dense board never turns the map into a hairball.
  const crossQuota = Math.min(cross.length, max, Math.max(4, max - same.length))
  const chosen = [...cross.slice(0, crossQuota), ...same.slice(0, max - crossQuota)]

  // Sort strongest-last so the heaviest edges render over the lighter ones.
  return chosen.sort((a, b) => -byWeight(a, b))
}

// De-duplicated list of every asset carrying a link in `links` (for the readout
// line "…linked through Oil · FX · Defense"). Preserves first-seen order.
export function sharedAssetSummary(links, limit = 5) {
  const seen = []
  const set = new Set()
  for (const l of links) {
    for (const m of l.shared) {
      const k = norm(m)
      if (!set.has(k)) {
        set.add(k)
        seen.push(m)
      }
    }
  }
  return limit ? seen.slice(0, limit) : seen
}
