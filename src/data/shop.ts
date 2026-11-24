export type Category = 'dish' | 'lnb' | 'receiver' | 'cable' | 'connectors' | 'mount' | 'hdmi' | 'finder' | 'compass' | 'tools'

export interface ShopItem {
  id: string
  category: Category
  name: string
  brand: string
  price: number
  desc: string
  diameter?: number     // metres, dishes
  noiseFigure?: number  // dB, LNBs
  outputs?: number
  required?: boolean
}

export const SHOP: ShopItem[] = [
  { id: 'dish60', category: 'dish', name: '60 cm Offset Dish', brand: 'Triax TD 64', price: 39, diameter: 0.6, desc: 'Steel offset reflector. Fine for strong spot beams in the footprint centre.' },
  { id: 'dish80', category: 'dish', name: '80 cm Offset Dish', brand: 'Gibertini OP 85', price: 59, diameter: 0.8, desc: 'The European standard. Good rain-fade margin on Astra/Hot Bird.' },
  { id: 'dish100', category: 'dish', name: '100 cm Offset Dish', brand: 'Kathrein CAS 120', price: 109, diameter: 1.0, desc: 'Aluminium reflector. Picks up weaker beams and far-away satellites.' },
  { id: 'dish120', category: 'dish', name: '120 cm Offset Dish', brand: 'Famaval 120 TRX', price: 169, diameter: 1.2, desc: 'Large reflector for fringe reception. Narrow beamwidth – harder to aim.' },
  { id: 'dish180', category: 'dish', name: '180 cm Prime-Focus Dish', brand: 'Laminas 1.8m', price: 349, diameter: 1.8, desc: 'Mesh prime-focus dish for C-band and extreme DX reception.' },

  { id: 'lnbsingle', category: 'lnb', name: 'Universal Single LNB 0.1 dB', brand: 'Inverto Black Ultra', price: 12, noiseFigure: 0.1, outputs: 1, desc: 'Ku-band 10.7–12.75 GHz, LO 9750/10600 MHz, 22 kHz band switching.' },
  { id: 'lnbtwin', category: 'lnb', name: 'Universal Twin LNB 0.2 dB', brand: 'Octagon Optima', price: 19, noiseFigure: 0.2, outputs: 2, desc: 'Two independent outputs – feeds two receivers or a PVR twin tuner.' },
  { id: 'lnbquad', category: 'lnb', name: 'Universal Quad LNB 0.1 dB', brand: 'Inverto Black Premium', price: 29, noiseFigure: 0.1, outputs: 4, desc: 'Four outputs. High-gain, excellent phase noise for DVB-S2 8PSK.' },
  { id: 'lnbc', category: 'lnb', name: 'C-band LNBF 17K', brand: 'Norsat 8115', price: 45, noiseFigure: 0.3, outputs: 1, desc: 'For 3.4–4.2 GHz C-band on prime-focus dishes (LO 5150 MHz).' },

  { id: 'rxhd', category: 'receiver', name: 'HD DVB-S2 FTA Receiver', brand: 'Edision Piccollo S2', price: 49, desc: 'Free-to-air DVB-S/S2 receiver, HDMI out, blind scan, DiSEqC 1.0/1.2, USB PVR.' },
  { id: 'rx4k', category: 'receiver', name: '4K UHD DVB-S2X Receiver', brand: 'Octagon SF8008 4K', price: 139, desc: 'Enigma2 Linux receiver with twin tuner, S2X, HEVC, fast blind scan.' },

  { id: 'cable20', category: 'cable', name: '20 m Coaxial Cable RG6', brand: 'Televes T100 (75 Ω)', price: 18, desc: 'Double-shielded 75 Ω satellite coax. Attenuation ≈ 20 dB/100 m @ 2 GHz.' },
  { id: 'fconn', category: 'connectors', name: 'F-Connectors (10 pcs)', brand: 'Cabelcon', price: 6, desc: 'Compression F-plugs for RG6. Weatherproof when wrapped.' },
  { id: 'wallmount', category: 'mount', name: 'Wall Mount Bracket 35 cm', brand: 'Steel, hot-dip galvanised', price: 22, desc: 'Wall standoff bracket with 48 mm mast and 4 anchor bolts.' },
  { id: 'hdmi', category: 'hdmi', name: 'HDMI 2.0 Cable 1.5 m', brand: 'Hama Premium', price: 8, desc: 'Connects the receiver to the Samsung TV.' },

  { id: 'finder', category: 'finder', name: 'Satellite Finder Meter', brand: 'Satlink WS-6933', price: 59, desc: 'Digital meter showing level & quality at the dish. Makes alignment much easier.' },
  { id: 'compass', category: 'compass', name: 'Compass + Inclinometer', brand: 'Suunto / digital', price: 14, desc: 'Measure azimuth and elevation at the dish – know where you point.' },
  { id: 'tools', category: 'tools', name: 'Tool Kit', brand: 'Drill, 13 mm spanner, cable stripper', price: 29, desc: 'Needed to drill the wall mount and crimp connectors.' },
]

export const REQUIRED_CATEGORIES: Category[] = ['dish', 'lnb', 'receiver', 'cable', 'connectors', 'mount', 'hdmi', 'tools']
export const STARTING_BUDGET = 450
