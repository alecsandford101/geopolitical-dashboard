// Classifies a news article into one of the dashboard's categories by keyword match.
// Shared by the fetch pipeline (scripts/fetch-events.js) and the offline tests, so the
// exact matching rules live in one place.
//
// Matching is WORD-BOUNDARY based against the headline plus the URL slug:
//   - Leading \b rejects substring false-positives ("war" must not match "ransomware",
//     "warns", "toward"; "election" must not match "selection").
//   - Trailing (s|es)? catches regular plurals ("tariff" → "tariffs", "sanction" → "sanctions").
//   - The URL slug (de-hyphenated) is included because GDELT matches queries on full body
//     text, so the keyword often isn't repeated in the (truncated/reworded) title.
// First category in CATEGORIES order whose keyword matches wins.

import { CATEGORIES, CATEGORY_KEYWORDS } from '../src/config/constants.js'

// Classification priority = the fixed CATEGORIES order.
export const CATEGORY_ORDER = Object.keys(CATEGORIES)

const CATEGORY_PATTERNS = Object.fromEntries(
  CATEGORY_ORDER.map((cat) => [
    cat,
    CATEGORY_KEYWORDS[cat].map(
      (kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|es)?\\b`, 'i'),
    ),
  ]),
)

// The text we classify against: headline + de-hyphenated URL slug.
function haystack(article) {
  let slug = ''
  try {
    slug = new URL(article.url).pathname.replace(/[^a-z0-9]+/gi, ' ')
  } catch {
    /* unparseable url — title only */
  }
  return `${article.title || ''} ${slug}`
}

// Returns the matched category name, or null if nothing matches.
export function classify(article) {
  const text = haystack(article)
  for (const category of CATEGORY_ORDER) {
    for (const re of CATEGORY_PATTERNS[category]) {
      if (re.test(text)) return category
    }
  }
  return null
}
