import { CATEGORIES, SEVERITY } from '../config/constants.js'

export default function EventCard({ ev, active, onSelect }) {
  const cat = CATEGORIES[ev.category] || {}
  const sev = SEVERITY[ev.severity] || {}

  const select = () => onSelect(ev.id)
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      select()
    }
  }

  return (
    <div
      className={'card' + (active ? ' active' : '')}
      style={{ '--sev': sev.hex }}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={select}
      onKeyDown={onKeyDown}
    >
      <div className="card-top">
        <span className="cat">
          <span className="cat-dot" style={{ background: cat.hex }} />
          {ev.category}
        </span>
        <span className="sev-pill" style={{ background: sev.hex }}>{ev.severity}</span>
        <span className="card-date">{ev.date}</span>
      </div>

      <h3>{ev.title}</h3>

      <div className="loc">
        {ev.place} · {ev.region}
        {ev.translated && (
          <span
            className="card-xlate"
            title={`Headline machine-translated to English${ev.lang ? ` from ${ev.lang}` : ''}`}
          > · translated</span>
        )}
      </div>

      <p className="desc">{ev.desc}</p>

      <div className="tags">
        {ev.markets.map((m) => <span key={m} className="tag">{m}</span>)}
      </div>

      {ev.sources?.length > 0 && (
        <div className="src-links" onClick={(e) => e.stopPropagation()}>
          {ev.sources.slice(0, 3).map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer">
              ↗ {s.domain || 'source'}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
