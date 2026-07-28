import { useMemo } from 'react'
import { CATEGORIES, SEV_ORDER } from '../config/constants.js'

// Signature element: a live tape of the highest-signal headlines, ordered by
// severity then recency. Fed the full source set (not the filtered view) so the
// wire always reflects the live world. Two identical sequences give a seamless
// CSS marquee (track translates -50%); the CSS pauses it on hover and freezes it
// under prefers-reduced-motion.
export default function WireTicker({ events = [] }) {
  const items = useMemo(() => {
    return [...events]
      .sort((a, b) =>
        (SEV_ORDER[b.severity] - SEV_ORDER[a.severity]) || (b.date || '').localeCompare(a.date || ''),
      )
      .slice(0, 8)
  }, [events])

  if (items.length === 0) {
    return (
      <div className="wire">
        <div className="wire-tag">Live Wire</div>
        <div className="wire-viewport">
          <span className="wire-idle">Monitoring global sources…</span>
        </div>
      </div>
    )
  }

  const Seq = ({ hidden }) => (
    <div className="wire-seq" aria-hidden={hidden || undefined}>
      {items.map((ev, i) => (
        <span className="wire-item" key={`${ev.id}-${i}`}>
          <span className="wire-dot" style={{ background: (CATEGORIES[ev.category] || {}).hex }} />
          <span className="wire-text">{ev.title}</span>
          {ev.place && <span className="wire-place">{ev.place}</span>}
        </span>
      ))}
    </div>
  )

  return (
    <div className="wire">
      <div className="wire-tag">Live Wire</div>
      <div className="wire-viewport">
        <div className="wire-track">
          <Seq />
          <Seq hidden />
        </div>
      </div>
    </div>
  )
}
