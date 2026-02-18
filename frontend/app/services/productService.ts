import { fetchApi } from '../../services/api';
import { Product } from '../types/product';

export const productService = {
  getProducts: async (categoryId?: string): Promise<Product[]> => {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return fetchApi<Product[]>(`/products${query}`);
  },

  getProduct: async (id: string): Promise<Product> => {
    return fetchApi<Product>(`/products/${id}`);
  },

  createProduct: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    return fetchApi<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    return fetchApi<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (id: string): Promise<void> => {
    return fetchApi<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};
