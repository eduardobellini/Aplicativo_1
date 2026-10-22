import { CartItem, DeliveryMethod, PaymentMethod, Totals } from '../types';

export const FREE_SHIPPING = 199;
export const SHIPPING_FEE = 19.9;
export const EXPRESS_FEE = 29.9;
export const PIX_DISCOUNT = 0.05;
export const FIRST_ORDER_DISCOUNT = 0.1;
const MAX_INSTALLMENTS = 6;
const MIN_INSTALLMENT = 20;

type Coupon = {
  code: string;
  description: string;
  rate: number;
  appliesTo: (item: CartItem) => boolean;
};

const coupons: Record<string, Coupon> = {
  AUAU30: {
    code: 'AUAU30',
    description: '30% off em rações',
    rate: 0.3,
    appliesTo: item => item.name.startsWith('Ração'),
  },
};

export const findCoupon = (code: string): Coupon | undefined =>
  coupons[code.trim().toUpperCase()];

export const deliveryOptions: Record<DeliveryMethod, { label: string; eta: string }> = {
  standard: { label: 'Padrão', eta: 'Até 5 dias úteis' },
  express: { label: 'Expressa', eta: 'Até 1 dia útil' },
};

export const paymentLabels: Record<PaymentMethod, string> = {
  pix: 'Pix',
  card: 'Cartão de crédito',
  boleto: 'Boleto',
};

const round = (value: number) => Math.round(value * 100) / 100;

const sum = (items: CartItem[]) => items.reduce((total, i) => total + i.price * i.quantity, 0);

type Options = {
  coupon?: string | null;
  firstOrder?: boolean;
  delivery?: DeliveryMethod;
  payment?: PaymentMethod;
};

// Discounts stack in order: coupon → first order → Pix. Shipping is never discounted.
export function calculateTotals(
  items: CartItem[],
  { coupon, firstOrder = false, delivery = 'standard', payment }: Options = {},
): Totals {
  const subtotal = round(sum(items));
  const found = coupon ? findCoupon(coupon) : undefined;
  const couponDiscount = found ? round(sum(items.filter(found.appliesTo)) * found.rate) : 0;
  const afterCoupon = subtotal - couponDiscount;
  const firstOrderDiscount = firstOrder ? round(afterCoupon * FIRST_ORDER_DISCOUNT) : 0;
  const products = afterCoupon - firstOrderDiscount;
  const pixDiscount = payment === 'pix' ? round(products * PIX_DISCOUNT) : 0;

  let shipping = 0;
  if (subtotal > 0) {
    if (delivery === 'express') shipping = EXPRESS_FEE;
    else if (subtotal < FREE_SHIPPING) shipping = SHIPPING_FEE;
  }

  return {
    subtotal,
    couponDiscount,
    firstOrderDiscount,
    pixDiscount,
    shipping,
    total: round(products - pixDiscount + shipping),
  };
}

export function installmentOptions(total: number) {
  const max = Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(total / MIN_INSTALLMENT)));
  return Array.from({ length: max }, (_, i) => i + 1);
}

export const installmentValue = (total: number, installments: number) =>
  round(total / installments);
