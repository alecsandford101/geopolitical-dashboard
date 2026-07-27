import { useMemo, useState } from 'react'
import { EVENTS } from './data/events.js'
import { SEV_ORDER } from './config/constants.js'
import Header from './components/Header.jsx'
import StatsRow from './components/StatsRow.jsx'
import Filters from './components/Filters.jsx'
import WorldMap from './components/WorldMap.jsx'
import EventList from './components/EventList.jsx'

export default function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [region, setRegion] = useState('All')
  const [selectedId, setSelectedId] = useState(null)

  const regions = useMemo(
    () => ['All', ...Array.from(new Set(EVENTS.map((e) => e.region))).sort()],
    [],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EVENTS
      .filter((e) => category === 'All' || e.category === category)
      .filter((e) => severity === 'All' || e.severity === severity)
      .filter((e) => region === 'All' || e.region === region)
      .filter((e) => {
        if (!q) return true
        return (
          e.title.toLowerCase().includes(q) ||
          e.desc.toLowerCase().includes(q) ||
          e.place.toLowerCase().includes(q) ||
          e.markets.join(' ').toLowerCase().includes(q)
        )
      })
      .sort((a, b) =>
        (SEV_ORDER[b.severity] - SEV_ORDER[a.severity]) || b.date.localeCompare(a.date),
      )
  }, [query, category, severity, region])

  const stats = useMemo(() => {
    const highCrit = filtered.filter((e) => e.severity === 'High' || e.severity === 'Critical').length
    const counts = {}
    filtered.forEach((e) => { counts[e.category] = (counts[e.category] || 0) + 1 })
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    const regionsHit = new Set(filtered.map((e) => e.region)).size
    return { total: filtered.length, highCrit, regionsHit, top: top ? top[0] : '—' }
  }, [filtered])

  const handleReset = () => {
    setQuery(''); setCategory('All'); setSeverity('All'); setRegion('All')
  }

  return (
    <div className="app">
      <Header />
      <StatsRow stats={stats} total={EVENTS.length} />
      <Filters
        query={query} setQuery={setQuery}
        category={category} setCategory={setCategory}
        severity={severity} setSeverity={setSeverity}
        region={region} setRegion={setRegion}
        regions={regions}
        resultCount={filtered.length}
        onReset={handleReset}
      />

      <section className="main">
        <WorldMap events={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        <EventList events={filtered} selectedId={selectedId} onSelect={setSelectedId} />
      </section>

      <footer className="note">
        Prototype with mock data · {EVENTS.length} events. To go live, replace{' '}
        <code>src/data/events.js</code> with a <code>fetch()</code> to a geopolitical feed
        (GDELT, ACLED, NewsAPI) mapped to the same event shape.
      </footer>
    </div>
  )
}
