import { useMemo } from 'react'
import { CATEGORIES, SEV_ORDER } from '../config/constants.js'

// The lead board: a single split-flap headline showing the highest-signal story
// on the desk right now (severity, then recency). Fed the full source set (not
// the filtered view) so the lead always reflects the live world. The headline is
// keyed by event id, so when the lead changes React remounts it and the flap
// animation replays — frozen under prefers-reduced-motion.
function shortDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getUTCMonth()]
  return `${String(d.getUTCDate()).padStart(2, '0')} ${mon}`
}

export default function LeadBoard({ events = [] }) {
  const lead = useMemo(() => {
    return [...events].sort(
      (a, b) => (SEV_ORDER[b.severity] - SEV_ORDER[a.severity]) || (b.date || '').localeCompare(a.date || ''),
    )[0]
  }, [events])

  if (!lead) {
    return (
      <div className="lead">
        <span className="lead-tag"><span className="lead-dot" />Lead</span>
        <span className="lead-idle">Monitoring global sources…</span>
      </div>
    )
  }

  const hex = (CATEGORIES[lead.category] || {}).hex

  return (
    <div className="lead">
      <span className="lead-tag"><span className="lead-dot" />Lead</span>
      <span className="lead-cat" style={{ '--gel': hex }}>{lead.category}</span>
      <span className="lead-flap">
        <span className="lead-headline" key={lead.id}>{lead.title}</span>
      </span>
      <span className="lead-place">
        {[lead.place, lead.severity].filter(Boolean).join(' · ')}
        {lead.date && <> · {shortDate(lead.date)}</>}
      </span>
    </div>
  )
}
