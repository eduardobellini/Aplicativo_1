import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { RootStackParamList } from './src/navigation/types';
import Cart from './src/pages/Cart';
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import ProductDetail from './src/pages/ProductDetail';
import SignUp from './src/pages/SignUp';
import Success from './src/pages/Success';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Routes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={user ? 'Home' : 'Login'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
          animationDuration: 320,
        }}
      >
        <Stack.Screen name="Login" component={Login} options={{ animation: 'fade' }} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Home" component={Home} options={{ animation: 'fade' }} />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetail}
          options={{ animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="Cart"
          component={Cart}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Success"
          component={Success}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <Routes />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
