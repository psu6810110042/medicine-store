import ProductDetailPage from '@/app/components/ProductDetailPage';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ProductDetailPage productId={id} />;
}
