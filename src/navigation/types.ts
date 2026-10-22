import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Order } from '../types';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  Success: { order: Order };
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
