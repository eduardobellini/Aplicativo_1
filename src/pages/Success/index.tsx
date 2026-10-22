import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FadeInView from '../../components/FadeInView';
import PressableScale from '../../components/PressableScale';
import { ScreenProps } from '../../navigation/types';
import { boletoLine, pixCode } from '../../services/orders';
import { colors, formatPrice, radius } from '../../theme';
import { Order } from '../../types';
import { deliveryOptions, installmentValue } from '../../utils/pricing';

const confetti = [
  { emoji: '🐾', top: 0, left: 10 },
  { emoji: '🦴', top: 30, left: 230 },
  { emoji: '🎾', top: 190, left: 0 },
  { emoji: '🐟', top: 200, left: 240 },
  { emoji: '💛', top: 100, left: 270 },
];

const headlines: Record<Order['payment']['method'], { title: string; subtitle: string }> = {
  card: {
    title: 'Pedido confirmado!',
    subtitle: 'Pagamento aprovado. Seu pet já pode ir abanando o rabo.',
  },
  pix: {
    title: 'Falta só o Pix!',
    subtitle: 'Copie o código abaixo e pague no app do seu banco em até 30 minutos.',
  },
  boleto: {
    title: 'Boleto gerado!',
    subtitle: 'Pague até o vencimento. Assim que compensar, separamos seu pedido.',
  },
};

function paymentSummary(order: Order) {
  const { payment, totals } = order;
  if (payment.method === 'pix') return 'Pix';
  if (payment.method === 'boleto') return 'Boleto bancário';
  const card = [payment.cardBrand ?? 'Cartão', `•••• ${payment.cardLast4}`].join(' ');
  const parcels = payment.installments ?? 1;
  return parcels > 1
    ? `${card} · ${parcels}x de ${formatPrice(installmentValue(totals.total, parcels))}`
    : `${card} · à vista`;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function Success({ navigation, route }: ScreenProps<'Success'>) {
  const { order } = route.params;
  const pop = useRef(new Animated.Value(0)).current;
  const headline = headlines[order.payment.method];
  const { address } = order;
  const code =
    order.payment.method === 'pix'
      ? pixCode(order)
      : order.payment.method === 'boleto'
        ? boletoLine(order)
        : null;

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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
                transform: [
                  { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
                ],
              },
            ]}
          >
            <Text style={styles.check}>✓</Text>
          </Animated.View>
        </View>

        <FadeInView delay={300} style={styles.texts}>
          <Text style={styles.title}>{headline.title}</Text>
          <Text style={styles.subtitle}>{headline.subtitle}</Text>
          <View style={styles.orderPill}>
            <Text style={styles.orderText}>Pedido #{order.id}</Text>
          </View>
        </FadeInView>

        {!!code && (
          <FadeInView delay={380} style={styles.codeCard}>
            <Text style={styles.codeLabel}>
              {order.payment.method === 'pix' ? 'Pix copia e cola' : 'Linha digitável'}
            </Text>
            <Text style={styles.code} selectable>
              {code}
            </Text>
            <Text style={styles.codeHint}>Toque e segure o código para copiar.</Text>
          </FadeInView>
        )}

        <FadeInView delay={420} style={styles.details}>
          <Detail label="Total" value={formatPrice(order.totals.total)} />
          <Detail label="Pagamento" value={paymentSummary(order)} />
          <Detail
            label="Entrega"
            value={`${deliveryOptions[order.delivery].label} · ${deliveryOptions[order.delivery].eta.toLowerCase()}`}
          />
          <Detail
            label="Endereço"
            value={`${address.street}, ${address.number}${address.complement ? ` – ${address.complement}` : ''}\n${address.district} · ${address.city}/${address.state}`}
          />
        </FadeInView>

        <FadeInView delay={480} style={styles.footer}>
          <PressableScale
            style={styles.button}
            onPress={() => navigation.popToTop()}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Voltar à loja</Text>
          </PressableScale>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24 },
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
  codeCard: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: colors.leafSoft,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
  },
  codeLabel: { fontSize: 13, fontWeight: '800', color: colors.leaf },
  code: { fontSize: 13, color: colors.ink, fontFamily: 'monospace', lineHeight: 19 },
  codeHint: { fontSize: 12, color: colors.leaf, fontWeight: '600' },
  details: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    gap: 12,
  },
  detail: { gap: 2 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: colors.muted },
  detailValue: { fontSize: 14, fontWeight: '700', color: colors.ink, lineHeight: 20 },
  footer: { paddingHorizontal: 24, marginTop: 28 },
  button: {
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
