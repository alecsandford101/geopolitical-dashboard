// Coverage volume over time: summed report count per day across the data window
// (single-hue = magnitude over time). Recessive baseline, direct value labels,
// hover highlight. Built as inline SVG, no dependency.
export default function Timeline({ events }) {
  // Bin by day, weighting by article volume (falls back to 1 per event).
  const byDay = new Map()
  for (const e of events) {
    if (!e.date) continue
    byDay.set(e.date, (byDay.get(e.date) || 0) + (e.count || 1))
  }
  const days = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  if (days.length === 0) return <div className="chart-empty">No data</div>

  const W = 320
  const H = 120
  const padB = 22 // room for date labels
  const padT = 16 // room for value labels
  const max = Math.max(1, ...days.map((d) => d[1]))
  const slot = W / days.length
  const barW = Math.min(38, slot * 0.62)

  const fmt = (iso) => {
    const [, m, d] = iso.split('-')
    const mon = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m]
    return `${mon} ${+d}`
  }

  return (
    <svg className="timeline" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Coverage volume by day">
      {/* baseline */}
      <line x1="0" y1={H - padB} x2={W} y2={H - padB} className="tl-axis" />
      {days.map(([iso, v], i) => {
        const h = ((v / max) * (H - padB - padT))
        const x = i * slot + (slot - barW) / 2
        const y = H - padB - h
        return (
          <g key={iso} className="tl-group">
            <title>{`${fmt(iso)}: ${v} reports`}</title>
            <rect x={x} y={y} width={barW} height={h} rx="3" className="tl-bar" />
            <text x={x + barW / 2} y={y - 4} className="tl-val">{v}</text>
            <text x={x + barW / 2} y={H - padB + 14} className="tl-day">{fmt(iso)}</text>
          </g>
        )
      })}
    </svg>
  )
}
