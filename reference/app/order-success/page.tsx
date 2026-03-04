import { Suspense } from 'react';
import OrderSuccessPage from '@/app/components/OrderSuccessPage';

export default function Page() {
    return (
        <Suspense>
            <OrderSuccessPage />
        </Suspense>
    );
}
