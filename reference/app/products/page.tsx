import { Suspense } from 'react';
import ProductListPage from '@/app/components/ProductListPage';

export default function ProductsPage() {
    return (
        <Suspense>
            <ProductListPage />
        </Suspense>
    );
}
