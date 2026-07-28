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
export const CATEGORY_PLAYBOOK = {
  'Conflict': {
    direction: 'long',
    ideas: [
      { ticker: 'LMT', name: 'Lockheed Martin', theme: 'Defense primes', thesis: 'Escalating conflict expands defense budgets and aircraft/missile procurement, growing Lockheed’s multi-year backlog.', confidence: 'high' },
      { ticker: 'RTX', name: 'RTX Corporation', theme: 'Missiles & air defense', thesis: 'Active fighting expends missiles and interceptors faster than they are built, forcing government restock orders.', confidence: 'high' },
      { ticker: 'XOM', name: 'Exxon Mobil', theme: 'Oil majors', thesis: 'Conflict near oil regions or transit chokepoints threatens supply and spikes crude, widening upstream margins.', confidence: 'high' },
      { ticker: 'NEM', name: 'Newmont', theme: 'Gold miners', thesis: 'War-driven safe-haven demand lifts gold, and rising prices flow with operating leverage into miner earnings.', confidence: 'medium' },
    ],
  },
  'Monetary Policy': {
    direction: 'long',
    ideas: [
      { ticker: 'CME', name: 'CME Group', theme: 'Rate-derivatives exchange', thesis: 'Every Fed decision forces traders to rebalance in CME’s SOFR and Treasury futures, earning it a fee per contract.', confidence: 'high' },
      { ticker: 'ICE', name: 'Intercontinental Exchange', theme: 'Rates & fixed income', thesis: 'Central-bank moves lift ICE’s rate and fixed-income volumes and demand for its bond-pricing data.', confidence: 'high' },
      { ticker: 'FHI', name: 'Federated Hermes', theme: 'Money-market funds', thesis: 'Higher-for-longer rates swell money-fund assets and end fee waivers, expanding Federated’s fee revenue.', confidence: 'medium' },
      { ticker: 'IBKR', name: 'Interactive Brokers', theme: 'Broker net interest', thesis: 'Elevated rates widen the spread IBKR earns on client cash and margin balances — its largest revenue line.', confidence: 'medium' },
    ],
  },
  'Trade & Tariffs': {
    direction: 'long',
    ideas: [
      { ticker: 'NUE', name: 'Nucor', theme: 'Domestic steel', thesis: 'Section 232 duties raise the cost of foreign steel, handing the largest US producer pricing power and share.', confidence: 'high' },
      { ticker: 'STLD', name: 'Steel Dynamics', theme: 'Domestic steel', thesis: 'Tariffs and quotas shift demand to low-cost domestic mini-mills, widening Steel Dynamics’ metal spreads.', confidence: 'high' },
      { ticker: 'CLF', name: 'Cleveland-Cliffs', theme: 'Domestic steel', thesis: 'Import barriers keep cheap foreign coil out of the US auto supply chain, expanding Cliffs’ flat-rolled margins.', confidence: 'medium' },
      { ticker: 'AA', name: 'Alcoa', theme: 'Domestic aluminum', thesis: 'Aluminum import tariffs push up the US Midwest premium and realized pricing on the metal Alcoa sells here.', confidence: 'medium' },
    ],
  },
  'Energy': {
    direction: 'long',
    ideas: [
      { ticker: 'XOM', name: 'Exxon Mobil', theme: 'Integrated oil majors', thesis: 'Higher crude and gas prices from OPEC cuts or supply shocks flow straight into Exxon’s upstream revenue.', confidence: 'high' },
      { ticker: 'COP', name: 'ConocoPhillips', theme: 'Upstream pure-play', thesis: 'With no refining segment, Conoco has near-undiluted earnings leverage to rising crude and gas prices.', confidence: 'high' },
      { ticker: 'OXY', name: 'Occidental Petroleum', theme: 'High-beta E&P', thesis: 'Oil-weighted output plus balance-sheet leverage turn crude-price spikes into outsized share-price upside.', confidence: 'high' },
      { ticker: 'LNG', name: 'Cheniere Energy', theme: 'LNG exports', thesis: 'Gas-supply crises raise global LNG demand and spot spreads above Cheniere’s fixed take-or-pay margins.', confidence: 'high' },
    ],
  },
  'Sanctions': {
    direction: 'long',
    ideas: [
      { ticker: 'XOM', name: 'Exxon Mobil', theme: 'Oil majors', thesis: 'Bans that strip Russian, Iranian and Venezuelan crude from supply tighten the oil balance and lift prices.', confidence: 'high' },
      { ticker: 'NEM', name: 'Newmont', theme: 'Gold miners', thesis: 'Reserve-asset freezes push central banks to diversify into gold, lifting bullion and miner margins.', confidence: 'medium' },
      { ticker: 'NICE', name: 'NICE Ltd', theme: 'Compliance software', thesis: 'Each new sanctions round forces banks to re-screen payments, driving demand for NICE Actimize’s platform.', confidence: 'medium' },
      { ticker: 'TRI', name: 'Thomson Reuters', theme: 'Screening data', thesis: 'More blacklist entries raise screening volume, driving World-Check subscriptions as firms avoid breaches.', confidence: 'medium' },
    ],
  },
  'Elections': {
    direction: 'long',
    ideas: [
      { ticker: 'NXST', name: 'Nexstar Media Group', theme: 'Political advertising', thesis: 'Election cycles force campaigns to buy finite local-TV airtime, surging Nexstar’s high-margin ad revenue.', confidence: 'high' },
      { ticker: 'CBOE', name: 'Cboe Global Markets', theme: 'Volatility', thesis: 'Election uncertainty lifts the VIX and index-options hedging on Cboe’s proprietary VIX and SPX products.', confidence: 'medium' },
      { ticker: 'CME', name: 'CME Group', theme: 'Hedging venues', thesis: 'Electoral uncertainty raises hedging in rate, FX and equity-index futures — CME’s core contracts.', confidence: 'medium' },
      { ticker: 'IBKR', name: 'Interactive Brokers', theme: 'Brokerage', thesis: 'Election-period volatility spikes trading activity, lifting commissions and margin-lending balances.', confidence: 'low' },
    ],
  },
  'Cyber & Security': {
    direction: 'long',
    ideas: [
      { ticker: 'CRWD', name: 'CrowdStrike', theme: 'Endpoint & XDR', thesis: 'High-profile ransomware and breaches push enterprises onto CrowdStrike’s Falcon platform, expanding ARR.', confidence: 'high' },
      { ticker: 'PANW', name: 'Palo Alto Networks', theme: 'Platform security', thesis: 'Rising attacks drive consolidation onto Palo Alto’s network, cloud and SOC stack, lifting next-gen ARR.', confidence: 'high' },
      { ticker: 'ZS', name: 'Zscaler', theme: 'Zero-trust', thesis: 'Breach headlines accelerate zero-trust and secure-access adoption, growing Zscaler’s cloud billings.', confidence: 'high' },
      { ticker: 'FTNT', name: 'Fortinet', theme: 'Network security', thesis: 'Heightened malware and ransomware raise demand for Fortinet’s firewalls and security-fabric appliances.', confidence: 'high' },
    ],
  },
  'Disaster & Logistics': {
    direction: 'long',
    ideas: [
      { ticker: 'GNRC', name: 'Generac Holdings', theme: 'Backup power', thesis: 'Hurricanes, floods and grid failures spike demand for Generac’s home standby generators, where it leads share.', confidence: 'high' },
      { ticker: 'HD', name: 'The Home Depot', theme: 'Rebuild & repair', thesis: 'Post-disaster rebuilding pulls forward roofing, drywall and generator spend across Home Depot’s big-box footprint.', confidence: 'high' },
      { ticker: 'ZIM', name: 'ZIM Integrated Shipping', theme: 'Container shipping', thesis: 'Port closures tighten vessel capacity and spike spot freight rates, which ZIM’s leverage amplifies per container.', confidence: 'medium' },
      { ticker: 'MATX', name: 'Matson', theme: 'Expedited shipping', thesis: 'Supply-chain bottlenecks raise expedited trans-Pacific rates, and Matson’s premium fast service captures the pricing.', confidence: 'medium' },
      { ticker: 'MMC', name: 'Marsh & McLennan', theme: 'Insurance brokers', thesis: 'Large catastrophe losses harden P&C pricing, lifting broker Marsh’s commissions without bearing any claims.', confidence: 'medium' },
    ],
  },
}
