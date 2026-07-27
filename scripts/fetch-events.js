// Fetches recent market-relevant geopolitical coverage from the GDELT DOC 2.0 API
// and transforms it into the app's event shape, written to public/events.json.
//
// Runs in CI (see .github/workflows/deploy.yml) before `npm run build`, and can be
// run locally with `node scripts/fetch-events.js`. GDELT is aggressively rate-limited
// (≈1 request / 5s per IP), so category queries are spaced out and retried on 429.
//
// GDELT gives no coordinates/category/severity, so we derive them:
//   category  = which keyword bucket returned the article (CATEGORY_QUERY)
//   lat/lng   = centroid of `sourcecountry` (scripts/geo-lookup.js)
//   severity  = article volume per (category, country) cluster  → market attention
//   markets   = fixed per category (CATEGORY_MARKETS)

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORY_QUERY, CATEGORY_MARKETS } from '../src/config/constants.js'
import { resolveCountry } from './geo-lookup.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'events.json')

const TIMESPAN = '3d'
const MAXRECORDS = 75
const SPACING_MS = 6500   // between successive GDELT calls
const MAX_TOTAL = 120     // cap events written

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// One GDELT DOC query, with retry/backoff on rate limiting.
async function queryGdelt(query, attempt = 0) {
  const url =
    'https://api.gdeltproject.org/api/v2/doc/doc' +
    `?query=${encodeURIComponent(query)}` +
    `&mode=ArtList&format=json&sort=DateDesc` +
    `&maxrecords=${MAXRECORDS}&timespan=${TIMESPAN}`

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'GeoPulse/1.0 (github pages dashboard)' } })
    const text = await res.text()
    if (!res.ok || text.trimStart().startsWith('Please limit')) {
      throw new Error(`rate/http ${res.status}`)
    }
    const data = JSON.parse(text)
    return Array.isArray(data.articles) ? data.articles : []
  } catch (err) {
    if (attempt < 2) {
      const backoff = 10000 * (attempt + 1)
      console.warn(`  retry in ${backoff / 1000}s (${err.message})`)
      await sleep(backoff)
      return queryGdelt(query, attempt + 1)
    }
    console.warn(`  giving up on query: ${err.message}`)
    return []
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

async function main() {
  const categories = Object.keys(CATEGORY_QUERY)
  const clusters = new Map() // key: `${category}|${country}` -> { articles: [] }

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    console.log(`[${i + 1}/${categories.length}] ${category}`)
    const articles = await queryGdelt(CATEGORY_QUERY[category])
    console.log(`  ${articles.length} articles`)

    for (const a of articles) {
      const geo = resolveCountry(a.sourcecountry)
      if (!geo) continue // skip unmappable / unknown source countries
      const key = `${category}|${a.sourcecountry}`
      if (!clusters.has(key)) clusters.set(key, { category, country: a.sourcecountry, geo, articles: [] })
      clusters.get(key).articles.push(a)
    }

    if (i < categories.length - 1) await sleep(SPACING_MS)
  }

  let events = []
  let id = 1
  for (const { category, country, geo, articles } of clusters.values()) {
    // newest first
    articles.sort((x, y) => (y.seendate || '').localeCompare(x.seendate || ''))
    const top = articles[0]
    const catIndex = categories.indexOf(category)
    const { dLat, dLng } = jitter(catIndex)

    events.push({
      id: id++,
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
      sources: articles.slice(0, 4).map((a) => ({ title: a.title, url: a.url, domain: a.domain })),
    })
  }

  // Highest-attention first, then cap.
  events.sort((a, b) => b.count - a.count)
  events = events.slice(0, MAX_TOTAL)

  if (events.length === 0) {
    console.error('No events produced (GDELT unreachable or rate-limited). Leaving existing events.json untouched.')
    process.exitCode = 0 // do not fail the build; app falls back to bundled mock
    return
  }

  const payload = { generatedAt: new Date().toISOString(), source: 'GDELT DOC 2.0', events }
  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(payload, null, 2))
  console.log(`\nWrote ${events.length} events -> ${OUT}`)
}

main().catch((err) => {
  console.error('fetch-events failed:', err)
  process.exitCode = 0 // fail-soft: never break the deploy over data fetch
})
