// Talks to the OpenWeatherMap API directly from the phone (no backend).
// Two free endpoints: current weather + 5-day forecast in 3-hour steps.
const BASE = 'https://api.openweathermap.org/data/2.5';

export class WeatherError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (e) {
    throw new WeatherError('OFFLINE'); // no connection, DNS failure or timeout
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401) throw new WeatherError('BAD_KEY');
  if (response.status === 429) throw new WeatherError('RATE_LIMIT');
  if (!response.ok) throw new WeatherError('SERVER');

  try {
    return await response.json();
  } catch (e) {
    throw new WeatherError('SERVER');
  }
}

// OpenWeatherMap condition id -> Ionicons name (the "d"/"n" in the icon code = day/night)
function iconFor(id, code) {
  const night = typeof code === 'string' && code.endsWith('n');
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'cloud';
  if (id === 800) return night ? 'moon' : 'sunny';
  if (id === 801 || id === 802) return night ? 'cloudy-night' : 'partly-sunny';
  return 'cloudy';
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

// Turns the two raw API answers into one small, tidy object that the screens
// (and later the AI) can use. Temperatures are °C, wind is km/h.
function normalize(current, forecast) {
  const w = current.weather?.[0] || {};
  const list = forecast.list || [];

  const temps = [current.main.temp, ...list.slice(0, 8).map((i) => i.main.temp)];
  const chances = list.slice(0, 3).map((i) => i.pop || 0);

  return {
    city: current.name || '',
    country: current.sys?.country || '',
    fetchedAt: Date.now(),
    current: {
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      high: Math.max(...temps),
      low: Math.min(...temps),
      humidity: current.main.humidity,
      windKmh: (current.wind?.speed || 0) * 3.6, // API gives m/s
      condition: w.main || '',
      description: capitalize(w.description || w.main || ''),
      icon: iconFor(w.id, w.icon),
      precipChance: Math.round(Math.max(0, ...chances) * 100),
      rainMm: current.rain?.['1h'] || 0,
    },
    hourly: list.slice(0, 5).map((i) => ({
      time: i.dt * 1000,
      temp: i.main.temp,
      icon: iconFor(i.weather?.[0]?.id, i.weather?.[0]?.icon),
      chance: Math.round((i.pop || 0) * 100),
    })),
  };
}

export async function fetchWeather(lat, lon, apiKey) {
  const query = `lat=${lat}&lon=${lon}&units=metric&appid=${encodeURIComponent(apiKey)}`;
  const [current, forecast] = await Promise.all([
    fetchJson(`${BASE}/weather?${query}`),
    fetchJson(`${BASE}/forecast?${query}&cnt=9`),
  ]);
  return normalize(current, forecast);
}
