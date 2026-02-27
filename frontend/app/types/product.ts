export interface Product {
    id: string;
    name: string;
    categoryId?: string;
    category?: Category;
    price: number;
    description: string;
    properties?: string;
    warnings?: string;
    image?: string;
    inStock: boolean;
    isControlled: boolean;
    requiresPrescription: boolean;
    stockQuantity: number;
    batchNumber?: string;
    expiryDate?: string;
    manufacturer?: string;
    activeIngredient?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Category {
    id: string;
    name: string;
    icon?: string;
    count?: number;
}
