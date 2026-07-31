// Generic news-flow ranker, shared by the macro (commodities/FX) and short desks.
// It mirrors the equities Decision-desk ranking but takes the playbook as an
// argument so a second asset class can reuse the exact same weighting without
// touching TradeSignals. Each event contributes weight = severity × recency to
// every instrument its category maps to; scores sum across events, so an instrument
// lit up by several categories rises. An instrument's accent + call come from the
// category driving most of its score (the strongest active theme sets direction).
//
// Headline signals: an idea may carry `signals` — thesis-relevant keywords/phrases.
// When a live headline in the idea's category actually names one of them (in the
// title, description, place or market tags), that event's contribution is boosted,
// so the pick reorders around WHAT the news says, not just how heavy its category
// is. A Conflict feed full of "Hormuz"/"tanker"/"crude" pushes the fuel-cost shorts
// to the top; a chip-war Conflict feed does not. The matched terms ride along as
// `triggers` so the card can show the live evidence. Ideas with no `signals` behave
// exactly as before (boost = 1), so this is transparent to any existing playbook.
import { CATEGORIES } from '../config/constants.js'

const SEV_WEIGHT = { Critical: 4, High: 3, Medium: 2, Low: 1 }
const DAY = 86400000
// A headline naming an idea's own signal terms is direct evidence the thesis is
// live, so it counts for more than a generic same-category event. Tuned to reorder
// within a category without letting one matched headline erase another's volume.
const SIGNAL_BOOST = 2.5

const norm = (s) => (s || '').toLowerCase()

export function rankIdeas(events, playbook, topN = 6) {
  if (!events.length) return []

  const times = events.map((e) => Date.parse(e.date)).filter((t) => !Number.isNaN(t))
  const newest = times.length ? Math.max(...times) : NaN

  const byTicker = new Map()
  for (const e of events) {
    const pb = playbook[e.category]
    if (!pb) continue
    const sev = SEV_WEIGHT[e.severity] || 1
    let recency = 1
    if (!Number.isNaN(newest)) {
      const t = Date.parse(e.date)
      if (!Number.isNaN(t)) recency = 1 / (1 + ((newest - t) / DAY) * 0.3)
    }
    const w = sev * recency
    const text = `${norm(e.title)} ${norm(e.desc)} ${norm(e.place)} ${norm((e.markets || []).join(' '))}`
    for (const idea of pb.ideas) {
      let rec = byTicker.get(idea.ticker)
      if (!rec) {
        rec = { ticker: idea.ticker, score: 0, drivers: 0, byCat: {}, ideaByCat: {}, hits: new Map(), matchEvents: 0 }
        byTicker.set(idea.ticker, rec)
      }
      // Does this headline name any of the idea's own signal terms?
      const matched = (idea.signals || []).filter((kw) => text.includes(norm(kw)))
      const contribution = w * (matched.length ? SIGNAL_BOOST : 1)
      rec.score += contribution
      rec.drivers += 1
      rec.byCat[e.category] = (rec.byCat[e.category] || 0) + contribution
      rec.ideaByCat[e.category] = idea
      if (matched.length) {
        rec.matchEvents += 1
        for (const m of matched) rec.hits.set(m, (rec.hits.get(m) || 0) + 1)
      }
    }
  }

  const ranked = [...byTicker.values()]
    .map((rec) => {
      const domCat = Object.entries(rec.byCat).sort((a, b) => b[1] - a[1])[0][0]
      const idea = rec.ideaByCat[domCat]
      // Matched signal terms, most-cited first — the live evidence behind the pick.
      const triggers = [...rec.hits.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)
      return {
        ...idea,
        score: rec.score,
        drivers: rec.drivers,
        category: domCat,
        hex: (CATEGORIES[domCat] || {}).hex,
        themes: Object.keys(rec.byCat).length,
        triggers,
        matchEvents: rec.matchEvents,
      }
    })
    .sort((a, b) => b.score - a.score)

  const max = ranked.length ? ranked[0].score : 1
  return ranked.slice(0, topN).map((r) => ({ ...r, strength: Math.max(6, Math.round((r.score / max) * 100)) }))
}
