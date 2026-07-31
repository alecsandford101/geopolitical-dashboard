// News → commodities & FX map. For each category we list liquid, tradable
// commodity and currency instruments and the DIRECTION they structurally take
// when that category of news is active. The Commodities & FX panel aggregates the
// events in the current view, weights each by severity + recency, and ranks the
// implicated instruments — so the list reflects what the live feed is actually
// driving, not a static watchlist.
//
// Unlike the equities playbook (structurally long names), macro instruments are
// directional: `dir` is 'long' or 'short' per idea. `klass` is 'Commodity' or 'FX'.
// When an instrument is implicated by several categories, the ranker resolves it to
// the dominant (highest-scoring) category's call — the strongest active theme sets
// the direction. Every instrument, direction and thesis below was drafted and then
// adversarially verified by the `macro-playbook-verify` workflow (27 checks: all
// tradable, all directions confirmed; theses tightened per its notes — several
// FX/gold calls are conditional on the hawkish/risk-off regime). Educational, not
// investment advice.
//
// `signals` are thesis-relevant keywords. When a live headline in the idea's category
// actually names one (title, description, place or market tags), the ranker boosts
// that pick, so the desk reorders around what the news says — not just how heavy its
// category is. The matched terms show on the card as the live trigger.
export const MACRO_PLAYBOOK = {
  'Conflict': {
    ideas: [
      { ticker: 'XAU', name: 'Gold', klass: 'Commodity', dir: 'long', theme: 'Safe haven', thesis: 'War and escalation drive safe-haven flows into gold, the asset investors buy when geopolitical risk spikes.', confidence: 'high', signals: ['gold', 'safe haven', 'safe-haven', 'haven', 'escalat', 'war'] },
      { ticker: 'BRENT', name: 'Brent Crude', klass: 'Commodity', dir: 'long', theme: 'Oil supply risk', thesis: 'Conflict near oil regions or transit chokepoints threatens supply and adds a risk premium to crude.', confidence: 'high', signals: ['oil', 'crude', 'brent', 'chokepoint', 'hormuz', 'strait', 'tanker', 'supply'] },
      { ticker: 'CHF', name: 'Swiss Franc', klass: 'FX', dir: 'long', theme: 'Haven currency', thesis: 'Conflict triggers safe-haven flows into the franc (funding repatriation, Swiss stability and surplus); SNB intervention can cap extreme upside.', confidence: 'medium', signals: ['safe haven', 'haven', 'risk-off', 'flight', 'franc', 'escalat'] },
      { ticker: 'WHEAT', name: 'Wheat', klass: 'Commodity', dir: 'long', theme: 'Breadbasket risk', thesis: 'Fighting in grain-exporting regions or blocked export routes cuts supply and lifts wheat futures.', confidence: 'medium', signals: ['wheat', 'grain', 'breadbasket', 'black sea', 'harvest', 'export'] },
    ],
  },
  'Monetary Policy': {
    ideas: [
      { ticker: 'USD', name: 'US Dollar (DXY)', klass: 'FX', dir: 'long', theme: 'Rate differential', thesis: 'A hawkish, higher-for-longer Fed widens the dollar’s yield advantage, drawing capital into USD. Sign flips on a dovish pivot.', confidence: 'high', signals: ['rate hike', 'hawkish', 'higher for longer', 'fed', 'yields', 'tightening', 'dollar'] },
      { ticker: 'JPY', name: 'Japanese Yen', klass: 'FX', dir: 'short', theme: 'Carry funding', thesis: 'Wide rate gaps make the low-yield yen the carry funding leg. Holds while the Fed is hawkish and the BOJ dovish; reverses if the BOJ tightens or risk-off unwinds carry.', confidence: 'medium', signals: ['rate', 'boj', 'yen', 'carry', 'intervention'] },
      { ticker: 'XAU', name: 'Gold', klass: 'Commodity', dir: 'short', theme: 'Real-rate headwind', thesis: 'A hawkish surprise lifts real yields and the dollar, raising the cost of holding non-yielding gold. Dovish easing reverses it.', confidence: 'medium', signals: ['rate hike', 'hawkish', 'real yields', 'tightening', 'fed'] },
    ],
  },
  'Trade & Tariffs': {
    ideas: [
      { ticker: 'CNH', name: 'Offshore Yuan', klass: 'FX', dir: 'short', theme: 'Tariff offset', thesis: 'Tariffs are an export and growth shock; the PBoC guides the fix weaker to cushion exporters, so USD/CNH rises and the yuan falls.', confidence: 'high', signals: ['tariff', 'china', 'yuan', 'duties', 'export', 'pboc', 'retaliat'] },
      { ticker: 'USD', name: 'US Dollar (DXY)', klass: 'FX', dir: 'long', theme: 'Tariff haven', thesis: 'Trade-war escalation drives risk-off flows into the dollar, the reserve currency, plus relative Fed hawkishness — a safe-haven bid, not reflation.', confidence: 'medium', signals: ['tariff', 'trade war', 'risk-off', 'duties'] },
      { ticker: 'MXN', name: 'Mexican Peso', klass: 'FX', dir: 'short', theme: 'Supply-chain risk', thesis: 'Tariff threats on cross-border trade hit the trade-sensitive peso, whose economy leans on US-bound exports.', confidence: 'medium', signals: ['tariff', 'mexico', 'peso', 'border', 'trade'] },
      { ticker: 'SOYB', name: 'Soybeans', klass: 'Commodity', dir: 'short', theme: 'Retaliation target', thesis: 'China retaliates against US farm exports, and diverted soybean demand pressures Chicago futures lower.', confidence: 'medium', signals: ['soybean', 'soy', 'china', 'tariff', 'farm', 'agriculture', 'retaliat'] },
    ],
  },
  'Energy': {
    ideas: [
      { ticker: 'BRENT', name: 'Brent Crude', klass: 'Commodity', dir: 'long', theme: 'Crude supply', thesis: 'OPEC+ cuts or supply shocks tighten the oil balance, and the global benchmark reprices higher.', confidence: 'high', signals: ['oil', 'crude', 'brent', 'opec', 'barrel', 'production cut', 'supply'] },
      { ticker: 'NATGAS', name: 'Natural Gas', klass: 'Commodity', dir: 'long', theme: 'Gas supply crunch', thesis: 'Pipeline outages, cold snaps or LNG-supply crises drain inventories and spike Henry Hub gas.', confidence: 'high', signals: ['natural gas', 'gas', 'pipeline', 'lng', 'henry hub', 'cold'] },
      { ticker: 'CAD', name: 'Canadian Dollar', klass: 'FX', dir: 'long', theme: 'Petro-currency', thesis: 'As a net oil exporter, Canada sees rising crude improve its terms of trade, tending to support the loonie — a positive but partial correlation.', confidence: 'medium', signals: ['oil', 'crude', 'energy', 'canada', 'loonie'] },
      { ticker: 'NOK', name: 'Norwegian Krone', klass: 'FX', dir: 'long', theme: 'Oil exporter', thesis: 'Higher energy prices improve net-exporter Norway’s terms of trade — a modest krone tailwind, though risk sentiment and rate gaps often dominate NOK.', confidence: 'low', signals: ['oil', 'energy', 'crude', 'norway', 'krone'] },
    ],
  },
  'Sanctions': {
    ideas: [
      { ticker: 'BRENT', name: 'Brent Crude', klass: 'Commodity', dir: 'long', theme: 'Barrels at risk', thesis: 'Sanctions on Russian, Iranian or Venezuelan crude curb and reroute supply, adding a risk premium and tightening the balance at the margin.', confidence: 'high', signals: ['oil', 'crude', 'russian', 'iran', 'venezuela', 'embargo', 'ban', 'barrel'] },
      { ticker: 'XAU', name: 'Gold', klass: 'Commodity', dir: 'long', theme: 'Reserve hedge', thesis: 'Reserve freezes drive safe-haven flows plus a structural central-bank shift into non-freezable gold reserves; both bid bullion higher.', confidence: 'medium', signals: ['gold', 'reserve', 'freeze', 'central bank', 'haven'] },
      { ticker: 'NATGAS', name: 'Natural Gas', klass: 'Commodity', dir: 'long', theme: 'Supply removed', thesis: 'Sanctioning a major gas exporter removes supply and forces costlier substitution — prices up, strongest in the sanctioning region’s benchmark (e.g. TTF).', confidence: 'medium', signals: ['gas', 'pipeline', 'lng', 'export'] },
      { ticker: 'USD', name: 'US Dollar (DXY)', klass: 'FX', dir: 'long', theme: 'Dollar funding', thesis: 'Sanctions episodes trigger safe-haven flight and dollar-funding scarcity — settlement runs through USD clearing — lifting near-term USD demand.', confidence: 'low', signals: ['sanction', 'dollar', 'funding', 'clearing'] },
    ],
  },
  'Elections': {
    ideas: [
      { ticker: 'XAU', name: 'Gold', klass: 'Commodity', dir: 'long', theme: 'Uncertainty hedge', thesis: 'Contested elections raise policy uncertainty, adding a safe-haven bid for gold — but a modest, transient one versus real yields, the dollar and Fed policy.', confidence: 'low', signals: ['election', 'uncertainty', 'contested', 'vote', 'haven'] },
      { ticker: 'MXN', name: 'Mexican Peso', klass: 'FX', dir: 'short', theme: 'Risk premium', thesis: 'Election uncertainty in or around emerging markets adds a risk premium that pressures high-beta EM FX.', confidence: 'low', signals: ['election', 'emerging market', 'uncertainty', 'peso'] },
    ],
  },
  'Cyber & Security': {
    ideas: [
      { ticker: 'NATGAS', name: 'Natural Gas', klass: 'Commodity', dir: 'long', theme: 'Infra attack', thesis: 'Cyberattacks on gas pipeline, LNG or grid control systems can halt flows and tighten near-term supply. (Colonial 2021 hit refined-fuel logistics, not gas.)', confidence: 'medium', signals: ['pipeline', 'grid', 'gas', 'infrastructure', 'lng', 'control system'] },
      { ticker: 'XAU', name: 'Gold', klass: 'Commodity', dir: 'long', theme: 'Systemic risk', thesis: 'Major attacks on financial or critical infrastructure can spur a modest safe-haven bid for gold, but it is small, unreliable and usually fades absent wider contagion.', confidence: 'low', signals: ['systemic', 'infrastructure', 'attack', 'financial', 'haven'] },
    ],
  },
  'Disaster & Logistics': {
    ideas: [
      { ticker: 'NATGAS', name: 'Natural Gas', klass: 'Commodity', dir: 'long', theme: 'Gulf disruption', thesis: 'Hurricanes shut in Gulf gas production and processing faster than they cut demand, tightening supply — a classic spike, though LNG-export outages can blunt it.', confidence: 'medium', signals: ['hurricane', 'gulf', 'storm', 'landfall', 'shut-in', 'freeze'] },
      { ticker: 'WTI', name: 'WTI Crude', klass: 'Commodity', dir: 'long', theme: 'Production shut-in', thesis: 'A Gulf hurricane shutting in offshore crude production tightens supply and lifts WTI. NB: refinery outages cut crude demand and can mute the move.', confidence: 'low', signals: ['hurricane', 'gulf', 'offshore', 'shut-in', 'storm', 'landfall'] },
      { ticker: 'WHEAT', name: 'Wheat', klass: 'Commodity', dir: 'long', theme: 'Crop damage', thesis: 'Drought, freeze or flood in key wheat belts, or Black Sea and river export-logistics disruption, cuts exportable supply and tightens balances.', confidence: 'medium', signals: ['drought', 'freeze', 'flood', 'harvest', 'crop', 'black sea', 'wheat'] },
      { ticker: 'KC', name: 'Coffee', klass: 'Commodity', dir: 'long', theme: 'Crop shock', thesis: 'Frost or drought in Brazil, the dominant grower, damages the harvest and drives arabica futures higher.', confidence: 'medium', signals: ['frost', 'drought', 'brazil', 'coffee', 'harvest', 'crop'] },
    ],
  },
}
