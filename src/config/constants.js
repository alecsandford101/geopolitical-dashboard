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

// GDELT DOC-API keyword query per category. The fetch script runs one query per
// bucket, so the matching category is known from which query returned the article.
// Syntax: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
export const CATEGORY_QUERY = {
  'Conflict':             '(war OR conflict OR "military strike" OR invasion OR ceasefire)',
  'Monetary Policy':      '("central bank" OR "interest rate" OR "rate hike" OR "rate cut" OR inflation OR "federal reserve")',
  'Trade & Tariffs':      '(tariff OR tariffs OR "trade war" OR "export ban" OR "trade deal" OR embargo)',
  'Energy':               '("oil price" OR "crude oil" OR "natural gas" OR OPEC OR "energy crisis" OR pipeline)',
  'Sanctions':            '(sanctions OR "asset freeze" OR "sanctioned" OR "export controls")',
  'Elections':            '(election OR "general election" OR "presidential vote" OR referendum OR "coalition government")',
  'Cyber & Security':     '(cyberattack OR "data breach" OR ransomware OR "cyber attack" OR espionage)',
  'Disaster & Logistics': '(earthquake OR flood OR hurricane OR "port closure" OR "supply chain" OR "shipping disruption")',
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
