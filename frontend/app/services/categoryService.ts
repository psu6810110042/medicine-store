import { fetchApi } from '../../services/api';
import { Category } from '../types/product';

export const categoryService = {
    getCategories: async (): Promise<Category[]> => {
        return fetchApi<Category[]>('/category');
    },

    getCategory: async (id: string): Promise<Category> => {
        return fetchApi<Category>(`/category/${id}`);
    },
};
