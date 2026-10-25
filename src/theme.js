export const colors = {
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
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const shadow = {
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

export const categories = [
  { key: 'Tops', emoji: '👕', tint: '#E8EEFF' },
  { key: 'Bottoms', emoji: '👖', tint: '#E7F4FF' },
  { key: 'Shoes', emoji: '👟', tint: '#FFF1E3' },
  { key: 'Outerwear', emoji: '🧥', tint: '#EDE9FF' },
];

export const formalities = ['Casual', 'Formal', 'Gym'];
export const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];

export const getCategoryMeta = (name) =>
  categories.find((c) => c.key === name) || { key: name, emoji: '🧺', tint: '#F0F1F6' };
