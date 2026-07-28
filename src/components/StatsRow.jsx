import { CATEGORIES, SEVERITY } from '../config/constants.js'

// KPI tile. The 2px top hairline uses `accent` — data/status color where it
// carries meaning, a neutral hairline otherwise. `isText` shrinks the figure for
// category names (which aren't numerals).
function StatTile({ label, value, sub, accent, isText }) {
  return (
    <div className="tile" style={accent ? { '--accent': accent } : undefined}>
      <div className="tile-label">{label}</div>
      <div className={'tile-value' + (isText ? ' is-text' : '')}>{value}</div>
      {sub && <div className="tile-sub">{sub}</div>}
    </div>
  )
}

export default function StatsRow({ stats, total }) {
  const topAccent = (CATEGORIES[stats.top] || {}).hex
  return (
    <section className="stats">
      <StatTile label="Events shown" value={stats.total} sub={`of ${total} tracked`} />
      <StatTile
        label="High / Critical"
        value={stats.highCrit}
        sub="elevated market risk"
        accent={SEVERITY.Critical.hex}
      />
      <StatTile label="Regions affected" value={stats.regionsHit} sub="across the globe" />
      <StatTile label="Top category" value={stats.top} sub="most frequent" accent={topAccent} isText />
    </section>
  )
}
