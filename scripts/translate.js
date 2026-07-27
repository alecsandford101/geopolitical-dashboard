// Build-time translation of foreign-language headlines into English, so every title the
// dashboard displays is readable regardless of the source outlet's language.
//
// The data pipeline is deliberately free of dependencies and secrets, so this uses only
// public, no-key HTTP endpoints: Google's `gtx` translate endpoint as primary (auto source
// detection, handles non-Latin scripts), and MyMemory as a fallback. Headlines are short,
// so we translate one per call, with a concurrency cap, a per-call timeout, retries with
// backoff, and de-duplication of identical (syndicated) titles so each headline is sent once.
//
// A persistent title->translation cache (a committed sidecar file) is loaded before any
// network call, so recurring/syndicated headlines are translated once across ALL hourly
// builds — the single biggest reduction in call volume and 429/quota pressure.
//
// Fail-soft: if a headline can't be confidently translated, the caller drops that article
// rather than display a non-English title — the "everything shown is English" invariant holds.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const REQ_TIMEOUT_MS = 8000
const CONCURRENCY = 5
const MAX_UNIQUE = 500 // runaway guard; titles are cheap, this is effectively never hit
const RETRY_BACKOFF_MS = 1500
const MAX_ATTEMPTS = 3   // Google attempts before falling back (unless rate-limited)
const MAX_CACHE = 5000   // entries kept in the persistent translation cache

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const jitter = (ms) => Math.floor(Math.random() * ms)

// GDELT reports language NAMES ("German"); MyMemory needs ISO codes. Google uses sl=auto.
const LANG_ISO = {
  German: 'de', French: 'fr', Spanish: 'es', Portuguese: 'pt', Italian: 'it',
  Russian: 'ru', Arabic: 'ar', Chinese: 'zh', Japanese: 'ja', Korean: 'ko',
  Turkish: 'tr', Dutch: 'nl', Polish: 'pl', Swedish: 'sv', Ukrainian: 'uk',
  Persian: 'fa', Hindi: 'hi', Indonesian: 'id', Vietnamese: 'vi', Thai: 'th',
  Greek: 'el', Hebrew: 'he', Czech: 'cs', Romanian: 'ro', Hungarian: 'hu',
  Finnish: 'fi', Norwegian: 'no', Danish: 'da', Bulgarian: 'bg', Serbian: 'sr',
}

// ---- foreignness gate ---------------------------------------------------------------
// The last line of defence for the "every headline is English" invariant: a text check
// used both here (to refuse a translation that didn't actually reach English) and by the
// fetch pipeline (to drop any legacy/leaked non-English title before it is written).
//
// Scripts that never occur in English text → definitely foreign.
const NON_LATIN =
  /[Ͱ-ϿЀ-ӿ԰-֏֐-׿؀-ۿݐ-ݿऀ-ॿ฀-๿ᄀ-ᇿ぀-ヿ　-〿㐀-鿿가-힯豈-﫿]/
// Accented Latin letters (Latin-1 supplement + Latin Extended-A/B + additional).
const ACCENTED = /[À-ɏḀ-ỿ]/g
const LETTERS = /[A-Za-zÀ-ɏḀ-ỿ]/g

// True when `text` is not plain English: any non-Latin script, or a high proportion of
// accented Latin letters. The ratio test tolerates the odd accented loan-word or proper
// noun that legitimately appears in an English headline ("São Paulo", "Malmö", "Erdoğan")
// while still catching accent-dense foreign Latin text (Vietnamese, dense Romanian/French).
//
// This is a BACKSTOP, not the primary defence: sparse-accent foreign Latin is deliberately
// left to translate-at-source (needsTranslation sends every non-English-tagged article),
// because it is indistinguishable from English naming a few accented European places.
export function looksForeign(text) {
  if (!text) return false
  if (NON_LATIN.test(text)) return true
  const accents = (text.match(ACCENTED) || []).length
  if (accents < 2) return false
  const letters = (text.match(LETTERS) || []).length
  return letters > 0 && accents / letters > 0.15
}

const isRateLimit = (err) => /\b(429|403)\b/.test(err?.message || '')

async function fetchJson(url, opts = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), REQ_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: ctrl.signal, ...opts })
    if (!res.ok) throw new Error(`http ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// Google public endpoint. Response: [ [ [translatedSeg, origSeg, ...], ... ], ..., detectedLang, ... ]
export async function googleTranslate(text) {
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`
  const j = await fetchJson(url, { headers: { 'User-Agent': 'Mozilla/5.0 (GeoPulse build)' } })
  const translated = (j[0] || []).map((seg) => (seg && seg[0]) || '').join('').trim()
  if (!translated) throw new Error('empty translation')
  return { text: translated, detected: j[2] || null }
}

// MyMemory fallback. Needs an ISO source; returns responseData.translatedText.
export async function myMemoryTranslate(text, isoFrom) {
  if (!isoFrom) throw new Error('no source lang for MyMemory')
  const url =
    'https://api.mymemory.translated.net/get' +
    `?q=${encodeURIComponent(text)}&langpair=${isoFrom}|en`
  const j = await fetchJson(url)
  if (j.quotaFinished || j.responseStatus !== 200 || !j.responseData?.translatedText) {
    throw new Error(`mymemory ${j.responseStatus}${j.quotaFinished ? ' quota' : ''}`)
  }
  return { text: j.responseData.translatedText.trim(), detected: isoFrom }
}

// Google with backoff + jitter. On a rate-limit (429/403) throw immediately so the caller
// falls straight to MyMemory instead of hammering an already-throttled endpoint.
async function translateGoogle(text) {
  let lastErr
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await googleTranslate(text)
    } catch (err) {
      lastErr = err
      if (isRateLimit(err)) throw err
      if (attempt < MAX_ATTEMPTS - 1) await sleep(RETRY_BACKOFF_MS * (attempt + 1) + jitter(500))
    }
  }
  throw lastErr
}

// Translate one headline into confident English, or throw if it can't.
// Returns { text, lang, translated }: translated=false means the text is already English
// (leave it as-is). Reconciles the two detectors — if GDELT tagged the article as a known
// foreign language but Google claims English (a common Google miss on short headlines), the
// echo is NOT trusted: we force MyMemory with the known ISO, and refuse any result that
// still looks foreign, so a detector miss can never leak a foreign title.
async function translateOne(text, langName) {
  const knownForeign = !!(langName && langName !== 'English' && LANG_ISO[langName])

  let google = null
  try {
    google = await translateGoogle(text)
  } catch {
    google = null
  }

  if (google) {
    if (google.detected === 'en') {
      // Genuinely English (no explicit foreign tag): keep the original, no translation.
      if (!knownForeign) return { text, lang: null, translated: false }
      // else: GDELT said foreign but Google echoed English → mis-detection; fall through.
    } else if (!looksForeign(google.text)) {
      return { text: google.text, lang: langName || google.detected || null, translated: true }
    }
  }

  // Fallback / reconciliation via MyMemory with the known ISO code.
  const iso = LANG_ISO[langName]
  if (iso) {
    const mm = await myMemoryTranslate(text, iso) // throws on failure/quota
    if (!looksForeign(mm.text) && mm.text.toLowerCase() !== text.toLowerCase()) {
      return { text: mm.text, lang: langName, translated: true }
    }
  }

  throw new Error('no confident English translation')
}

// Should this article's title be translated? Skip ONLY when GDELT explicitly tagged it
// English. Everything else — including a missing/unknown language tag — is sent through:
// Google's sl=auto no-ops on genuine English (returns detected='en', kept verbatim), so an
// accent-free foreign headline with no tag is no longer silently assumed English. Volume is
// held down by the persistent cross-build cache.
export function needsTranslation(article) {
  return (article.language || '').trim() !== 'English'
}

// Simple concurrency-limited map.
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length)
  let next = 0
  async function run() {
    while (next < items.length) {
      const i = next++
      results[i] = await worker(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
  return results
}

// Persistent title -> { text, lang, translated } cache (JSON sidecar, committed by CI).
async function loadCache(path) {
  const map = new Map()
  if (!path) return map
  try {
    const data = JSON.parse(await readFile(path, 'utf8'))
    if (data && data.entries) for (const [k, v] of Object.entries(data.entries)) map.set(k, v)
  } catch {
    /* no cache yet / unreadable → start empty */
  }
  return map
}

async function saveCache(path, map) {
  if (!path) return
  let entries = [...map.entries()]
  if (entries.length > MAX_CACHE) entries = entries.slice(entries.length - MAX_CACHE) // keep newest
  const obj = {}
  for (const [k, v] of entries) obj[k] = v
  try {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, JSON.stringify({ version: 1, entries: obj }, null, 2))
  } catch {
    /* cache is best-effort; never fail the build over it */
  }
}

// Translate foreign titles in `articles` IN PLACE. For each translated article sets:
//   origTitle (original), title (English), lang (source language), translated: true
// On failure sets translateFailed: true (caller should drop it). Titles already English
// are left untouched. De-dupes by title and consults/updates the persistent cache so each
// distinct headline is translated at most once across all builds. Returns run stats.
export async function translateTitles(articles, { log = console, cachePath = null } = {}) {
  const todo = articles.filter(needsTranslation)
  if (todo.length === 0) return { unique: 0, translated: 0, failed: 0, capped: 0, cached: 0 }

  const cache = await loadCache(cachePath)

  // Unique titles → the language name of the first article carrying that title.
  const uniq = new Map()
  for (const a of todo) if (!uniq.has(a.title)) uniq.set(a.title, (a.language || '').trim())

  let entries = [...uniq.entries()]
  let capped = 0
  if (entries.length > MAX_UNIQUE) {
    capped = entries.length - MAX_UNIQUE
    log.warn?.(`translate: capping at ${MAX_UNIQUE} unique titles, ${capped} left untranslated (dropped)`)
    entries = entries.slice(0, MAX_UNIQUE)
  }

  const table = new Map() // origTitle -> { text, lang, translated } | { error: true }
  let cached = 0
  const toFetch = []
  for (const [title, langName] of entries) {
    const hit = cache.get(title)
    if (hit && typeof hit.text === 'string') {
      table.set(title, hit)
      cached++
    } else {
      toFetch.push([title, langName])
    }
  }

  await mapLimit(toFetch, CONCURRENCY, async ([title, langName]) => {
    try {
      const r = await translateOne(title, langName)
      table.set(title, r)
      cache.set(title, r) // cache confident translations AND English pass-throughs
    } catch {
      table.set(title, { error: true }) // don't cache failures — they're usually transient
    }
  })

  let translated = 0
  let failed = 0
  for (const a of todo) {
    const r = table.get(a.title)
    if (!r || r.error) {
      a.translateFailed = true
      failed++
      continue
    }
    if (!r.translated) continue // already English — leave the title as-is
    a.origTitle = a.title
    a.title = r.text
    a.lang = r.lang || a.language || null
    a.translated = true
    translated++
  }

  await saveCache(cachePath, cache)
  return { unique: uniq.size, translated, failed, capped, cached }
}
