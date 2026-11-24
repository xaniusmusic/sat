import { useMemo, useState } from 'react'
import { useStore, cartTotal, itemsByCategory, useSite, useLink, visibleSats } from '../store'
import { REQUIRED_CATEGORIES, Category, ShopItem } from '../data/shop'
import { COUNTRIES } from '../data/locations'
import { fmtLon, satById } from '../data/satellites'
import { lookAngles, fmtAz, beamwidth3dB, levelPercent, eirpAt } from '../lib/geo'
import { useOsd } from './TVScreen'

const CATS: { c: Category; label: string; icon: string }[] = [
  { c: 'dish', label: 'Dish', icon: '📡' }, { c: 'lnb', label: 'LNB', icon: '🔭' }, { c: 'receiver', label: 'Receiver', icon: '📦' },
  { c: 'cable', label: 'Coax cable', icon: '🔌' }, { c: 'connectors', label: 'F-connectors', icon: '🔩' }, { c: 'mount', label: 'Wall mount', icon: '🧱' },
  { c: 'hdmi', label: 'HDMI cable', icon: '🎞️' }, { c: 'tools', label: 'Tools', icon: '🧰' }, { c: 'finder', label: 'Sat finder (optional)', icon: '📟' }, { c: 'compass', label: 'Compass (optional)', icon: '🧭' },
]

export function ShopPanel() {
  const s = useStore()
  const [cat, setCat] = useState<Category>('dish')
  const total = cartTotal(s.cart)
  const missing = REQUIRED_CATEGORIES.filter(c => !s.cart[c])
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">🛒 SatShop</h2>
        <div className="text-sm">Budget <b className={total > s.money ? 'text-red-400' : 'text-emerald-400'}>€{s.money - total}</b> <span className="text-zinc-500">/ €{s.money}</span></div>
      </div>
      <div className="flex flex-wrap gap-1">
        {CATS.map(x => <button key={x.c} onClick={() => setCat(x.c)} className={`text-xs px-2 py-1 rounded border ${cat === x.c ? 'bg-sky-600 border-sky-500' : 'border-zinc-700 hover:bg-zinc-800'} ${s.cart[x.c] ? 'ring-1 ring-emerald-500' : ''}`}>{x.icon} {x.label}</button>)}
      </div>
      <div className="space-y-2 max-h-[40vh] overflow-auto pr-1">
        {itemsByCategory(cat).map(item => <ItemCard key={item.id} item={item} selected={s.cart[cat]?.id === item.id} onPick={() => s.addToCart(item)} />)}
      </div>
      <div className="rounded bg-zinc-800/70 p-2 text-xs space-y-1">
        <div className="font-semibold">Cart (€{total})</div>
        {Object.values(s.cart).filter(Boolean).map(i => <div key={i!.id} className="flex justify-between"><span>{i!.name}</span><span>€{i!.price} <button onClick={() => s.removeFromCart(i!.category)} className="text-red-400 ml-1">✕</button></span></div>)}
        {missing.length > 0 && <div className="text-amber-400">Still needed: {missing.join(', ')}</div>}
      </div>
      <button onClick={s.checkout} className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold disabled:opacity-40" disabled={missing.length > 0 || total > s.money}>Buy & deliver</button>
      <p className="text-[11px] text-zinc-500">Tip: dish size decides your rain-fade margin and whether weak beams are receivable. Bigger dish = narrower beam = harder to aim. A sat-finder and a compass make alignment far easier.</p>
    </div>
  )
}

function ItemCard({ item, selected, onPick }: { item: ShopItem; selected: boolean; onPick: () => void }) {
  return (
    <button onClick={onPick} className={`w-full text-left rounded border p-2 ${selected ? 'border-emerald-500 bg-emerald-900/20' : 'border-zinc-700 hover:bg-zinc-800'}`}>
      <div className="flex justify-between text-sm"><span className="font-semibold">{item.name}</span><span>€{item.price}</span></div>
      <div className="text-xs text-zinc-400">{item.brand}</div>
      <div className="text-xs text-zinc-300 mt-1">{item.desc}</div>
      {item.diameter && <div className="text-[11px] text-sky-300 mt-1">Beamwidth ≈ {beamwidth3dB(item.diameter).toFixed(1)}° @ Ku-band</div>}
    </button>
  )
}

/* ---------------- Install ---------------- */
const STEPS: { k: keyof ReturnType<typeof useStore.getState>['install']; label: string; detail: string; view: 'balcony' | 'dish' | 'tv' }[] = [
  { k: 'mountDrilled', label: 'Drill & fix the wall bracket', detail: 'Use the tool kit. Bracket goes on the balcony wall with a clear view towards the geostationary arc (south in the northern hemisphere, north in the southern).', view: 'balcony' },
  { k: 'dishMounted', label: 'Mount the dish on the mast', detail: 'Slide the dish clamp over the 48 mm mast, leave the bolts hand-tight so you can still rotate it.', view: 'dish' },
  { k: 'lnbAttached', label: 'Fit the LNB in the feed arm', detail: 'Clamp the LNB into the holder. The "0" skew mark should point straight up for now.', view: 'dish' },
  { k: 'cableRun', label: 'Crimp F-connector & connect coax to the LNB', detail: 'Strip 8 mm of RG6, compress the F-plug, screw it onto the LNB and weather-seal it. Run the cable along the wall into the living room.', view: 'dish' },
  { k: 'cableToReceiver', label: 'Connect coax to the receiver LNB IN', detail: 'Second F-connector into the receiver\'s LNB IN socket on the back panel.', view: 'tv' },
  { k: 'hdmiConnected', label: 'Connect HDMI to the Samsung TV (HDMI 1)', detail: 'HDMI OUT of the receiver → HDMI 1 on the TV.', view: 'tv' },
  { k: 'receiverPowered', label: 'Plug in the receiver power supply', detail: 'The red standby LED lights up. The receiver powers the LNB via the coax (13/18 V).', view: 'tv' },
]

export function InstallPanel() {
  const s = useStore()
  const nextIdx = STEPS.findIndex(st => !s.install[st.k])
  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg">🔧 Installation</h2>
      <ol className="space-y-1.5">
        {STEPS.map((st, i) => {
          const done = s.install[st.k], active = i === nextIdx
          return (
            <li key={st.k} className={`rounded border p-2 text-sm ${done ? 'border-emerald-700 bg-emerald-900/20' : active ? 'border-sky-500 bg-sky-900/20' : 'border-zinc-800 opacity-50'}`}>
              <div className="flex items-start gap-2">
                <span>{done ? '✅' : active ? '👉' : '⬜'}</span>
                <div className="flex-1">
                  <div className="font-medium">{st.label}</div>
                  {active && <div className="text-xs text-zinc-400 mt-1">{st.detail}</div>}
                  {active && <button onClick={() => { s.setView(st.view); s.doInstall(st.k) }} className="mt-2 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-xs font-semibold">Do it</button>}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------------- Location ---------------- */
export function LocationPicker() {
  const s = useStore()
  const { country, city } = useSite()
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <label className="block"><span className="text-xs text-zinc-400">Country</span>
        <select className="w-full bg-zinc-800 rounded px-2 py-1 border border-zinc-700" value={s.countryCode} onChange={e => s.setLocation(e.target.value, 0)}>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select></label>
      <label className="block"><span className="text-xs text-zinc-400">City</span>
        <select className="w-full bg-zinc-800 rounded px-2 py-1 border border-zinc-700" value={s.cityIdx} onChange={e => s.setLocation(s.countryCode, +e.target.value)}>
          {country.cities.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
        </select></label>
      <div className="col-span-2 text-[11px] text-zinc-500">{city.name}: {city.lat.toFixed(3)}°, {city.lon.toFixed(3)}° · satellites are {city.lat >= 0 ? 'to the south' : 'to the north'} · balcony faces {city.lat >= 0 ? 'south' : 'north'}</div>
    </div>
  )
}

/* ---------------- Align ---------------- */
export function AlignPanel() {
  const s = useStore()
  const { city } = useSite()
  const { results, lnbPowered, input } = useLink()
  const sats = useMemo(() => visibleSats(city.lat, city.lon), [city])
  const [calcSat, setCalcSat] = useState(s.selectedSatId)
  const target = lookAngles(city.lat, city.lon, satById(calcSat).lon)
  const level = levelPercent(results, lnbPowered)
  const best = results.reduce((a, b) => (b.cnDb > a.cnDb ? b : a))
  const bw = beamwidth3dB(input.diameter, input.cBand ? 3900 : 11500)
  const hasCompass = !!s.cart.compass
  const fmt = (v: number) => hasCompass ? v.toFixed(1) : '?'

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg">🎯 Dish Alignment</h2>
      <div className="rounded border border-zinc-700 p-2 space-y-2">
        <div className="text-xs font-semibold text-zinc-300">Look-angle calculator (like dishpointer.com)</div>
        <select className="w-full bg-zinc-800 rounded px-2 py-1 border border-zinc-700 text-sm" value={calcSat} onChange={e => setCalcSat(e.target.value)}>
          {sats.map(({ sat, p }) => <option key={sat.id} value={sat.id}>{fmtLon(sat.lon)} {sat.name} — el {p.el.toFixed(0)}°</option>)}
        </select>
        <div className="grid grid-cols-3 gap-1 text-xs">
          <Stat k="Azimuth (true)" v={fmtAz(target.az)} />
          <Stat k="Elevation" v={`${target.el.toFixed(1)}°`} />
          <Stat k="LNB skew" v={`${target.skew.toFixed(1)}°`} />
        </div>
        <div className="text-[11px] text-zinc-500">EIRP at {city.name}: {eirpAt(satById(calcSat), city.lat, city.lon).eirp.toFixed(1)} dBW ({eirpAt(satById(calcSat), city.lat, city.lon).beam.name}) · dish beamwidth {bw.toFixed(1)}° · slant range {target.distanceKm.toFixed(0)} km</div>
      </div>

      <div className="rounded border border-zinc-700 p-2 space-y-2">
        <div className="flex justify-between text-xs"><span className="font-semibold text-zinc-300">Dish mount (loosen bolts, nudge, tighten)</span>{!hasCompass && <span className="text-amber-400">no compass – angles unknown!</span>}</div>
        <Slider label={`Azimuth ${fmt(s.dish.az)}°`} min={0} max={360} step={0.1} value={s.dish.az} onChange={v => s.setDish({ az: v })} />
        <Slider label={`Elevation ${fmt(s.dish.el)}°`} min={0} max={90} step={0.1} value={s.dish.el} onChange={v => s.setDish({ el: v })} />
        <Slider label={`LNB skew ${s.dish.skew.toFixed(1)}°`} min={-60} max={60} step={0.5} value={s.dish.skew} onChange={v => s.setDish({ skew: v })} />
        <div className="grid grid-cols-4 gap-1 text-xs">
          {[-1, -0.1, 0.1, 1].map(d => <button key={'a' + d} onClick={() => s.setDish({ az: (s.dish.az + d + 360) % 360 })} className="rounded bg-zinc-800 hover:bg-zinc-700 py-1">Az {d > 0 ? '+' : ''}{d}°</button>)}
          {[-1, -0.1, 0.1, 1].map(d => <button key={'e' + d} onClick={() => s.setDish({ el: Math.max(0, Math.min(90, s.dish.el + d)) })} className="rounded bg-zinc-800 hover:bg-zinc-700 py-1">El {d > 0 ? '+' : ''}{d}°</button>)}
        </div>
      </div>

      <div className="rounded border border-zinc-700 p-2 space-y-1 text-xs">
        <div className="font-semibold text-zinc-300">{s.cart.finder ? '📟 Sat-finder meter at the dish' : 'Receiver level meter (on TV)'}</div>
        <div className="grid grid-cols-[60px_1fr_44px] gap-2 items-center"><span>Level</span><div className="h-3 bg-zinc-800 rounded overflow-hidden"><div className="h-full bg-yellow-400 transition-all" style={{ width: `${level}%` }} /></div><span>{level.toFixed(0)} %</span></div>
        {s.cart.finder && <div className="grid grid-cols-[60px_1fr_44px] gap-2 items-center"><span>Quality</span><div className="h-3 bg-zinc-800 rounded overflow-hidden"><div className={`h-full transition-all ${best.cnDb > 6 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${lnbPowered ? Math.max(0, Math.min(100, (best.cnDb + 2) * 5)) : 0}%` }} /></div><span>{lnbPowered ? `${Math.max(0, Math.min(100, (best.cnDb + 2) * 5)).toFixed(0)} %` : '—'}</span></div>}
        {s.cart.finder && lnbPowered && best.cnDb > 0 && <div className="text-zinc-400">Strongest carrier: <b className="text-zinc-200">{best.sat.name}</b> {fmtLon(best.sat.lon)} · C/N {best.cnDb.toFixed(1)} dB · off-axis {best.offsetDeg.toFixed(2)}°</div>}
        {!lnbPowered && <div className="text-amber-400">LNB unpowered: switch on the receiver so the LNB gets 13/18 V.</div>}
        {lnbPowered && level > 60 && <Beeper level={best.cnDb} />}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <label className="flex items-center gap-1"><input type="checkbox" checked={s.showArc} onChange={e => s.setShowArc(e.target.checked)} /> Show satellite arc (training aid)</label>
        <label className="flex items-center gap-1">Weather
          <select className="bg-zinc-800 rounded px-1 border border-zinc-700" value={s.weather} onChange={e => s.setWeather(e.target.value as any)}><option value="clear">Clear</option><option value="rain">Rain (−3 dB)</option><option value="storm">Heavy storm (−9 dB)</option></select></label>
      </div>
      <p className="text-[11px] text-zinc-500">Real-world tip: set elevation first, then sweep azimuth slowly until the meter peaks, then fine-tune elevation and skew for max <i>quality</i>, not level. Level alone also rises on neighbouring satellites!</p>
    </div>
  )
}

function Beeper({ level }: { level: number }) {
  const n = Math.max(1, Math.min(8, Math.round((level + 2) / 2.5)))
  return <div className="text-green-400 font-mono">{'▮'.repeat(n)}{'▯'.repeat(8 - n)} {level > 8 ? 'beeeeep' : level > 3 ? 'beep-beep' : 'beep . . .'}</div>
}
function Stat({ k, v }: { k: string; v: string }) { return <div className="rounded bg-zinc-800 p-1.5"><div className="text-[10px] text-zinc-500">{k}</div><div className="font-mono text-sky-300">{v}</div></div> }
function Slider({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return <label className="block text-xs"><div className="flex justify-between"><span>{label}</span></div><input type="range" className="w-full accent-sky-500" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} /></label>
}

/* ---------------- Remote control ---------------- */
export function Remote() {
  const s = useStore()
  const osd = useOsd()
  const K = ({ children, onClick, cls = '' }: { children: React.ReactNode; onClick: () => void; cls?: string }) => (
    <button onClick={onClick} className={`rounded-full bg-zinc-700 hover:bg-zinc-600 text-[11px] px-2 py-1.5 ${cls}`}>{children}</button>
  )
  const next = (d: number) => { if (!s.channels.length) return; s.setCurrentChannel((s.currentChannel + d + s.channels.length) % s.channels.length); osd.set({ banner: true, screen: 'play' }) }
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-700 p-3 w-44 space-y-2 shadow-xl">
      <div className="text-[10px] text-zinc-400 text-center">SAMSUNG TV REMOTE</div>
      <div className="grid grid-cols-2 gap-1">
        <K cls="bg-red-700 hover:bg-red-600" onClick={() => { const on = !s.tvOn; s.setTvOn(on); if (on) osd.set({ bootUntil: Date.now() + 2000 }) }}>⏻ TV</K>
        <K onClick={() => s.setTvInput(s.tvInput === 'HDMI1' ? 'TV' : s.tvInput === 'TV' ? 'HDMI2' : 'HDMI1')}>SOURCE</K>
      </div>
      <div className="text-[10px] text-zinc-400 text-center pt-1">RECEIVER REMOTE</div>
      <div className="grid grid-cols-2 gap-1">
        <K cls="bg-red-700 hover:bg-red-600" onClick={() => s.install.receiverPowered ? s.setReceiverOn(!s.receiverOn) : s.say('The receiver is not plugged in yet.')}>⏻ RX</K>
        <K onClick={() => osd.set({ screen: 'menu' })}>MENU</K>
        <K onClick={() => osd.set({ screen: s.channels.length ? 'play' : 'menu', banner: true })}>EXIT</K>
        <K onClick={() => osd.set({ screen: 'list' })}>LIST</K>
        <K onClick={() => next(1)}>CH ▲</K>
        <K onClick={() => next(-1)}>CH ▼</K>
        <K onClick={() => osd.set({ screen: 'info' })}>INFO</K>
        <K onClick={() => osd.set({ screen: 'antenna' })}>SAT</K>
      </div>
    </div>
  )
}
