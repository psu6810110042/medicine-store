import { fetchApi } from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  stockQuantity: number;
  inStock: boolean;
  isControlled: boolean;
  requiresPrescription: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export const productsService = {
  async getAll(categoryId?: string, search?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    return fetchApi<Product[]>(`/products?${params.toString()}`);
  },

  async getById(id: string): Promise<Product> {
    return fetchApi<Product>(`/products/${id}`);
  },

  async getAllCategories(): Promise<Category[]> {
    return fetchApi<Category[]>('/categories');
  }
};
