// Tests for the build-time translation step.
//   1. needsTranslation() / looksForeign() — pure logic, no network.
//   2. cache hit — pre-seed the sidecar cache and confirm a foreign title resolves with NO
//      network call (deterministic, offline).
//   3. translateTitles() end-to-end against the real Google endpoint, then classify() the
//      result — verifies foreign headlines become English AND become classifiable.
// The live part (3) is best-effort: on a network failure it warns and skips (so the script is
// safe to keep), but asserts correctness whenever the endpoint is reachable.
import { writeFile, rm } from 'node:fs/promises'
import { needsTranslation, looksForeign, translateTitles } from './translate.js'
import { classify } from './classify.js'

let pass = 0
let fail = 0
const ok = (cond, msg) => { if (cond) { pass++; console.log(`PASS  ${msg}`) } else { fail++; console.log(`FAIL  ${msg}`) } }

// --- 1a. needsTranslation (offline) --------------------------------------------------
ok(needsTranslation({ language: 'German', title: 'Neue Sanktionen' }) === true, 'German → needs translation')
ok(needsTranslation({ language: 'English', title: 'New sanctions' }) === false, 'English → skip')
ok(needsTranslation({ language: 'Japanese', title: '地震' }) === true, 'Japanese → needs translation')
// Unknown/missing language is NOT assumed English — an accent-free foreign headline would
// otherwise leak untranslated. Google sl=auto no-ops on genuine English, so this is safe.
ok(needsTranslation({ language: '', title: 'US imposes sanctions on network' }) === true, 'unknown language → send through (no assume-English)')
ok(needsTranslation({ language: '', title: '日本で地震' }) === true, 'unknown + non-ASCII → needs translation')

// --- 1b. looksForeign (offline) — the output backstop --------------------------------
// The gate reliably catches ALL non-Latin scripts and accent-DENSE Latin. Sparse-accent
// foreign Latin (e.g. a Romanian headline with only a couple of diacritics) is intentionally
// NOT the gate's job — it's indistinguishable from an English headline naming accented
// European places ("Malmö", "Zürich"); such text is handled upstream by translate-at-source.
ok(looksForeign('New sanctions on Russia announced') === false, 'plain English → not foreign')
ok(looksForeign('日本で大きな地震が発生') === true, 'Japanese script → foreign')
ok(looksForeign('Президент подписал указ о санкциях') === true, 'Cyrillic → foreign')
ok(looksForeign('عقوبات جديدة على روسيا') === true, 'Arabic → foreign')
ok(looksForeign('Ελληνική οικονομική κρίση') === true, 'Greek → foreign')
ok(looksForeign('Chính phủ công bố các biện pháp kinh tế mới') === true, 'accent-dense Vietnamese → foreign')
ok(looksForeign('Macron visits São Paulo for summit') === false, 'English w/ one accented proper noun → not foreign')
ok(looksForeign('Leaders from Malmö and Zürich sign a climate pact') === false, 'English w/ two accented place names → not foreign')
ok(looksForeign('') === false, 'empty → not foreign')

// --- 2. cache hit (offline, no network) ----------------------------------------------
const CACHE = './.tmp-test-translations.json'
try {
  await writeFile(CACHE, JSON.stringify({
    version: 1,
    entries: { 'Grève générale paralyse la France': { text: 'General strike paralyses France', lang: 'French', translated: true } },
  }))
  const cached = { language: 'French', title: 'Grève générale paralyse la France', url: 'https://x.fr/greve' }
  const stats = await translateTitles([cached], { log: { warn() {} }, cachePath: CACHE })
  ok(cached.translated === true && cached.title === 'General strike paralyses France' && stats.cached === 1,
    'cache hit resolves without a network call')
} finally {
  await rm(CACHE, { force: true })
}

// --- 3. live translate + classify ----------------------------------------------------
const fixture = [
  { language: 'German', title: 'Neue Sanktionen gegen Russland verhängt', url: 'https://example.de/welt/neue-sanktionen-gegen-russland', expectCat: 'Sanctions' },
  { language: 'Japanese', title: '日本で大きな地震が発生し、津波警報が出されました', url: 'https://example.jp/news/earthquake', expectCat: 'Disaster & Logistics' },
  { language: 'Spanish', title: 'El banco central sube las tasas de interés para frenar la inflación', url: 'https://example.es/economia/banco-central', expectCat: 'Monetary Policy' },
  { language: 'English', title: 'Oil prices climb on OPEC supply cut', url: 'https://example.com/markets/oil-opec', expectCat: 'Energy' },
]

try {
  const stats = await translateTitles(fixture, { log: console })
  console.log('\ntranslate stats:', JSON.stringify(stats))

  const [de, ja, es, en] = fixture

  ok(de.translated === true && !looksForeign(de.title), `German translated to English: "${de.title}"`)
  ok(ja.translated === true && !looksForeign(ja.title), `Japanese translated to English: "${ja.title}"`)
  ok(es.translated === true && !es.translateFailed, `Spanish translated: "${es.title}"`)
  ok(en.translated !== true && en.title === 'Oil prices climb on OPEC supply cut', 'English left untouched')

  // Translated titles must now be classifiable by the English keyword rules.
  ok(classify(de) === de.expectCat, `German → classify ${classify(de)} (expect ${de.expectCat})`)
  ok(classify(ja) === ja.expectCat, `Japanese → classify ${classify(ja)} (expect ${ja.expectCat})`)
  ok(classify(es) === es.expectCat, `Spanish → classify ${classify(es)} (expect ${es.expectCat})`)
  ok(classify(en) === en.expectCat, `English → classify ${classify(en)} (expect ${en.expectCat})`)
} catch (err) {
  console.log(`\nSKIP  live translation unreachable (${err.message}) — offline checks still ran`)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exitCode = fail === 0 ? 0 : 1
