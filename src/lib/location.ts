// Deno: https://deno.com/deploy/docs
// Docs: https://developers.cloudflare.com/workers/examples/geolocation-hello-world/
// Ref: https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties
import { BotRoot, BotConfig } from './bot'
export type IncomingLocation = Partial<{
  city: string // ex. 'Los Angeles'
  colo: string // ex. 'LAX', "The three-letter IATA airport code of the data center that the request hit"
  continent: string
  country: string
  latitude: string
  longitude: string
  postalCode: string // ex90210
  region: string
  timezone: string // ex. 'America/Los_Angeles'
}>

export const defaultLocationData = {
  city: 'error',
  colo: 'error',
  continent: 'error',
  latitude: 'error',
  longitude: 'error',
  country: 'error',
  postalCode: 'error',
  region: 'error',
  state: 'error',
  tod: 'error',
  timezone: 'error',
}

export type TOD = 'morning' | 'afternoon' | 'evening' | 'error' // time of day, ex. 'morning' | 'afternoon' | 'evening' | 'error'
export type Location = {
  city: string // ex. 'Los Angeles'
  colo: string // ex. 'LAX', IATA airport code of colo facility where request came in
  continent: string // ex. 'NA',
  latitude: string
  longitude: string
  country: string // ex. 'US'
  postalCode: string // ex90210
  region: string
  state: string // trick: if US, will be set otherwise 'error'
  timezone: string // ex. 'America/Los_Angeles'
  tod: TOD
}

export const LocationGenerator = (candidate: IncomingLocation): Location => {
  const {
    city = 'error',
    colo = 'error',
    continent = 'error',
    country = 'error',
    latitude = 'error',
    longitude = 'error',
    postalCode = 'error',
    region = 'error',
    timezone = 'error',
  } = candidate
  let tod = 'error'
  try {
    const date = new Date().toLocaleString('en-US', { timeZone: timezone })
    const hour = new Date(date).getHours()
    // 10~3 is evening
    if (20 <= hour || hour <= 3) {
      tod = 'evening'
    }

    if (hour <= 11) {
      tod = 'morning'
    }

    if (12 <= hour && hour <= 16) {
      tod = 'afternoon'
    }

    if (17 <= hour && hour <= 19) {
      tod = 'evening'
    }
  } catch (e) {
    tod = 'error'
  }

  const res: Location = {
    city,
    colo,
    continent,
    country,
    latitude,
    longitude,
    postalCode,
    region,
    state: region,
    tod: tod as TOD,
    timezone,
  }
  return res
}
export class LocationAwareBot extends BotRoot {
  public location = defaultLocationData
  constructor(config: BotConfig, incomingLocationData: IncomingLocation) {
    super(config)
    this.location = LocationGenerator(incomingLocationData)
  }
}

export const locationResolver = (request: Request) => null
