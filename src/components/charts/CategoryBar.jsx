import { CATEGORIES } from '../../config/constants.js'

// Horizontal bar chart: event count by category (magnitude by identity).
// Categorical hues in fixed order; every bar carries a direct text label + value,
// so identity never rests on color alone.
export default function CategoryBar({ events }) {
  const counts = {}
  for (const e of events) counts[e.category] = (counts[e.category] || 0) + 1
  const rows = Object.keys(CATEGORIES)
    .map((cat) => ({ cat, n: counts[cat] || 0, hex: CATEGORIES[cat].hex }))
    .filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n)

  const max = Math.max(1, ...rows.map((r) => r.n))

  if (rows.length === 0) return <div className="chart-empty">No data</div>

  return (
    <div className="cbar">
      {rows.map((r) => (
        <div className="cbar-row" key={r.cat} title={`${r.cat}: ${r.n}`}>
          <span className="cbar-label">{r.cat}</span>
          <span className="cbar-track">
            <span
              className="cbar-fill"
              style={{ width: `${(r.n / max) * 100}%`, background: r.hex }}
            />
          </span>
          <span className="cbar-val">{r.n}</span>
        </div>
      ))}
    </div>
  )
}
