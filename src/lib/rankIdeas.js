// Generic news-flow ranker, shared by the macro (commodities/FX) desk. It mirrors
// the equities Decision-desk ranking but takes the playbook as an argument so a
// second asset class can reuse the exact same weighting without touching
// TradeSignals. Each event contributes weight = severity × recency to every
// instrument its category maps to; scores sum across events, so an instrument lit
// up by several categories rises. An instrument's accent + call come from the
// category driving most of its score (the strongest active theme sets direction).
import { CATEGORIES } from '../config/constants.js'

const SEV_WEIGHT = { Critical: 4, High: 3, Medium: 2, Low: 1 }
const DAY = 86400000

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
    for (const idea of pb.ideas) {
      let rec = byTicker.get(idea.ticker)
      if (!rec) {
        rec = { ticker: idea.ticker, score: 0, drivers: 0, byCat: {}, ideaByCat: {} }
        byTicker.set(idea.ticker, rec)
      }
      rec.score += w
      rec.drivers += 1
      rec.byCat[e.category] = (rec.byCat[e.category] || 0) + w
      rec.ideaByCat[e.category] = idea
    }
  }

  const ranked = [...byTicker.values()]
    .map((rec) => {
      const domCat = Object.entries(rec.byCat).sort((a, b) => b[1] - a[1])[0][0]
      const idea = rec.ideaByCat[domCat]
      return {
        ...idea,
        score: rec.score,
        drivers: rec.drivers,
        category: domCat,
        hex: (CATEGORIES[domCat] || {}).hex,
        themes: Object.keys(rec.byCat).length,
      }
    })
    .sort((a, b) => b.score - a.score)

  const max = ranked.length ? ranked[0].score : 1
  return ranked.slice(0, topN).map((r) => ({ ...r, strength: Math.max(6, Math.round((r.score / max) * 100)) }))
}
