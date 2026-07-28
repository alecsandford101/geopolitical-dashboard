import { useEffect, useState } from 'react'

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

const BADGE = {
  live:    { cls: 'live', text: 'Live · GDELT' },
  mock:    { cls: 'mock', text: 'Sample data' },
  loading: { cls: 'loading', text: 'Loading…' },
}

// UTC, terminal-style: "28 JUL 2026 · 14:32:07"
function formatUTC(d) {
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getUTCMonth()]
  const p = (n) => String(n).padStart(2, '0')
  const date = `${p(d.getUTCDate())} ${mon} ${d.getUTCFullYear()}`
  const time = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`
  return { date, time }
}

export default function Header({ status = 'loading', generatedAt }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const badge = BADGE[status] || BADGE.loading
  const updated = status === 'live' ? timeAgo(generatedAt) : null
  const { date, time } = formatUTC(now)

  return (
    <header className="masthead">
      <div className="mast-brand">
        <div className="mast-mark"><span className="signal" />GEOPULSE</div>
        <div className="mast-tag">Global geopolitical event monitor</div>
      </div>

      <div className="mast-status">
        <div className="mast-clock">{time}<span>UTC</span></div>
        <div className="mast-meta">
          <span className="mast-date">{date}</span>
          <span className={`src-badge ${badge.cls}`}><span className="bdot" />{badge.text}</span>
          {updated && <span>· upd {updated}</span>}
        </div>
      </div>
    </header>
  )
}
