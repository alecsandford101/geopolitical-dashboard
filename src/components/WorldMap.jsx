import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { SEVERITY, SEV_ORDER } from '../config/constants.js'

// Flies the map to the selected event and opens its popup. The full-viewport
// pan/zoom is a vestibular trigger, so it's suppressed (jump-cut) when the user
// asks for reduced motion.
function FlyController({ selectedId, events, markerRefs }) {
  const map = useMap()
  useEffect(() => {
    if (selectedId == null) return
    const ev = events.find((e) => e.id === selectedId)
    if (!ev) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const zoom = Math.max(map.getZoom(), 4)
    if (reduce) map.setView([ev.lat, ev.lng], zoom, { animate: false })
    else map.flyTo([ev.lat, ev.lng], zoom, { duration: 0.6 })
    const marker = markerRefs.current[selectedId]
    if (marker) marker.openPopup()
  }, [selectedId, events, map, markerRefs])
  return null
}

export default function WorldMap({ events, selectedId, onSelect }) {
  const markerRefs = useRef({})

  return (
    <div className="panel map-wrap">
      <div className="section-head">
        <div className="sh-left">
          <span className="eyebrow">Big board</span>
          <h2>Global event map</h2>
        </div>
        <span className="sh-meta">size &amp; color = severity · click to inspect</span>
      </div>

      <MapContainer
        center={[25, 15]}
        zoom={2}
        minZoom={2}
        worldCopyJump
        style={{ height: 560, width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />

        {events.map((ev) => {
          const sev = SEVERITY[ev.severity]
          return (
            <CircleMarker
              key={ev.id}
              center={[ev.lat, ev.lng]}
              radius={sev.radius}
              pathOptions={{ color: '#120e09', weight: 1.5, fillColor: sev.hex, fillOpacity: 0.9 }}
              ref={(inst) => { if (inst) markerRefs.current[ev.id] = inst }}
              eventHandlers={{ click: () => onSelect(ev.id) }}
            >
              <Popup>
                <div className="popup-title">{ev.title}</div>
                <div className="popup-meta">
                  {ev.category} · {ev.severity} · {ev.date}
                  <br />{ev.place}
                </div>
                {ev.sources?.length > 0 && (
                  <div className="src-links">
                    {ev.sources.slice(0, 3).map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer">↗ {s.domain || 'source'}</a>
                    ))}
                  </div>
                )}
              </Popup>
            </CircleMarker>
          )
        })}

        <FlyController selectedId={selectedId} events={events} markerRefs={markerRefs} />
      </MapContainer>

      <div className="legend">
        {Object.keys(SEVERITY)
          .sort((a, b) => SEV_ORDER[b] - SEV_ORDER[a])
          .map((k) => (
            <span key={k} className="item">
              <span className="swatch" style={{ background: SEVERITY[k].hex }} />{k}
            </span>
          ))}
      </div>
    </div>
  )
}
