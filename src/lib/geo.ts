import { SATELLITES, Satellite, Transponder, Beam } from '../data/satellites'

const D2R = Math.PI / 180, R2D = 180 / Math.PI
const R_EARTH = 6378.137, R_GEO = 42164.17

export interface Pointing { az: number; el: number; skew: number; visible: boolean; distanceKm: number }

/** Geostationary look angles for a site. az = true north 0..360, skew = LNB tilt (+ = clockwise seen from behind dish, N hemisphere). */
export function lookAngles(lat: number, lon: number, satLon: number): Pointing {
  const phi = lat * D2R
  let dl = (satLon - lon)
  while (dl > 180) dl -= 360
  while (dl < -180) dl += 360
  const d = dl * D2R
  const cosG = Math.cos(phi) * Math.cos(d)
  const ratio = R_EARTH / R_GEO // 0.1513
  const el = Math.atan2(cosG - ratio, Math.sqrt(1 - cosG * cosG)) * R2D
  let az = Math.atan2(Math.sin(d), -Math.sin(phi) * Math.cos(d)) * R2D
  if (az < 0) az += 360
  let skew = Math.atan2(Math.sin(d), Math.tan(phi)) * R2D
  if (skew > 90) skew -= 180
  if (skew < -90) skew += 180
  const distanceKm = Math.sqrt(R_EARTH ** 2 + R_GEO ** 2 - 2 * R_EARTH * R_GEO * cosG)
  return { az, el, skew, visible: el > 0, distanceKm }
}

/** Unit vector in local ENU-ish frame: x=east, y=up, z=north (az measured from north clockwise). */
export function dirVector(azDeg: number, elDeg: number) {
  const az = azDeg * D2R, el = elDeg * D2R
  return { x: Math.cos(el) * Math.sin(az), y: Math.sin(el), z: Math.cos(el) * Math.cos(az) }
}
export function angleBetween(az1: number, el1: number, az2: number, el2: number) {
  const a = dirVector(az1, el1), b = dirVector(az2, el2)
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z))
  return Math.acos(dot) * R2D
}

export function greatCircleKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p1 = lat1 * D2R, p2 = lat2 * D2R, dp = (lat2 - lat1) * D2R, dl = (lon2 - lon1) * D2R
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return 2 * R_EARTH * Math.asin(Math.sqrt(a))
}

/** EIRP (dBW) at a site from the best beam of a satellite; gaussian roll-off, -3 dB at beam edge. */
export function eirpAt(sat: Satellite, lat: number, lon: number): { eirp: number; beam: Beam } {
  let best = { eirp: -99, beam: sat.beams[0] }
  for (const b of sat.beams) {
    const d = greatCircleKm(lat, lon, b.lat, b.lon)
    const e = b.eirp - 3 * (d / b.radiusKm) ** 2
    if (e > best.eirp) best = { eirp: e, beam: b }
  }
  return best
}

export function dishGainDbi(diameter: number, freqMHz = 11500) {
  const lambda = 299.792458 / freqMHz
  return 10 * Math.log10(0.65 * (Math.PI * diameter / lambda) ** 2)
}
export function beamwidth3dB(diameter: number, freqMHz = 11500) {
  const lambda = 299.792458 / freqMHz
  return 70 * lambda / diameter
}

export const FEC_THRESHOLD: Record<string, number> = { '1/2': 3.0, '2/3': 4.5, '3/4': 5.5, '5/6': 6.5, '7/8': 7.0 }
export function lockThreshold(tp: Transponder) {
  let t = FEC_THRESHOLD[tp.fec] ?? 5.5
  if (tp.mod === '8PSK') t += 3.0
  return t
}

export interface LinkInput {
  lat: number; lon: number
  dishAz: number; dishEl: number; dishSkew: number
  diameter: number; lnbNoiseDb: number; cBand: boolean
  rainDb: number; cableLossDb: number
}

export interface LinkResult {
  sat: Satellite
  pointing: Pointing
  offsetDeg: number
  eirp: number
  cnDb: number          // C/N on a 27.5 MS/s carrier
  rxPowerRel: number    // relative received power dB (for level meter)
  skewErr: number
}

/** Evaluate link budget for every satellite given the current dish state. */
export function evaluateAll(input: LinkInput): LinkResult[] {
  return SATELLITES.map(sat => evaluate(sat, input))
}

export function evaluate(sat: Satellite, input: LinkInput): LinkResult {
  const pointing = lookAngles(input.lat, input.lon, sat.lon)
  const offsetDeg = angleBetween(input.dishAz, input.dishEl, pointing.az, pointing.el)
  const freq = input.cBand ? 3900 : 11500
  const bw = beamwidth3dB(input.diameter, freq)
  const pointingLoss = Math.min(45, 12 * (offsetDeg / bw) ** 2)
  const { eirp } = eirpAt(sat, input.lat, input.lon)
  const gain = dishGainDbi(input.diameter, freq)
  const skewErr = Math.abs(input.dishSkew - pointing.skew)
  // cross-polar isolation collapses as skew error grows → effective interference
  const skewLoss = -20 * Math.log10(Math.max(0.05, Math.cos(skewErr * D2R))) + 0.6 * (skewErr / 10) ** 2
  const fsl = input.cBand ? 196.1 : 205.5
  const tsysDb = 10 * Math.log10(input.cBand ? 60 : 85 + input.lnbNoiseDb * 60)
  const bwDb = 10 * Math.log10(27.5e6)
  let cn = eirp + gain - pointingLoss - skewLoss - fsl + 228.6 - tsysDb - bwDb - input.rainDb - input.cableLossDb * 0.15
  if (!pointing.visible) cn = -30
  const rxPowerRel = pointing.visible ? eirp + gain - pointingLoss - input.rainDb : -99
  return { sat, pointing, offsetDeg, eirp, cnDb: cn, rxPowerRel, skewErr }
}

/** LNB level meter: 0–100 %, aggregate of all carriers hitting the LNB plus noise floor. */
export function levelPercent(results: LinkResult[], lnbPowered: boolean) {
  if (!lnbPowered) return 0
  let lin = 0
  for (const r of results) if (r.rxPowerRel > -90) lin += Math.pow(10, r.rxPowerRel / 10)
  const db = lin > 0 ? 10 * Math.log10(lin) : 0
  const pct = 22 + ((db - 58) / 32) * 78
  return Math.max(22, Math.min(100, pct))
}

/** Quality for a given transponder of a given satellite. Returns 0..100 and lock state. */
export function qualityFor(result: LinkResult | undefined, tp: Transponder) {
  if (!result) return { quality: 0, locked: false, cn: -30 }
  const th = lockThreshold(tp)
  const cn = result.cnDb
  const q = Math.max(0, Math.min(100, ((cn - (th - 3)) / 14) * 100))
  return { quality: q, locked: cn >= th, cn }
}

/** Which satellite's carrier the tuner actually locks on for a requested frequency/pol. */
export function findCarrier(results: LinkResult[], freq: number, pol: string, cBand: boolean) {
  let best: { r: LinkResult; tp: Transponder } | undefined
  for (const r of results) {
    for (const tp of r.sat.transponders) {
      const isC = tp.freq < 5000
      if (isC !== cBand) continue
      if (tp.pol !== pol) continue
      if (Math.abs(tp.freq - freq) > tp.sr / 2000 * 0.9) continue
      if (!best || r.cnDb > best.r.cnDb) best = { r, tp }
    }
  }
  return best
}

export function universalLnbIF(freqMHz: number, cBand: boolean) {
  if (cBand) return { lo: 5150, ifMHz: 5150 - freqMHz, tone: false }
  const high = freqMHz >= 11700
  const lo = high ? 10600 : 9750
  return { lo, ifMHz: freqMHz - lo, tone: high }
}

export function fmtAz(az: number) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return `${az.toFixed(1)}° (${dirs[Math.round(az / 22.5) % 16]})`
}
