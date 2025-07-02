

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: Date;
  rating: number;
  reviewCount: number;
  attributes?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  id?: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  address: Address;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  promoCode: string | null;
  total: number;
  paymentMethod: 'COD' | 'Online';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface DeliverySettings {
  fee: number;
  freeDeliveryThreshold: number;
}

export interface PromoCode {
  id: string; // The code itself, e.g. "SUMMER10"
  type: 'percentage' | 'free_delivery';
  discountPercentage?: number;
  isActive: boolean;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    adminRole: 'main' | 'standard' | null;
}

export interface AttributeSet {
  id: string;
  name: string; // e.g., "Weight", "Volume", "Brand"
  values: string[]; // e.g., ["500gm", "1kg", "2kg"]
}
