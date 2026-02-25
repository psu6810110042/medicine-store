'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/app/types/product';
import { productService } from '@/app/services/productService';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!id) return;
        const data = await productService.getProduct(id);
        setProduct(data);
      } catch (err) {
        setError('ไม่สามารถโหลดรายละเอียดสินค้า');
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า');
      router.push('/login');
      return;
    }
    if (user.role !== 'customer') {
      toast.error('เฉพาะลูกค้าเท่านั้นที่สามารถสั่งซื้อสินค้าได้');
      return;
    }
    if (product && (product.stockQuantity <= 0 || !product.inStock)) {
      toast.error('สินค้าหมดสต็อก');
      return;
    }
    if (product) {
      addToCart(product, 1);
      toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (product && product.stockQuantity > 0 && product.inStock) {
      router.push('/store');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ย้อนกลับ
          </Button>
          <Card className="animate-pulse bg-gray-200 h-96" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ย้อนกลับ
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-red-500 text-lg mb-4">{error || 'ไม่พบสินค้า'}</p>
              <Button onClick={() => router.push('/products')}>
                กลับไปหน้าสินค้า
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0 || !product.inStock;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          ย้อนกลับ
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <Card>
              <CardContent className="p-8">
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <svg
                        className="w-24 h-24 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-400">ไม่มีรูปภาพ</p>
                    </div>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <Badge className="text-white bg-red-600 border-none px-4 py-2 text-lg font-bold">
                        สินค้าหมด
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stock Status */}
            <div className="mt-4">
              <div className={`text-sm font-medium p-3 rounded-lg ${
                isOutOfStock 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isOutOfStock 
                  ? '❌ สินค้าหมดสต็อก' 
                  : `✓ คงเหลือ: ${product.stockQuantity} ชิ้น`}
              </div>
            </div>

            {/* Specifications */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">ข้อมูลจำเพาะ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.activeIngredient && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">สารออกฤทธิ์</p>
                      <p className="text-gray-900">{product.activeIngredient}</p>
                    </div>
                  )}

                  {product.manufacturer && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">ผู้ผลิต</p>
                      <p className="text-gray-900">{product.manufacturer}</p>
                    </div>
                  )}

                  {product.batchNumber && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">เลขแบตช์</p>
                      <p className="text-gray-900">{product.batchNumber}</p>
                    </div>
                  )}

                  {product.expiryDate && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">วันหมดอายุ</p>
                      <p className="text-gray-900">
                        {new Date(product.expiryDate).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  )}

                  {product.properties && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">คุณสมบัติ</p>
                      <p className="text-gray-900">{product.properties}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div>
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex gap-2 mb-3 flex-wrap">
                {product.isControlled && (
                  <Badge variant="destructive">ยาควบคุม</Badge>
                )}
                {product.requiresPrescription && (
                  <Badge variant="outline">ใบสั่งแพทย์</Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
              
              {product.category && (
                <p className="text-gray-600 mb-4">
                  หมวดหมู่: <span className="font-semibold">{product.category.name}</span>
                </p>
              )}

              <p className="text-5xl font-bold text-primary mb-1">
                ฿{product.price.toLocaleString()}
              </p>
            </div>

            {/* Main Description */}
            {product.description && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">รายละเอียดสินค้า</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {product.warnings && (
              <Card className="mb-6 border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-yellow-900">
                    <AlertCircle className="w-5 h-5" />
                    คำเตือน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-900">{product.warnings}</p>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.createdAt && (
                    <div>
                      <p className="text-gray-600 font-medium">เพิ่มเข้าระบบเมื่อ</p>
                      <p className="text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  )}
                  {product.updatedAt && (
                    <div>
                      <p className="text-gray-600 font-medium">อัปเดตเมื่อ</p>
                      <p className="text-gray-900">
                        {new Date(product.updatedAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
              >
                <Zap className="w-5 h-5 mr-2 fill-current" />
                สั่งซื้อทันที
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                เพิ่มลงตะกร้า
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
