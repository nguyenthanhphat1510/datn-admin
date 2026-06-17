export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  lat?: number;
  lon?: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  shippingFee: number;
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
