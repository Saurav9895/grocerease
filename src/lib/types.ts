export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  address: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'COD' | 'Online';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: Date;
}
