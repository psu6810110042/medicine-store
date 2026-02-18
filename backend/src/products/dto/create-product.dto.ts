export class CreateProductDto {
    id: string;
    name: string;
    categoryId: string;
    price: number;
    description: string;
    properties?: string;
    warnings?: string;
    image?: string;
    inStock?: boolean;
    isControlled?: boolean;
    requiresPrescription?: boolean;
    stockQuantity?: number;
    batchNumber?: string;
    expiryDate?: string;
    manufacturer?: string;
    activeIngredient?: string;
}
