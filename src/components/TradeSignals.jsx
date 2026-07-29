import { useMemo } from 'react'
import { CATEGORIES } from '../config/constants.js'
import { CATEGORY_PLAYBOOK } from '../config/playbook.js'

const SEV_WEIGHT = { Critical: 4, High: 3, Medium: 2, Low: 1 }
const CONF_PIPS = { high: 3, medium: 2, low: 1 }
const TOP_N = 6

// Rank the instruments implicated by the current events. Each event contributes
// weight = severity × recency to every ticker its category maps to; scores sum
// across events (so a ticker lit up by several categories rises). A ticker's
// accent + thesis come from the category driving most of its score.
function rankIdeas(events) {
  if (!events.length) return []

  const times = events.map((e) => Date.parse(e.date)).filter((t) => !Number.isNaN(t))
  const newest = times.length ? Math.max(...times) : NaN
  const DAY = 86400000

  const byTicker = new Map()
  for (const e of events) {
    const pb = CATEGORY_PLAYBOOK[e.category]
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
  return ranked.slice(0, TOP_N).map((r) => ({ ...r, strength: Math.max(6, Math.round((r.score / max) * 100)) }))
}

function Pips({ level }) {
  const n = CONF_PIPS[level] || 1
  return (
    <span className="sig-conf" title={`${level} conviction`}>
      {[0, 1, 2].map((i) => <span key={i} className={'pip' + (i < n ? ' on' : '')} />)}
    </span>
  )
}

export default function TradeSignals({ events }) {
  const ideas = useMemo(() => rankIdeas(events), [events])

  return (
    <section className="signals">
      <div className="section-head">
        <div className="sh-left">
          <span className="eyebrow">Decision desk</span>
          <h2>Stocks in the crosshairs</h2>
        </div>
        <span className="sh-meta">ranked by news flow · not investment advice</span>
      </div>

      {ideas.length === 0 ? (
        <div className="signals-empty">No active signals in the current view.</div>
      ) : (
        <div className="signals-grid">
          {ideas.map((it) => (
            <article className="sig" key={it.ticker} style={{ '--accent': it.hex }}>
              <div className="sig-top">
                <span className="sig-ticker">{it.ticker}</span>
                <span className="sig-long">LONG</span>
                <Pips level={it.confidence} />
              </div>
              <div className="sig-name">{it.name}</div>
              <div className="sig-theme">
                <span className="sig-dot" />
                {it.theme}
                {it.themes > 1 && <span className="sig-cross">· {it.themes} themes</span>}
              </div>
              <p className="sig-thesis">{it.thesis}</p>
              <div className="sig-meter" aria-hidden="true">
                <span className="sig-meter-fill" style={{ width: `${it.strength}%` }} />
              </div>
              <div className="sig-foot">
                <span className="sig-signal">Signal {it.strength}</span>
                <span className="sig-drivers">{it.drivers} event{it.drivers !== 1 ? 's' : ''} · {it.category}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="signals-note">
        Illustrative exposures derived from the current news flow — educational, not investment advice.
      </p>
    </section>
  )
}
