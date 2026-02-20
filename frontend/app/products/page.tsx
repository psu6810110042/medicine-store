import { Suspense } from 'react';
import ProductListPage from '@/components/ProductListPage';

export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductListPage />
        </Suspense>
    );
}
