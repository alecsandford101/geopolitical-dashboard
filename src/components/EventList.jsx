import EventCard from './EventCard.jsx'

export default function EventList({ events, selectedId, onSelect }) {
  return (
    <div className="panel">
      <div className="section-head">
        <div className="sh-left">
          <span className="eyebrow">Feed</span>
          <h2>Event stream</h2>
        </div>
        <span className="sh-meta">sorted by severity</span>
      </div>
      <div className="list">
        {events.length === 0 ? (
          <div className="empty">No events match your filters.</div>
        ) : (
          events.map((ev) => (
            <EventCard
              key={ev.id}
              ev={ev}
              active={selectedId === ev.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  )
}
