export type Pol = 'H' | 'V'
export interface Transponder {
  freq: number       // MHz (downlink)
  pol: Pol
  sr: number         // kS/s
  fec: string
  system: 'DVB-S' | 'DVB-S2'
  mod: 'QPSK' | '8PSK'
  country: string    // iptv-org country code used to populate FTA channels
  count: number      // how many FTA channels to put on this TP
  provider: string
  scrambled?: string[] // names of famous encrypted channels on this TP
}
export interface Beam { lat: number; lon: number; radiusKm: number; eirp: number; name: string }
export interface Satellite {
  id: string
  name: string
  lon: number        // degrees East (negative = West)
  operator: string
  beams: Beam[]
  transponders: Transponder[]
}

const S2 = 'DVB-S2' as const, S1 = 'DVB-S' as const

export const SATELLITES: Satellite[] = [
  {
    id: 'astra19', name: 'Astra 1KR/1L/1M/1N', lon: 19.2, operator: 'SES',
    beams: [{ name: 'Europe wide beam', lat: 49, lon: 9, radiusKm: 1700, eirp: 51 }],
    transponders: [
      { freq: 11836, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'de', count: 10, provider: 'ARD' },
      { freq: 11954, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'de', count: 10, provider: 'ZDFvision' },
      { freq: 12188, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'de', count: 10, provider: 'ProSiebenSat.1' },
      { freq: 11362, pol: 'H', sr: 22000, fec: '2/3', system: S2, mod: '8PSK', country: 'de', count: 8, provider: 'ARD HD' },
      { freq: 11494, pol: 'H', sr: 22000, fec: '2/3', system: S2, mod: '8PSK', country: 'de', count: 8, provider: 'ZDF HD' },
      { freq: 12545, pol: 'H', sr: 22000, fec: '2/3', system: S2, mod: '8PSK', country: 'de', count: 8, provider: 'RTL Group', scrambled: ['Sky Cinema Premieren HD', 'Sky Sport 1 HD'] },
      { freq: 11597, pol: 'V', sr: 22000, fec: '5/6', system: S1, mod: 'QPSK', country: 'es', count: 8, provider: 'Movistar+', scrambled: ['Movistar LaLiga', '#0 HD'] },
      { freq: 12402, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'fr', count: 8, provider: 'CanalSat', scrambled: ['Canal+ HD', 'TF1 HD', 'M6 HD'] },
      { freq: 11509, pol: 'V', sr: 22000, fec: '5/6', system: S1, mod: 'QPSK', country: 'nl', count: 6, provider: 'Canal Digitaal', scrambled: ['NPO 1 HD', 'RTL 4 HD'] },
      { freq: 12070, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'at', count: 6, provider: 'ORF', scrambled: ['ORF1 HD', 'ORF2 HD'] },
    ],
  },
  {
    id: 'hotbird13', name: 'Hot Bird 13F/13G', lon: 13.0, operator: 'Eutelsat',
    beams: [{ name: 'Europe + MENA wide', lat: 44, lon: 15, radiusKm: 2300, eirp: 50 }],
    transponders: [
      { freq: 11766, pol: 'V', sr: 27500, fec: '2/3', system: S2, mod: '8PSK', country: 'it', count: 10, provider: 'Rai' },
      { freq: 10992, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'it', count: 10, provider: 'Mediaset' },
      { freq: 11541, pol: 'V', sr: 22000, fec: '5/6', system: S1, mod: 'QPSK', country: 'it', count: 8, provider: 'Tivùsat', scrambled: ['Sky Sport Uno', 'Sky Cinema Uno'] },
      { freq: 12111, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'pl', count: 10, provider: 'TVP' },
      { freq: 10719, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'pl', count: 8, provider: 'Polsat/Canal+', scrambled: ['Polsat HD', 'TVN HD'] },
      { freq: 11034, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'sa', count: 8, provider: 'Arabic Multiplex' },
      { freq: 12520, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'ir', count: 8, provider: 'Persian Multiplex' },
      { freq: 11373, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'fr', count: 8, provider: 'France TV FTA' },
      { freq: 12597, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'gr', count: 6, provider: 'Greek Multiplex' },
      { freq: 11219, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'ru', count: 6, provider: 'Russian Multiplex' },
    ],
  },
  {
    id: 'astra28', name: 'Astra 2E/2F/2G', lon: 28.2, operator: 'SES',
    beams: [{ name: 'UK spot beam', lat: 54, lon: -2, radiusKm: 1050, eirp: 52 }, { name: 'Europe beam', lat: 49, lon: 8, radiusKm: 1600, eirp: 46 }],
    transponders: [
      { freq: 10773, pol: 'H', sr: 22000, fec: '5/6', system: S1, mod: 'QPSK', country: 'gb', count: 10, provider: 'BBC' },
      { freq: 10803, pol: 'H', sr: 22000, fec: '5/6', system: S1, mod: 'QPSK', country: 'gb', count: 10, provider: 'BBC' },
      { freq: 10891, pol: 'H', sr: 22000, fec: '5/6', system: S1, mod: 'QPSK', country: 'gb', count: 8, provider: 'ITV' },
      { freq: 10964, pol: 'H', sr: 22000, fec: '5/6', system: S1, mod: 'QPSK', country: 'gb', count: 8, provider: 'Channel 4' },
      { freq: 10847, pol: 'V', sr: 23000, fec: '2/3', system: S2, mod: '8PSK', country: 'gb', count: 8, provider: 'BBC HD' },
      { freq: 11306, pol: 'V', sr: 27500, fec: '2/3', system: S2, mod: '8PSK', country: 'gb', count: 8, provider: 'Channel 5 / Sky', scrambled: ['Sky Sports Main Event', 'Sky Atlantic HD', 'Sky Cinema Premiere'] },
      { freq: 12207, pol: 'V', sr: 27500, fec: '2/3', system: S1, mod: 'QPSK', country: 'ie', count: 6, provider: 'RTÉ / Freesat' },
    ],
  },
  {
    id: 'turksat42', name: 'Türksat 4A/5B', lon: 42.0, operator: 'Türksat',
    beams: [{ name: 'Türkiye beam', lat: 39, lon: 35, radiusKm: 1300, eirp: 52 }, { name: 'Europe/West beam', lat: 47, lon: 15, radiusKm: 1800, eirp: 46 }],
    transponders: [
      { freq: 11958, pol: 'V', sr: 27500, fec: '5/6', system: S1, mod: 'QPSK', country: 'tr', count: 10, provider: 'TRT' },
      { freq: 12015, pol: 'H', sr: 27500, fec: '5/6', system: S1, mod: 'QPSK', country: 'tr', count: 10, provider: 'Kanal D / Show' },
      { freq: 11096, pol: 'H', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'tr', count: 10, provider: 'TRT HD' },
      { freq: 12188, pol: 'V', sr: 27500, fec: '5/6', system: S1, mod: 'QPSK', country: 'tr', count: 10, provider: 'ATV / Star', scrambled: ['beIN Sports 1 HD', 'beIN Movies'] },
      { freq: 11729, pol: 'V', sr: 30000, fec: '5/6', system: S2, mod: '8PSK', country: 'tr', count: 10, provider: 'Digiturk', scrambled: ['Digiturk Promo'] },
      { freq: 11054, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'az', count: 6, provider: 'Azerbaijan Mux' },
    ],
  },
  {
    id: 'nilesat7w', name: 'Nilesat 201/301 & Eutelsat 7 West A', lon: -7.0, operator: 'Nilesat / Eutelsat',
    beams: [{ name: 'MENA beam', lat: 27, lon: 30, radiusKm: 2400, eirp: 51 }],
    transponders: [
      { freq: 11766, pol: 'H', sr: 27500, fec: '5/6', system: S1, mod: 'QPSK', country: 'eg', count: 10, provider: 'ERTU' },
      { freq: 12034, pol: 'V', sr: 27500, fec: '5/6', system: S1, mod: 'QPSK', country: 'eg', count: 10, provider: 'Nilesat Mux' },
      { freq: 11862, pol: 'H', sr: 27500, fec: '5/6', system: S1, mod: 'QPSK', country: 'sa', count: 10, provider: 'MBC Group' },
      { freq: 12226, pol: 'H', sr: 27500, fec: '5/6', system: S2, mod: '8PSK', country: 'qa', count: 8, provider: 'Al Jazeera', scrambled: ['beIN Sports 1 HD', 'beIN Sports 2 HD', 'OSN Movies'] },
      { freq: 11373, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'ma', count: 8, provider: 'SNRT' },
      { freq: 11012, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'lb', count: 6, provider: 'Lebanese Mux' },
      { freq: 10815, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'iq', count: 6, provider: 'Iraqi Mux' },
    ],
  },
  {
    id: 'badr26', name: 'Badr 4/5/7/8 (Arabsat)', lon: 26.0, operator: 'Arabsat',
    beams: [{ name: 'MENA beam', lat: 27, lon: 38, radiusKm: 2500, eirp: 50 }],
    transponders: [
      { freq: 11938, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'sa', count: 10, provider: 'Saudi Broadcasting' },
      { freq: 12054, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'ae', count: 10, provider: 'Dubai Media / ADMN' },
      { freq: 12207, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'kw', count: 6, provider: 'Gulf Mux' },
      { freq: 11785, pol: 'H', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'sa', count: 8, provider: 'MBC HD', scrambled: ['OSN Yahala', 'Shahid VIP'] },
      { freq: 12302, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'jo', count: 6, provider: 'Levant Mux' },
    ],
  },
  {
    id: 'hispasat30w', name: 'Hispasat 30W-5/30W-6', lon: -30.0, operator: 'Hispasat',
    beams: [{ name: 'Europe beam', lat: 40, lon: -4, radiusKm: 1500, eirp: 51 }, { name: 'South America beam', lat: -15, lon: -55, radiusKm: 2800, eirp: 48 }],
    transponders: [
      { freq: 11931, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'es', count: 10, provider: 'RTVE' },
      { freq: 12092, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'es', count: 8, provider: 'Atresmedia / Mediaset España' },
      { freq: 11972, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'pt', count: 8, provider: 'RTP / NOS', scrambled: ['Sport TV 1 HD', 'TVCine Top'] },
      { freq: 12456, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'br', count: 8, provider: 'Brazil FTA' },
      { freq: 11771, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'ar', count: 6, provider: 'Latin Mux' },
    ],
  },
  {
    id: 'eutelsat9', name: 'Eutelsat 9B', lon: 9.0, operator: 'Eutelsat',
    beams: [{ name: 'Europe wide', lat: 46, lon: 12, radiusKm: 1800, eirp: 50 }],
    transponders: [
      { freq: 11823, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'it', count: 8, provider: 'Italian FTA' },
      { freq: 12034, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'de', count: 8, provider: 'German FTA / Telekom' },
      { freq: 11919, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'gr', count: 6, provider: 'Greek Mux', scrambled: ['Nova Sports 1 HD'] },
      { freq: 12111, pol: 'H', sr: 27500, fec: '2/3', system: S2, mod: '8PSK', country: 'al', count: 6, provider: 'Albanian Mux' },
    ],
  },
  {
    id: 'eutelsat16', name: 'Eutelsat 16A', lon: 16.0, operator: 'Eutelsat',
    beams: [{ name: 'Europe B beam', lat: 44, lon: 19, radiusKm: 1600, eirp: 52 }],
    transponders: [
      { freq: 11283, pol: 'V', sr: 27500, fec: '2/3', system: S2, mod: '8PSK', country: 'rs', count: 8, provider: 'RTS / Total TV', scrambled: ['Arena Sport 1', 'Sportklub 1'] },
      { freq: 11554, pol: 'H', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'hr', count: 6, provider: 'HRT' },
      { freq: 10845, pol: 'H', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'ba', count: 6, provider: 'BiH Mux' },
      { freq: 11595, pol: 'H', sr: 30000, fec: '2/3', system: S2, mod: '8PSK', country: 'ro', count: 8, provider: 'Romanian Mux' },
      { freq: 10803, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'bg', count: 6, provider: 'Bulgarian Mux' },
    ],
  },
  {
    id: 'thor1w', name: 'Thor 5/6/7 & Intelsat 10-02', lon: -0.8, operator: 'Telenor / Intelsat',
    beams: [{ name: 'Nordic beam', lat: 60, lon: 15, radiusKm: 1400, eirp: 51 }],
    transponders: [
      { freq: 11216, pol: 'V', sr: 24500, fec: '7/8', system: S1, mod: 'QPSK', country: 'no', count: 8, provider: 'NRK / Canal Digital', scrambled: ['TV 2 Norge HD', 'Viasat Sport'] },
      { freq: 11293, pol: 'H', sr: 24500, fec: '7/8', system: S1, mod: 'QPSK', country: 'se', count: 8, provider: 'SVT / Allente', scrambled: ['TV4 HD', 'C More First'] },
      { freq: 12418, pol: 'V', sr: 28000, fec: '7/8', system: S1, mod: 'QPSK', country: 'dk', count: 6, provider: 'DR / TV2' },
      { freq: 11325, pol: 'V', sr: 24500, fec: '7/8', system: S2, mod: '8PSK', country: 'fi', count: 6, provider: 'Yle' },
    ],
  },
  {
    id: 'eutelsat36', name: 'Eutelsat 36B / Express-AMU1', lon: 36.0, operator: 'Eutelsat / RSCC',
    beams: [{ name: 'Russia beam', lat: 55, lon: 45, radiusKm: 2200, eirp: 50 }, { name: 'Sub-Saharan Africa beam', lat: -10, lon: 25, radiusKm: 2800, eirp: 48 }],
    transponders: [
      { freq: 11785, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'ru', count: 10, provider: 'Tricolor TV', scrambled: ['Match! Premier HD', 'Kinopremiera HD'] },
      { freq: 12245, pol: 'H', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'ru', count: 10, provider: 'NTV-Plus' },
      { freq: 11900, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'ng', count: 8, provider: 'MultiChoice Africa', scrambled: ['SuperSport Premier League', 'M-Net Movies'] },
      { freq: 12054, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'za', count: 8, provider: 'DStv South Africa', scrambled: ['SuperSport PSL', 'M-Net HD'] },
      { freq: 11674, pol: 'V', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'ke', count: 6, provider: 'East Africa Mux' },
    ],
  },
  {
    id: 'hellas39', name: 'Hellas Sat 3/4', lon: 39.0, operator: 'Hellas Sat',
    beams: [{ name: 'Europe/Balkans beam', lat: 42, lon: 24, radiusKm: 1600, eirp: 51 }],
    transponders: [
      { freq: 12524, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'gr', count: 8, provider: 'ERT' },
      { freq: 12565, pol: 'H', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'cy', count: 6, provider: 'Cyprus Mux' },
      { freq: 12688, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'bg', count: 8, provider: 'Bulsatcom', scrambled: ['Diema Sport HD', 'bTV HD'] },
      { freq: 12606, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'rs', count: 6, provider: 'Serbian Mux' },
    ],
  },
  {
    id: 'yahsat52', name: 'Yahsat 1A', lon: 52.5, operator: 'Yahsat',
    beams: [{ name: 'Middle East beam', lat: 26, lon: 48, radiusKm: 2000, eirp: 51 }, { name: 'South-West Asia beam', lat: 30, lon: 68, radiusKm: 1800, eirp: 49 }],
    transponders: [
      { freq: 11785, pol: 'H', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'ae', count: 8, provider: 'YahLive' },
      { freq: 11938, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'pk', count: 8, provider: 'Pakistani Mux' },
      { freq: 12054, pol: 'H', sr: 27500, fec: '3/4', system: S1, mod: 'QPSK', country: 'af', count: 6, provider: 'Afghan Mux' },
      { freq: 11996, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'sa', count: 6, provider: 'Arabic Mux' },
    ],
  },
  {
    id: 'intelsat20', name: 'Intelsat 20 (IS-20)', lon: 68.5, operator: 'Intelsat',
    beams: [{ name: 'Africa Ku beam', lat: -5, lon: 25, radiusKm: 3200, eirp: 49 }, { name: 'South Asia Ku beam', lat: 20, lon: 78, radiusKm: 2000, eirp: 50 }],
    transponders: [
      { freq: 12522, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'za', count: 8, provider: 'DStv / OpenView', scrambled: ['SuperSport Grandstand', 'M-Net'] },
      { freq: 12562, pol: 'H', sr: 26657, fec: '3/4', system: S2, mod: '8PSK', country: 'ng', count: 8, provider: 'Nigeria FTA' },
      { freq: 12682, pol: 'H', sr: 26657, fec: '3/4', system: S2, mod: '8PSK', country: 'in', count: 10, provider: 'Indian FTA' },
      { freq: 12602, pol: 'V', sr: 26657, fec: '3/4', system: S1, mod: 'QPSK', country: 'gh', count: 6, provider: 'West Africa Mux' },
      { freq: 12722, pol: 'H', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'ke', count: 6, provider: 'East Africa Mux' },
    ],
  },
  {
    id: 'gsat93', name: 'GSAT-30/GSAT-10 (DD Free Dish)', lon: 93.5, operator: 'ISRO / Prasar Bharati',
    beams: [{ name: 'India beam', lat: 22, lon: 79, radiusKm: 1900, eirp: 52 }],
    transponders: [
      { freq: 11090, pol: 'V', sr: 29500, fec: '3/4', system: S2, mod: '8PSK', country: 'in', count: 10, provider: 'DD Free Dish' },
      { freq: 11170, pol: 'V', sr: 29500, fec: '3/4', system: S2, mod: '8PSK', country: 'in', count: 10, provider: 'DD Free Dish' },
      { freq: 11510, pol: 'V', sr: 29500, fec: '3/4', system: S2, mod: '8PSK', country: 'in', count: 10, provider: 'DD Free Dish' },
      { freq: 11630, pol: 'V', sr: 29500, fec: '3/4', system: S2, mod: '8PSK', country: 'in', count: 10, provider: 'DD Free Dish' },
    ],
  },
  {
    id: 'paksat38', name: 'Paksat-1R / Paksat MM1', lon: 38.0, operator: 'SUPARCO',
    beams: [{ name: 'Pakistan beam', lat: 30, lon: 70, radiusKm: 1600, eirp: 51 }],
    transponders: [
      { freq: 3785, pol: 'H', sr: 2963, fec: '3/4', system: S1, mod: 'QPSK', country: 'pk', count: 6, provider: 'PTV (C-band)' },
      { freq: 11494, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'pk', count: 10, provider: 'Pakistani Mux' },
      { freq: 11551, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'pk', count: 8, provider: 'Pakistani Mux' },
    ],
  },
  {
    id: 'measat91', name: 'MEASAT-3b / 3d', lon: 91.5, operator: 'MEASAT',
    beams: [{ name: 'Malaysia/Indonesia beam', lat: 1, lon: 108, radiusKm: 1800, eirp: 52 }],
    transponders: [
      { freq: 12563, pol: 'H', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'my', count: 8, provider: 'Astro', scrambled: ['Astro SuperSport HD', 'Astro First'] },
      { freq: 12643, pol: 'H', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'my', count: 8, provider: 'Astro NJOI' },
      { freq: 12436, pol: 'V', sr: 30000, fec: '5/6', system: S2, mod: '8PSK', country: 'id', count: 8, provider: 'Indonesian FTA' },
      { freq: 12356, pol: 'V', sr: 30000, fec: '5/6', system: S2, mod: '8PSK', country: 'id', count: 8, provider: 'Indonesian FTA' },
    ],
  },
  {
    id: 'optus160', name: 'Optus D1 / D3', lon: 160.0, operator: 'Optus',
    beams: [{ name: 'Australia national beam', lat: -27, lon: 134, radiusKm: 2300, eirp: 50 }],
    transponders: [
      { freq: 12398, pol: 'V', sr: 22500, fec: '3/4', system: S2, mod: '8PSK', country: 'au', count: 10, provider: 'VAST', scrambled: ['Foxtel Movies Premiere', 'Fox Sports 501'] },
      { freq: 12558, pol: 'H', sr: 22500, fec: '3/4', system: S2, mod: '8PSK', country: 'au', count: 10, provider: 'VAST / ABC / SBS' },
      { freq: 12456, pol: 'V', sr: 22500, fec: '3/4', system: S2, mod: '8PSK', country: 'au', count: 8, provider: 'Foxtel', scrambled: ['Sky News HD', 'Fox League'] },
      { freq: 12326, pol: 'H', sr: 22500, fec: '3/4', system: S2, mod: '8PSK', country: 'nz', count: 6, provider: 'Freeview NZ' },
    ],
  },
  {
    id: 'galaxy19', name: 'Galaxy 19', lon: -97.0, operator: 'Intelsat',
    beams: [{ name: 'CONUS Ku beam', lat: 39, lon: -97, radiusKm: 2600, eirp: 48 }],
    transponders: [
      { freq: 11836, pol: 'V', sr: 20770, fec: '3/4', system: S1, mod: 'QPSK', country: 'us', count: 10, provider: 'GloryStar' },
      { freq: 11929, pol: 'H', sr: 22000, fec: '3/4', system: S1, mod: 'QPSK', country: 'us', count: 10, provider: 'Ethnic American Mux' },
      { freq: 12152, pol: 'H', sr: 20000, fec: '3/4', system: S2, mod: '8PSK', country: 'us', count: 8, provider: 'International Mux' },
      { freq: 11966, pol: 'V', sr: 22000, fec: '3/4', system: S1, mod: 'QPSK', country: 'ca', count: 6, provider: 'Canadian Mux' },
      { freq: 12053, pol: 'H', sr: 22000, fec: '3/4', system: S1, mod: 'QPSK', country: 'mx', count: 6, provider: 'Spanish-language Mux' },
    ],
  },
  {
    id: 'dish119', name: 'EchoStar / DISH 119°W', lon: -119.0, operator: 'DISH Network',
    beams: [{ name: 'CONUS DBS beam', lat: 39, lon: -98, radiusKm: 2700, eirp: 53 }],
    transponders: [
      { freq: 12239, pol: 'V', sr: 20000, fec: '5/6', system: S1, mod: 'QPSK', country: 'us', count: 6, provider: 'DISH Network', scrambled: ['ESPN HD', 'HBO HD', 'CNN HD', 'Fox News HD'] },
      { freq: 12457, pol: 'V', sr: 20000, fec: '5/6', system: S1, mod: 'QPSK', country: 'us', count: 6, provider: 'DISH Network', scrambled: ['TNT HD', 'AMC HD', 'Discovery HD'] },
      { freq: 12341, pol: 'H', sr: 20000, fec: '5/6', system: S1, mod: 'QPSK', country: 'ca', count: 6, provider: 'Shaw Direct (nearby)', scrambled: ['CBC HD', 'TSN 1 HD'] },
    ],
  },
  {
    id: 'amazonas61', name: 'Amazonas 3/5', lon: -61.0, operator: 'Hispasat',
    beams: [{ name: 'South America beam', lat: -15, lon: -58, radiusKm: 3000, eirp: 51 }],
    transponders: [
      { freq: 11810, pol: 'H', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'br', count: 10, provider: 'Brazilian FTA' },
      { freq: 11940, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'ar', count: 8, provider: 'Argentine Mux', scrambled: ['TyC Sports HD', 'ESPN Premium'] },
      { freq: 12092, pol: 'H', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'mx', count: 8, provider: 'Latin American Mux' },
      { freq: 11131, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'cl', count: 6, provider: 'Chilean Mux' },
    ],
  },
  {
    id: 'starone70', name: 'Star One D2', lon: -70.0, operator: 'Embratel / Claro',
    beams: [{ name: 'Brazil Ku beam', lat: -14, lon: -52, radiusKm: 2500, eirp: 52 }],
    transponders: [
      { freq: 11140, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'br', count: 10, provider: 'Claro TV', scrambled: ['Premiere Clubes', 'Telecine Premium', 'SporTV HD'] },
      { freq: 11260, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'br', count: 10, provider: 'Brazilian FTA' },
      { freq: 11380, pol: 'H', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'br', count: 10, provider: 'Globo / Record FTA' },
    ],
  },
  {
    id: 'skymex116', name: 'SKY México / SES 116.8°W', lon: -116.8, operator: 'SES / Sky México',
    beams: [{ name: 'Mexico & Central America beam', lat: 21, lon: -100, radiusKm: 2200, eirp: 52 }],
    transponders: [
      { freq: 12224, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'mx', count: 10, provider: 'Televisa FTA' },
      { freq: 12380, pol: 'H', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'mx', count: 8, provider: 'SKY México', scrambled: ['Fox Sports MX', 'TUDN HD'] },
      { freq: 12120, pol: 'V', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'us', count: 6, provider: 'Hispanic Mux' },
    ],
  },
  {
    id: 'anik107', name: 'Anik F1R / Shaw Direct 107.3°W', lon: -107.3, operator: 'Telesat',
    beams: [{ name: 'Canada beam', lat: 55, lon: -98, radiusKm: 2600, eirp: 50 }],
    transponders: [
      { freq: 12004, pol: 'H', sr: 22000, fec: '3/4', system: S2, mod: '8PSK', country: 'ca', count: 10, provider: 'Shaw Direct', scrambled: ['Sportsnet HD', 'CTV HD'] },
      { freq: 12063, pol: 'V', sr: 22000, fec: '3/4', system: S2, mod: '8PSK', country: 'ca', count: 8, provider: 'CBC / Radio-Canada' },
      { freq: 11745, pol: 'V', sr: 20000, fec: '3/4', system: S1, mod: 'QPSK', country: 'us', count: 6, provider: 'US Ethnic Mux' },
    ],
  },
  {
    id: 'abs75', name: 'ABS-2 / ABS-2A', lon: 75.0, operator: 'ABS',
    beams: [{ name: 'Russia / Central Asia beam', lat: 50, lon: 70, radiusKm: 2600, eirp: 49 }, { name: 'India beam', lat: 21, lon: 78, radiusKm: 1800, eirp: 51 }],
    transponders: [
      { freq: 11473, pol: 'V', sr: 22500, fec: '3/4', system: S2, mod: '8PSK', country: 'ru', count: 8, provider: 'MTS TV', scrambled: ['Match! Arena', 'Kinohit'] },
      { freq: 11605, pol: 'V', sr: 45000, fec: '3/4', system: S2, mod: '8PSK', country: 'ru', count: 8, provider: 'Russian FTA' },
      { freq: 12020, pol: 'H', sr: 27500, fec: '3/4', system: S2, mod: '8PSK', country: 'in', count: 8, provider: 'Indian Mux' },
      { freq: 12153, pol: 'V', sr: 30000, fec: '3/4', system: S2, mod: '8PSK', country: 'kz', count: 6, provider: 'Kazakh Mux' },
    ],
  },
]

export const satById = (id: string) => SATELLITES.find(s => s.id === id)!

/** Returns the satellite longitude formatted like "19.2°E". */
export const fmtLon = (lon: number) => `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`
