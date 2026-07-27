// Fetches recent market-relevant geopolitical coverage from the GDELT DOC 2.0 API
// and transforms it into the app's event shape, written to public/events.json.
//
// Runs in CI (see .github/workflows/deploy.yml) before `npm run build`, and can be
// run locally with `node scripts/fetch-events.js`.
//
// GDELT is aggressively rate-limited (≈1 request / 5s per IP, and GitHub's shared
// runner IPs are often already "hot"), so firing one narrow query per category means
// most get throttled and the map stays half-empty. Instead we fire a SMALL number of
// BROAD queries that each span every category (a big OR of all category keywords),
// then classify each returned article into a category locally. One successful request
// therefore covers all 8 categories — the rate limit stops mattering.
//
// Two safety nets on top:
//   - Merge/carry-forward: reads the previously-committed events.json and keeps a
//     category's prior events (up to FRESH_HOURS old) if it produced nothing this run.
//   - Broad queries are tried in turn; if the first succeeds we already have full
//     coverage, but the second still runs to improve recall / dedupe fills gaps.
//
// GDELT gives no coordinates/category/severity, so we derive them:
//   category  = first CATEGORY_KEYWORDS bucket whose keyword appears in the headline
//   lat/lng   = centroid of `sourcecountry` (scripts/geo-lookup.js)
//   severity  = article volume per (category, country) cluster  → market attention
//   markets   = fixed per category (CATEGORY_MARKETS)

import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIES, CATEGORY_KEYWORDS, CATEGORY_MARKETS } from '../src/config/constants.js'
import { resolveCountry } from './geo-lookup.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'events.json')

const TIMESPAN = '3d'
const MAXRECORDS = 250     // per broad query (GDELT max)
const SPACING_MS = 8000    // between successive GDELT calls (respect ~1 req/5s)
const REQ_TIMEOUT_MS = 20000 // abort a single hung request instead of stalling CI
const MAX_RETRIES = 3
const MAX_TOTAL = 120      // cap events written
const FRESH_HOURS = 36     // keep a category's events this long if a run is throttled

// Category order defines classification priority (first match wins).
const CATEGORY_ORDER = Object.keys(CATEGORIES)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// GDELT term: quote multi-word phrases, leave single words bare.
const term = (kw) => (kw.includes(' ') ? `"${kw}"` : kw)

// Build N broad queries, each an OR spanning every category (using a different slice
// of each category's keywords), so any single successful query yields all categories.
function buildQueries() {
  const slices = [
    (kws) => kws.slice(0, 2), // query 1: first two keywords of each category
    (kws) => kws.slice(2, 4), // query 2: next two
  ]
  return slices.map((pick) => {
    const terms = []
    for (const kws of Object.values(CATEGORY_KEYWORDS)) {
      for (const kw of pick(kws)) terms.push(term(kw))
    }
    return `(${terms.join(' OR ')})`
  })
}

// Precompile each keyword as a WORD-BOUNDARY regex. Naive substring matching is wrong:
// "war" would match inside "ransomware", "warns", "toward", German "war" (=was), turning
// unrelated stories into Conflict and starving Cyber of its ransomware articles.
const CATEGORY_PATTERNS = Object.fromEntries(
  CATEGORY_ORDER.map((cat) => [
    cat,
    // \b…(s|es)?\b — leading boundary stays strict (rejects "war" inside "warns"/"toward"),
    // trailing (s|es)? catches regular plurals ("tariff" → "tariffs", "sanction" → "sanctions").
    CATEGORY_KEYWORDS[cat].map(
      (kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|es)?\\b`, 'i'),
    ),
  ]),
)

// The article text we classify against: the headline plus the URL slug (de-hyphenated).
// GDELT matches queries on the full article body, so many relevant articles don't repeat
// the keyword in the (often truncated/reworded) title — the slug recovers those.
function haystack(article) {
  let slug = ''
  try {
    slug = new URL(article.url).pathname.replace(/[^a-z0-9]+/gi, ' ')
  } catch {
    /* unparseable url — title only */
  }
  return `${article.title || ''} ${slug}`
}

// Classify an article into a category by first-matching keyword (CATEGORY_ORDER priority).
function classify(article) {
  const text = haystack(article)
  for (const category of CATEGORY_ORDER) {
    for (const re of CATEGORY_PATTERNS[category]) {
      if (re.test(text)) return category
    }
  }
  return null
}

// One GDELT DOC query, with a hard timeout and retry/backoff on rate limiting.
async function queryGdelt(query, attempt = 0) {
  const url =
    'https://api.gdeltproject.org/api/v2/doc/doc' +
    `?query=${encodeURIComponent(query)}` +
    `&mode=ArtList&format=json&sort=DateDesc` +
    `&maxrecords=${MAXRECORDS}&timespan=${TIMESPAN}`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), REQ_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'GeoPulse/1.0 (github pages dashboard)' },
    })
    const text = await res.text()
    if (!res.ok || text.trimStart().startsWith('Please limit')) {
      throw new Error(`rate/http ${res.status}`)
    }
    const data = JSON.parse(text)
    return Array.isArray(data.articles) ? data.articles : []
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const backoff = 12000 * (attempt + 1)
      console.warn(`  retry in ${backoff / 1000}s (${err.message})`)
      await sleep(backoff)
      return queryGdelt(query, attempt + 1)
    }
    console.warn(`  giving up on query: ${err.message}`)
    return []
  } finally {
    clearTimeout(timer)
  }
}

// "20260726T224500Z" -> "2026-07-26"
function parseSeendate(s) {
  if (!s || s.length < 8) return null
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

function severityFromCount(n) {
  if (n >= 12) return 'Critical'
  if (n >= 7) return 'High'
  if (n >= 3) return 'Medium'
  return 'Low'
}

// Small deterministic offset so multiple categories in the same country don't stack.
function jitter(catIndex) {
  const angle = (catIndex * 2 * Math.PI) / 8
  return { dLat: Math.sin(angle) * 2.2, dLng: Math.cos(angle) * 2.2 }
}

// Load previously-committed events so we can merge throttled categories forward.
async function loadExisting() {
  try {
    const txt = await readFile(OUT, 'utf8')
    const data = JSON.parse(txt)
    if (!Array.isArray(data.events)) return []
    const stamp = data.generatedAt || new Date().toISOString()
    return data.events.map((e) => ({ ...e, fetchedAt: e.fetchedAt || stamp })) // backfill
  } catch {
    return [] // no prior file / unreadable → start fresh
  }
}

async function main() {
  const nowIso = new Date().toISOString()
  const nowMs = Date.parse(nowIso)
  const existing = await loadExisting()

  // Fetch broad queries and pool the articles, deduped by URL.
  const queries = buildQueries()
  const byUrl = new Map()
  for (let i = 0; i < queries.length; i++) {
    console.log(`[query ${i + 1}/${queries.length}]`)
    const articles = await queryGdelt(queries[i])
    console.log(`  ${articles.length} articles`)
    for (const a of articles) {
      if (a.url && !byUrl.has(a.url)) byUrl.set(a.url, a)
    }
    if (i < queries.length - 1) await sleep(SPACING_MS)
  }
  const pooled = [...byUrl.values()]
  console.log(`Pooled ${pooled.length} unique articles`)

  // Classify + cluster by category|country.
  const clusters = new Map() // key: `${category}|${country}` -> { articles: [] }
  for (const a of pooled) {
    // English only: keeps titles readable for the user and avoids short-keyword collisions
    // with other languages (e.g. German "war" = "was", which would false-match Conflict).
    if (a.language && a.language !== 'English') continue
    const category = classify(a)
    if (!category) continue
    const geo = resolveCountry(a.sourcecountry)
    if (!geo) continue // skip unmappable / unknown source countries
    const key = `${category}|${a.sourcecountry}`
    if (!clusters.has(key)) clusters.set(key, { category, country: a.sourcecountry, geo, articles: [] })
    clusters.get(key).articles.push(a)
  }

  // Fresh events from this run's clusters.
  const freshEvents = []
  const refreshedCats = new Set()
  for (const { category, country, geo, articles } of clusters.values()) {
    refreshedCats.add(category)
    articles.sort((x, y) => (y.seendate || '').localeCompare(x.seendate || '')) // newest first
    const top = articles[0]
    const catIndex = CATEGORY_ORDER.indexOf(category)
    const { dLat, dLng } = jitter(catIndex)

    freshEvents.push({
      title: top.title?.slice(0, 140) || `${category} — ${country}`,
      category,
      severity: severityFromCount(articles.length),
      date: parseSeendate(top.seendate) || '',
      region: geo.region,
      place: country,
      lat: geo.lat + dLat,
      lng: geo.lng + dLng,
      desc: `${articles.length} recent report${articles.length !== 1 ? 's' : ''} on ${category.toLowerCase()} coverage originating from ${country}.`,
      markets: CATEGORY_MARKETS[category] || [],
      count: articles.length,
      fetchedAt: nowIso,
      sources: articles.slice(0, 4).map((a) => ({ title: a.title, url: a.url, domain: a.domain })),
    })
  }

  // Merge: keep prior events whose category was NOT refreshed this run and is still
  // within the freshness window. Refreshed categories are fully replaced by freshEvents.
  const keptOld = existing.filter(
    (e) =>
      !refreshedCats.has(e.category) &&
      Number.isFinite(Date.parse(e.fetchedAt)) &&
      nowMs - Date.parse(e.fetchedAt) < FRESH_HOURS * 3600 * 1000,
  )

  let events = [...freshEvents, ...keptOld]
  events.sort((a, b) => (b.count || 0) - (a.count || 0)) // highest-attention first
  events = events.slice(0, MAX_TOTAL)
  events.forEach((e, i) => { e.id = i + 1 }) // stable, contiguous ids

  const present = [...new Set(events.map((e) => e.category))]
  console.log(`\nRefreshed this run: ${[...refreshedCats].join(', ') || '(none — all throttled)'}`)
  console.log(`Carried forward: ${keptOld.length} events from prior runs`)

  if (events.length === 0) {
    console.error('No events available (fresh or prior). Leaving existing events.json untouched.')
    process.exitCode = 0 // do not fail the build; app falls back to bundled mock
    return
  }

  const payload = { generatedAt: nowIso, source: 'GDELT DOC 2.0', events }
  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(payload, null, 2))
  console.log(`Wrote ${events.length} events across ${present.length}/8 categories -> ${OUT}`)
}

main().catch((err) => {
  console.error('fetch-events failed:', err)
  process.exitCode = 0 // fail-soft: never break the deploy over data fetch
})
