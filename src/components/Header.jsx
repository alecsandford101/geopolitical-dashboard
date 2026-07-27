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

export default function Header({ status = 'loading', generatedAt }) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const badge = BADGE[status] || BADGE.loading
  const updated = status === 'live' ? timeAgo(generatedAt) : null

  return (
    <header className="top">
      <div className="brand">
        <span className="dot" />
        <div>
          <h1>GeoPulse</h1>
          <p>Market-impacting geopolitical events</p>
        </div>
      </div>
      <div className="clock">
        <span className={`src-badge ${badge.cls}`}><span className="bdot" />{badge.text}</span>
        <div>{today}</div>
        {updated && <div className="updated">updated {updated}</div>}
      </div>
    </header>
  )
}
