import CategoryBar from './charts/CategoryBar.jsx'
import SeverityBar from './charts/SeverityBar.jsx'
import Timeline from './charts/Timeline.jsx'

// Three trend panels that all react to the active filters (fed the same `events`
// array the map and list receive).
export default function ChartsRow({ events }) {
  return (
    <section className="charts">
      <div className="chart-panel">
        <div className="chart-head">
          <h3>Events by category</h3>
          <span className="chart-sub">count in current view</span>
        </div>
        <CategoryBar events={events} />
      </div>

      <div className="chart-panel">
        <div className="chart-head">
          <h3>Coverage over time</h3>
          <span className="chart-sub">report volume per day</span>
        </div>
        <Timeline events={events} />
      </div>

      <div className="chart-panel">
        <div className="chart-head">
          <h3>Severity mix</h3>
          <span className="chart-sub">of {events.length} events</span>
        </div>
        <SeverityBar events={events} />
      </div>
    </section>
  )
}
