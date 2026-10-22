import { ImageSourcePropType } from 'react-native';
import { Category } from '../types';

export const logo = require('./logo.png');

export const illustrations = {
  heroLogin: require('./illustrations/hero-login.jpg'),
  banner: require('./illustrations/banner-cao.jpg'),
  emptyCart: require('./illustrations/vazio-carrinho.jpg'),
  emptySearch: require('./illustrations/vazio-busca.jpg'),
};

export const categoryImages: Record<Category | 'all', ImageSourcePropType> = {
  all: require('./categories/cat-todos.png'),
  dog: require('./categories/cat-caes.png'),
  cat: require('./categories/cat-gatos.png'),
  bird: require('./categories/cat-aves.png'),
  fish: require('./categories/cat-peixes.png'),
};

// Keyed by product id rather than stored on the product: carts and orders are persisted,
// and a bundled asset reference is not stable across builds.
export const productImages: Record<string, ImageSourcePropType> = {
  '1': require('./products/racao-premium-adulto.jpg'),
  '2': require('./products/arranhador-torre.jpg'),
  '3': require('./products/bolinha-mordedor.jpg'),
  '4': require('./products/sache-salmao.jpg'),
  '5': require('./products/cama-nuvem.jpg'),
  '6': require('./products/mix-sementes.jpg'),
  '7': require('./products/aquario-compacto.jpg'),
  '8': require('./products/varinha-penas.jpg'),
  '9': require('./products/poleiro-natural.jpg'),
  '10': require('./products/racao-tropical.jpg'),
};
