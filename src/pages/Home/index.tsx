import { useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartButton from '../../components/CartButton';
import FadeInView from '../../components/FadeInView';
import PressableScale from '../../components/PressableScale';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { categories, products } from '../../data/products';
import { ScreenProps } from '../../navigation/types';
import { colors, radius } from '../../theme';
import { Category } from '../../types';

export default function Home({ navigation }: ScreenProps<'Home'>) {
  const { addToCart, clearCart } = useCart();
  const { user, signOut } = useAuth();
  const firstName = user?.name.split(' ')[0] || 'tutor';
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(
      p =>
        (category === 'all' || p.category === category) &&
        (!term || p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)),
    );
  }, [category, search]);

  function confirmSignOut() {
    Alert.alert(user?.name ?? 'Conta', user?.email, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          clearCart();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  }

  const header = (
    <View>
      <FadeInView style={styles.topBar}>
        <View>
          <Text style={styles.hello}>Olá, {firstName} 👋</Text>
          <Text style={styles.headline}>O que seu pet{'\n'}merece hoje?</Text>
        </View>
        <View style={styles.actions}>
          <PressableScale
            style={styles.avatar}
            onPress={confirmSignOut}
            accessibilityLabel="Conta, toque para sair"
          >
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </PressableScale>
          <CartButton onPress={() => navigation.navigate('Cart')} />
        </View>
      </FadeInView>

      <FadeInView delay={80} style={styles.search}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar rações, brinquedos..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </FadeInView>

      <FadeInView delay={160}>
        <View style={styles.banner}>
          <View style={styles.bannerCircle} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerKicker}>SEMANA DO PET</Text>
            <Text style={styles.bannerTitle}>Até 30% off{'\n'}em rações</Text>
            <View style={styles.bannerPill}>
              <Text style={styles.bannerPillText}>Cupom AUAU30</Text>
            </View>
          </View>
          <Text style={styles.bannerEmoji}>🐕</Text>
        </View>
      </FadeInView>

      <FadeInView delay={240}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {categories.map(c => {
            const active = c.id === category;
            return (
              <PressableScale
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={styles.chipEmoji}>{c.emoji}</Text>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </FadeInView>

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Mais amados</Text>
        <Text style={styles.sectionCount}>{visible.length} produtos</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={visible}
        keyExtractor={item => `${category}-${item.id}`}
        numColumns={2}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <FadeInView delay={300 + Math.min(index, 6) * 70} style={styles.cell}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              onAdd={() => addToCart(item)}
            />
          </FadeInView>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { gap: 14 },
  cell: { flex: 1, marginBottom: 14, maxWidth: '50%' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  actions: { flexDirection: 'row', gap: 10 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.leaf,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  hello: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  headline: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
    lineHeight: 34,
    marginTop: 4,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 52,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: colors.ink },
  banner: {
    marginTop: 20,
    backgroundColor: colors.leaf,
    borderRadius: radius.lg,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerCircle: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -40,
    top: -30,
  },
  bannerText: { flex: 1 },
  bannerKicker: { color: '#A9D3C4', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  bannerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 28,
    marginTop: 6,
  },
  bannerPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 14,
  },
  bannerPillText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  bannerEmoji: { fontSize: 78, marginLeft: 8 },
  chips: { gap: 10, paddingVertical: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.inkSoft },
  chipTextActive: { color: '#fff' },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  section: { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.4 },
  sectionCount: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 50 },
  emptyEmoji: { fontSize: 44, marginBottom: 8 },
  emptyText: { fontSize: 15, color: colors.muted, fontWeight: '600' },
});
