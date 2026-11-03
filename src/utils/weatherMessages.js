import { timeAgo } from './units';

// Friendly text for every way the weather can fail.
// action: 'settings' (open Settings) | 'phone' (open phone settings) | 'retry'
const PROBLEMS = {
  NO_KEY: {
    icon: 'key-outline',
    title: 'Weather key needed',
    text: 'Add your free OpenWeatherMap API key in Settings to see live weather.',
    action: 'settings',
    button: 'Open Settings',
  },
  BAD_KEY: {
    icon: 'key-outline',
    title: 'Weather key not accepted',
    text:
      'OpenWeatherMap rejected the key. Check that it was copied correctly. A brand-new key can take up to 2 hours to activate.',
    action: 'settings',
    button: 'Check key',
  },
  NO_PERMISSION: {
    icon: 'location-outline',
    title: 'Location access is off',
    text: 'Allow location for WearCast in your phone settings so we can find your local weather.',
    action: 'phone',
    button: 'Open phone settings',
  },
  GPS_OFF: {
    icon: 'navigate-outline',
    title: 'GPS is turned off',
    text: 'Turn on "Use my GPS location" in Settings to get your local weather.',
    action: 'settings',
    button: 'Open Settings',
  },
  LOCATION_FAILED: {
    icon: 'locate-outline',
    title: "Can't find your location",
    text: 'Make sure location services are turned on, then try again.',
    action: 'retry',
    button: 'Try again',
  },
  OFFLINE: {
    icon: 'cloud-offline-outline',
    title: "You're offline",
    text: "We couldn't reach the weather service. Check your internet connection.",
    action: 'retry',
    button: 'Try again',
  },
  RATE_LIMIT: {
    icon: 'time-outline',
    title: 'Too many requests',
    text: 'The weather service is busy. Please try again in a minute.',
    action: 'retry',
    button: 'Try again',
  },
  SERVER: {
    icon: 'alert-circle-outline',
    title: 'Weather unavailable',
    text: 'Something went wrong while loading the weather. Please try again.',
    action: 'retry',
    button: 'Try again',
  },
};

export const getWeatherProblem = (code) => PROBLEMS[code] || PROBLEMS.SERVER;

// Banner text shown when old (saved) weather is displayed instead of fresh data
export const cacheBannerText = (code, fetchedAt) =>
  code === 'OFFLINE'
    ? `You're offline. Showing the weather saved ${timeAgo(fetchedAt)}.`
    : `Couldn't update the weather. Showing the weather saved ${timeAgo(fetchedAt)}.`;
