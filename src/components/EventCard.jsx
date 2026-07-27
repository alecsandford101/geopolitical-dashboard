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
    </div>
  )
}
