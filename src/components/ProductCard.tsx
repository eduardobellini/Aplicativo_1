import { Image, StyleSheet, Text, View } from 'react-native';
import { productImages } from '../Assets';
import { Product } from '../types';
import { colors, formatPrice, radius, shadow, tints } from '../theme';
import PressableScale from './PressableScale';

type Props = {
  product: Product;
  onPress: () => void;
  onAdd: () => void;
};

export default function ProductCard({ product, onPress, onAdd }: Props) {
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <PressableScale onPress={onPress} style={styles.card} accessibilityRole="button">
      <View style={[styles.art, { backgroundColor: tints[product.category] }]}>
        <Image source={productImages[product.id]} style={styles.image} accessibilityIgnoresInvertColors />
        {discount > 0 && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>-{discount}%</Text>
          </View>
        )}
      </View>

      <Text style={styles.brand}>{product.brand}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>

      <View style={styles.footer}>
        <View>
          {product.oldPrice && (
            <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>
          )}
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
        </View>
        <PressableScale
          onPress={onAdd}
          scaleTo={0.85}
          style={styles.add}
          hitSlop={8}
          accessibilityLabel={`Adicionar ${product.name} ao carrinho`}
        >
          <Text style={styles.addText}>+</Text>
        </PressableScale>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 10,
    ...shadow,
  },
  art: {
    height: 130,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  tag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  brand: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 3,
    minHeight: 38,
    paddingHorizontal: 4,
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  oldPrice: {
    fontSize: 11,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  price: { fontSize: 16, fontWeight: '800', color: colors.ink, letterSpacing: -0.3 },
  add: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#fff', fontSize: 22, fontWeight: '600', marginTop: -2 },
});
