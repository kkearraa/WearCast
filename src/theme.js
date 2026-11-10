// Central design tokens so every screen looks consistent.
export const lightColors = {
  bg: '#F5F6FA',
  card: '#FFFFFF',
  ink: '#14172B',
  muted: '#6B7280',
  faint: '#A3A8B8',
  line: '#E8EAF2',

  primary: '#4F5BFF',
  primaryDark: '#3A44D6',
  primarySoft: '#ECEEFF',

  navy: '#171C3B',
  navySoft: 'rgba(255,255,255,0.12)',
  sun: '#FFB547',

  success: '#1F9D63',
  successSoft: '#E5F6EE',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
  warnSoft: '#FFF4E5',
  warnText: '#B54708',
};


export const darkColors = {
  // Dark mode: soft bluish-grey (not pure black)
  bg: '#171C2B',
  card: '#222A3D',
  ink: '#E9EDF7',
  muted: '#A0A9BE',
  faint: '#6F7A93',
  line: '#313B55',

  primary: '#7E88FF',
  primaryDark: '#A6AEFF',
  primarySoft: '#2C3560',

  navy: '#0F1423',
  navySoft: 'rgba(255,255,255,0.12)',
  sun: '#FFB547',

  success: '#3DC98A',
  successSoft: '#163A2D',
  danger: '#FF6B70',
  dangerSoft: '#40242A',
  warnSoft: '#43321F',
  warnText: '#FFB86B',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const lightShadow = {
  card: {
    shadowColor: '#1B2150',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  button: {
    shadowColor: '#4F5BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
};

export const darkShadow = {
  card: { ...lightShadow.card, shadowColor: '#000', shadowOpacity: 0.25 },
  button: { ...lightShadow.button, shadowColor: '#000', shadowOpacity: 0.35 },
};

export const categories = [
  { key: 'Tops', emoji: '👕', tint: '#E8EEFF', darkTint: '#2B3558' },
  { key: 'Bottoms', emoji: '👖', tint: '#E7F4FF', darkTint: '#243B52' },
  { key: 'Shoes', emoji: '👟', tint: '#FFF1E3', darkTint: '#4A3524' },
  { key: 'Outerwear', emoji: '🧥', tint: '#EDE9FF', darkTint: '#392F5E' },
];

export const formalities = ['Casual', 'Formal', 'Gym'];
export const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];

export const getCategoryMeta = (name, dark = false) => {
  const found = categories.find((c) => c.key === name) || {
    key: name,
    emoji: '🧺',
    tint: '#F0F1F6',
    darkTint: '#2C3448',
  };
  return { ...found, tint: dark ? found.darkTint : found.tint };
};
