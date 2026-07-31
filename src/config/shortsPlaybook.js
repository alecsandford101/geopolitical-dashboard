// News → equity SHORTS map. The mirror of playbook.js: for each category we list
// liquid, US-listed stocks that structurally SUFFER when that category of news is
// active. The Short desk aggregates the events in the current view, weights each by
// severity + recency, and ranks the implicated tickers — so the list reflects the
// pressure the live feed is actually creating, not a static watchlist.
//
// Every idea carries dir: 'short'. Where a category is direction-ambiguous
// (Monetary Policy, Trade), the thesis conditions the short on the stated regime.
// Every ticker, direction and thesis below was drafted and then adversarially
// verified (liquidity, short-direction correctness, thesis soundness) by the
// `shorts-playbook-verify` workflow, one skeptic per idea. Its notes dropped three
// wrong-direction calls — DOW and LYB (US ethane/NGL-advantaged producers actually
// benefit as the oil-to-gas spread widens) and CB (a hard cyber market lifts pricing,
// making Chubb a net beneficiary, not a loser) — and trimmed DAL, DHI, TRV and ALL
// from high to medium (hedges, mortgage buydowns and reinsurance blunt the hit).
// Cyber & Security carries no equity short: no name reliably falls on that trigger.
//
// `signals` are thesis-relevant keywords. When a live headline in the idea's category
// actually names one (title, description, place or market tags), the ranker boosts
// that pick, so the desk reorders around what the news says — a Conflict feed about
// the Strait of Hormuz surfaces the fuel-cost airlines ahead of the travel-demand
// cruise line, a chip-war feed does not. The matched terms show on the card.
// Educational, not investment advice.
export const SHORTS_PLAYBOOK = {
  'Conflict': {
    ideas: [
      { ticker: 'DAL', name: 'Delta Air Lines', dir: 'short', theme: 'Jet-fuel cost', thesis: 'Conflict spikes crude, and jet fuel is a top airline cost; airspace and route closures add detours that compress Delta’s margins. Fuel hedges and fare hikes can soften the hit.', confidence: 'medium', signals: ['oil', 'crude', 'brent', 'fuel', 'hormuz', 'strait', 'tanker', 'chokepoint', 'airspace', 'missile', 'strike'] },
      { ticker: 'CCL', name: 'Carnival', dir: 'short', theme: 'Travel demand', thesis: 'Geopolitical shocks chill discretionary travel and raise bunker-fuel costs, a double hit to cruise-line bookings and margins.', confidence: 'medium', signals: ['travel', 'tourism', 'red sea', 'suez', 'shipping', 'attack', 'escalat'] },
      { ticker: 'LUV', name: 'Southwest Airlines', dir: 'short', theme: 'Fuel-exposed carrier', thesis: 'A domestic carrier with limited long-term fuel hedges sees conflict-driven fuel spikes flow straight into unit costs.', confidence: 'medium', signals: ['oil', 'crude', 'brent', 'fuel', 'hormuz', 'strait', 'tanker', 'chokepoint'] },
    ],
  },
  'Monetary Policy': {
    ideas: [
      { ticker: 'DHI', name: 'D.R. Horton', dir: 'short', theme: 'Mortgage-rate hit', thesis: 'A hawkish, higher-for-longer Fed lifts mortgage rates, cutting affordability and order volumes for the largest US homebuilder. Rate buydowns and the resale lock-in effect blunt it; reverses on a dovish pivot.', confidence: 'medium', signals: ['rate hike', 'hawkish', 'higher for longer', 'mortgage', 'tightening', 'inflation', 'basis points'] },
      { ticker: 'AMT', name: 'American Tower', dir: 'short', theme: 'Rate-sensitive REIT', thesis: 'Higher-for-longer rates raise this leveraged tower REIT’s refinancing costs and lift the discount rate on its long-dated cash flows. Reverses if the Fed eases.', confidence: 'medium', signals: ['rate hike', 'hawkish', 'higher for longer', 'yields', 'treasury', 'tightening'] },
      { ticker: 'O', name: 'Realty Income', dir: 'short', theme: 'Bond-proxy REIT', thesis: 'As a net-lease REIT valued like a bond, Realty Income de-rates when rates stay high and its rising cost of capital squeezes acquisition spreads.', confidence: 'medium', signals: ['rate hike', 'hawkish', 'higher for longer', 'yields', 'treasury', 'tightening'] },
    ],
  },
  'Trade & Tariffs': {
    ideas: [
      { ticker: 'BBY', name: 'Best Buy', dir: 'short', theme: 'Import COGS', thesis: 'Best Buy sells consumer electronics largely sourced from China and Asia; tariffs raise landed cost on a thin-margin, price-sensitive assortment.', confidence: 'high', signals: ['tariff', 'china', 'import', 'duties', 'levy', 'electronics', 'consumer'] },
      { ticker: 'NKE', name: 'Nike', dir: 'short', theme: 'Asian supply chain', thesis: 'Nike makes most footwear and apparel in Asia, so tariffs raise input costs while Chinese retaliation and boycotts threaten a key growth market.', confidence: 'medium', signals: ['tariff', 'china', 'import', 'duties', 'vietnam', 'retaliat', 'boycott'] },
      { ticker: 'DLTR', name: 'Dollar Tree', dir: 'short', theme: 'Import-reliant discounter', thesis: 'A fixed-price discounter reliant on cheap imported goods has little room to pass tariff cost through without breaking its price points.', confidence: 'medium', signals: ['tariff', 'china', 'import', 'duties', 'levy', 'supply chain'] },
    ],
  },
  'Energy': {
    ideas: [
      { ticker: 'LUV', name: 'Southwest Airlines', dir: 'short', theme: 'Jet-fuel cost', thesis: 'Rising crude lifts jet fuel, one of an airline’s largest and least controllable costs, directly compressing Southwest’s operating margin.', confidence: 'high', signals: ['oil', 'crude', 'brent', 'opec', 'fuel', 'barrel', 'production cut', 'gasoline'] },
    ],
  },
  'Sanctions': {
    ideas: [
      { ticker: 'LRCX', name: 'Lam Research', dir: 'short', theme: 'Export-control hit', thesis: 'Expanding export controls on advanced chip tools curb Lam’s sales into China, historically a large share of its revenue.', confidence: 'medium', signals: ['chip', 'semiconductor', 'export control', 'china', 'entity list', 'technology', 'ban'] },
      { ticker: 'QCOM', name: 'Qualcomm', dir: 'short', theme: 'China revenue risk', thesis: 'Qualcomm derives much of its chip and licensing revenue from China; sanctions and export curbs threaten that exposed demand base.', confidence: 'low', signals: ['chip', 'semiconductor', 'china', 'export control', 'ban', 'technology'] },
    ],
  },
  'Elections': {
    ideas: [
      { ticker: 'UNH', name: 'UnitedHealth Group', dir: 'short', theme: 'Policy risk', thesis: 'Election cycles raise headline risk around drug pricing and Medicare Advantage reimbursement, key policy levers for the largest US health insurer. Idiosyncratic, not a clean rule.', confidence: 'low', signals: ['medicare', 'drug pricing', 'health', 'reform', 'insurance'] },
    ],
  },
  // Cyber & Security: no equity short. The obvious candidate (a cyber insurer like
  // Chubb) is a net beneficiary of a hard cyber market, not a structural loser, so
  // the direction is wrong. Left empty rather than shipping a backwards call.
  'Disaster & Logistics': {
    ideas: [
      { ticker: 'ALL', name: 'Allstate', dir: 'short', theme: 'Catastrophe claims', thesis: 'Hurricanes, wildfires and floods drive catastrophe claims straight through Allstate’s home and auto book, hitting underwriting profit. Reinsurance and post-event rate hardening partly offset.', confidence: 'medium', signals: ['hurricane', 'wildfire', 'flood', 'storm', 'landfall', 'typhoon', 'earthquake', 'catastrophe'] },
      { ticker: 'TRV', name: 'Travelers', dir: 'short', theme: 'Catastrophe claims', thesis: 'Large natural-disaster losses raise Travelers’ combined ratio and dent quarterly underwriting results as claims spike. A diversified book and reinsurance cushion the blow.', confidence: 'medium', signals: ['hurricane', 'wildfire', 'flood', 'storm', 'landfall', 'typhoon', 'earthquake', 'catastrophe'] },
      { ticker: 'RNR', name: 'RenaissanceRe', dir: 'short', theme: 'Reinsurance losses', thesis: 'As a property-catastrophe reinsurer, RenaissanceRe absorbs the tail of major disaster losses, the most direct claims exposure of the group.', confidence: 'medium', signals: ['hurricane', 'wildfire', 'flood', 'storm', 'landfall', 'typhoon', 'earthquake', 'catastrophe', 'reinsur'] },
    ],
  },
}
