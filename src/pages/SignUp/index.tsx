import { useRef, useState } from 'react';
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
import { useScrollToFocused } from '../../hooks/useScrollToFocused';
import { ScreenProps } from '../../navigation/types';
import { colors, radius, shadow } from '../../theme';

type Field = 'name' | 'email' | 'password' | 'confirm';
type Errors = Partial<Record<Field | 'form', string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = 'Digite seu nome.';
  if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'E-mail inválido.';
  if (values.password.length < 6) errors.password = 'A senha precisa ter pelo menos 6 caracteres.';
  if (values.confirm !== values.password) errors.confirm = 'As senhas não coincidem.';
  return errors;
}

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];
const strengthColors = ['#D64545', '#D64545', colors.star, colors.leaf, colors.leaf];

export default function SignUp({ navigation }: ScreenProps<'SignUp'>) {
  const { signUp } = useAuth();
  const [values, setValues] = useState<Record<Field, string>>({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const { scrollRef, contentRef, focusHandler } = useScrollToFocused();
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const set = (field: Field) => (text: string) => {
    setValues(v => ({ ...v, [field]: text }));
    if (errors[field] || errors.form) setErrors(e => ({ ...e, [field]: undefined, form: undefined }));
  };

  async function handleSubmit() {
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await signUp(values.name, values.email, values.password);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      setErrors({ form: (e as Error).message });
      setSubmitting(false);
    }
  }

  const strength = passwordStrength(values.password);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View ref={contentRef} collapsable={false} style={styles.inner}>
            <FadeInView style={styles.topBar}>
              <PressableScale
                style={styles.back}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Voltar"
              >
                <Text style={styles.backText}>‹</Text>
              </PressableScale>
              <Text style={styles.step}>🐾 Patinhas</Text>
            </FadeInView>

            <FadeInView delay={80}>
              <Text style={styles.title}>Crie sua conta</Text>
              <Text style={styles.subtitle}>
                Ganhe 10% off na primeira compra e acompanhe seus pedidos.
              </Text>
            </FadeInView>

            <FadeInView delay={160} style={styles.card}>
              <TextField
                ref={nameRef}
                onFocus={focusHandler(nameRef)}
                label="Nome"
                placeholder="Como podemos te chamar?"
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                value={values.name}
                onChangeText={set('name')}
                onSubmitEditing={() => emailRef.current?.focus()}
                error={errors.name}
              />
              <TextField
                ref={emailRef}
                onFocus={focusHandler(emailRef)}
                label="E-mail"
                placeholder="voce@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                value={values.email}
                onChangeText={set('email')}
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={errors.email}
              />
              <View>
                <TextField
                  ref={passwordRef}
                  onFocus={focusHandler(passwordRef)}
                  label="Senha"
                  placeholder="Mínimo de 6 caracteres"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="next"
                  value={values.password}
                  onChangeText={set('password')}
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  error={errors.password}
                />
                {!!values.password && !errors.password && (
                  <View style={styles.strength}>
                    <View style={styles.bars}>
                      {[0, 1, 2, 3].map(i => (
                        <View
                          key={i}
                          style={[
                            styles.bar,
                            i < strength && { backgroundColor: strengthColors[strength] },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthText, { color: strengthColors[strength] }]}>
                      {strengthLabels[strength]}
                    </Text>
                  </View>
                )}
              </View>
              <TextField
                ref={confirmRef}
                onFocus={focusHandler(confirmRef)}
                label="Confirmar senha"
                placeholder="Repita a senha"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                value={values.confirm}
                onChangeText={set('confirm')}
                onSubmitEditing={handleSubmit}
                error={errors.confirm}
              />
            </FadeInView>

            <FadeInView delay={240}>
              {!!errors.form && <Text style={styles.formError}>{errors.form}</Text>}
              <PressableScale
                style={[styles.button, submitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
                accessibilityRole="button"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Criar conta</Text>
                )}
              </PressableScale>
              <Text style={styles.login}>
                Já tem conta?{' '}
                <Text
                  style={styles.loginLink}
                  onPress={() => navigation.goBack()}
                  accessibilityRole="link"
                >
                  Entrar
                </Text>
              </Text>
            </FadeInView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { padding: 24 },
  inner: { gap: 22 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  step: { fontSize: 15, fontWeight: '800', color: colors.ink },
  title: { fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.muted, lineHeight: 22, marginTop: 6 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    gap: 16,
    ...shadow,
  },
  strength: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  bars: { flexDirection: 'row', gap: 4, flex: 1 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.line },
  strengthText: { fontSize: 12, fontWeight: '700', minWidth: 76, textAlign: 'right' },
  formError: {
    color: '#D64545',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  login: { textAlign: 'center', marginTop: 16, color: colors.muted, fontSize: 14 },
  loginLink: { color: colors.leaf, fontWeight: '800' },
});
