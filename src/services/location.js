import * as Location from 'expo-location';

export class LocationError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms)),
  ]);

// Asks permission (the first time) and returns the phone's coordinates.
export async function getCoordinates() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) throw new LocationError('NO_PERMISSION');

  try {
    // A recent position is instant and good enough for weather
    const last = await Location.getLastKnownPositionAsync({
      maxAge: 10 * 60 * 1000,
      requiredAccuracy: 5000,
    });
    if (last) return { lat: last.coords.latitude, lon: last.coords.longitude };

    const current = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      15000
    );
    return { lat: current.coords.latitude, lon: current.coords.longitude };
  } catch (e) {
    throw new LocationError('LOCATION_FAILED');
  }
}
