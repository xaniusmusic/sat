export interface City { name: string; lat: number; lon: number }
export interface Country { code: string; name: string; cities: City[] }

export const COUNTRIES: Country[] = [
  { code: 'de', name: 'Germany', cities: [
    { name: 'Berlin', lat: 52.52, lon: 13.405 }, { name: 'Munich', lat: 48.137, lon: 11.575 }, { name: 'Hamburg', lat: 53.551, lon: 9.994 }, { name: 'Cologne', lat: 50.938, lon: 6.96 } ] },
  { code: 'gb', name: 'United Kingdom', cities: [
    { name: 'London', lat: 51.507, lon: -0.128 }, { name: 'Manchester', lat: 53.483, lon: -2.244 }, { name: 'Edinburgh', lat: 55.953, lon: -3.188 }, { name: 'Belfast', lat: 54.597, lon: -5.93 } ] },
  { code: 'fr', name: 'France', cities: [
    { name: 'Paris', lat: 48.857, lon: 2.352 }, { name: 'Marseille', lat: 43.296, lon: 5.37 }, { name: 'Lyon', lat: 45.764, lon: 4.836 } ] },
  { code: 'it', name: 'Italy', cities: [
    { name: 'Rome', lat: 41.903, lon: 12.496 }, { name: 'Milan', lat: 45.464, lon: 9.19 }, { name: 'Naples', lat: 40.852, lon: 14.268 } ] },
  { code: 'es', name: 'Spain', cities: [
    { name: 'Madrid', lat: 40.417, lon: -3.703 }, { name: 'Barcelona', lat: 41.385, lon: 2.173 }, { name: 'Seville', lat: 37.389, lon: -5.984 } ] },
  { code: 'pt', name: 'Portugal', cities: [
    { name: 'Lisbon', lat: 38.722, lon: -9.139 }, { name: 'Porto', lat: 41.158, lon: -8.629 } ] },
  { code: 'pl', name: 'Poland', cities: [
    { name: 'Warsaw', lat: 52.23, lon: 21.012 }, { name: 'Kraków', lat: 50.065, lon: 19.945 }, { name: 'Gdańsk', lat: 54.352, lon: 18.646 } ] },
  { code: 'nl', name: 'Netherlands', cities: [
    { name: 'Amsterdam', lat: 52.37, lon: 4.895 }, { name: 'Rotterdam', lat: 51.924, lon: 4.478 } ] },
  { code: 'se', name: 'Sweden', cities: [
    { name: 'Stockholm', lat: 59.329, lon: 18.069 }, { name: 'Gothenburg', lat: 57.709, lon: 11.975 } ] },
  { code: 'no', name: 'Norway', cities: [
    { name: 'Oslo', lat: 59.913, lon: 10.752 }, { name: 'Bergen', lat: 60.392, lon: 5.324 } ] },
  { code: 'gr', name: 'Greece', cities: [
    { name: 'Athens', lat: 37.984, lon: 23.728 }, { name: 'Thessaloniki', lat: 40.64, lon: 22.944 } ] },
  { code: 'rs', name: 'Serbia', cities: [
    { name: 'Belgrade', lat: 44.787, lon: 20.457 }, { name: 'Novi Sad', lat: 45.267, lon: 19.833 } ] },
  { code: 'tr', name: 'Türkiye', cities: [
    { name: 'Istanbul', lat: 41.008, lon: 28.978 }, { name: 'Ankara', lat: 39.933, lon: 32.859 }, { name: 'Izmir', lat: 38.423, lon: 27.143 } ] },
  { code: 'ru', name: 'Russia', cities: [
    { name: 'Moscow', lat: 55.756, lon: 37.617 }, { name: 'Saint Petersburg', lat: 59.934, lon: 30.335 } ] },
  { code: 'eg', name: 'Egypt', cities: [
    { name: 'Cairo', lat: 30.044, lon: 31.236 }, { name: 'Alexandria', lat: 31.2, lon: 29.919 } ] },
  { code: 'sa', name: 'Saudi Arabia', cities: [
    { name: 'Riyadh', lat: 24.714, lon: 46.675 }, { name: 'Jeddah', lat: 21.543, lon: 39.173 } ] },
  { code: 'ae', name: 'United Arab Emirates', cities: [
    { name: 'Dubai', lat: 25.205, lon: 55.271 }, { name: 'Abu Dhabi', lat: 24.454, lon: 54.377 } ] },
  { code: 'ma', name: 'Morocco', cities: [
    { name: 'Casablanca', lat: 33.573, lon: -7.59 }, { name: 'Rabat', lat: 34.021, lon: -6.841 } ] },
  { code: 'ng', name: 'Nigeria', cities: [
    { name: 'Lagos', lat: 6.524, lon: 3.379 }, { name: 'Abuja', lat: 9.058, lon: 7.49 } ] },
  { code: 'za', name: 'South Africa', cities: [
    { name: 'Johannesburg', lat: -26.204, lon: 28.047 }, { name: 'Cape Town', lat: -33.925, lon: 18.424 } ] },
  { code: 'in', name: 'India', cities: [
    { name: 'Mumbai', lat: 19.076, lon: 72.878 }, { name: 'New Delhi', lat: 28.614, lon: 77.209 }, { name: 'Chennai', lat: 13.083, lon: 80.27 } ] },
  { code: 'pk', name: 'Pakistan', cities: [
    { name: 'Karachi', lat: 24.861, lon: 67.01 }, { name: 'Lahore', lat: 31.52, lon: 74.359 } ] },
  { code: 'my', name: 'Malaysia', cities: [
    { name: 'Kuala Lumpur', lat: 3.139, lon: 101.687 } ] },
  { code: 'id', name: 'Indonesia', cities: [
    { name: 'Jakarta', lat: -6.208, lon: 106.846 }, { name: 'Surabaya', lat: -7.258, lon: 112.752 } ] },
  { code: 'au', name: 'Australia', cities: [
    { name: 'Sydney', lat: -33.869, lon: 151.209 }, { name: 'Melbourne', lat: -37.814, lon: 144.963 }, { name: 'Perth', lat: -31.95, lon: 115.86 } ] },
  { code: 'us', name: 'United States', cities: [
    { name: 'New York', lat: 40.713, lon: -74.006 }, { name: 'Chicago', lat: 41.878, lon: -87.63 }, { name: 'Los Angeles', lat: 34.052, lon: -118.244 }, { name: 'Miami', lat: 25.762, lon: -80.192 } ] },
  { code: 'ca', name: 'Canada', cities: [
    { name: 'Toronto', lat: 43.653, lon: -79.383 }, { name: 'Vancouver', lat: 49.283, lon: -123.121 } ] },
  { code: 'mx', name: 'Mexico', cities: [
    { name: 'Mexico City', lat: 19.433, lon: -99.133 }, { name: 'Guadalajara', lat: 20.66, lon: -103.35 } ] },
  { code: 'br', name: 'Brazil', cities: [
    { name: 'São Paulo', lat: -23.551, lon: -46.633 }, { name: 'Rio de Janeiro', lat: -22.907, lon: -43.173 }, { name: 'Brasília', lat: -15.794, lon: -47.883 } ] },
  { code: 'ar', name: 'Argentina', cities: [
    { name: 'Buenos Aires', lat: -34.604, lon: -58.382 }, { name: 'Córdoba', lat: -31.42, lon: -64.188 } ] },
]
