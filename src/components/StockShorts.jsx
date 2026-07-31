import { useMemo } from 'react'
import { SHORTS_PLAYBOOK } from '../config/shortsPlaybook.js'
import { rankIdeas } from '../lib/rankIdeas.js'

const CONF_PIPS = { high: 3, medium: 2, low: 1 }

function Pips({ level }) {
  const n = CONF_PIPS[level] || 1
  return (
    <span className="sig-conf" title={`${level} conviction`}>
      {[0, 1, 2].map((i) => <span key={i} className={'pip' + (i < n ? ' on' : '')} />)}
    </span>
  )
}

// Short desk — the mirror of the long-only Decision desk. Same news-flow ranking,
// but every idea is a SHORT: liquid US-listed stocks that structurally suffer when
// a category of news is active (fuel-exposed airlines on Conflict, rate-sensitive
// homebuilders on hawkish policy, catastrophe insurers on Disaster, and so on).
// Every card carries the monochrome ▼ SHORT chip. Educational, not investment advice.
export default function StockShorts({ events }) {
  const ideas = useMemo(() => rankIdeas(events, SHORTS_PLAYBOOK), [events])

  return (
    <section className="signals shorts-signals">
      <div className="section-head">
        <div className="sh-left">
          <span className="eyebrow">Short desk</span>
          <h2>Stocks in the crosshairs — short side</h2>
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
                <span className="sig-dir short">
                  <span aria-hidden="true">▼</span> SHORT
                </span>
                <Pips level={it.confidence} />
              </div>
              <div className="sig-name">{it.name}</div>
              <div className="sig-theme">
                <span className="sig-dot" />
                {it.theme}
                {it.themes > 1 && <span className="sig-cross">· {it.themes} themes</span>}
              </div>
              {it.triggers?.length > 0 && (
                <div
                  className="sig-trigger"
                  title={`${it.matchEvents} live headline${it.matchEvents !== 1 ? 's' : ''} name this thesis`}
                >
                  Live news: {it.triggers.slice(0, 2).map((t) => `“${t}”`).join(' · ')}
                </div>
              )}
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
        Illustrative short exposures derived from the current news flow — educational, not investment advice.
      </p>
    </section>
  )
}
