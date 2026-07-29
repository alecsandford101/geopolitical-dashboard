import { useEffect, useMemo, useState } from 'react'
import { EVENTS } from './data/events.js'
import { loadEvents } from './data/loadEvents.js'
import { SEV_ORDER } from './config/constants.js'
import Header from './components/Header.jsx'
import LeadBoard from './components/LeadBoard.jsx'
import StatsRow from './components/StatsRow.jsx'
import Filters from './components/Filters.jsx'
import ChartsRow from './components/ChartsRow.jsx'
import TradeSignals from './components/TradeSignals.jsx'
import WorldMap from './components/WorldMap.jsx'
import EventList from './components/EventList.jsx'

export default function App() {
  // Live data (from build-time GDELT fetch) with the bundled mock as fallback.
  const [sourceEvents, setSourceEvents] = useState(EVENTS)
  const [status, setStatus] = useState('loading') // 'loading' | 'live' | 'mock'
  const [generatedAt, setGeneratedAt] = useState(null)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [region, setRegion] = useState('All')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let cancelled = false
    loadEvents().then((res) => {
      if (cancelled) return
      if (res) {
        setSourceEvents(res.events)
        setGeneratedAt(res.generatedAt)
        setStatus('live')
      } else {
        setStatus('mock')
      }
    })
    return () => { cancelled = true }
  }, [])

  const regions = useMemo(
    () => ['All', ...Array.from(new Set(sourceEvents.map((e) => e.region))).sort()],
    [sourceEvents],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sourceEvents
      .filter((e) => category === 'All' || e.category === category)
      .filter((e) => severity === 'All' || e.severity === severity)
      .filter((e) => region === 'All' || e.region === region)
      .filter((e) => {
        if (!q) return true
        return (
          e.title.toLowerCase().includes(q) ||
          (e.desc || '').toLowerCase().includes(q) ||
          (e.place || '').toLowerCase().includes(q) ||
          (e.markets || []).join(' ').toLowerCase().includes(q)
        )
      })
      .sort((a, b) =>
        (SEV_ORDER[b.severity] - SEV_ORDER[a.severity]) || (b.date || '').localeCompare(a.date || ''),
      )
  }, [sourceEvents, query, category, severity, region])

  // Global Pulse (0–100) — the Situation Gauge reading. Aggregate severity of the
  // whole live world (not the filtered view), blending the hottest event with the
  // breadth of severe activity so a single Critical spikes it but a busy board
  // sustains it. criticalCount drives the gauge's pulse-on-new-Critical.
  const { globalPulse, criticalCount } = useMemo(() => {
    if (!sourceEvents.length) return { globalPulse: 0, criticalCount: 0 }
    const W = { Critical: 100, High: 70, Medium: 40, Low: 15 }
    const vals = sourceEvents.map((e) => W[e.severity] ?? 15)
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    const max = Math.max(...vals)
    return {
      globalPulse: Math.round(Math.min(100, 0.55 * max + 0.45 * mean)),
      criticalCount: sourceEvents.filter((e) => e.severity === 'Critical').length,
    }
  }, [sourceEvents])

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
      <Header
        status={status}
        generatedAt={generatedAt}
        globalPulse={globalPulse}
        criticalCount={criticalCount}
      />
      <LeadBoard events={sourceEvents} />
      <StatsRow stats={stats} total={sourceEvents.length} />
      <Filters
        query={query} setQuery={setQuery}
        category={category} setCategory={setCategory}
        severity={severity} setSeverity={setSeverity}
        region={region} setRegion={setRegion}
        regions={regions}
        resultCount={filtered.length}
        onReset={handleReset}
      />

      <section className="console">
        <div className="console-main">
          <WorldMap events={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          <ChartsRow events={filtered} />
        </div>
        <div className="console-side">
          <EventList events={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </section>

      <TradeSignals events={filtered} />

      <footer className="note">
        {status === 'live'
          ? <>Live data from <code>GDELT</code>, refreshed hourly. Map location reflects the primary country of coverage, not always the physical event site.</>
          : <>Showing bundled sample data{status === 'loading' ? ' while live data loads…' : ' (live feed unavailable).'}</>}
      </footer>
    </div>
  )
}
