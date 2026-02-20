import { Product } from '@/app/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface FetchProductsParams {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    isControlled?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    ids?: string[];
}

export const fetchProducts = async (params?: FetchProductsParams): Promise<Product[]> => {
    try {
        const url = new URL(`${API_URL}/products`);

        if (params) {
            if (params.search) url.searchParams.append('search', params.search);
            if (params.categoryId && params.categoryId !== 'all-categories') url.searchParams.append('categoryId', params.categoryId);
            if (params.minPrice !== undefined) url.searchParams.append('minPrice', params.minPrice.toString());
            if (params.maxPrice !== undefined) url.searchParams.append('maxPrice', params.maxPrice.toString());
            if (params.inStock !== undefined) url.searchParams.append('inStock', params.inStock.toString());
            if (params.isControlled !== undefined) url.searchParams.append('isControlled', params.isControlled.toString());
            if (params.isControlled !== undefined) url.searchParams.append('isControlled', params.isControlled.toString());
            if (params.ids && params.ids.length > 0) url.searchParams.append('ids', params.ids.join(','));
            if (params.sortBy) url.searchParams.append('sortBy', params.sortBy);
            if (params.sortOrder) url.searchParams.append('sortOrder', params.sortOrder);
        }

        const res = await fetch(url.toString(), {
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: 0 }, // Disable cache for now
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch products: ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: 0 },
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch product: ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }
};
