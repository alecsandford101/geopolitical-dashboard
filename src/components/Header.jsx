export default function Header() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

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
        <div className="live">Live monitor</div>
        <div>{today}</div>
      </div>
    </header>
  )
}
