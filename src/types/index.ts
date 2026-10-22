export type Category = 'dog' | 'cat' | 'bird' | 'fish';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  size: string;
  description: string;
};

export type CartItem = Product & { quantity: number };

export type DeliveryMethod = 'standard' | 'express';

export type PaymentMethod = 'pix' | 'card' | 'boleto';

export type Address = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

export type Payment = {
  method: PaymentMethod;
  installments?: number;
  cardBrand?: string;
  cardLast4?: string;
};

export type Totals = {
  subtotal: number;
  couponDiscount: number;
  firstOrderDiscount: number;
  pixDiscount: number;
  shipping: number;
  total: number;
};

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  address: Address;
  delivery: DeliveryMethod;
  payment: Payment;
  coupon: string | null;
  totals: Totals;
};
