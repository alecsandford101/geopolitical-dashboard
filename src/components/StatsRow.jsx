function StatTile({ label, value, sub }) {
  return (
    <div className="tile">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  )
}

export default function StatsRow({ stats, total }) {
  return (
    <section className="stats">
      <StatTile label="Events shown" value={stats.total} sub={`of ${total} tracked`} />
      <StatTile label="High / Critical" value={stats.highCrit} sub="elevated market risk" />
      <StatTile label="Regions affected" value={stats.regionsHit} sub="across the globe" />
      <StatTile label="Top category" value={stats.top} sub="most frequent" />
    </section>
  )
}
