'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { fetchProducts } from '@/services/product';
import { Product } from '@/app/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, clearCart, getTotalItems } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadCartProducts = async () => {
            if (cart.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            const ids = cart.map(item => item.productId);
            try {
                // Fetch products by IDs
                const fetchedProducts = await fetchProducts({ ids });
                setProducts(fetchedProducts);
            } catch (error) {
                console.error('Failed to load cart products:', error);
                toast.error('ไม่สามารถโหลดข้อมูลสินค้าในตะกร้าได้');
            } finally {
                setLoading(false);
            }
        };

        loadCartProducts();
    }, [cart.length]); // Reload if cart count changes from 0 to something or vice versa (though mainly initial load)
    // Note: If quantities change, we don't need to refetch products.
    // However, if items are added/removed, 'cart' changes.
    // If we add complex logic, we might need to optimize.
    // For now, depending on cart.length might be not enough if we swap items, but ids are derived from cart.
    // Let's rely on ids check or just refetch if cart items change (ids change).

    // Better effect dependency:
    useEffect(() => {
        const loadCartProducts = async () => {
            const ids = cart.map(item => item.productId);
            if (ids.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            // Optimization: Only fetch if we have new IDs or verified missing ones? 
            // For simplicity, just fetch all IDs in cart.
            try {
                const fetchedProducts = await fetchProducts({ ids });
                setProducts(fetchedProducts);
            } catch (error) {
                console.error('Failed to load cart products:', error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce or check if IDs actually changed could be good, but for now simple approach:
        // We only really need to fetch when specific product IDs enter the cart that we don't have.
        // But since we don't persist product data, we must fetch on mount.
        // And if new items are added while on this page (unlikely unless distinct window), we might want to update.
        // Let's just run when cart structure (IDs) changes.
        const ids = cart.map(c => c.productId).sort().join(',');
        loadCartProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(cart.map(c => c.productId).sort())]);


    const getProduct = (id: string) => products.find(p => p.id === id);

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const product = getProduct(item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 bg-primary/20 rounded-full mb-4"></div>
                    <p className="text-muted-foreground">กำลังโหลดตะกร้าสินค้า...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 text-primary" />
                        ตะกร้าสินค้า
                        <span className="text-lg font-normal text-muted-foreground ml-2">
                            ({getTotalItems()} รายการ)
                        </span>
                    </h1>
                    <Link href="/">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            เลือกซื้อสินค้าต่อ
                        </Button>
                    </Link>
                </div>

                {cart.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <ShoppingBag className="w-24 h-24 text-gray-200 mb-6" />
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">ตะกร้าสินค้าว่างเปล่า</h2>
                            <p className="text-gray-500 mb-8">คุณยังไม่ได้เพิ่มสินค้าใดๆ ลงในตะกร้า</p>
                            <Link href="/">
                                <Button size="lg" className="bg-primary hover:bg-primary/90">
                                    เลือกซื้อสินค้า
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => {
                                const product = getProduct(item.productId);
                                if (!product) return null; // Or skeleton

                                return (
                                    <Card key={item.productId} className="overflow-hidden">
                                        <CardContent className="p-4 flex gap-4">
                                            {/* Product Image */}
                                            <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-2"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                                                            {product.name}
                                                        </h3>
                                                        <button
                                                            onClick={() => removeFromCart(item.productId)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            title="ลบสินค้า"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                                                    {product.isControlled && (
                                                        <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                                            ยาควบคุม
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center border rounded-md">
                                                        <button
                                                            className="p-1 px-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="px-3 py-1 text-sm font-medium text-gray-900 border-x">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="p-1 px-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                            disabled={item.quantity >= product.stockQuantity} // Check stock?
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-primary">
                                                            ฿{(product.price * item.quantity).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6">สรุปคำสั่งซื้อ</h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-base text-gray-600">
                                            <span>ยอดรวม ({getTotalItems()} ชิ้น)</span>
                                            <span>฿{calculateTotal().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-base text-gray-600">
                                            <span>ค่าจัดส่ง</span>
                                            <span className="text-green-600">ฟรี</span>
                                        </div>
                                        <div className="border-t pt-4 flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">ยอดรวมทั้งสิ้น</span>
                                            <span className="text-2xl font-bold text-primary">
                                                ฿{calculateTotal().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Button className="w-full mt-8 bg-primary hover:bg-primary/90 text-lg py-6 shadow-lg">
                                        ดำเนินการชำระเงิน
                                    </Button>
                                    <Button variant="ghost" onClick={clearCart} className="w-full mt-4 text-gray-500 hover:text-red-500">
                                        ล้างตะกร้าสินค้า
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
