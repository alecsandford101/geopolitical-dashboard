import { CATEGORIES, SEVERITY } from '../config/constants.js'

export default function EventCard({ ev, active, onSelect }) {
  const cat = CATEGORIES[ev.category]
  const sev = SEVERITY[ev.severity]

  return (
    <div
      className={'card' + (active ? ' active' : '')}
      style={{ borderLeftColor: sev.hex }}
      onClick={() => onSelect(ev.id)}
    >
      <div className="row1">
        <span className="badge" style={{ color: cat.hex }}>{ev.category}</span>
        <span className="sev-pill" style={{ background: sev.hex }}>{ev.severity}</span>
        <span className="date">{ev.date}</span>
      </div>
      <h3>{ev.title}</h3>
      <div className="loc">📍 {ev.place} · {ev.region}</div>
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
