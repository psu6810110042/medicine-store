import { fetchApi } from '../../services/api';
import { Order, OrderStatus } from '../types/order';

export interface CreateOrderDto {
  items: { productId: string; quantity: number }[];
  shippingAddress?: {
    street: string;
    subDistrict: string;
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

type PaymentMethod = 'BANK_TRANSFER' | 'PROMPTPAY';
type PaymentVerifyStatus = 'APPROVED' | 'REJECTED';

function isPrescriptionOnlyOrder(data: {
  items?: { productId: string; quantity: number }[];
  prescriptionImage?: string;
}) {
  return Boolean(data.prescriptionImage) && (!data.items || data.items.length === 0);
}

function normalizeOrder(order: Order): Order {
  if (
    order?.status === OrderStatus.PENDING_REVIEW &&
    order?.prescriptionImage &&
    (!order.items || order.items.length === 0)
  ) {
    return {
      ...order,
      status: OrderStatus.PRESCRIPTION,
    };
  }

  return order;
}

function normalizeOrders(orders: Order[]): Order[] {
  return Array.isArray(orders) ? orders.map(normalizeOrder) : [];
}

export const orderService = {
  // Create a new order
  createOrder: async (data: CreateOrderDto): Promise<Order> => {
    const payload = isPrescriptionOnlyOrder(data)
      ? {
          ...data,
          status: OrderStatus.PRESCRIPTION,
        }
      : data;

    const created = await fetchApi<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeOrder(created);
  },

  // Get all orders (for admin/pharmacist)
  getOrders: async (): Promise<Order[]> => {
    const orders = await fetchApi<Order[]>('/orders');
    return normalizeOrders(orders);
  },

  // Get orders for the current user
  getMyOrders: async (): Promise<Order[]> => {
    const orders = await fetchApi<Order[]>('/orders/my');
    return normalizeOrders(orders);
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    const order = await fetchApi<Order>(`/orders/${id}`);
    return normalizeOrder(order);
  },

  // Update order status (for admin/pharmacist)
  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const updated = await fetchApi<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    return normalizeOrder(updated);
  },

  // Add/replace items on a PRESCRIPTION order (pharmacist only)
  addItemsToOrder: async (
    id: string,
    items: { productId: string; quantity: number }[],
  ): Promise<Order> => {
    const updated = await fetchApi<Order>(`/orders/${id}/items`, {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });

    return normalizeOrder(updated);
  },

  // Submit payment for an order
  submitPayment: async (
    id: string,
    data: { method: PaymentMethod; slipUrl: string; note?: string },
  ): Promise<Order> => {
    const updated = await fetchApi<Order>(`/orders/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    return normalizeOrder(updated);
  },

  // Verify payment (admin only)
  verifyPayment: async (
    id: string,
    data: { status: PaymentVerifyStatus; note?: string },
  ): Promise<Order> => {
    const updated = await fetchApi<Order>(`/orders/${id}/verify-payment`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    return normalizeOrder(updated);
  },

  // Delete order by id
  deleteOrder: async (id: string): Promise<void> => {
    await fetchApi(`/orders/${id}`, {
      method: 'DELETE',
    });
  },

  // Delete many orders one by one
  deleteOrders: async (ids: string[]): Promise<void> => {
    for (const id of ids) {
      await fetchApi(`/orders/${id}`, {
        method: 'DELETE',
      });
    }
  },
};