import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FadeInView from '../../components/FadeInView';
import PressableScale from '../../components/PressableScale';
import TextField from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useScrollToFocused } from '../../hooks/useScrollToFocused';
import { ScreenProps } from '../../navigation/types';
import { lookupCep } from '../../services/cep';
import { getOrders, newOrderId, placeOrder } from '../../services/orders';
import { colors, formatPrice, radius, shadow } from '../../theme';
import { Address, DeliveryMethod, Order, Payment, PaymentMethod } from '../../types';
import {
  cardBrand,
  formatCardNumber,
  formatCep,
  formatExpiry,
  isValidCardNumber,
  isValidExpiry,
  onlyDigits,
} from '../../utils/forms';
import {
  calculateTotals,
  deliveryOptions,
  EXPRESS_FEE,
  FREE_SHIPPING,
  installmentOptions,
  installmentValue,
  SHIPPING_FEE,
} from '../../utils/pricing';

type CardForm = { cardNumber: string; cardName: string; cardExpiry: string; cardCvv: string };
type Field = keyof Address | keyof CardForm;
type Errors = Partial<Record<Field | 'form', string>>;

const emptyAddress: Address = {
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
};

const emptyCard: CardForm = { cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' };

function validate(address: Address, method: PaymentMethod, card: CardForm): Errors {
  const errors: Errors = {};
  if (onlyDigits(address.cep).length !== 8) errors.cep = 'CEP inválido.';
  if (!address.street.trim()) errors.street = 'Informe a rua.';
  if (!address.number.trim()) errors.number = 'Informe o número.';
  if (!address.district.trim()) errors.district = 'Informe o bairro.';
  if (!address.city.trim()) errors.city = 'Informe a cidade.';
  if (!/^[A-Za-z]{2}$/.test(address.state.trim())) errors.state = 'UF inválida.';
  if (method === 'card') {
    if (!isValidCardNumber(card.cardNumber)) errors.cardNumber = 'Número de cartão inválido.';
    if (card.cardName.trim().length < 3) errors.cardName = 'Digite o nome impresso no cartão.';
    if (!isValidExpiry(card.cardExpiry)) errors.cardExpiry = 'Validade inválida.';
    if (!/^\d{3,4}$/.test(card.cardCvv)) errors.cardCvv = 'CVV inválido.';
  }
  return errors;
}

type OptionProps = {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
  trailing?: string;
  children?: ReactNode;
};

function Option({ selected, onPress, title, subtitle, trailing, children }: OptionProps) {
  return (
    <View style={[styles.option, selected && styles.optionSelected]}>
      <PressableScale
        style={styles.optionHead}
        onPress={onPress}
        scaleTo={0.98}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={[title, subtitle, trailing].filter(Boolean).join(', ')}
      >
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
        </View>
        {!!trailing && <Text style={styles.optionTrailing}>{trailing}</Text>}
      </PressableScale>
      {selected && children}
    </View>
  );
}

function Line({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={[styles.lineValue, highlight && styles.discount]}>{value}</Text>
    </View>
  );
}

export default function Checkout({ navigation }: ScreenProps<'Checkout'>) {
  const { user } = useAuth();
  const { items, coupon, clearCart } = useCart();
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [delivery, setDelivery] = useState<DeliveryMethod>('standard');
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [card, setCard] = useState<CardForm>(emptyCard);
  const [installments, setInstallments] = useState(1);
  const [firstOrder, setFirstOrder] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const { scrollRef, contentRef, focusHandler } = useScrollToFocused();
  const refs = {
    cep: useRef<TextInput>(null),
    street: useRef<TextInput>(null),
    number: useRef<TextInput>(null),
    complement: useRef<TextInput>(null),
    district: useRef<TextInput>(null),
    city: useRef<TextInput>(null),
    state: useRef<TextInput>(null),
    cardNumber: useRef<TextInput>(null),
    cardName: useRef<TextInput>(null),
    cardExpiry: useRef<TextInput>(null),
    cardCvv: useRef<TextInput>(null),
  };

  useEffect(() => {
    if (!user) return;
    getOrders(user.email)
      .then(orders => {
        setFirstOrder(orders.length === 0);
        if (orders[0]) setAddress(orders[0].address);
      })
      .catch(() => {});
  }, [user]);

  const totals = calculateTotals(items, { coupon, firstOrder, delivery, payment: method });
  const parcelOptions = installmentOptions(totals.total);
  const parcels = Math.min(installments, parcelOptions.length);
  const brand = cardBrand(card.cardNumber);

  function clearError(field: Field) {
    if (errors[field] || errors.form) {
      setErrors(e => ({ ...e, [field]: undefined, form: undefined }));
    }
  }

  const setAddressField = (field: keyof Address) => (text: string) => {
    setAddress(a => ({ ...a, [field]: text }));
    clearError(field);
  };

  const setCardField = (field: keyof CardForm, format?: (v: string) => string) => (text: string) => {
    setCard(c => ({ ...c, [field]: format ? format(text) : text }));
    clearError(field);
  };

  async function handleCep(text: string) {
    const cep = formatCep(text);
    setAddress(a => ({ ...a, cep }));
    clearError('cep');
    const digits = onlyDigits(cep);
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const found = await lookupCep(digits);
      setAddress(a => ({
        ...a,
        street: found.street || a.street,
        district: found.district || a.district,
        city: found.city || a.city,
        state: found.state || a.state,
      }));
      (found.street ? refs.number : refs.street).current?.focus();
    } catch {
      setErrors(e => ({ ...e, cep: 'Não encontramos esse CEP. Preencha o endereço abaixo.' }));
    } finally {
      setCepLoading(false);
    }
  }

  async function handlePay() {
    const found = validate(address, method, card);
    if (Object.keys(found).length) {
      setErrors({ ...found, form: 'Revise os campos destacados.' });
      return;
    }
    if (!user) return;

    const payment: Payment =
      method === 'card'
        ? {
            method,
            installments: parcels,
            cardBrand: brand,
            cardLast4: onlyDigits(card.cardNumber).slice(-4),
          }
        : { method };

    const order: Order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      items,
      address: {
        ...address,
        street: address.street.trim(),
        number: address.number.trim(),
        complement: address.complement.trim(),
        district: address.district.trim(),
        city: address.city.trim(),
        state: address.state.trim().toUpperCase(),
      },
      delivery,
      payment,
      coupon: totals.couponDiscount > 0 ? coupon : null,
      totals,
    };

    setErrors({});
    setSubmitting(true);
    try {
      await placeOrder(user.email, order);
      clearCart();
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'Success', params: { order } }],
      });
    } catch (e) {
      setErrors({ form: (e as Error).message || 'Não foi possível concluir o pagamento.' });
      setSubmitting(false);
    }
  }

  const payLabel =
    method === 'pix' ? 'Pagar com Pix' : method === 'boleto' ? 'Gerar boleto' : 'Pagar com cartão';
  const standardFee = totals.subtotal >= FREE_SHIPPING ? 'Grátis' : formatPrice(SHIPPING_FEE);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <PressableScale
            style={styles.back}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Voltar ao carrinho"
            disabled={submitting}
          >
            <Text style={styles.backText}>‹</Text>
          </PressableScale>
          <Text style={styles.title}>Pagamento</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View ref={contentRef} collapsable={false} style={styles.inner}>
            <FadeInView style={styles.card}>
              <Text style={styles.sectionTitle}>📍 Endereço de entrega</Text>
              <View>
                <TextField
                  ref={refs.cep}
                  onFocus={focusHandler(refs.cep)}
                  label="CEP"
                  placeholder="00000-000"
                  keyboardType="number-pad"
                  autoComplete="postal-code"
                  textContentType="postalCode"
                  maxLength={9}
                  value={address.cep}
                  onChangeText={handleCep}
                  error={errors.cep}
                />
                {cepLoading && (
                  <ActivityIndicator style={styles.cepLoading} color={colors.primary} />
                )}
              </View>
              <TextField
                ref={refs.street}
                onFocus={focusHandler(refs.street)}
                label="Rua"
                placeholder="Avenida, rua, travessa..."
                autoComplete="street-address"
                textContentType="streetAddressLine1"
                returnKeyType="next"
                value={address.street}
                onChangeText={setAddressField('street')}
                onSubmitEditing={() => refs.number.current?.focus()}
                error={errors.street}
              />
              <View style={styles.row}>
                <View style={styles.small}>
                  <TextField
                    ref={refs.number}
                    onFocus={focusHandler(refs.number)}
                    label="Número"
                    placeholder="123"
                    returnKeyType="next"
                    value={address.number}
                    onChangeText={setAddressField('number')}
                    onSubmitEditing={() => refs.complement.current?.focus()}
                    error={errors.number}
                  />
                </View>
                <View style={styles.grow}>
                  <TextField
                    ref={refs.complement}
                    onFocus={focusHandler(refs.complement)}
                    label="Complemento (opcional)"
                    placeholder="Apto, bloco..."
                    returnKeyType="next"
                    value={address.complement}
                    onChangeText={setAddressField('complement')}
                    onSubmitEditing={() => refs.district.current?.focus()}
                  />
                </View>
              </View>
              <TextField
                ref={refs.district}
                onFocus={focusHandler(refs.district)}
                label="Bairro"
                placeholder="Seu bairro"
                returnKeyType="next"
                value={address.district}
                onChangeText={setAddressField('district')}
                onSubmitEditing={() => refs.city.current?.focus()}
                error={errors.district}
              />
              <View style={styles.row}>
                <View style={styles.grow}>
                  <TextField
                    ref={refs.city}
                    onFocus={focusHandler(refs.city)}
                    label="Cidade"
                    placeholder="Sua cidade"
                    textContentType="addressCity"
                    returnKeyType="next"
                    value={address.city}
                    onChangeText={setAddressField('city')}
                    onSubmitEditing={() => refs.state.current?.focus()}
                    error={errors.city}
                  />
                </View>
                <View style={styles.small}>
                  <TextField
                    ref={refs.state}
                    onFocus={focusHandler(refs.state)}
                    label="UF"
                    placeholder="SP"
                    autoCapitalize="characters"
                    textContentType="addressState"
                    maxLength={2}
                    returnKeyType="done"
                    value={address.state}
                    onChangeText={setAddressField('state')}
                    error={errors.state}
                  />
                </View>
              </View>
            </FadeInView>

            <FadeInView delay={80} style={styles.card}>
              <Text style={styles.sectionTitle}>🚚 Entrega</Text>
              <View accessibilityRole="radiogroup" style={styles.options}>
                <Option
                  selected={delivery === 'standard'}
                  onPress={() => setDelivery('standard')}
                  title={deliveryOptions.standard.label}
                  subtitle={deliveryOptions.standard.eta}
                  trailing={standardFee}
                />
                <Option
                  selected={delivery === 'express'}
                  onPress={() => setDelivery('express')}
                  title={deliveryOptions.express.label}
                  subtitle={deliveryOptions.express.eta}
                  trailing={formatPrice(EXPRESS_FEE)}
                />
              </View>
            </FadeInView>

            <FadeInView delay={160} style={styles.card}>
              <Text style={styles.sectionTitle}>💳 Pagamento</Text>
              <View accessibilityRole="radiogroup" style={styles.options}>
                <Option
                  selected={method === 'pix'}
                  onPress={() => setMethod('pix')}
                  title="Pix"
                  subtitle="Aprovação na hora · 5% de desconto"
                />
                <Option
                  selected={method === 'card'}
                  onPress={() => setMethod('card')}
                  title="Cartão de crédito"
                  subtitle={`Em até ${parcelOptions.length}x sem juros`}
                >
                  <View style={styles.cardForm}>
                    <TextField
                      ref={refs.cardNumber}
                      onFocus={focusHandler(refs.cardNumber)}
                      label={brand ? `Número do cartão · ${brand}` : 'Número do cartão'}
                      placeholder="0000 0000 0000 0000"
                      keyboardType="number-pad"
                      autoComplete="cc-number"
                      textContentType="creditCardNumber"
                      maxLength={19}
                      returnKeyType="next"
                      value={card.cardNumber}
                      onChangeText={setCardField('cardNumber', formatCardNumber)}
                      onSubmitEditing={() => refs.cardName.current?.focus()}
                      error={errors.cardNumber}
                    />
                    <TextField
                      ref={refs.cardName}
                      onFocus={focusHandler(refs.cardName)}
                      label="Nome impresso no cartão"
                      placeholder="Como está no cartão"
                      autoCapitalize="characters"
                      autoComplete="name"
                      returnKeyType="next"
                      value={card.cardName}
                      onChangeText={setCardField('cardName')}
                      onSubmitEditing={() => refs.cardExpiry.current?.focus()}
                      error={errors.cardName}
                    />
                    <View style={styles.row}>
                      <View style={styles.grow}>
                        <TextField
                          ref={refs.cardExpiry}
                          onFocus={focusHandler(refs.cardExpiry)}
                          label="Validade"
                          placeholder="MM/AA"
                          keyboardType="number-pad"
                          autoComplete="cc-exp"
                          maxLength={5}
                          value={card.cardExpiry}
                          onChangeText={setCardField('cardExpiry', formatExpiry)}
                          error={errors.cardExpiry}
                        />
                      </View>
                      <View style={styles.grow}>
                        <TextField
                          ref={refs.cardCvv}
                          onFocus={focusHandler(refs.cardCvv)}
                          label="CVV"
                          placeholder="123"
                          keyboardType="number-pad"
                          autoComplete="cc-csc"
                          secureTextEntry
                          maxLength={4}
                          value={card.cardCvv}
                          onChangeText={setCardField('cardCvv', onlyDigits)}
                          error={errors.cardCvv}
                        />
                      </View>
                    </View>
                    <Text style={styles.fieldLabel}>Parcelas</Text>
                    <View style={styles.parcels}>
                      {parcelOptions.map(n => {
                        const active = n === parcels;
                        return (
                          <PressableScale
                            key={n}
                            style={[styles.parcel, active && styles.parcelActive]}
                            onPress={() => setInstallments(n)}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: active }}
                          >
                            <Text style={[styles.parcelText, active && styles.parcelTextActive]}>
                              {n}x {formatPrice(installmentValue(totals.total, n))}
                            </Text>
                          </PressableScale>
                        );
                      })}
                    </View>
                  </View>
                </Option>
                <Option
                  selected={method === 'boleto'}
                  onPress={() => setMethod('boleto')}
                  title="Boleto"
                  subtitle="Vence em 3 dias · compensa em até 2 dias úteis"
                />
              </View>
            </FadeInView>

            <FadeInView delay={240} style={styles.card}>
              <Text style={styles.sectionTitle}>🧾 Resumo</Text>
              {items.map(item => (
                <View key={item.id} style={styles.summaryItem}>
                  <Text style={styles.summaryItemName} numberOfLines={1}>
                    {item.quantity}× {item.name}
                  </Text>
                  <Text style={styles.summaryItemPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
              <View style={styles.divider} />
              <Line label="Subtotal" value={formatPrice(totals.subtotal)} />
              {totals.couponDiscount > 0 && (
                <Line
                  label={`Cupom ${coupon}`}
                  value={`− ${formatPrice(totals.couponDiscount)}`}
                  highlight
                />
              )}
              {totals.firstOrderDiscount > 0 && (
                <Line
                  label="Primeira compra (10%)"
                  value={`− ${formatPrice(totals.firstOrderDiscount)}`}
                  highlight
                />
              )}
              {totals.pixDiscount > 0 && (
                <Line
                  label="Desconto Pix (5%)"
                  value={`− ${formatPrice(totals.pixDiscount)}`}
                  highlight
                />
              )}
              <Line
                label={`Entrega ${deliveryOptions[delivery].label.toLowerCase()}`}
                value={totals.shipping === 0 ? 'Grátis' : formatPrice(totals.shipping)}
                highlight={totals.shipping === 0}
              />
            </FadeInView>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {!!errors.form && <Text style={styles.formError}>{errors.form}</Text>}
          <View style={styles.footerRow}>
            <View style={styles.footerTotal}>
              <Text style={styles.footerLabel}>Total</Text>
              <Text style={styles.footerValue}>{formatPrice(totals.total)}</Text>
              {method === 'card' && parcels > 1 && (
                <Text style={styles.footerHint}>
                  {parcels}x de {formatPrice(installmentValue(totals.total, parcels))}
                </Text>
              )}
            </View>
            <PressableScale
              style={[styles.pay, submitting && styles.payDisabled]}
              onPress={handlePay}
              disabled={submitting || items.length === 0}
              accessibilityRole="button"
              accessibilityState={{ busy: submitting }}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payText}>{payLabel}</Text>
              )}
            </PressableScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  backText: { fontSize: 32, color: colors.ink, marginTop: -4, marginLeft: -2 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  headerSpacer: { width: 48 },
  content: { padding: 20, paddingBottom: 32 },
  inner: { gap: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    gap: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  cepLoading: { position: 'absolute', right: 16, top: 41 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  grow: { flex: 1 },
  small: { width: 96 },
  options: { gap: 10 },
  option: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#FFF8F4' },
  optionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    minHeight: 64,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  optionSubtitle: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  optionTrailing: { fontSize: 14, fontWeight: '800', color: colors.ink },
  cardForm: { paddingHorizontal: 14, paddingBottom: 16, gap: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.inkSoft, marginBottom: -6 },
  parcels: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  parcel: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  parcelActive: { borderColor: colors.primary, backgroundColor: '#FFF' },
  parcelText: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  parcelTextActive: { color: colors.ink, fontWeight: '800' },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  summaryItemName: { flex: 1, fontSize: 14, color: colors.inkSoft },
  summaryItemPrice: { fontSize: 14, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: colors.line },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  lineLabel: { fontSize: 14, color: colors.inkSoft, fontWeight: '600' },
  lineValue: { fontSize: 14, color: colors.ink, fontWeight: '700' },
  discount: { color: colors.leaf },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...shadow,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  footerTotal: { flex: 1 },
  footerLabel: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  footerValue: { fontSize: 24, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  footerHint: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
  formError: {
    color: '#D64545',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  pay: {
    flex: 1.3,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payDisabled: { opacity: 0.7 },
  payText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
