import { useEffect, useState } from 'react'
import SituationGauge from './SituationGauge.jsx'

function timeAgo(iso) {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return null
  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

// The tally light: live feed → ON AIR (amber), sample → STANDBY, fetch → SYNCING.
const ONAIR = {
  live:    { cls: 'live',    text: 'On air' },
  mock:    { cls: 'mock',    text: 'Standby' },
  loading: { cls: 'loading', text: 'Syncing' },
}

// UTC, watch-desk style: "28 JUL 2026" / "14:32:07"
function formatUTC(d) {
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getUTCMonth()]
  const p = (n) => String(n).padStart(2, '0')
  const date = `${p(d.getUTCDate())} ${mon} ${d.getUTCFullYear()}`
  const time = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`
  return { date, time }
}

export default function Header({ status = 'loading', generatedAt, globalPulse = 0, criticalCount = 0 }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const onair = ONAIR[status] || ONAIR.loading
  const updated = status === 'live' ? timeAgo(generatedAt) : null
  const { date, time } = formatUTC(now)

  return (
    <header className="masthead">
      <div className="mast-plate">
        <span className="mast-mark">Geopulse</span>
        <span className="mast-tag">Global situation desk</span>
      </div>

      <div className="mast-gauge">
        <SituationGauge value={globalPulse} criticalCount={criticalCount} />
      </div>

      <div className="mast-onair">
        <span className={`onair ${onair.cls}`}><span className="onair-dot" />{onair.text}</span>
        <span className="mast-clock">{time}<span>UTC</span></span>
        <span className="mast-meta">
          <span className="mast-date">{date}</span>
          {updated && <span className="mast-upd">upd {updated}</span>}
        </span>
      </div>
    </header>
  )
}
