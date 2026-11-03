import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getSettings, setSetting } from '../db/settings';
import { saveWeatherCache, loadWeatherCache } from '../db/weatherCache';
import { getWeatherApiKey } from '../utils/secrets';
import { getCoordinates } from '../services/location';
import { fetchWeather } from '../services/weather';

const STALE_MS = 10 * 60 * 1000; // weather younger than 10 minutes isn't re-downloaded
const RETRY_MS = 60 * 1000; // after a failure, try again after 1 minute

// Shares the weather with every screen, so Home and Outfit use the same data.
const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const [weather, setWeather] = useState(null);
  const [source, setSource] = useState(null); // 'live' | 'cache'
  const [error, setError] = useState(null); // error code, see utils/weatherMessages.js
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState('metric');

  const busy = useRef(false);
  const lastLoad = useRef(0);
  const started = useRef(false);

  // remember the chosen units
  useEffect(() => {
    getSettings()
      .then((s) => setUnits(s.units))
      .catch(() => {});
  }, []);

  const refresh = useCallback(async (force = false) => {
    if (busy.current) return;
    if (!force && lastLoad.current && Date.now() - lastLoad.current < STALE_MS) return;

    started.current = true;
    busy.current = true;
    setLoading(true);
    let succeeded = false;

    try {
      const settings = await getSettings();
      setUnits(settings.units);

      // On any problem: show the last saved weather (if we have it) plus the reason.
      const fallback = async (code) => {
        const cached = settings.cacheWeather ? await loadWeatherCache() : null;
        setWeather(cached);
        setSource(cached ? 'cache' : null);
        setError(code);
      };

      if (!settings.useGps) return await fallback('GPS_OFF');

      const apiKey = await getWeatherApiKey();
      if (!apiKey) return await fallback('NO_KEY');

      let coords;
      try {
        coords = await getCoordinates();
      } catch (e) {
        return await fallback(e.code || 'LOCATION_FAILED');
      }

      try {
        const data = await fetchWeather(coords.lat, coords.lon, apiKey);
        if (settings.cacheWeather) await saveWeatherCache(data);
        setWeather(data);
        setSource('live');
        setError(null);
        succeeded = true;
      } catch (e) {
        return await fallback(e.code || 'SERVER');
      }
    } catch (e) {
      console.warn('Weather refresh failed', e);
      setError('SERVER');
    } finally {
      lastLoad.current = succeeded ? Date.now() : Date.now() - STALE_MS + RETRY_MS;
      busy.current = false;
      setLoading(false);
    }
  }, []);

  // When the app comes back to the foreground, refresh if the data is old.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && started.current) refresh(false);
    });
    return () => sub.remove();
  }, [refresh]);

  const changeUnits = async (next) => {
    setUnits(next);
    await setSetting('units', next);
  };

  return (
    <WeatherContext.Provider value={{ weather, source, error, loading, units, refresh, changeUnits }}>
      {children}
    </WeatherContext.Provider>
  );
}

export const useWeather = () => useContext(WeatherContext);
