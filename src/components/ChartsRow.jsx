import CategoryBar from './charts/CategoryBar.jsx'
import SeverityBar from './charts/SeverityBar.jsx'
import Timeline from './charts/Timeline.jsx'

// Three trend panels that all react to the active filters (fed the same `events`
// array the map and list receive).
export default function ChartsRow({ events }) {
  return (
    <section className="charts">
      <div className="chart-panel">
        <div className="section-head">
          <div className="sh-left">
            <span className="eyebrow">Distribution</span>
            <h2>By category</h2>
          </div>
          <span className="sh-meta">current view</span>
        </div>
        <div className="chart-body"><CategoryBar events={events} /></div>
      </div>

      <div className="chart-panel">
        <div className="section-head">
          <div className="sh-left">
            <span className="eyebrow">Volume</span>
            <h2>Coverage over time</h2>
          </div>
          <span className="sh-meta">reports / day</span>
        </div>
        <div className="chart-body"><Timeline events={events} /></div>
      </div>

      <div className="chart-panel">
        <div className="section-head">
          <div className="sh-left">
            <span className="eyebrow">Severity</span>
            <h2>Risk mix</h2>
          </div>
          <span className="sh-meta">of {events.length} events</span>
        </div>
        <div className="chart-body"><SeverityBar events={events} /></div>
      </div>
    </section>
  )
}
