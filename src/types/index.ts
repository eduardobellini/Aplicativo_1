export type Category = 'dog' | 'cat' | 'bird' | 'fish';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  emoji: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  size: string;
  description: string;
};

export type CartItem = Product & { quantity: number };
