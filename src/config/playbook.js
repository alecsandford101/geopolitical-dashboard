// News → equities map. For each category we list liquid, US-listed stocks that
// structurally BENEFIT when that category of news is active. The Positioning panel
// aggregates the events in the current view, weights each by severity + recency, and
// ranks the implicated tickers — so the list reflects what the live feed is actually
// driving, not a static watchlist.
//
// Every ticker, direction and thesis below was drafted and then adversarially
// verified (symbol currency, direction, liquidity, thesis) by the `stock-playbook`
// workflow — corrections it made include Newmont (NEM) for gold rather than an ETF,
// the CME/ICE/FHI/IBKR rates complex for Monetary Policy, and OXY as the high-beta
// energy play. Educational, not investment advice.
//
// `signals` are thesis-relevant keywords. When a live headline in the idea's category
// actually names one (title, description, place or market tags), the ranker boosts
// that pick, so the desk reorders around what the news says — not just how heavy its
// category is. The matched terms show on the card as the live trigger.
export const CATEGORY_PLAYBOOK = {
  'Conflict': {
    direction: 'long',
    ideas: [
      { ticker: 'LMT', name: 'Lockheed Martin', theme: 'Defense primes', thesis: 'Escalating conflict expands defense budgets and aircraft/missile procurement, growing Lockheed’s multi-year backlog.', confidence: 'high', signals: ['war', 'military', 'missile', 'strike', 'invasion', 'airstrike', 'defense', 'troops', 'escalat'] },
      { ticker: 'RTX', name: 'RTX Corporation', theme: 'Missiles & air defense', thesis: 'Active fighting expends missiles and interceptors faster than they are built, forcing government restock orders.', confidence: 'high', signals: ['missile', 'interceptor', 'air defense', 'strike', 'rocket', 'drone', 'war'] },
      { ticker: 'XOM', name: 'Exxon Mobil', theme: 'Oil majors', thesis: 'Conflict near oil regions or transit chokepoints threatens supply and spikes crude, widening upstream margins.', confidence: 'high', signals: ['oil', 'crude', 'brent', 'chokepoint', 'hormuz', 'strait', 'tanker', 'supply'] },
      { ticker: 'NEM', name: 'Newmont', theme: 'Gold miners', thesis: 'War-driven safe-haven demand lifts gold, and rising prices flow with operating leverage into miner earnings.', confidence: 'medium', signals: ['gold', 'safe haven', 'safe-haven', 'haven', 'bullion'] },
    ],
  },
  'Monetary Policy': {
    direction: 'long',
    ideas: [
      { ticker: 'CME', name: 'CME Group', theme: 'Rate-derivatives exchange', thesis: 'Every Fed decision forces traders to rebalance in CME’s SOFR and Treasury futures, earning it a fee per contract.', confidence: 'high', signals: ['rate', 'fed', 'interest rate', 'hike', 'sofr', 'treasury', 'fomc', 'hawkish'] },
      { ticker: 'ICE', name: 'Intercontinental Exchange', theme: 'Rates & fixed income', thesis: 'Central-bank moves lift ICE’s rate and fixed-income volumes and demand for its bond-pricing data.', confidence: 'high', signals: ['rate', 'bond', 'fixed income', 'yields', 'treasury', 'fed'] },
      { ticker: 'FHI', name: 'Federated Hermes', theme: 'Money-market funds', thesis: 'Higher-for-longer rates swell money-fund assets and end fee waivers, expanding Federated’s fee revenue.', confidence: 'medium', signals: ['higher for longer', 'rate', 'money market', 'yields', 'hawkish'] },
      { ticker: 'IBKR', name: 'Interactive Brokers', theme: 'Broker net interest', thesis: 'Elevated rates widen the spread IBKR earns on client cash and margin balances — its largest revenue line.', confidence: 'medium', signals: ['rate', 'interest rate', 'yields', 'fed', 'higher for longer'] },
    ],
  },
  'Trade & Tariffs': {
    direction: 'long',
    ideas: [
      { ticker: 'NUE', name: 'Nucor', theme: 'Domestic steel', thesis: 'Section 232 duties raise the cost of foreign steel, handing the largest US producer pricing power and share.', confidence: 'high', signals: ['steel', 'tariff', 'section 232', 'duties', 'import', 'metal'] },
      { ticker: 'STLD', name: 'Steel Dynamics', theme: 'Domestic steel', thesis: 'Tariffs and quotas shift demand to low-cost domestic mini-mills, widening Steel Dynamics’ metal spreads.', confidence: 'high', signals: ['steel', 'tariff', 'duties', 'import', 'quota'] },
      { ticker: 'CLF', name: 'Cleveland-Cliffs', theme: 'Domestic steel', thesis: 'Import barriers keep cheap foreign coil out of the US auto supply chain, expanding Cliffs’ flat-rolled margins.', confidence: 'medium', signals: ['steel', 'tariff', 'import', 'auto', 'coil', 'duties'] },
      { ticker: 'AA', name: 'Alcoa', theme: 'Domestic aluminum', thesis: 'Aluminum import tariffs push up the US Midwest premium and realized pricing on the metal Alcoa sells here.', confidence: 'medium', signals: ['aluminum', 'aluminium', 'tariff', 'import', 'metal', 'premium'] },
    ],
  },
  'Energy': {
    direction: 'long',
    ideas: [
      { ticker: 'XOM', name: 'Exxon Mobil', theme: 'Integrated oil majors', thesis: 'Higher crude and gas prices from OPEC cuts or supply shocks flow straight into Exxon’s upstream revenue.', confidence: 'high', signals: ['oil', 'crude', 'brent', 'opec', 'gas', 'barrel', 'production cut'] },
      { ticker: 'COP', name: 'ConocoPhillips', theme: 'Upstream pure-play', thesis: 'With no refining segment, Conoco has near-undiluted earnings leverage to rising crude and gas prices.', confidence: 'high', signals: ['oil', 'crude', 'brent', 'opec', 'barrel', 'production cut'] },
      { ticker: 'OXY', name: 'Occidental Petroleum', theme: 'High-beta E&P', thesis: 'Oil-weighted output plus balance-sheet leverage turn crude-price spikes into outsized share-price upside.', confidence: 'high', signals: ['oil', 'crude', 'brent', 'opec', 'barrel'] },
      { ticker: 'LNG', name: 'Cheniere Energy', theme: 'LNG exports', thesis: 'Gas-supply crises raise global LNG demand and spot spreads above Cheniere’s fixed take-or-pay margins.', confidence: 'high', signals: ['lng', 'natural gas', 'gas', 'pipeline', 'export'] },
    ],
  },
  'Sanctions': {
    direction: 'long',
    ideas: [
      { ticker: 'XOM', name: 'Exxon Mobil', theme: 'Oil majors', thesis: 'Bans that strip Russian, Iranian and Venezuelan crude from supply tighten the oil balance and lift prices.', confidence: 'high', signals: ['oil', 'crude', 'russian', 'iran', 'venezuela', 'embargo', 'ban'] },
      { ticker: 'NEM', name: 'Newmont', theme: 'Gold miners', thesis: 'Reserve-asset freezes push central banks to diversify into gold, lifting bullion and miner margins.', confidence: 'medium', signals: ['gold', 'reserve', 'central bank', 'freeze', 'haven', 'bullion'] },
      { ticker: 'NICE', name: 'NICE Ltd', theme: 'Compliance software', thesis: 'Each new sanctions round forces banks to re-screen payments, driving demand for NICE Actimize’s platform.', confidence: 'medium', signals: ['sanction', 'compliance', 'screening', 'bank', 'payments'] },
      { ticker: 'TRI', name: 'Thomson Reuters', theme: 'Screening data', thesis: 'More blacklist entries raise screening volume, driving World-Check subscriptions as firms avoid breaches.', confidence: 'medium', signals: ['sanction', 'blacklist', 'screening', 'compliance'] },
    ],
  },
  'Elections': {
    direction: 'long',
    ideas: [
      { ticker: 'NXST', name: 'Nexstar Media Group', theme: 'Political advertising', thesis: 'Election cycles force campaigns to buy finite local-TV airtime, surging Nexstar’s high-margin ad revenue.', confidence: 'high', signals: ['election', 'campaign', 'vote', 'ballot', 'primary', 'poll'] },
      { ticker: 'CBOE', name: 'Cboe Global Markets', theme: 'Volatility', thesis: 'Election uncertainty lifts the VIX and index-options hedging on Cboe’s proprietary VIX and SPX products.', confidence: 'medium', signals: ['election', 'uncertainty', 'volatility', 'vix'] },
      { ticker: 'CME', name: 'CME Group', theme: 'Hedging venues', thesis: 'Electoral uncertainty raises hedging in rate, FX and equity-index futures — CME’s core contracts.', confidence: 'medium', signals: ['election', 'hedging', 'uncertainty', 'futures'] },
      { ticker: 'IBKR', name: 'Interactive Brokers', theme: 'Brokerage', thesis: 'Election-period volatility spikes trading activity, lifting commissions and margin-lending balances.', confidence: 'low', signals: ['election', 'volatility', 'trading'] },
    ],
  },
  'Cyber & Security': {
    direction: 'long',
    ideas: [
      { ticker: 'CRWD', name: 'CrowdStrike', theme: 'Endpoint & XDR', thesis: 'High-profile ransomware and breaches push enterprises onto CrowdStrike’s Falcon platform, expanding ARR.', confidence: 'high', signals: ['ransomware', 'breach', 'cyberattack', 'hack', 'malware', 'cyber', 'attack'] },
      { ticker: 'PANW', name: 'Palo Alto Networks', theme: 'Platform security', thesis: 'Rising attacks drive consolidation onto Palo Alto’s network, cloud and SOC stack, lifting next-gen ARR.', confidence: 'high', signals: ['cyberattack', 'breach', 'ransomware', 'hack', 'malware', 'cyber'] },
      { ticker: 'ZS', name: 'Zscaler', theme: 'Zero-trust', thesis: 'Breach headlines accelerate zero-trust and secure-access adoption, growing Zscaler’s cloud billings.', confidence: 'high', signals: ['breach', 'cyberattack', 'zero-trust', 'hack', 'ransomware', 'cyber'] },
      { ticker: 'FTNT', name: 'Fortinet', theme: 'Network security', thesis: 'Heightened malware and ransomware raise demand for Fortinet’s firewalls and security-fabric appliances.', confidence: 'high', signals: ['malware', 'ransomware', 'firewall', 'cyberattack', 'breach', 'cyber'] },
    ],
  },
  'Disaster & Logistics': {
    direction: 'long',
    ideas: [
      { ticker: 'GNRC', name: 'Generac Holdings', theme: 'Backup power', thesis: 'Hurricanes, floods and grid failures spike demand for Generac’s home standby generators, where it leads share.', confidence: 'high', signals: ['hurricane', 'flood', 'grid', 'power outage', 'storm', 'blackout', 'landfall'] },
      { ticker: 'HD', name: 'The Home Depot', theme: 'Rebuild & repair', thesis: 'Post-disaster rebuilding pulls forward roofing, drywall and generator spend across Home Depot’s big-box footprint.', confidence: 'high', signals: ['hurricane', 'flood', 'storm', 'rebuild', 'landfall', 'damage'] },
      { ticker: 'ZIM', name: 'ZIM Integrated Shipping', theme: 'Container shipping', thesis: 'Port closures tighten vessel capacity and spike spot freight rates, which ZIM’s leverage amplifies per container.', confidence: 'medium', signals: ['port', 'shipping', 'freight', 'container', 'canal', 'suez', 'panama', 'strait'] },
      { ticker: 'MATX', name: 'Matson', theme: 'Expedited shipping', thesis: 'Supply-chain bottlenecks raise expedited trans-Pacific rates, and Matson’s premium fast service captures the pricing.', confidence: 'medium', signals: ['shipping', 'freight', 'port', 'supply chain', 'trans-pacific', 'container'] },
      { ticker: 'MMC', name: 'Marsh & McLennan', theme: 'Insurance brokers', thesis: 'Large catastrophe losses harden P&C pricing, lifting broker Marsh’s commissions without bearing any claims.', confidence: 'medium', signals: ['catastrophe', 'hurricane', 'flood', 'storm', 'wildfire', 'losses', 'landfall'] },
    ],
  },
}
