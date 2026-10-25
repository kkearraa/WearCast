// Placeholder data used only to make the UI look alive. Replace with real data later.
export const mockUser = {
  name: 'Kira Pugachova',
  firstName: 'Kira',
  email: 'kira.pugachova@email.com',
  initials: 'KP',
};

export const mockWeather = {
  location: 'Current location',
  temp: 12,
  feelsLike: 9,
  condition: 'Light rain',
  icon: 'rainy',
  high: 14,
  low: 8,
  precipitation: '70%',
  wind: '18 km/h',
  humidity: '82%',
  hourly: [
    { time: 'Now', icon: 'rainy', temp: 12 },
    { time: '2 PM', icon: 'rainy', temp: 13 },
    { time: '4 PM', icon: 'cloudy', temp: 14 },
    { time: '6 PM', icon: 'cloudy', temp: 12 },
    { time: '8 PM', icon: 'moon', temp: 10 },
    { time: '10 PM', icon: 'moon', temp: 9 },
  ],
};

export const mockOutfit = {
  pieces: [
    { id: 'o1', category: 'Outerwear', name: 'Waterproof Coat', note: 'Keeps the rain out' },
    { id: 'o2', category: 'Tops', name: 'Grey Wool Sweater', note: 'Warm base layer' },
    { id: 'o3', category: 'Bottoms', name: 'Dark Denim Jeans', note: 'Hides splashes' },
    { id: 'o4', category: 'Shoes', name: 'Waterproof Boots', note: 'Dry feet all day' },
  ],
  tip:
    'Light rain and a chilly breeze today. Layering a warm sweater under a waterproof parka keeps you comfortable, and boots will handle the puddles.',
};

export const mockItem = {
  id: 'sample',
  name: 'Blue Denim Jacket',
  category: 'Outerwear',
  formality: 'Casual',
  seasons: ['Spring', 'Autumn'],
  status: 'Clean',
  addedOn: 'Today',
};
