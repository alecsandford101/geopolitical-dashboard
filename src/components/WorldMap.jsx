import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet'
import { CATEGORIES, SEVERITY, SEV_ORDER } from '../config/constants.js'
import { connectionsFor, sharedAssetSummary } from '../lib/connections.js'

// Flies the map to the selected event and opens its popup. The full-viewport
// pan/zoom is a vestibular trigger, so it's suppressed (jump-cut) when the user
// asks for reduced motion.
function FlyController({ selectedId, events, markerRefs }) {
  const map = useMap()
  const lastFlown = useRef(null)
  useEffect(() => {
    if (selectedId == null) {
      lastFlown.current = null
      return
    }
    // Fly only when the *selection* changes — not when `events` (App's filtered
    // array) gets a new reference on every keystroke/filter change, which would
    // otherwise yank the map back and reopen the popup mid-typing.
    if (selectedId === lastFlown.current) return
    const ev = events.find((e) => e.id === selectedId)
    if (!ev) return
    lastFlown.current = selectedId
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

// A dedicated map pane for the influence edges, below the marker layer (z 400)
// but above the tiles — so links read as connective tissue *behind* the nodes
// rather than painting over them. Created once when the map mounts, before any
// edge is ever rendered (edges only appear on selection).
function EdgePane() {
  const map = useMap()
  useEffect(() => {
    if (!map.getPane('edges')) {
      const pane = map.createPane('edges')
      pane.style.zIndex = 350
      pane.style.pointerEvents = 'none'
    }
  }, [map])
  return null
}

// Marker style by its role in the current selection. Driven entirely by numeric /
// color options (which Leaflet's setStyle updates reliably) so selecting an event
// re-paints the whole board: the pick and its linked nodes stay lit while the
// unrelated ones recede. Severity fill (the data hue) is never changed.
function nodeStyle(ev, selectedId, linkedIds, sev) {
  const base = { color: '#120e09', weight: 1.5, fillColor: sev.hex, fillOpacity: 0.9, opacity: 1 }
  if (selectedId == null) return base
  if (ev.id === selectedId) return { ...base, color: '#ece4d3', weight: 3, fillOpacity: 1 }
  if (linkedIds.has(ev.id)) return { ...base, color: '#d6b47c', weight: 2.5, fillOpacity: 1 }
  return { ...base, opacity: 0.25, fillOpacity: 0.2 } // unrelated → recede
}

export default function WorldMap({ events, selectedId, onSelect }) {
  const markerRefs = useRef({})
  const readoutRef = useRef(null)

  // Trace a link: re-select the target, then move focus to the readout region.
  // The activated row unmounts as the list recomputes, so without this a keyboard
  // user's focus would fall to <body>; the region persists, so focus lands there.
  const traceTo = (id) => {
    onSelect(id)
    readoutRef.current?.focus()
  }

  const sel = useMemo(
    () => (selectedId == null ? null : events.find((e) => e.id === selectedId) || null),
    [events, selectedId],
  )
  // The selected event's influence network (market-overlap links), within the
  // events currently on the board.
  const links = useMemo(() => connectionsFor(selectedId, events), [selectedId, events])
  const linkedIds = useMemo(() => new Set(links.map((l) => l.event.id)), [links])
  const assets = useMemo(() => sharedAssetSummary(links), [links])

  // Esc anywhere clears the selection (and with it the network overlay).
  useEffect(() => {
    if (selectedId == null) return
    const onKey = (e) => { if (e.key === 'Escape') onSelect(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, onSelect])

  return (
    <div className="panel map-wrap">
      <div className="section-head">
        <div className="sh-left">
          <span className="eyebrow">Big board</span>
          <h2>Global event map</h2>
        </div>
        <span className="sh-meta">size &amp; color = severity · select to trace links</span>
      </div>

      <div className="map-stage">
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

          <EdgePane />

          {/* Influence edges — drawn before the markers so pins sit on top. Keyed
              by both endpoints so any change of selection remounts them (keeps the
              same/cross-category class correct). Direction: earlier → later. */}
          {sel &&
            links.map((l) => {
              const b = l.event
              const later = l.laterId === b.id ? b : sel
              const earlier = later === b ? sel : b
              return (
                <Polyline
                  key={`${sel.id}-${b.id}`}
                  positions={[[earlier.lat, earlier.lng], [later.lat, later.lng]]}
                  pathOptions={{
                    className: `edge ${l.sameCat ? 'edge-same' : 'edge-cross'}`,
                    pane: 'edges',
                    color: '#b08d57',
                    weight: l.sameCat ? 1.4 : 2,
                    interactive: false,
                  }}
                />
              )
            })}

          {events.map((ev) => {
            const sev = SEVERITY[ev.severity]
            return (
              <CircleMarker
                key={ev.id}
                center={[ev.lat, ev.lng]}
                radius={sev.radius}
                pathOptions={nodeStyle(ev, selectedId, linkedIds, sev)}
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

        {/* Influence readout — names the network in words: what the pick is linked
            to, and through which shared assets. Each row traces to that event. */}
        {sel && (
          <div className="link-readout" role="region" aria-label="Influence network" ref={readoutRef} tabIndex={-1}>
            <div className="lr-head">
              <span className="eyebrow">Influence network</span>
              <button
                type="button"
                className="lr-close"
                onClick={() => onSelect(null)}
                aria-label="Clear selection"
              >✕</button>
            </div>
            <div className="lr-title">{sel.title}</div>
            {links.length > 0 ? (
              <>
                <div className="lr-sub">
                  Linked to {links.length} event{links.length !== 1 ? 's' : ''} through{' '}
                  {assets.map((a) => <span key={a} className="lr-asset">{a}</span>)}
                </div>
                <ul className="lr-list">
                  {links.map((l) => {
                    const cat = CATEGORIES[l.event.category] || {}
                    const outbound = l.laterId === l.event.id // pick → this event
                    return (
                      <li key={l.event.id}>
                        <button type="button" className="lr-item" onClick={() => traceTo(l.event.id)}>
                          <span className="lr-dot" style={{ background: cat.hex }} />
                          <span className="lr-arrow" aria-hidden="true">{outbound ? '→' : '←'}</span>
                          <span className="lr-name">{l.event.title}</span>
                          <span className="lr-via">{l.shared.slice(0, 2).join(' · ')}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : (
              <div className="lr-sub lr-empty">No linked events in the current view.</div>
            )}
          </div>
        )}
      </div>

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
