import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { styles } from './styles';

export default function Login({ navigation }: ScreenProps<'Login'>) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const { scrollRef, contentRef, focusHandler } = useScrollToFocused();

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await signIn(email, password);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View ref={contentRef} collapsable={false} style={styles.flex}>
            <View style={styles.hero}>
              <View style={[styles.blob, styles.blobOrange]} />
              <View style={[styles.blob, styles.blobGreen]} />
              <FadeInView delay={0} offset={30}>
                <Text style={styles.heroEmoji}>🐶</Text>
              </FadeInView>
              <FadeInView delay={120} offset={30} style={styles.heroEmojiCatWrap}>
                <Text style={styles.heroEmojiCat}>🐱</Text>
              </FadeInView>
            </View>

            <View style={styles.form}>
              <FadeInView delay={200}>
                <View style={styles.brandRow}>
                  <View style={styles.brandMark}>
                    <Text style={styles.brandMarkText}>🐾</Text>
                  </View>
                  <Text style={styles.brandName}>Patinhas</Text>
                </View>
                <Text style={styles.title}>Tudo o que seu pet ama, num só lugar.</Text>
              </FadeInView>

              <FadeInView delay={300}>
                <TextField
                  ref={emailRef}
                  onFocus={focusHandler(emailRef)}
                  label="E-mail"
                  placeholder="voce@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </FadeInView>

              <FadeInView delay={380}>
                <TextField
                  ref={passwordRef}
                  onFocus={focusHandler(passwordRef)}
                  label="Senha"
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="go"
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleSubmit}
                />
                {!!error && <Text style={styles.formError}>{error}</Text>}
              </FadeInView>

              <FadeInView delay={460}>
                <PressableScale
                  style={[styles.button, submitting && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  accessibilityRole="button"
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                  )}
                </PressableScale>
                <Text style={styles.signup}>
                  Novo por aqui?{' '}
                  <Text
                    style={styles.signupLink}
                    onPress={() => navigation.navigate('SignUp')}
                    accessibilityRole="link"
                  >
                    Criar conta
                  </Text>
                </Text>
              </FadeInView>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
