import { SEVERITY, SEV_ORDER } from '../../config/constants.js'

// Severity mix as a single stacked bar using the reserved status palette
// (escalating heat). Each segment is labeled in the legend below — color + text,
// never color alone. 2px surface gaps separate segments.
export default function SeverityBar({ events }) {
  const counts = {}
  for (const e of events) counts[e.severity] = (counts[e.severity] || 0) + 1
  const levels = Object.keys(SEVERITY).sort((a, b) => SEV_ORDER[b] - SEV_ORDER[a])
  const total = events.length

  if (total === 0) return <div className="chart-empty">No data</div>

  return (
    <div className="sevchart">
      <div className="sevbar">
        {levels.map((lvl) => {
          const n = counts[lvl] || 0
          if (n === 0) return null
          return (
            <span
              key={lvl}
              className="sevseg"
              style={{ flexGrow: n, background: SEVERITY[lvl].hex }}
              title={`${lvl}: ${n}`}
            />
          )
        })}
      </div>
      <div className="sevlegend">
        {levels.map((lvl) => (
          <span className="sevlegend-item" key={lvl}>
            <span className="swatch" style={{ background: SEVERITY[lvl].hex }} />
            {lvl} <b>{counts[lvl] || 0}</b>
          </span>
        ))}
      </div>
    </div>
  )
}
