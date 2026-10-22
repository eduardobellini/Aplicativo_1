import { Platform } from 'react-native';

export const colors = {
  bg: '#FBF6EE',
  surface: '#FFFFFF',
  ink: '#1E1B18',
  inkSoft: '#4A433D',
  muted: '#8F857B',
  line: '#EFE6DA',
  primary: '#FF6B3D',
  primaryDark: '#E4532A',
  leaf: '#24584B',
  leafSoft: '#DCEBE4',
  star: '#FFB547',
};

export const tints = {
  dog: '#FFE1CF',
  cat: '#E3E7FF',
  bird: '#FFF0BF',
  fish: '#D4F1EA',
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
};

export const shadow = Platform.select({
  ios: {
    shadowColor: '#5A3A1E',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  default: { elevation: 3 },
});

export function formatPrice(value: number) {
  const [int, cents] = value.toFixed(2).split('.');
  return `R$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${cents}`;
}
