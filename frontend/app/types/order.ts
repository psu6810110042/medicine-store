import { Product } from './product';

export enum OrderStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  PRESCRIPTION = 'PRESCRIPTION',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
  STOCK = 'STOCK',
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress?: {
    street?: string;
    district?: string;
    province?: string;
    postalCode?: string;
  } | string;
  notes?: string;
  prescriptionImage?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
