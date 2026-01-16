export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  colors: string[];
  description: string;
  sizes: string[];
  stock: number;
  isNew?: boolean;
  isBestseller?: boolean;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}
