import { fetchApi } from '../../services/api';
import { Order, OrderStatus } from '../types/order';

export interface CreateOrderDto {
  items: { productId: string; quantity: number }[];
  shippingAddress?: {
    street: string;
    district: string;
    province: string;
    postalCode: string;
  };
  notes?: string;
  prescriptionImage?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export const orderService = {
  // Create a new order
  createOrder: async (data: CreateOrderDto): Promise<Order> => {
    return fetchApi<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all orders (for admin/pharmacist)
  getOrders: async (): Promise<Order[]> => {
    return fetchApi<Order[]>('/orders');
  },

  // Get orders for the current user
  getMyOrders: async (): Promise<Order[]> => {
    return fetchApi<Order[]>('/orders/my');
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    return fetchApi<Order>(`/orders/${id}`);
  },

  // Update order status (for admin/pharmacist)
  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    return fetchApi<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
