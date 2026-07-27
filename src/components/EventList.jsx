import EventCard from './EventCard.jsx'

export default function EventList({ events, selectedId, onSelect }) {
  return (
    <div className="panel">
      <div className="phead">
        <h2>Event feed</h2>
        <span className="hint">sorted by severity</span>
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
