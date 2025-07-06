






export interface Vendor {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  createdAt: Date;
  address?: Address;
}

export interface Product {
  id: string;
  name: string;
  vendorId: string;
  vendorName: string;
  description: string;
  price: number; // Base price for non-variant products or a fallback
  originalPrice?: number;
  imageUrl: string;
  category: string;
  stock: number; // Base stock for non-variant products
  createdAt: Date;
  rating: number;
  reviewCount: number;
  attributes?: Record<string, string>;
  
  // New Variant Structure
  hasVariants?: boolean;
  variantDefinitions?: {
    name: string; // e.g. "Color"
    values: string[]; // e.g. ["Black", "White"]
  }[];
  variantSKUs?: {
    id: string; // e.g. "black_s"
    options: Record<string, string>; // e.g. { "Color": "Black", "Size": "S" }
    price: number;
    originalPrice?: number;
    stock: number;
    imageUrl: string;
  }[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  vendorId?: string;
}

export interface CartItem extends Product {
  quantity: number;
  productId: string; // Always the base product ID
  skuId?: string; // The ID of the specific SKU, e.g., "black-s"
  selectedOptions?: Record<string, string>; // e.g., { "Color": "Black", "Size": "S" }
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
  variantValue: string | null; // Legacy, can be replaced by selectedOptions display
  vendorId: string;
  vendorName: string;
  selectedOptions?: Record<string, string>;
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
  vendorIds: string[];
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
  vendorId?: string;
}

export interface GroupedDeliveries {
  [key: string]: {
    personName: string;
    orders: Order[];
  };
}
