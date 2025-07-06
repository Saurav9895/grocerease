

export interface Vendor {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  vendorId: string;
  vendorName: string;
  description: string;
  price: number; // This is the sale price
  originalPrice?: number; // The M.R.P. or strikethrough price
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: Date;
  rating: number;
  reviewCount: number;
  attributes?: Record<string, string>;
  
  // Variant fields
  isVariant?: boolean;
  variantAttributeName?: string; // e.g., "Weight", "Size"
  variants?: Record<string, { // The key is the attribute value (e.g., "500gm")
    price: number;
    originalPrice?: number;
    stock: number;
    imageUrl: string;
  }>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
  productId?: string;
  variantValue?: string;
}

export interface Address {
  id?: string;
  name: string;
  phone: string;
  apartment: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  googleMapsUrl?: string;
}

export interface OrderItem {
  id: string; // This might be a composite ID for variants
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  variantValue: string | null;
  vendorId: string;
  vendorName: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  address: Address;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  promoCode: string | null;
  total: number;
  paymentMethod: 'COD' | 'Online';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: Date;
  deliveryPersonId?: string | null;
  deliveryPersonName?: string | null;
  deliveryOtp?: string | null;
  paymentSubmitted?: boolean;
  deliveredAt?: Date | null;
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

export interface HomepageSettings {
  featuredProductIds: string[];
  featuredCategoryIds: string[];
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
    adminRole: 'main' | 'standard' | 'delivery' | 'vendor' | null;
    vendorId?: string;
}

export interface AttributeSet {
  id: string;
  name: string; // e.g., "Weight", "Volume", "Brand"
}

export interface GroupedDeliveries {
  [key: string]: {
    personName: string;
    orders: Order[];
  };
}
