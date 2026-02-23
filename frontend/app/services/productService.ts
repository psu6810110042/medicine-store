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

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/storage/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },
};
