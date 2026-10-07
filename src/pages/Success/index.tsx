import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FadeInView from '../../components/FadeInView';
import PressableScale from '../../components/PressableScale';
import { ScreenProps } from '../../navigation/types';
import { colors, radius } from '../../theme';

const confetti = [
  { emoji: '🐾', top: 0, left: 10 },
  { emoji: '🦴', top: 30, left: 230 },
  { emoji: '🎾', top: 190, left: 0 },
  { emoji: '🐟', top: 200, left: 240 },
  { emoji: '💛', top: 100, left: 270 },
];

export default function Success({ navigation }: ScreenProps<'Success'>) {
  const pop = useRef(new Animated.Value(0)).current;
  const order = useMemo(() => Math.floor(100000 + Math.random() * 900000), []);

  useEffect(() => {
    Animated.spring(pop, {
      toValue: 1,
      friction: 5,
      tension: 70,
      delay: 150,
      useNativeDriver: true,
    }).start();
  }, [pop]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stage}>
        {confetti.map((c, i) => (
          <FadeInView
            key={c.emoji}
            delay={350 + i * 90}
            offset={24}
            style={[styles.confetti, { top: c.top, left: c.left }]}
          >
            <Text style={styles.confettiText}>{c.emoji}</Text>
          </FadeInView>
        ))}
        <Animated.View
          style={[
            styles.circle,
            {
              opacity: pop,
              transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
            },
          ]}
        >
          <Text style={styles.check}>✓</Text>
        </Animated.View>
      </View>

      <FadeInView delay={300} style={styles.texts}>
        <Text style={styles.title}>Pedido confirmado!</Text>
        <Text style={styles.subtitle}>
          Seu pet já pode ir abanando o rabo. Chega em até 2 dias úteis.
        </Text>
        <View style={styles.orderPill}>
          <Text style={styles.orderText}>Pedido #{order}</Text>
        </View>
      </FadeInView>

      <FadeInView delay={450} style={styles.footer}>
        <PressableScale
          style={styles.button}
          onPress={() => navigation.popToTop()}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Voltar à loja</Text>
        </PressableScale>
      </FadeInView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  stage: {
    width: 300,
    height: 240,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: { position: 'absolute' },
  confettiText: { fontSize: 32 },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.leaf,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 10,
    borderColor: colors.leafSoft,
  },
  check: { color: '#fff', fontSize: 62, fontWeight: '800', marginTop: -4 },
  texts: { alignItems: 'center', paddingHorizontal: 36, marginTop: 24 },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },
  orderPill: {
    marginTop: 18,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  orderText: { fontWeight: '800', color: colors.inkSoft, fontSize: 13 },
  footer: { paddingHorizontal: 24, marginTop: 40 },
  button: {
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
