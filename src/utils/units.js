import { colors } from '../theme';

// Weather is always stored in metric (°C, km/h). These helpers convert for display,
// so switching units in Settings changes the screen instantly without a new request.
export const tempValue = (celsius, units) =>
  Math.round(units === 'imperial' ? (celsius * 9) / 5 + 32 : celsius);

export const windText = (kmh, units) =>
  units === 'imperial' ? `${Math.round(kmh * 0.621371)} mph` : `${Math.round(kmh)} km/h`;

// Icon color: sunny icons are yellow, everything else is a cool blue.
export const iconColor = (name, onLight = false) => {
  const sunny = name === 'sunny' || name === 'partly-sunny';
  if (onLight) return sunny ? '#F59E0B' : colors.primary;
  return sunny ? colors.sun : '#BFD0FF';
};

export const hourLabel = (ms) => new Date(ms).toLocaleTimeString([], { hour: 'numeric' });

export const timeAgo = (ms) => {
  const minutes = Math.round((Date.now() - ms) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
};
