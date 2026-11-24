import { useEffect, useRef, useState } from 'react'
import { create } from 'zustand'
import Hls from 'hls.js'
import { useStore, useLink } from '../store'
import { SATELLITES, satById, fmtLon, Transponder } from '../data/satellites'
import { findCarrier, levelPercent, qualityFor, lockThreshold, universalLnbIF, LinkResult } from '../lib/geo'
import { transponderChannels, Channel } from '../lib/iptv'

type Screen = 'menu' | 'antenna' | 'scan' | 'list' | 'play' | 'info' | 'manual'
interface Osd {
  screen: Screen
  tpIdx: number
  manual: { freq: number; pol: 'H' | 'V'; sr: number }
  scanning: boolean
  scanLog: string[]
  scanProgress: number
  found: Channel[]
  banner: boolean
  bootUntil: number
  set: (p: Partial<Osd>) => void
}
export const useOsd = create<Osd>(set => ({
  screen: 'menu', tpIdx: 0, manual: { freq: 11836, pol: 'H', sr: 27500 }, scanning: false, scanLog: [], scanProgress: 0, found: [], banner: true, bootUntil: 0,
  set: p => set(p),
}))

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export default function TVScreen({ compact = false }: { compact?: boolean }) {
  const s = useStore()
  const osd = useOsd()
  const { results, input, lnbPowered } = useLink()
  const overlay = s.overlayTV
  const hidden = compact && overlay // avoid double video playback

  const hdmiPath = s.install.hdmiConnected && s.install.receiverPowered
  const [, tick] = useState(0)
  useEffect(() => { const id = setInterval(() => tick(t => t + 1), 500); return () => clearInterval(id) }, [])

  if (!s.tvOn) return <Frame compact={compact}><div className="w-full h-full bg-black" /></Frame>
  if (Date.now() < osd.bootUntil) return <Frame compact={compact}><div className="w-full h-full bg-black flex items-center justify-center text-white tracking-[0.5em] text-4xl font-bold">SAMSUNG</div></Frame>
  if (s.tvInput !== 'HDMI1' || !hdmiPath || !s.receiverOn) {
    return <Frame compact={compact}>
      <div className="w-full h-full bg-[#0b0f16] text-white relative">
        <div className="absolute top-5 left-6 text-sm bg-white/10 px-3 py-1 rounded">{s.tvInput}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full border-2 border-white/40 flex items-center justify-center text-2xl">!</div>
          <div className="text-xl">No Signal</div>
          <div className="text-xs text-white/60 text-center max-w-sm">
            {s.tvInput !== 'HDMI1' ? 'Press SOURCE and choose HDMI 1 (the receiver is connected to HDMI 1).' :
              !s.install.hdmiConnected ? 'The HDMI cable is not connected.' : !s.install.receiverPowered ? 'Receiver has no power.' : 'Receiver is in standby – press its power button.'}
          </div>
        </div>
      </div>
    </Frame>
  }

  return (
    <Frame compact={compact}>
      <ReceiverOSD results={results} cBand={input.cBand} lnbPowered={lnbPowered} hidden={hidden} compact={compact} />
    </Frame>
  )
}

function Frame({ children, compact }: { children: React.ReactNode; compact: boolean }) {
  const setOverlayTV = useStore(s => s.setOverlayTV), setView = useStore(s => s.setView)
  return <div className={`w-full h-full overflow-hidden select-none ${compact ? 'text-[13px] cursor-pointer' : 'text-base'}`} style={{ aspectRatio: '16/9' }}
    onClickCapture={compact ? e => { e.stopPropagation(); setView('tv'); setOverlayTV(true) } : undefined}>{children}</div>
}

/* ---------------- Receiver OSD ---------------- */
function ReceiverOSD({ results, cBand, lnbPowered, hidden, compact }: { results: LinkResult[]; cBand: boolean; lnbPowered: boolean; hidden: boolean; compact: boolean }) {
  const s = useStore()
  const osd = useOsd()
  const sat = satById(s.selectedSatId)
  const tp = sat.transponders[Math.min(osd.tpIdx, sat.transponders.length - 1)]
  const level = levelPercent(results, lnbPowered)
  const carrier = lnbPowered ? findCarrier(results, tp.freq, tp.pol, cBand) : undefined
  const q = qualityFor(carrier?.r, carrier?.tp ?? tp)

  async function runScan(mode: 'sat' | 'blind' | 'tp') {
    if (osd.scanning) return
    osd.set({ scanning: true, scanLog: [], scanProgress: 0, found: [], screen: 'scan' })
    let tps: { freq: number; pol: 'H' | 'V'; sr: number; label: string }[]
    if (mode === 'sat') tps = sat.transponders.map(t => ({ freq: t.freq, pol: t.pol, sr: t.sr, label: `${t.freq} ${t.pol} ${t.sr}` }))
    else if (mode === 'tp') tps = [{ freq: tp.freq, pol: tp.pol, sr: tp.sr, label: `${tp.freq} ${tp.pol} ${tp.sr}` }]
    else {
      // blind scan: sweep the whole band in 20 MHz steps on both polarities
      tps = []
      const lo = cBand ? 3400 : 10700, hi = cBand ? 4200 : 12750
      for (const pol of ['H', 'V'] as const) for (let f = lo; f <= hi; f += 20) tps.push({ freq: f, pol, sr: 0, label: `${f} ${pol}` })
    }
    const found: Channel[] = []
    const seenTp = new Set<string>()
    let num = 1
    const log: string[] = []
    for (let i = 0; i < tps.length; i++) {
      const t = tps[i]
      const c = lnbPowered ? findCarrier(results, t.freq, t.pol, cBand) : undefined
      const locked = c && c.r.cnDb >= lockThreshold(c.tp)
      const key = c ? `${c.r.sat.id}-${c.tp.freq}${c.tp.pol}` : ''
      if (locked && !seenTp.has(key)) {
        seenTp.add(key)
        const chans = await transponderChannels(c!.r.sat, c!.tp, num)
        num += chans.length
        found.push(...chans)
        log.unshift(`${c!.tp.freq} ${c!.tp.pol} ${c!.tp.sr} ${c!.tp.fec} ${c!.tp.system} – LOCK (${c!.r.sat.name.split('(')[0].trim()}) – ${chans.length} services`)
      } else if (mode !== 'blind') log.unshift(`${t.label} – ${c ? `signal too weak (C/N ${c.r.cnDb.toFixed(1)} dB)` : 'no carrier'}`)
      else if (c && !locked) log.unshift(`${t.label} – weak carrier`)
      osd.set({ scanProgress: ((i + 1) / tps.length) * 100, scanLog: log.slice(0, 8), found: [...found] })
      await sleep(mode === 'blind' ? 12 : 350)
    }
    osd.set({ scanning: false })
    if (found.length) s.say(`Scan found ${found.length} services. Save them and enjoy – or fine-tune the dish for better quality.`)
    else s.say('Nothing found. Check: is the LNB powered, is the dish pointed at the right satellite, is the correct satellite selected in the receiver?')
  }

  const header = (title: string) => (
    <div className="flex items-center justify-between bg-gradient-to-r from-sky-700 to-sky-900 px-4 py-2 text-white">
      <span className="font-semibold tracking-wide">{title}</span>
      <span className="text-xs opacity-80">EDISION · DVB-S2 · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  )

  const bars = (
    <div className="grid grid-cols-[70px_1fr_52px] gap-2 items-center text-xs">
      <span>Level</span><Bar v={level} color="bg-yellow-400" /><span>{level.toFixed(0)} %</span>
      <span>Quality</span><Bar v={q.quality} color={q.locked ? 'bg-green-500' : 'bg-red-500'} /><span>{q.quality.toFixed(0)} %</span>
    </div>
  )

  const Btn = ({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active?: boolean }) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded text-left ${active ? 'bg-sky-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>{children}</button>
  )

  if (osd.screen === 'menu') return (
    <div className="w-full h-full bg-[#0e1a2b] text-white">
      {header('Main Menu')}
      <div className="grid grid-cols-[220px_1fr] h-[calc(100%-40px)]">
        <div className="flex flex-col gap-1 p-3 border-r border-white/10">
          <Btn onClick={() => osd.set({ screen: 'antenna' })}>📡 Installation</Btn>
          <Btn onClick={() => osd.set({ screen: 'list' })}>📺 Channel List ({s.channels.length})</Btn>
          <Btn onClick={() => osd.set({ screen: 'manual' })}>🔧 Manual Scan</Btn>
          <Btn onClick={() => osd.set({ screen: 'info' })}>ℹ️ Signal Information</Btn>
          {s.channels.length > 0 && <Btn onClick={() => osd.set({ screen: 'play', banner: true })}>▶ Watch TV</Btn>}
        </div>
        <div className="p-4 text-sm text-white/80 space-y-3">
          <p>Welcome to your DVB-S/S2 receiver. No channels are stored yet? Go to <b>Installation → Antenna Setup</b>, select the satellite your dish points to and start a scan.</p>
          <div className="rounded bg-black/30 p-3">{bars}</div>
          <p className="text-xs text-white/50">Tuner: Ku/C-band · LNB: {cBand ? 'C-band 5150' : 'Universal 9750/10600'} · DiSEqC 1.0 Port A · LNB power {lnbPowered ? '13/18 V ON' : 'OFF / open circuit'}</p>
        </div>
      </div>
    </div>
  )

  if (osd.screen === 'antenna') {
    const ifc = universalLnbIF(tp.freq, cBand)
    return (
      <div className="w-full h-full bg-[#0e1a2b] text-white">
        {header('Installation › Antenna Setup')}
        <div className="grid grid-cols-2 gap-4 p-4 text-sm">
          <div className="space-y-2">
            <label className="block"><span className="text-white/60 text-xs">Satellite</span>
              <select className="w-full bg-black/40 rounded px-2 py-1 border border-white/20" value={s.selectedSatId} onChange={e => { s.setSelectedSat(e.target.value); osd.set({ tpIdx: 0 }) }}>
                {SATELLITES.map(x => <option key={x.id} value={x.id}>{fmtLon(x.lon)} {x.name}</option>)}
              </select></label>
            <label className="block"><span className="text-white/60 text-xs">Transponder</span>
              <select className="w-full bg-black/40 rounded px-2 py-1 border border-white/20" value={osd.tpIdx} onChange={e => osd.set({ tpIdx: +e.target.value })}>
                {sat.transponders.map((t, i) => <option key={i} value={i}>{t.freq} {t.pol} {t.sr} {t.fec} {t.system}</option>)}
              </select></label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Field k="LNB Type" v={cBand ? 'C-band (5150)' : 'Universal (9750/10600)'} />
              <Field k="LNB Power" v={lnbPowered ? (tp.pol === 'H' ? '18 V' : '13 V') : 'OFF'} />
              <Field k="22 kHz" v={ifc.tone ? 'ON (high band)' : 'OFF'} />
              <Field k="DiSEqC 1.0" v="Port A" />
              <Field k="IF frequency" v={`${ifc.ifMHz} MHz`} />
              <Field k="Modulation" v={`${tp.mod} ${tp.fec}`} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded bg-black/30 p-3 space-y-2">
              {bars}
              <div className="text-xs text-white/60">{carrier ? `Carrier detected: ${carrier.r.sat.name.split('(')[0].trim()} ${carrier.tp.freq}${carrier.tp.pol} · C/N ${carrier.r.cnDb.toFixed(1)} dB (need ≥ ${lockThreshold(carrier.tp).toFixed(1)})` : lnbPowered ? 'No carrier on this frequency' : 'LNB not powered – check cabling'}</div>
              {q.locked && carrier && carrier.r.sat.id !== sat.id && <div className="text-xs text-amber-300">⚠ Locked carrier belongs to {carrier.r.sat.name} – your dish is pointed at a different satellite than selected!</div>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn onClick={() => runScan('tp')}>Scan Transponder</Btn>
              <Btn onClick={() => runScan('sat')} active>Scan Satellite</Btn>
              <Btn onClick={() => runScan('blind')}>Blind Scan</Btn>
              <Btn onClick={() => osd.set({ screen: 'menu' })}>Back</Btn>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (osd.screen === 'manual') {
    const m = osd.manual
    const c = lnbPowered ? findCarrier(results, m.freq, m.pol, cBand) : undefined
    const mq = qualityFor(c?.r, c?.tp ?? tp)
    return (
      <div className="w-full h-full bg-[#0e1a2b] text-white">
        {header('Manual Scan')}
        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <label className="block"><span className="text-white/60 text-xs">Frequency (MHz)</span><input type="number" className="w-full bg-black/40 rounded px-2 py-1 border border-white/20" value={m.freq} onChange={e => osd.set({ manual: { ...m, freq: +e.target.value } })} /></label>
            <label className="block"><span className="text-white/60 text-xs">Polarisation</span>
              <select className="w-full bg-black/40 rounded px-2 py-1 border border-white/20" value={m.pol} onChange={e => osd.set({ manual: { ...m, pol: e.target.value as 'H' | 'V' } })}><option>H</option><option>V</option></select></label>
            <label className="block"><span className="text-white/60 text-xs">Symbol rate (kS/s)</span><input type="number" className="w-full bg-black/40 rounded px-2 py-1 border border-white/20" value={m.sr} onChange={e => osd.set({ manual: { ...m, sr: +e.target.value } })} /></label>
          </div>
          <div className="space-y-3">
            <div className="rounded bg-black/30 p-3">
              <div className="grid grid-cols-[70px_1fr_52px] gap-2 items-center text-xs">
                <span>Level</span><Bar v={level} color="bg-yellow-400" /><span>{level.toFixed(0)} %</span>
                <span>Quality</span><Bar v={mq.quality} color={mq.locked ? 'bg-green-500' : 'bg-red-500'} /><span>{mq.quality.toFixed(0)} %</span>
              </div>
              <div className="text-xs text-white/60 mt-2">{c ? `${c.r.sat.name} · ${c.tp.freq} ${c.tp.pol} ${c.tp.sr} ${c.tp.fec} ${c.tp.system} · ${c.tp.provider}` : 'No carrier'}</div>
            </div>
            <div className="flex gap-2">
              <Btn onClick={async () => {
                if (!c || !mq.locked) { s.say('No lock on that frequency.'); return }
                osd.set({ scanning: true, screen: 'scan', scanLog: [], found: [], scanProgress: 50 })
                const ch = await transponderChannels(c.r.sat, c.tp, s.channels.length + 1)
                osd.set({ scanning: false, scanProgress: 100, found: ch, scanLog: [`${c.tp.freq} ${c.tp.pol} – LOCK – ${ch.length} services`] })
              }} active>Search</Btn>
              <Btn onClick={() => osd.set({ screen: 'menu' })}>Back</Btn>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (osd.screen === 'scan') return (
    <div className="w-full h-full bg-[#0e1a2b] text-white">
      {header('Channel Search')}
      <div className="p-4 grid grid-cols-2 gap-4 text-xs h-[calc(100%-40px)]">
        <div className="space-y-2">
          <div className="flex justify-between"><span>Progress</span><span>{osd.scanProgress.toFixed(0)} %</span></div>
          <Bar v={osd.scanProgress} color="bg-sky-400" />
          <div className="bg-black/40 rounded p-2 h-40 overflow-hidden font-mono space-y-0.5">{osd.scanLog.map((l, i) => <div key={i} className={l.includes('LOCK') ? 'text-green-400' : 'text-white/50'}>{l}</div>)}</div>
          {!osd.scanning && <div className="flex gap-2">
            <Btn onClick={() => { const merged = [...s.channels.filter(c => !osd.found.some(f => f.satId === c.satId && f.freq === c.freq && f.pol === c.pol && f.name === c.name)), ...osd.found].map((c, i) => ({ ...c, num: i + 1 })); s.setChannels(merged); osd.set({ screen: 'play', banner: true }) }} active>Save & Watch</Btn>
            <Btn onClick={() => osd.set({ screen: 'antenna' })}>Back</Btn>
          </div>}
        </div>
        <div className="bg-black/40 rounded p-2 overflow-auto">
          <div className="text-white/60 mb-1">TV services found: {osd.found.length}</div>
          {osd.found.map(c => <div key={c.id} className="flex justify-between"><span className="truncate">{c.num}. {c.name}</span><span className="text-white/40 ml-2">{c.scrambled ? '$' : 'FTA'}</span></div>)}
        </div>
      </div>
    </div>
  )

  if (osd.screen === 'list') return (
    <div className="w-full h-full bg-[#0e1a2b] text-white">
      {header('Channel List')}
      <div className="grid grid-cols-[1fr_240px] h-[calc(100%-40px)]">
        <div className="overflow-auto p-2 text-sm">
          {s.channels.length === 0 && <div className="text-white/50 p-4">No channels. Run a scan first.</div>}
          {s.channels.map((c, i) => (
            <button key={c.id} onClick={() => { s.setCurrentChannel(i); osd.set({ screen: 'play', banner: true }) }} className={`w-full flex items-center justify-between px-2 py-1 rounded ${i === s.currentChannel ? 'bg-sky-600' : 'hover:bg-white/10'}`}>
              <span className="truncate"><span className="text-white/50 w-10 inline-block">{c.num}</span>{c.name}</span>
              <span className="text-[10px] text-white/50">{c.scrambled ? '🔒' : ''} {fmtLon(satById(c.satId).lon)}</span>
            </button>
          ))}
        </div>
        <div className="p-3 border-l border-white/10 text-xs space-y-1">
          {s.channels[s.currentChannel] && <ChannelInfo c={s.channels[s.currentChannel]} />}
          <div className="pt-2"><Btn onClick={() => osd.set({ screen: 'menu' })}>Menu</Btn></div>
        </div>
      </div>
    </div>
  )

  if (osd.screen === 'info') {
    const best = [...results].sort((a, b) => b.cnDb - a.cnDb).slice(0, 5)
    return (
      <div className="w-full h-full bg-[#0e1a2b] text-white">
        {header('Signal Information')}
        <div className="p-4 text-xs space-y-2">
          {bars}
          <div className="text-white/60 pt-2">Carriers in the dish beam (sorted by C/N):</div>
          <table className="w-full"><tbody>
            {best.map(r => <tr key={r.sat.id} className="border-t border-white/10"><td className="py-1">{r.sat.name}</td><td>{fmtLon(r.sat.lon)}</td><td>off-axis {r.offsetDeg.toFixed(2)}°</td><td>EIRP {r.eirp.toFixed(1)} dBW</td><td className={r.cnDb > 6 ? 'text-green-400' : 'text-red-400'}>C/N {r.cnDb.toFixed(1)} dB</td></tr>)}
          </tbody></table>
          <Btn onClick={() => osd.set({ screen: 'menu' })}>Back</Btn>
        </div>
      </div>
    )
  }

  // play
  const ch = s.channels[s.currentChannel]
  return <Player ch={ch} results={results} cBand={cBand} lnbPowered={lnbPowered} hidden={hidden} compact={compact} />
}

function Player({ ch, results, cBand, lnbPowered, hidden, compact }: { ch?: Channel; results: LinkResult[]; cBand: boolean; lnbPowered: boolean; hidden: boolean; compact: boolean }) {
  const osd = useOsd()
  const s = useStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamErr, setStreamErr] = useState(false)
  const carrier = ch && lnbPowered ? findCarrier(results, ch.freq, ch.pol, cBand) : undefined
  const q = qualityFor(carrier?.r, carrier?.tp ?? (ch ? { fec: ch.fec, mod: ch.system === 'DVB-S2' ? '8PSK' : 'QPSK' } as Transponder : undefined as any))
  const locked = !!(ch && carrier && carrier.r.sat.id === ch.satId && q.locked)

  useEffect(() => {
    if (!osd.banner) return
    const t = setTimeout(() => osd.set({ banner: false }), 5000)
    return () => clearTimeout(t)
  }, [osd.banner, ch?.id])

  useEffect(() => {
    setStreamErr(false)
    const v = videoRef.current
    if (!v || !ch?.url || hidden || !locked || ch.scrambled) return
    let hls: Hls | undefined
    if (ch.url.includes('.m3u8') && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, maxBufferLength: 20 })
      hls.loadSource(ch.url); hls.attachMedia(v)
      hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) setStreamErr(true) })
    } else { v.src = ch.url; v.onerror = () => setStreamErr(true) }
    v.play().catch(() => {})
    return () => { hls?.destroy(); v.removeAttribute('src'); v.load() }
  }, [ch?.id, hidden, locked])

  const next = (d: number) => { if (!s.channels.length) return; s.setCurrentChannel((s.currentChannel + d + s.channels.length) % s.channels.length); osd.set({ banner: true }) }

  return (
    <div className="w-full h-full bg-black text-white relative" onClick={() => osd.set({ banner: true })}>
      {ch && locked && !ch.scrambled && !hidden && <video ref={videoRef} className="w-full h-full object-contain" muted={compact} autoPlay playsInline />}
      {ch && locked && !ch.scrambled && hidden && <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">▶ playing on the large screen</div>}
      {ch && !locked && <NoSignal quality={q.quality} />}
      {ch && locked && ch.scrambled && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-zinc-900 to-black"><div className="text-3xl">🔒</div><div>Scrambled channel</div><div className="text-xs text-white/50">{ch.provider} – a subscription smart card is required</div></div>}
      {ch && locked && !ch.scrambled && streamErr && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-2"><div className="text-lg">Service unavailable</div><div className="text-xs text-white/50 text-center max-w-xs">The IPTV stream behind “{ch.name}” (iptv-org) is offline or blocked by CORS. Try another channel.</div></div>}
      {!ch && <div className="absolute inset-0 flex items-center justify-center text-white/60">No channels stored – press MENU</div>}
      {ch && osd.banner && (
        <div className="absolute left-4 right-4 bottom-4 rounded-lg bg-black/80 backdrop-blur border border-white/10 p-3 grid grid-cols-[64px_1fr_auto] gap-3 items-center">
          <div className="text-3xl font-bold text-center">{ch.num}</div>
          <div>
            <div className="text-lg font-semibold flex items-center gap-2">{ch.logo && <img src={ch.logo} className="h-6 max-w-10 object-contain bg-white/90 rounded px-0.5" alt="" />}{ch.name} {ch.scrambled && '🔒'}</div>
            <div className="text-xs text-white/60">{ch.satName} {fmtLon(satById(ch.satId).lon)} · {ch.freq} {ch.pol} {ch.sr} {ch.fec} {ch.system} · {ch.provider} · {ch.group ?? 'General'}</div>
            <div className="grid grid-cols-[50px_1fr_40px] gap-2 items-center text-[10px] mt-1"><span>Quality</span><Bar v={q.quality} color={locked ? 'bg-green-500' : 'bg-red-500'} /><span>{q.quality.toFixed(0)} %</span></div>
          </div>
          <div className="text-xs text-white/60 text-right">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br />{locked ? `C/N ${q.cn.toFixed(1)} dB` : 'NO LOCK'}</div>
        </div>
      )}
      {!compact && (
        <div className="absolute top-3 right-3 flex gap-1 text-xs">
          <button className="bg-white/10 hover:bg-white/20 rounded px-2 py-1" onClick={e => { e.stopPropagation(); next(-1) }}>CH−</button>
          <button className="bg-white/10 hover:bg-white/20 rounded px-2 py-1" onClick={e => { e.stopPropagation(); next(1) }}>CH+</button>
          <button className="bg-white/10 hover:bg-white/20 rounded px-2 py-1" onClick={e => { e.stopPropagation(); osd.set({ screen: 'list' }) }}>LIST</button>
          <button className="bg-white/10 hover:bg-white/20 rounded px-2 py-1" onClick={e => { e.stopPropagation(); osd.set({ screen: 'menu' }) }}>MENU</button>
        </div>
      )}
    </div>
  )
}

function NoSignal({ quality }: { quality: number }) {
  const blocks = Array.from({ length: 48 })
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-8 opacity-60">
        {blocks.map((_, i) => <div key={i} style={{ background: `hsl(${(i * 53) % 360} 40% ${10 + ((i * 37 + Math.floor(Date.now() / 300)) % 25)}%)`, opacity: quality > 20 ? 0.6 : 0.25 }} />)}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="bg-black/70 px-4 py-2 rounded text-lg">No signal</div>
        <div className="text-xs text-white/70 bg-black/60 px-2 py-1 rounded">Quality {quality.toFixed(0)} % – check dish alignment, weather, or whether the dish points at this channel's satellite</div>
      </div>
    </div>
  )
}

function ChannelInfo({ c }: { c: Channel }) {
  return (
    <>
      <div className="font-semibold text-sm">{c.name}</div>
      <Field k="Satellite" v={`${c.satName} ${fmtLon(satById(c.satId).lon)}`} />
      <Field k="Frequency" v={`${c.freq} MHz ${c.pol}`} />
      <Field k="Symbol rate" v={`${c.sr} kS/s FEC ${c.fec}`} />
      <Field k="System" v={c.system} />
      <Field k="Provider" v={c.provider} />
      <Field k="Access" v={c.scrambled ? 'Scrambled (CA)' : 'Free-to-air'} />
    </>
  )
}
function Field({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-2 border-b border-white/5 py-0.5"><span className="text-white/50">{k}</span><span className="text-right truncate">{v}</span></div>
}
function Bar({ v, color }: { v: number; color: string }) {
  return <div className="h-3 bg-white/10 rounded overflow-hidden"><div className={`h-full ${color} transition-all duration-300`} style={{ width: `${Math.max(0, Math.min(100, v))}%` }} /></div>
}
