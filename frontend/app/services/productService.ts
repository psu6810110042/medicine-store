import { fetchApi } from '../../services/api';
import { Product } from '../types/product';

export interface FetchProductsParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isControlled?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const productService = {
  getProducts: async (params?: FetchProductsParams): Promise<Product[]> => {
    const urlParams = new URLSearchParams();
    if (params) {
      if (params.search) urlParams.append('search', params.search);
      if (params.categoryId && params.categoryId !== 'all-categories') urlParams.append('categoryId', params.categoryId);
      if (params.minPrice !== undefined) urlParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) urlParams.append('maxPrice', params.maxPrice.toString());
      if (params.inStock !== undefined) urlParams.append('inStock', params.inStock.toString());
      if (params.isControlled !== undefined) urlParams.append('isControlled', params.isControlled.toString());
      if (params.sortBy) urlParams.append('sortBy', params.sortBy);
      if (params.sortOrder) urlParams.append('sortOrder', params.sortOrder);
    }
    const query = urlParams.toString() ? `?${urlParams.toString()}` : '';
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

  uploadImage: async (file: File, folder: string = 'products'): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload/image/${folder}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },
};
