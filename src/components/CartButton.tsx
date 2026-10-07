import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useCart } from '../context/CartContext';
import { colors, shadow } from '../theme';
import PressableScale from './PressableScale';

export default function CartButton({ onPress }: { onPress: () => void }) {
  const { count } = useCart();
  const bump = useRef(new Animated.Value(1)).current;
  const previous = useRef(count);

  useEffect(() => {
    if (count > previous.current) {
      bump.setValue(1.45);
      Animated.spring(bump, {
        toValue: 1,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }).start();
    }
    previous.current = count;
  }, [count, bump]);

  return (
    <PressableScale
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={`Carrinho, ${count} itens`}
    >
      <Text style={styles.icon}>🛍️</Text>
      {count > 0 && (
        <Animated.View style={[styles.badge, { transform: [{ scale: bump }] }]}>
          <Text style={styles.badgeText}>{count}</Text>
        </Animated.View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  icon: { fontSize: 22 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
