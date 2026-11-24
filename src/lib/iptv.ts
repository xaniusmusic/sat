import { Satellite, Transponder } from '../data/satellites'

export interface IptvChannel { name: string; url: string; logo?: string; group?: string }

export interface Channel {
  id: string
  num: number
  name: string
  url?: string
  logo?: string
  group?: string
  satId: string
  satName: string
  freq: number
  pol: string
  sr: number
  fec: string
  system: string
  provider: string
  scrambled: boolean
  country: string
}

const cache = new Map<string, Promise<IptvChannel[]>>()

const SOURCES = (cc: string) => [
  `https://iptv-org.github.io/iptv/countries/${cc}.m3u`,
  `https://raw.githubusercontent.com/iptv-org/iptv/master/streams/${cc}.m3u`,
]

export function parseM3U(text: string): IptvChannel[] {
  const lines = text.split(/\r?\n/)
  const out: IptvChannel[] = []
  let cur: Partial<IptvChannel> | null = null
  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const name = line.substring(line.lastIndexOf(',') + 1).trim()
      const logo = /tvg-logo="([^"]*)"/.exec(line)?.[1]
      const group = /group-title="([^"]*)"/.exec(line)?.[1]
      cur = { name, logo, group }
    } else if (cur && line && !line.startsWith('#')) {
      cur.url = line.trim()
      out.push(cur as IptvChannel)
      cur = null
    }
  }
  // De-duplicate by name, prefer .m3u8
  const seen = new Map<string, IptvChannel>()
  for (const c of out) {
    const key = c.name.replace(/\s*\(.*?\)\s*/g, '').trim()
    if (!seen.has(key)) seen.set(key, { ...c, name: key })
  }
  return [...seen.values()]
}

/** Fetch FTA channels of a country from the iptv-org GitHub playlists (cached). */
export function fetchCountryChannels(cc: string): Promise<IptvChannel[]> {
  if (cache.has(cc)) return cache.get(cc)!
  const p = (async () => {
    for (const src of SOURCES(cc)) {
      try {
        const res = await fetch(src)
        if (!res.ok) continue
        const txt = await res.text()
        const list = parseM3U(txt)
        if (list.length) return list
      } catch { /* try next */ }
    }
    return []
  })()
  cache.set(cc, p)
  return p
}

/** Build the channel line-up of one transponder. Deterministic slicing so re-scans give identical results. */
export async function transponderChannels(sat: Satellite, tp: Transponder, startNum: number): Promise<Channel[]> {
  const list = await fetchCountryChannels(tp.country)
  // offset: use index of this TP among same-country TPs on this satellite + satellite hash
  const sameCountry = sat.transponders.filter(t => t.country === tp.country)
  const idx = sameCountry.indexOf(tp)
  const hash = [...sat.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 7
  const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name))
  const chans: Channel[] = []
  let n = startNum
  const base = (idx * tp.count + hash * 3) % Math.max(1, sorted.length)
  for (let i = 0; i < tp.count && sorted.length; i++) {
    const c = sorted[(base + i) % sorted.length]
    chans.push(mk(sat, tp, n++, c.name, false, c.url, c.logo, c.group))
  }
  for (const s of tp.scrambled ?? []) chans.push(mk(sat, tp, n++, s, true))
  return chans
}

function mk(sat: Satellite, tp: Transponder, num: number, name: string, scrambled: boolean, url?: string, logo?: string, group?: string): Channel {
  return {
    id: `${sat.id}-${tp.freq}${tp.pol}-${num}`, num, name, url, logo, group, satId: sat.id, satName: sat.name,
    freq: tp.freq, pol: tp.pol, sr: tp.sr, fec: tp.fec, system: tp.system, provider: tp.provider, scrambled, country: tp.country,
  }
}
