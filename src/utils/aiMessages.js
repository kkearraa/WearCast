// Friendly text for every way the AI step can fail.
// action: 'settings' | 'closet' | 'weather' | 'retry'
const PROBLEMS = {
  NO_KEY: {
    icon: 'key-outline',
    title: 'AI key needed',
    text: 'Add your free AI API key in Settings > AI stylist, then try again.',
    action: 'settings',
    button: 'Open Settings',
  },
  BAD_KEY: {
    icon: 'key-outline',
    title: 'AI key not accepted',
    text: 'The AI service rejected your key. Check that it was copied correctly and that the right provider is selected.',
    action: 'settings',
    button: 'Check key',
  },
  NO_WEATHER: {
    icon: 'partly-sunny-outline',
    title: 'Weather not loaded yet',
    text: 'The outfit is based on the weather. Load the weather first, then try again.',
    action: 'weather',
    button: 'Load weather',
  },
  NO_CLOTHES: {
    icon: 'shirt-outline',
    title: 'No clean clothes',
    text: 'You have no clean items in your closet. Add some clothes, or move items out of the laundry.',
    action: 'closet',
    button: 'Open closet',
  },
  OFFLINE: {
    icon: 'cloud-offline-outline',
    title: "You're offline",
    text: "We couldn't reach the AI service. Check your internet connection. Your closet still works.",
    action: 'retry',
    button: 'Try again',
  },
  TIMEOUT: {
    icon: 'hourglass-outline',
    title: 'The AI took too long',
    text: 'The request was sent but no answer arrived in 30 seconds. Try again; if it keeps happening, the network may be slow or blocking the AI service.',
    action: 'retry',
    button: 'Try again',
  },
  RATE_LIMIT: {
    icon: 'time-outline',
    title: 'Too many requests',
    text: 'The free AI limit was reached for now. Wait a minute and try again (the daily limit resets later).',
    action: 'retry',
    button: 'Try again',
  },
  BAD_RESPONSE: {
    icon: 'help-circle-outline',
    title: 'The AI answer was unclear',
    text: "The assistant didn't return a usable outfit. Try again.",
    action: 'retry',
    button: 'Try again',
  },
  SERVER: {
    icon: 'alert-circle-outline',
    title: 'AI unavailable',
    text: 'The AI service had a problem. Please try again in a moment.',
    action: 'retry',
    button: 'Try again',
  },
};

export const getAiProblem = (code) => PROBLEMS[code] || PROBLEMS.SERVER;
