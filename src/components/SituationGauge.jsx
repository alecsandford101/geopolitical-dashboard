import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// The Situation Gauge — the console's single signature instrument. An analog
// master meter reading the Global Pulse (0–100, an aggregate severity index of
// the whole live feed). The needle swings with a slight overshoot to its rest
// angle; the >80 band is a red danger zone; a new Critical event triggers one
// amber phosphor pulse. Everything respects prefers-reduced-motion.
//
// The needle is rotated imperatively via the SVG `transform` attribute
// (rotate(deg cx cy)) inside a requestAnimationFrame tween — NOT a CSS transform
// transition. Rotating about (cx,cy) in user space is unambiguous (no
// transform-box), and because React never manages this attribute the parent's
// 1s clock re-render can't reset the needle mid-swing.

const CX = 122
const CY = 120
const R = 96

// value → needle angle. v=50 points straight up (0°); v=0 swings to the left
// (−90°), v=100 to the right (+90°) — matching the arc below.
const angleFor = (v) => (v - 50) * 1.8

// value → point on a circle of radius r, centred on the pivot. v=0 sits at the
// left (180°), v=100 at the right (0°); the arc bulges over the top.
function pt(v, r = R) {
  const a = ((180 - v * 1.8) * Math.PI) / 180
  return [+(CX + r * Math.cos(a)).toFixed(2), +(CY - r * Math.sin(a)).toFixed(2)]
}

const [a0x, a0y] = pt(0)
const [a100x, a100y] = pt(100)
const [c80x, c80y] = pt(80)
const ARC = `M ${a0x} ${a0y} A ${R} ${R} 0 0 0 ${a100x} ${a100y}`
const CRIT = `M ${c80x} ${c80y} A ${R} ${R} 0 0 0 ${a100x} ${a100y}`

const MAJORS = [0, 20, 40, 60, 80, 100]
const LABELS = [
  { v: 0, r: 70 },
  { v: 50, r: 70 },
  { v: 100, r: 70 },
]

// easeOutBack — settles just past the target then eases back, giving the needle
// a mechanical overshoot without any physics.
function easeOutBack(t) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const SWEEP_MS = 1150

export default function SituationGauge({ value = 0, criticalCount = 0 }) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)))
  const target = angleFor(v)
  const crit = v > 80

  const needleRef = useRef(null)
  // Where the needle currently points. Starts fully swung left (the "at rest /
  // powering up" position) so mount plays an intro sweep to the live reading;
  // under reduced motion it starts on the target so there's nothing to animate.
  const angleRef = useRef(prefersReduced ? target : angleFor(0))

  const setNeedle = (deg) => {
    const el = needleRef.current
    if (el) el.setAttribute('transform', `rotate(${deg.toFixed(3)} ${CX} ${CY})`)
  }

  // Paint the starting angle before first paint so there's no flash at 0°.
  useLayoutEffect(() => {
    setNeedle(angleRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tween from the current angle to the target whenever the reading changes.
  useEffect(() => {
    const from = angleRef.current
    const to = target
    if (prefersReduced || from === to) {
      angleRef.current = to
      setNeedle(to)
      return
    }
    let raf = 0
    let start = null
    let done = false
    const finish = () => {
      if (done) return
      done = true
      cancelAnimationFrame(raf)
      angleRef.current = to
      setNeedle(to)
    }
    const step = (ts) => {
      // A frame queued before finish() (e.g. rAF paused on a hidden tab, then
      // resumed) must not resurrect the tween and replay it from the start.
      if (done) return
      if (start === null) start = ts
      const t = Math.min(1, (ts - start) / SWEEP_MS)
      const a = from + (to - from) * easeOutBack(t)
      angleRef.current = a
      setNeedle(a)
      if (t < 1) raf = requestAnimationFrame(step)
      else finish()
    }
    raf = requestAnimationFrame(step)
    // rAF is paused while the tab is hidden; a timer still fires (throttled), so
    // the needle always reaches its rest angle even if the sweep never plays.
    const fallback = setTimeout(finish, SWEEP_MS + 80)
    return () => { cancelAnimationFrame(raf); clearTimeout(fallback) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  // One amber phosphor pulse when a fresh Critical lands on the board.
  const [pulsing, setPulsing] = useState(false)
  const prevCrit = useRef(null)
  const timer = useRef(null)

  useEffect(() => {
    if (prefersReduced) { prevCrit.current = criticalCount; return }
    const fresh =
      (prevCrit.current === null && criticalCount > 0) ||
      (prevCrit.current !== null && criticalCount > prevCrit.current)
    prevCrit.current = criticalCount
    if (fresh) {
      setPulsing(false)
      const raf = requestAnimationFrame(() => setPulsing(true))
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setPulsing(false), 1700)
      return () => cancelAnimationFrame(raf)
    }
  }, [criticalCount])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <div className={`gauge${crit ? ' crit' : ''}${pulsing ? ' pulsing' : ''}`}>
      <svg
        className="gauge-svg"
        viewBox="0 0 244 184"
        role="img"
        aria-label={`Global pulse ${v} out of 100${crit ? ', critical' : ''}`}
      >
        <circle className="gauge-glow" cx={CX} cy={CY} r="66" />

        <path className="gauge-arc" d={ARC} />
        <path className="gauge-arc-crit" d={CRIT} />

        {MAJORS.map((m) => {
          const [ox, oy] = pt(m, R + 4)
          const [ix, iy] = pt(m, R - 9)
          return <line key={m} className="gauge-tick maj" x1={ox} y1={oy} x2={ix} y2={iy} />
        })}

        {LABELS.map(({ v: lv, r }) => {
          const [lx, ly] = pt(lv, r)
          return (
            <text key={lv} className="gauge-ticklabel" x={lx} y={ly + 3}>
              {lv}
            </text>
          )
        })}

        <g className="gauge-needle" ref={needleRef}>
          <line x1={CX} y1={CY} x2={CX} y2="36" />
        </g>

        <circle className="gauge-hub" cx={CX} cy={CY} r="8" />
        <circle className="gauge-hub2" cx={CX} cy={CY} r="2.5" />
      </svg>

      <div className="gauge-readout">
        <span className="gauge-val">{v}</span>
        <span className="gauge-label">Global Pulse</span>
      </div>
    </div>
  )
}
