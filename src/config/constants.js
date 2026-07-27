// Category metadata — colors follow the dataviz categorical palette (fixed order).
export const CATEGORIES = {
  'Conflict':               { hex: '#e66767' },
  'Monetary Policy':        { hex: '#3987e5' },
  'Trade & Tariffs':        { hex: '#d95926' },
  'Energy':                 { hex: '#c98500' },
  'Sanctions':              { hex: '#9085e9' },
  'Elections':              { hex: '#199e70' },
  'Cyber & Security':       { hex: '#d55181' },
  'Disaster & Logistics':   { hex: '#4caf50' },
}

// Severity — status palette (escalating heat). radius drives map marker size.
export const SEVERITY = {
  Low:      { hex: '#3987e5', radius: 7 },
  Medium:   { hex: '#fab219', radius: 9 },
  High:     { hex: '#ec835a', radius: 12 },
  Critical: { hex: '#d03b3b', radius: 16 },
}

export const SEV_ORDER = { Critical: 3, High: 2, Medium: 1, Low: 0 }
