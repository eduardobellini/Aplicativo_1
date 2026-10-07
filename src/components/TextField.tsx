import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius } from '../theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

const TextField = forwardRef<TextInput, Props>(({ label, error, onFocus, onBlur, ...rest }, ref) => {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.muted}
        {...rest}
        style={[styles.input, focused && styles.focused, !!error && styles.invalid]}
        onFocus={e => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', color: colors.inkSoft, marginBottom: 6 },
  input: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  focused: { borderColor: colors.primary, backgroundColor: '#FFF' },
  invalid: { borderColor: '#D64545', backgroundColor: '#FFF6F5' },
  error: { color: '#D64545', fontSize: 12, fontWeight: '600', marginTop: 6 },
});
