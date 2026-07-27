// Category metadata — colors are the dataviz validated categorical theme (dark
// steps) in fixed slot order. This exact ordering passes every adjacent CVD /
// normal-vision gate on the dark surface (validated with the skill's script);
// do not reorder or recolor without re-running validate_palette.js.
export const CATEGORIES = {
  'Conflict':               { hex: '#3987e5' }, // slot 1 blue
  'Monetary Policy':        { hex: '#d95926' }, // slot 2 orange
  'Trade & Tariffs':        { hex: '#199e70' }, // slot 3 aqua
  'Energy':                 { hex: '#c98500' }, // slot 4 yellow
  'Sanctions':              { hex: '#d55181' }, // slot 5 magenta
  'Elections':              { hex: '#008300' }, // slot 6 green
  'Cyber & Security':       { hex: '#9085e9' }, // slot 7 violet
  'Disaster & Logistics':   { hex: '#e66767' }, // slot 8 red
}

// Severity — status palette (escalating heat). radius drives map marker size.
export const SEVERITY = {
  Low:      { hex: '#3987e5', radius: 7 },
  Medium:   { hex: '#fab219', radius: 9 },
  High:     { hex: '#ec835a', radius: 12 },
  Critical: { hex: '#d03b3b', radius: 16 },
}

export const SEV_ORDER = { Critical: 3, High: 2, Medium: 1, Low: 0 }

// Keywords per category, used BOTH to build the GDELT queries and to classify each
// returned article locally (first category whose keyword appears in the headline wins,
// in the CATEGORIES order above). The fetch script fires a small number of broad
// queries that each span every category, then classifies — so one successful request
// covers all 8 categories, sidestepping GDELT's per-request rate limit.
// Keep multi-word phrases; the query builder quotes them for GDELT. Lowercase-matched.
export const CATEGORY_KEYWORDS = {
  'Conflict':             ['war', 'military strike', 'invasion', 'ceasefire', 'airstrike', 'armed conflict'],
  'Monetary Policy':      ['central bank', 'interest rate', 'rate cut', 'inflation', 'federal reserve', 'rate hike'],
  'Trade & Tariffs':      ['tariff', 'trade war', 'export ban', 'trade deal', 'embargo', 'import quota'],
  'Energy':               ['oil price', 'crude oil', 'natural gas', 'OPEC', 'energy crisis', 'gas pipeline'],
  'Sanctions':            ['sanctions', 'asset freeze', 'export controls', 'sanctioned', 'blacklist'],
  'Elections':            ['election', 'presidential vote', 'referendum', 'coalition government', 'general election', 'ballot'],
  'Cyber & Security':     ['cyberattack', 'data breach', 'ransomware', 'cyber espionage', 'malware'],
  'Disaster & Logistics': ['earthquake', 'flood', 'hurricane', 'port closure', 'supply chain', 'shipping disruption'],
}

// Default market tags shown per category (used when deriving events from GDELT,
// which carries no market metadata of its own).
export const CATEGORY_MARKETS = {
  'Conflict':             ['Defense', 'Oil', 'Gold'],
  'Monetary Policy':      ['Bonds', 'FX', 'Equities'],
  'Trade & Tariffs':      ['Equities', 'FX', 'Industrials'],
  'Energy':               ['Oil', 'Natural Gas', 'Energy'],
  'Sanctions':            ['FX', 'Commodities', 'Banks'],
  'Elections':            ['Equities', 'FX', 'Bonds'],
  'Cyber & Security':     ['Tech', 'Cybersecurity', 'Equities'],
  'Disaster & Logistics': ['Shipping', 'Commodities', 'Insurance'],
}
