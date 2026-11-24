import { create } from 'zustand'
import { COUNTRIES } from './data/locations'
import { SHOP, ShopItem, STARTING_BUDGET, REQUIRED_CATEGORIES, Category } from './data/shop'
import { SATELLITES } from './data/satellites'
import { Channel } from './lib/iptv'
import { evaluateAll, LinkInput, LinkResult, lookAngles } from './lib/geo'

export type Phase = 'shop' | 'install' | 'align' | 'watch'
export type View = 'room' | 'tv' | 'balcony' | 'dish'

export interface InstallState {
  mountDrilled: boolean
  dishMounted: boolean
  lnbAttached: boolean
  cableRun: boolean
  cableToReceiver: boolean
  hdmiConnected: boolean
  receiverPowered: boolean
}

interface State {
  phase: Phase
  view: View
  money: number
  cart: Record<Category, ShopItem | undefined>
  purchased: boolean
  install: InstallState
  countryCode: string
  cityIdx: number
  dish: { az: number; el: number; skew: number }
  weather: 'clear' | 'rain' | 'storm'
  receiverOn: boolean
  tvOn: boolean
  tvInput: 'HDMI1' | 'TV' | 'HDMI2'
  selectedSatId: string
  channels: Channel[]
  currentChannel: number
  mascotMsg: string
  overlayTV: boolean
  showArc: boolean

  setPhase: (p: Phase) => void
  setView: (v: View) => void
  addToCart: (item: ShopItem) => void
  removeFromCart: (c: Category) => void
  checkout: () => void
  doInstall: (k: keyof InstallState) => void
  setLocation: (cc: string, cityIdx: number) => void
  setDish: (d: Partial<{ az: number; el: number; skew: number }>) => void
  setWeather: (w: State['weather']) => void
  setReceiverOn: (b: boolean) => void
  setTvOn: (b: boolean) => void
  setTvInput: (i: State['tvInput']) => void
  setSelectedSat: (id: string) => void
  setChannels: (c: Channel[]) => void
  setCurrentChannel: (n: number) => void
  say: (m: string) => void
  setOverlayTV: (b: boolean) => void
  setShowArc: (b: boolean) => void
}

const emptyCart = (): Record<Category, ShopItem | undefined> => ({
  dish: undefined, lnb: undefined, receiver: undefined, cable: undefined, connectors: undefined, mount: undefined, hdmi: undefined, finder: undefined, compass: undefined, tools: undefined,
})

export const useStore = create<State>((set, get) => ({
  phase: 'shop',
  view: 'room',
  money: STARTING_BUDGET,
  cart: emptyCart(),
  purchased: false,
  install: { mountDrilled: false, dishMounted: false, lnbAttached: false, cableRun: false, cableToReceiver: false, hdmiConnected: false, receiverPowered: false },
  countryCode: 'de',
  cityIdx: 0,
  dish: { az: 180, el: 20, skew: 0 },
  weather: 'clear',
  receiverOn: false,
  tvOn: false,
  tvInput: 'HDMI1',
  selectedSatId: 'astra19',
  channels: [],
  currentChannel: 0,
  mascotMsg: 'Welcome! First, buy everything you need for a satellite system. The budget is tight – choose wisely.',
  overlayTV: false,
  showArc: false,

  setPhase: phase => set({ phase }),
  setView: view => set({ view }),
  addToCart: item => set(s => ({ cart: { ...s.cart, [item.category]: item } })),
  removeFromCart: c => set(s => ({ cart: { ...s.cart, [c]: undefined } })),
  checkout: () => {
    const { cart } = get()
    const total = cartTotal(cart)
    const missing = REQUIRED_CATEGORIES.filter(c => !cart[c])
    if (missing.length) { set({ mascotMsg: `You still need: ${missing.join(', ')}.` }); return }
    if (total > get().money) { set({ mascotMsg: `Not enough money – you are €${total - get().money} short. Pick cheaper parts.` }); return }
    set(s => ({ money: s.money - total, purchased: true, phase: 'install', view: 'balcony',
      mascotMsg: 'Delivered! Head to the balcony and start with the wall bracket. Follow the checklist on the left.' }))
  },
  doInstall: k => set(s => {
    const install = { ...s.install, [k]: true }
    const allDone = Object.values(install).every(Boolean)
    return { install, phase: allDone ? 'align' : s.phase, view: k === 'cableToReceiver' || k === 'hdmiConnected' || k === 'receiverPowered' ? 'tv' : s.view,
      mascotMsg: allDone ? 'Everything is wired up. Now the hard part: aim the dish at a satellite. Use the calculator for the target angles, then watch the signal meter.' : s.mascotMsg }
  }),
  setLocation: (countryCode, cityIdx) => set({ countryCode, cityIdx, channels: [], currentChannel: 0 }),
  setDish: d => set(s => ({ dish: { ...s.dish, ...d } })),
  setWeather: weather => set({ weather }),
  setReceiverOn: receiverOn => set({ receiverOn }),
  setTvOn: tvOn => set({ tvOn }),
  setTvInput: tvInput => set({ tvInput }),
  setSelectedSat: selectedSatId => set({ selectedSatId }),
  setChannels: channels => set(s => ({ channels, currentChannel: 0, phase: channels.length ? 'watch' : s.phase })),
  setCurrentChannel: currentChannel => set({ currentChannel }),
  say: mascotMsg => set({ mascotMsg }),
  setOverlayTV: overlayTV => set({ overlayTV }),
  setShowArc: showArc => set({ showArc }),
}))

export const cartTotal = (cart: Record<Category, ShopItem | undefined>) => Object.values(cart).reduce((a, i) => a + (i?.price ?? 0), 0)

/* -------- derived selectors -------- */
export function useSite() {
  const cc = useStore(s => s.countryCode), ci = useStore(s => s.cityIdx)
  const country = COUNTRIES.find(c => c.code === cc) ?? COUNTRIES[0]
  const city = country.cities[Math.min(ci, country.cities.length - 1)]
  return { country, city }
}

export function useLink(): { results: LinkResult[]; input: LinkInput; lnbPowered: boolean } {
  const s = useStore()
  const { city } = useSite()
  const diameter = s.cart.dish?.diameter ?? 0.8
  const cBand = s.cart.lnb?.id === 'lnbc'
  const rainDb = s.weather === 'clear' ? 0 : s.weather === 'rain' ? 3 : 9
  const input: LinkInput = { lat: city.lat, lon: city.lon, dishAz: s.dish.az, dishEl: s.dish.el, dishSkew: s.dish.skew, diameter, lnbNoiseDb: s.cart.lnb?.noiseFigure ?? 0.3, cBand, rainDb, cableLossDb: 4 }
  const i = s.install
  const lnbPowered = i.lnbAttached && i.cableRun && i.cableToReceiver && i.receiverPowered && s.receiverOn
  let results = evaluateAll(input)
  // Line of sight: the dish hangs on the balcony wall; pointing back into the building blocks the signal.
  const facing = city.lat >= 0 ? 180 : 0
  let diff = Math.abs(((s.dish.az - facing + 540) % 360) - 180)
  if (diff > 100 && s.dish.el < 60) results = results.map(r => ({ ...r, cnDb: -30, rxPowerRel: -99 }))
  return { results, input, lnbPowered }
}

/** Satellites visible above the horizon from the site, sorted by elevation. */
export function visibleSats(lat: number, lon: number) {
  return SATELLITES.map(s => ({ sat: s, p: lookAngles(lat, lon, s.lon) })).filter(x => x.p.el > 3).sort((a, b) => b.p.el - a.p.el)
}

export const itemsByCategory = (c: Category) => SHOP.filter(i => i.category === c)
