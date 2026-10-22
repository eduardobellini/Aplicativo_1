import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '../types';

const ordersKey = (email: string) => `@patinhas:orders:${email}`;

export async function getOrders(email: string): Promise<Order[]> {
  const raw = await AsyncStorage.getItem(ordersKey(email));
  return raw ? JSON.parse(raw) : [];
}

export const newOrderId = () => String(Math.floor(100000 + Math.random() * 900000));

// Payment is simulated: there is no backend yet. To charge for real, send the order to
// your server and let it talk to a gateway (Mercado Pago, Pagar.me, Stripe...). Never
// send full card data from the app straight to storage — only the gateway's token.
async function processPayment(order: Order) {
  await new Promise(resolve => setTimeout(resolve, 1400));
  return order;
}

export async function placeOrder(email: string, order: Order) {
  await processPayment(order);
  const orders = await getOrders(email);
  await AsyncStorage.setItem(ordersKey(email), JSON.stringify([order, ...orders]));
}

// Placeholder codes until a gateway issues real ones.
export function pixCode(order: Order) {
  const amount = order.totals.total.toFixed(2);
  const amountField = `54${String(amount.length).padStart(2, '0')}${amount}`;
  return `00020126580014BR.GOV.BCB.PIX0136patinhas-pedido-${order.id}52040000530398${amountField}5802BR5913PATINHAS PET6009SAO PAULO6304`;
}

export function boletoLine(order: Order) {
  const amount = Math.round(order.totals.total * 100).toString().padStart(10, '0');
  return `23790.12345 ${order.id.slice(0, 5)}.${order.id.slice(5)}0000 00000.000000 1 0000${amount}`;
}
