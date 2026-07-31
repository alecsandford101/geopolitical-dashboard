import { useMemo } from 'react'
import { CATEGORY_PLAYBOOK } from '../config/playbook.js'
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

export default function TradeSignals({ events }) {
  const ideas = useMemo(() => rankIdeas(events, CATEGORY_PLAYBOOK), [events])

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
        Illustrative exposures derived from the current news flow — educational, not investment advice.
      </p>
    </section>
  )
}
