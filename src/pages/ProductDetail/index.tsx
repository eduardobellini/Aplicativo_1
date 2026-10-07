import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartButton from '../../components/CartButton';
import FadeInView from '../../components/FadeInView';
import PressableScale from '../../components/PressableScale';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ScreenProps } from '../../navigation/types';
import { colors, formatPrice, radius, shadow, tints } from '../../theme';

const perks = [
  { icon: '🚚', label: 'Frete grátis\nacima de R$ 199' },
  { icon: '🔁', label: 'Troca fácil\nem 30 dias' },
  { icon: '🛡️', label: 'Compra\n100% segura' },
];

export default function ProductDetail({ navigation, route }: ScreenProps<'ProductDetail'>) {
  const product = products.find(p => p.id === route.params.productId)!;
  const { addToCart } = useCart();
  const reduced = useReducedMotion();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const entrance = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      friction: 6,
      tension: 50,
      delay: 120,
      useNativeDriver: true,
    }).start();

    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [entrance, float, reduced]);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [added]);

  function handleAdd() {
    addToCart(product, quantity);
    setAdded(true);
    if (reduced) return;
    hop.setValue(0);
    Animated.sequence([
      Animated.timing(hop, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(hop, { toValue: 0, friction: 4, useNativeDriver: true }),
    ]).start();
  }

  const scale = entrance.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const hopY = hop.interpolate({ inputRange: [0, 1], outputRange: [0, -36] });
  const rotate = hop.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-10deg'] });

  return (
    <View style={[styles.container, { backgroundColor: tints[product.category] }]}>
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <PressableScale
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Voltar"
          >
            <Text style={styles.back}>‹</Text>
          </PressableScale>
          <CartButton onPress={() => navigation.navigate('Cart')} />
        </View>
      </SafeAreaView>

      <View style={styles.hero}>
        <View style={styles.halo} />
        <Animated.Text
          style={[
            styles.heroEmoji,
            {
              opacity: entrance,
              transform: [{ scale }, { translateY: floatY }, { translateY: hopY }, { rotate }],
            },
          ]}
        >
          {product.emoji}
        </Animated.Text>
      </View>

      <FadeInView delay={80} offset={80} style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <FadeInView delay={220}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.name}>{product.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>{product.reviews.toLocaleString('pt-BR')} avaliações</Text>
              <View style={styles.sizePill}>
                <Text style={styles.sizeText}>{product.size}</Text>
              </View>
            </View>
          </FadeInView>

          <FadeInView delay={300}>
            <Text style={styles.description}>{product.description}</Text>
          </FadeInView>

          <FadeInView delay={380} style={styles.perks}>
            {perks.map(p => (
              <View key={p.icon} style={styles.perk}>
                <Text style={styles.perkIcon}>{p.icon}</Text>
                <Text style={styles.perkText}>{p.label}</Text>
              </View>
            ))}
          </FadeInView>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <View style={styles.stepper}>
            <PressableScale
              style={styles.stepButton}
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
              accessibilityLabel="Diminuir quantidade"
            >
              <Text style={styles.stepText}>−</Text>
            </PressableScale>
            <Text style={styles.quantity}>{quantity}</Text>
            <PressableScale
              style={styles.stepButton}
              onPress={() => setQuantity(q => q + 1)}
              accessibilityLabel="Aumentar quantidade"
            >
              <Text style={styles.stepText}>+</Text>
            </PressableScale>
          </View>

          <PressableScale
            style={[styles.addButton, added && styles.addButtonDone]}
            onPress={handleAdd}
            accessibilityRole="button"
          >
            {added ? (
              <Text style={styles.addText}>Adicionado ✓</Text>
            ) : (
              <View style={styles.addContent}>
                <Text style={styles.addText}>Adicionar</Text>
                <Text style={styles.addPrice} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  {formatPrice(product.price * quantity)}
                </Text>
              </View>
            )}
          </PressableScale>
        </SafeAreaView>
      </FadeInView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  back: { fontSize: 32, color: colors.ink, marginTop: -4, marginLeft: -2 },
  hero: { height: 260, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  heroEmoji: { fontSize: 130 },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  sheetContent: { padding: 24, gap: 18 },
  brand: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.8,
    marginTop: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  rating: { fontSize: 15, fontWeight: '800', color: colors.star },
  reviews: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  sizePill: {
    marginLeft: 'auto',
    backgroundColor: colors.bg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sizeText: { fontSize: 12, fontWeight: '700', color: colors.inkSoft },
  description: { fontSize: 15, lineHeight: 23, color: colors.inkSoft },
  perks: { flexDirection: 'row', gap: 10 },
  perk: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 12,
    gap: 6,
  },
  perkIcon: { fontSize: 20 },
  perkText: { fontSize: 11, lineHeight: 15, fontWeight: '700', color: colors.inkSoft },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 5,
  },
  stepButton: {
    width: 38,
    height: 46,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 22, fontWeight: '600', color: colors.ink },
  quantity: {
    minWidth: 30,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  addButton: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  addButtonDone: { backgroundColor: colors.leaf },
  addContent: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  addText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  addPrice: { flexShrink: 1, color: '#fff', fontSize: 16, fontWeight: '800' },
});
