import { useEffect, useRef } from 'react';
import { Animated, Easing, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FadeInView from '../../components/FadeInView';
import PressableScale from '../../components/PressableScale';
import { useCart } from '../../context/CartContext';
import { ScreenProps } from '../../navigation/types';
import { colors, formatPrice, radius, tints } from '../../theme';

const FREE_SHIPPING = 199;
const SHIPPING_FEE = 19.9;

export default function Cart({ navigation }: ScreenProps<'Cart'>) {
  const { items, subtotal, changeQuantity, removeFromCart, clearCart } = useCart();
  const progress = useRef(new Animated.Value(0)).current;

  const ratio = Math.min(subtotal / FREE_SHIPPING, 1);
  const shipping = subtotal >= FREE_SHIPPING || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: ratio,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [ratio, progress]);

  function checkout() {
    clearCart();
    navigation.replace('Success');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Meu carrinho</Text>
        <PressableScale
          style={styles.close}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Fechar carrinho"
        >
          <Text style={styles.closeText}>✕</Text>
        </PressableScale>
      </View>

      {items.length === 0 ? (
        <FadeInView style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐕‍🦺</Text>
          <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
          <Text style={styles.emptyText}>Que tal escolher um mimo pro seu melhor amigo?</Text>
          <PressableScale style={styles.emptyButton} onPress={() => navigation.goBack()}>
            <Text style={styles.emptyButtonText}>Explorar a loja</Text>
          </PressableScale>
        </FadeInView>
      ) : (
        <>
          <FadeInView style={styles.shippingCard}>
            <Text style={styles.shippingText}>
              {shipping === 0
                ? '🎉 Você ganhou frete grátis!'
                : `Faltam ${formatPrice(FREE_SHIPPING - subtotal)} para frete grátis`}
            </Text>
            <View style={styles.track}>
              <Animated.View
                style={[
                  styles.fill,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </FadeInView>

          <FlatList
            data={items}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <FadeInView delay={60 + index * 60} style={styles.item}>
                <View style={[styles.itemArt, { backgroundColor: tints[item.category] }]}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemSize}>{item.size}</Text>
                  <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                </View>
                <View style={styles.itemActions}>
                  <PressableScale
                    onPress={() => removeFromCart(item.id)}
                    hitSlop={8}
                    accessibilityLabel={`Remover ${item.name}`}
                  >
                    <Text style={styles.remove}>Remover</Text>
                  </PressableScale>
                  <View style={styles.stepper}>
                    <PressableScale
                      style={styles.step}
                      onPress={() => changeQuantity(item.id, -1)}
                      accessibilityLabel="Diminuir"
                    >
                      <Text style={styles.stepText}>−</Text>
                    </PressableScale>
                    <Text style={styles.qty}>{item.quantity}</Text>
                    <PressableScale
                      style={styles.step}
                      onPress={() => changeQuantity(item.id, 1)}
                      accessibilityLabel="Aumentar"
                    >
                      <Text style={styles.stepText}>+</Text>
                    </PressableScale>
                  </View>
                </View>
              </FadeInView>
            )}
          />

          <FadeInView delay={150} offset={40} style={styles.summary}>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Subtotal</Text>
              <Text style={styles.lineValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Entrega</Text>
              <Text style={[styles.lineValue, shipping === 0 && styles.free]}>
                {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.line}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
            <PressableScale style={styles.checkout} onPress={checkout} accessibilityRole="button">
              <Text style={styles.checkoutText}>Finalizar pedido</Text>
            </PressableScale>
          </FadeInView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 15, fontWeight: '800', color: colors.ink },
  shippingCard: {
    marginHorizontal: 20,
    backgroundColor: colors.leafSoft,
    borderRadius: radius.md,
    padding: 14,
    gap: 10,
  },
  shippingText: { fontSize: 13, fontWeight: '700', color: colors.leaf },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(36,88,75,0.15)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.leaf },
  list: { padding: 20, gap: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 10,
    gap: 12,
  },
  itemArt: {
    width: 74,
    height: 74,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: { fontSize: 36 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: colors.ink },
  itemSize: { fontSize: 12, color: colors.muted, marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: colors.ink, marginTop: 6 },
  itemActions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 74 },
  remove: { fontSize: 12, fontWeight: '700', color: colors.muted },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 3,
  },
  step: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 16, fontWeight: '700', color: colors.ink },
  qty: { minWidth: 26, textAlign: 'center', fontWeight: '800', color: colors.ink },
  summary: {
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    borderRadius: radius.xl,
    padding: 22,
    gap: 10,
  },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  lineLabel: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  lineValue: { fontSize: 14, color: colors.ink, fontWeight: '700' },
  free: { color: colors.leaf },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
  totalLabel: { fontSize: 18, fontWeight: '800', color: colors.ink },
  totalValue: { fontSize: 22, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  checkout: {
    marginTop: 8,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 80, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: colors.ink },
  emptyText: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 14,
  },
  emptyButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
