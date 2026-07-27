// Country -> approximate centroid { lat, lng } + region bucket.
// GDELT's `sourcecountry` field uses full English country names; the keys below
// match those. Anything not found falls back to a null island filter in the
// fetch script (the event is dropped rather than shown at 0,0).
//
// Coordinates are rough visual centroids — good enough for a world-scale map.

export const COUNTRY_GEO = {
  // North America
  'United States':        { lat: 39.5,  lng: -98.4,  region: 'North America' },
  'Canada':               { lat: 56.1,  lng: -106.3, region: 'North America' },
  'Mexico':               { lat: 23.6,  lng: -102.6, region: 'North America' },

  // Latin America
  'Brazil':               { lat: -14.2, lng: -51.9,  region: 'Latin America' },
  'Argentina':            { lat: -38.4, lng: -63.6,  region: 'Latin America' },
  'Chile':                { lat: -35.7, lng: -71.5,  region: 'Latin America' },
  'Colombia':             { lat: 4.6,   lng: -74.3,  region: 'Latin America' },
  'Venezuela':            { lat: 6.4,   lng: -66.6,  region: 'Latin America' },
  'Peru':                 { lat: -9.2,  lng: -75.0,  region: 'Latin America' },
  'Cuba':                 { lat: 21.5,  lng: -77.8,  region: 'Latin America' },

  // Europe
  'United Kingdom':       { lat: 54.0,  lng: -2.0,   region: 'Europe' },
  'Ireland':              { lat: 53.4,  lng: -8.2,   region: 'Europe' },
  'France':               { lat: 46.6,  lng: 2.2,    region: 'Europe' },
  'Germany':              { lat: 51.2,  lng: 10.4,   region: 'Europe' },
  'Italy':                { lat: 41.9,  lng: 12.6,   region: 'Europe' },
  'Spain':                { lat: 40.2,  lng: -3.7,   region: 'Europe' },
  'Portugal':             { lat: 39.4,  lng: -8.2,   region: 'Europe' },
  'Netherlands':          { lat: 52.1,  lng: 5.3,    region: 'Europe' },
  'Belgium':              { lat: 50.5,  lng: 4.5,    region: 'Europe' },
  'Switzerland':          { lat: 46.8,  lng: 8.2,    region: 'Europe' },
  'Austria':              { lat: 47.5,  lng: 14.6,   region: 'Europe' },
  'Sweden':               { lat: 60.1,  lng: 18.6,   region: 'Europe' },
  'Norway':               { lat: 60.5,  lng: 8.5,    region: 'Europe' },
  'Finland':              { lat: 61.9,  lng: 25.7,   region: 'Europe' },
  'Denmark':              { lat: 56.3,  lng: 9.5,    region: 'Europe' },
  'Poland':               { lat: 51.9,  lng: 19.1,   region: 'Europe' },
  'Czech Republic':       { lat: 49.8,  lng: 15.5,   region: 'Europe' },
  'Greece':               { lat: 39.1,  lng: 21.8,   region: 'Europe' },
  'Hungary':              { lat: 47.2,  lng: 19.5,   region: 'Europe' },
  'Romania':              { lat: 45.9,  lng: 24.97,  region: 'Europe' },
  'Ukraine':              { lat: 48.4,  lng: 31.2,   region: 'Europe' },
  'Russia':               { lat: 61.5,  lng: 90.0,   region: 'Europe' },
  'Turkey':               { lat: 39.0,  lng: 35.2,   region: 'Europe' },

  // Middle East
  'Israel':               { lat: 31.0,  lng: 34.9,   region: 'Middle East' },
  'Palestine':            { lat: 31.9,  lng: 35.2,   region: 'Middle East' },
  'Iran':                 { lat: 32.4,  lng: 53.7,   region: 'Middle East' },
  'Iraq':                 { lat: 33.2,  lng: 43.7,   region: 'Middle East' },
  'Saudi Arabia':         { lat: 23.9,  lng: 45.1,   region: 'Middle East' },
  'United Arab Emirates': { lat: 23.4,  lng: 53.8,   region: 'Middle East' },
  'Qatar':                { lat: 25.4,  lng: 51.2,   region: 'Middle East' },
  'Kuwait':               { lat: 29.3,  lng: 47.5,   region: 'Middle East' },
  'Syria':                { lat: 34.8,  lng: 39.0,   region: 'Middle East' },
  'Lebanon':              { lat: 33.9,  lng: 35.9,   region: 'Middle East' },
  'Jordan':               { lat: 30.6,  lng: 36.2,   region: 'Middle East' },
  'Yemen':                { lat: 15.6,  lng: 48.0,   region: 'Middle East' },

  // Asia-Pacific
  'China':                { lat: 35.9,  lng: 104.2,  region: 'Asia-Pacific' },
  'Japan':                { lat: 36.2,  lng: 138.3,  region: 'Asia-Pacific' },
  'South Korea':          { lat: 35.9,  lng: 127.8,  region: 'Asia-Pacific' },
  'North Korea':          { lat: 40.3,  lng: 127.5,  region: 'Asia-Pacific' },
  'India':                { lat: 22.4,  lng: 78.7,   region: 'Asia-Pacific' },
  'Pakistan':             { lat: 30.4,  lng: 69.3,   region: 'Asia-Pacific' },
  'Bangladesh':           { lat: 23.7,  lng: 90.4,   region: 'Asia-Pacific' },
  'Indonesia':            { lat: -0.8,  lng: 113.9,  region: 'Asia-Pacific' },
  'Malaysia':             { lat: 4.2,   lng: 101.98, region: 'Asia-Pacific' },
  'Singapore':            { lat: 1.35,  lng: 103.8,  region: 'Asia-Pacific' },
  'Thailand':             { lat: 15.9,  lng: 100.99, region: 'Asia-Pacific' },
  'Vietnam':              { lat: 14.06, lng: 108.3,  region: 'Asia-Pacific' },
  'Philippines':          { lat: 12.9,  lng: 121.8,  region: 'Asia-Pacific' },
  'Taiwan':               { lat: 23.7,  lng: 120.96, region: 'Asia-Pacific' },
  'Australia':            { lat: -25.3, lng: 133.8,  region: 'Asia-Pacific' },
  'New Zealand':          { lat: -40.9, lng: 174.9,  region: 'Asia-Pacific' },
  'Kazakhstan':           { lat: 48.0,  lng: 66.9,   region: 'Asia-Pacific' },
  'Afghanistan':          { lat: 33.9,  lng: 67.7,   region: 'Asia-Pacific' },

  // Africa
  'Egypt':                { lat: 26.8,  lng: 30.8,   region: 'Africa' },
  'South Africa':         { lat: -30.6, lng: 22.9,   region: 'Africa' },
  'Nigeria':              { lat: 9.1,   lng: 8.7,    region: 'Africa' },
  'Kenya':                { lat: -0.02, lng: 37.9,   region: 'Africa' },
  'Ethiopia':             { lat: 9.1,   lng: 40.5,   region: 'Africa' },
  'Morocco':              { lat: 31.8,  lng: -7.1,   region: 'Africa' },
  'Algeria':              { lat: 28.0,  lng: 1.7,    region: 'Africa' },
  'Libya':                { lat: 26.3,  lng: 17.2,   region: 'Africa' },
  'Sudan':                { lat: 12.9,  lng: 30.2,   region: 'Africa' },
  'Ghana':                { lat: 7.9,   lng: -1.0,   region: 'Africa' },
  'Tanzania':             { lat: -6.4,  lng: 34.9,   region: 'Africa' },
}

// Resolve a GDELT country name to geo info, tolerating a few common variants.
const ALIASES = {
  'USA': 'United States',
  'US': 'United States',
  'UK': 'United Kingdom',
  'Great Britain': 'United Kingdom',
  'UAE': 'United Arab Emirates',
  'Republic of Korea': 'South Korea',
  'Korea': 'South Korea',
  'Russian Federation': 'Russia',
  'Czechia': 'Czech Republic',
}

export function resolveCountry(name) {
  if (!name) return null
  const key = ALIASES[name] || name
  return COUNTRY_GEO[key] || null
}
