import { useEffect } from 'react'
import Scene from './components/Scene'
import TVScreen, { useOsd } from './components/TVScreen'
import { ShopPanel, InstallPanel, AlignPanel, LocationPicker, Remote } from './components/Panels'
import { useStore, useSite } from './store'

const PHASES = [['shop', 'Buy'], ['install', 'Install'], ['align', 'Align'], ['watch', 'Watch']] as const

export default function App() {
  const s = useStore()
  const osd = useOsd()
  const { city, country } = useSite()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!s.overlayTV) return
      if (e.key === 'Escape') s.setOverlayTV(false)
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { if (s.channels.length) { s.setCurrentChannel((s.currentChannel + 1) % s.channels.length); osd.set({ banner: true, screen: 'play' }) } }
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { if (s.channels.length) { s.setCurrentChannel((s.currentChannel - 1 + s.channels.length) % s.channels.length); osd.set({ banner: true, screen: 'play' }) } }
      if (e.key.toLowerCase() === 'm') osd.set({ screen: 'menu' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [s.overlayTV, s.channels.length, s.currentChannel])

  const phaseIdx = PHASES.findIndex(p => p[0] === s.phase)

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-[380px] shrink-0 h-full overflow-y-auto border-r border-zinc-800 bg-zinc-900/95 p-4 space-y-4">
        <header>
          <h1 className="text-xl font-black tracking-tight">🛰️ SatHome <span className="text-sky-400">Simulator</span></h1>
          <p className="text-xs text-zinc-400">Buy, install and align your own satellite TV system – with real geostationary geometry and real channel line-ups.</p>
        </header>

        <div className="flex gap-1">
          {PHASES.map(([k, label], i) => (
            <button key={k} onClick={() => i <= phaseIdx && s.setPhase(k)} className={`flex-1 text-xs py-1.5 rounded ${i === phaseIdx ? 'bg-sky-600 font-semibold' : i < phaseIdx ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}>{i + 1}. {label}</button>
          ))}
        </div>

        <div className="rounded-lg border border-zinc-800 p-3">
          <div className="text-xs font-semibold text-zinc-300 mb-2">📍 Your location</div>
          <LocationPicker />
        </div>

        <div className="rounded-lg bg-amber-900/20 border border-amber-800/50 p-3 text-sm flex gap-2">
          <span className="text-xl">👷</span><p className="text-amber-100/90 text-xs leading-relaxed">{s.mascotMsg}</p>
        </div>

        {s.phase === 'shop' && <ShopPanel />}
        {s.phase === 'install' && <InstallPanel />}
        {(s.phase === 'align' || s.phase === 'watch') && <AlignPanel />}

        {s.phase !== 'shop' && (
          <div className="rounded-lg border border-zinc-800 p-3 space-y-2 text-xs">
            <div className="font-semibold text-zinc-300">📺 TV & receiver</div>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => { s.setView('tv'); s.setOverlayTV(true) }} className="px-2 py-1 rounded bg-sky-700 hover:bg-sky-600">Sit down & use the TV</button>
              <button onClick={() => s.setView('dish')} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">Go to the dish</button>
              <button onClick={() => s.setView('room')} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">Room overview</button>
            </div>
            <div className="text-zinc-500">TV {s.tvOn ? 'ON' : 'off'} · input {s.tvInput} · receiver {s.receiverOn ? 'ON' : 'standby'} · {s.channels.length} channels stored</div>
          </div>
        )}

        <footer className="text-[10px] text-zinc-600 leading-relaxed">
          Channel line-ups are pulled live from the <a className="underline" href="https://github.com/iptv-org/iptv" target="_blank" rel="noreferrer">iptv-org/iptv</a> GitHub playlists per country and mapped onto real transponders. Look angles use the exact geostationary formulas (R⊕ 6378 km, 42 164 km orbit). Link budget: EIRP footprint, dish gain 10·log(η(πD/λ)²), pointing loss 12·(θ/θ₃dB)², cross-pol skew loss, rain fade, DVB-S/S2 FEC thresholds.
        </footer>
      </aside>

      {/* 3D viewport */}
      <main className="relative flex-1 h-full">
        <Scene />
        <div className="absolute top-3 left-3 flex gap-2 text-xs pointer-events-none">
          <div className="rounded bg-black/60 backdrop-blur px-2 py-1">{city.name}, {country.name} · {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°</div>
          <div className="rounded bg-black/60 backdrop-blur px-2 py-1">Dish az {s.dish.az.toFixed(1)}° · el {s.dish.el.toFixed(1)}° · skew {s.dish.skew.toFixed(1)}°</div>
        </div>
        <div className="absolute bottom-3 left-3 text-[11px] text-white/70 bg-black/50 rounded px-2 py-1">Drag to orbit · scroll to zoom · click the TV or the dish</div>

        {s.overlayTV && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center gap-4 p-6" onClick={() => s.setOverlayTV(false)}>
            <div className="relative" onClick={e => e.stopPropagation()}>
              <div className="rounded-lg bg-[#0d0d0f] p-2 shadow-2xl" style={{ width: 'min(70vw, 120vh)' }}>
                <div className="w-full bg-black" style={{ aspectRatio: '16/9' }}><TVScreen /></div>
                <div className="text-center text-zinc-500 text-[11px] tracking-[0.4em] font-bold pt-1">SAMSUNG</div>
              </div>
              <button onClick={() => s.setOverlayTV(false)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-600 hover:bg-zinc-700">✕</button>
            </div>
            <div onClick={e => e.stopPropagation()}><Remote /></div>
          </div>
        )}
      </main>
    </div>
  )
}
