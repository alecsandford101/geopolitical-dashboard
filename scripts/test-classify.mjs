// Offline unit test for the word-boundary classifier — no network. Feeds real article
// titles/urls captured from a prior live GDELT run, including the substring false-positives
// the old classifier got wrong, and asserts the expected category.
import { classify } from './classify.js'

const cases = [
  // was WRONG (Conflict via "war" inside "ransomware") → should be Cyber & Security
  { title: 'Coca - Cola resumes Fairlife milk production after ransomware attack',
    url: 'https://finance.yahoo.com/technology/ai/articles/coca-cola-resumes-fairlife-milk-143903991.html',
    expect: 'Cyber & Security' },
  // was WRONG (Conflict via "warns") → "inflation" makes it Monetary Policy
  { title: 'Inflation spike : oil prices could derail economy , Treasury warns',
    url: 'https://www.theage.com.au/politics/federal/inflation-spike-oil-prices-could-derail-economy-treasury-warns-20260727-p60ivl.html',
    expect: 'Monetary Policy' },
  // German "war" (=was) — excluded UPSTREAM by the English language gate, not by classify().
  // (regex alone can't tell German "war" from English "war"; the pipeline filters language first.)
  // genuine Conflict (real word "war")
  { title: 'Ukraine war is becoming more dangerous as Iran threatens to strike',
    url: 'https://londonlovesbusiness.com/zelensky-iran-support-russia-war-ukraine/',
    expect: 'Conflict' },
  // genuine Energy
  { title: 'Oil Price Action Telling a Nuanced Story , JPM Says',
    url: 'https://peakoil.com/consumption/oil-price-action-telling-a-nuanced-story-jpm-says',
    expect: 'Energy' },
  // genuine Trade & Tariffs
  { title: 'Trump is set to defend his economic policies in Michigan , where new Canadian tariffs may sting',
    url: 'https://www.wilx.com/2026/07/27/trump-is-set-defend-his-economic-policies-michigan-where-new-canadian-tariffs-may-sting/',
    expect: 'Trade & Tariffs' },
  // "selection" must NOT match "election"
  { title: 'Team announces final roster selection for the tournament',
    url: 'https://example.com/sports/final-roster-selection-tournament',
    expect: null },
  // genuine Elections (real word, even hyphenated in slug)
  { title: 'Count Binface 20 - point Clacton by - election manifesto',
    url: 'https://www.brentwoodlive.co.uk/news/26413011.count-binface-twenty-point-clacton-by-election-manifesto/',
    expect: 'Elections' },
  // recovered via URL slug when title lacks the keyword
  { title: 'Breaking: major development overnight',
    url: 'https://example.com/world/massive-earthquake-strikes-region-thousands-affected',
    expect: 'Disaster & Logistics' },
  // genuine Sanctions
  { title: 'US imposes fresh sanctions on shipping network',
    url: 'https://example.com/world/us-imposes-fresh-sanctions-shipping',
    expect: 'Sanctions' },
]

let pass = 0
for (const c of cases) {
  const got = classify(c)
  const ok = got === c.expect
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'}  expected=${String(c.expect)}  got=${String(got)}  :: ${c.title.slice(0, 60)}`)
}
console.log(`\n${pass}/${cases.length} passed`)
process.exitCode = pass === cases.length ? 0 : 1
