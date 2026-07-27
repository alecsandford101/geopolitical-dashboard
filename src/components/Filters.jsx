import { CATEGORIES, SEVERITY } from '../config/constants.js'

export default function Filters({
  query, setQuery,
  category, setCategory,
  severity, setSeverity,
  region, setRegion,
  regions, resultCount, onReset,
}) {
  return (
    <section className="filters">
      <input
        type="search"
        placeholder="Search events, places, markets…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="All">All categories</option>
        {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
        <option value="All">All severities</option>
        {Object.keys(SEVERITY).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={region} onChange={(e) => setRegion(e.target.value)}>
        {regions.map((r) => (
          <option key={r} value={r}>{r === 'All' ? 'All regions' : r}</option>
        ))}
      </select>
      <button className="clear" onClick={onReset}>Reset</button>
      <span className="count">{resultCount} result{resultCount !== 1 ? 's' : ''}</span>
    </section>
  )
}
