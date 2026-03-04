'use client';

import { useState } from 'react';
import { ArrowLeft, ShoppingCart, AlertTriangle, Info, Package, Zap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Separator } from '@/app/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { products } from '@/data/mockData';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ProductDetailPageProps {
  productId: string;
}

export default function ProductDetailPage({
  productId,
}: ProductDetailPageProps) {
  const router = useRouter();
  const product = products.find(p => p.id === productId);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { openAuthModal } = useUI();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">ไม่พบสินค้านี้</p>
            <Button onClick={() => router.push('/products')}>กลับไปหน้ารายการสินค้า</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า');
      openAuthModal();
      return;
    }

    if (user.role !== 'customer') {
      toast.error('เฉพาะลูกค้าเท่านั้นที่สามารถสั่งซื้อสินค้าได้');
      return;
    }

    if (!product.inStock) {
      toast.error('สินค้าหมดชั่วคราว');
      return;
    }

    if (quantity > product.stockQuantity) {
      toast.error('จำนวนสินค้าไม่เพียงพอ');
      return;
    }

    addToCart(product, quantity);
    toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า');
      openAuthModal();
      return;
    }

    if (user.role !== 'customer') {
      toast.error('เฉพาะลูกค้าเท่านั้นที่สามารถสั่งซื้อสินค้าได้');
      return;
    }

    if (!product.inStock) {
      toast.error('สินค้าหมดชั่วคราว');
      return;
    }

    addToCart(product, quantity);
    router.push('/checkout');
  };

  const incrementQuantity = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(q => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/products')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับ
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <Card className="overflow-hidden">
              <div className="relative bg-gray-100 h-96">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-text absolute inset-0 flex items-center justify-center text-gray-400';
                      fallback.innerHTML = `<div class="text-center p-8"><svg class="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-lg font-medium">${product.name}</p><p class="text-sm mt-2">รูปภาพไม่พร้อมใช้งาน</p></div>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />
                {!product.inStock || product.stockQuantity <= 0 ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <Badge variant="secondary" className="text-white bg-red-600 border-none px-6 py-2 text-xl font-bold">
                      สินค้าหมด
                    </Badge>
                  </div>
                ) : null}
              </div>
            </Card>

            {/* Product Info */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold">ข้อมูลสินค้า</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">รหัสสินค้า:</span>
                    <span className="font-medium">{product.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Batch Number:</span>
                    <span className="font-medium">{product.batchNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันหมดอายุ:</span>
                    <span className="font-medium">{product.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">คงเหลือ:</span>
                    <span className="font-medium">{product.stockQuantity} ชิ้น</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.isControlled && (
                <Badge variant="destructive">ยาควบคุม</Badge>
              )}
              {product.requiresPrescription && (
                <Badge variant="outline">ต้องมีใบสั่งแพทย์</Badge>
              )}
              {product.inStock && product.stockQuantity > 0 ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  มีสินค้า
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-800">สินค้าหมด</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="mb-6">
              <span className={`text-4xl font-bold ${product.stockQuantity <= 0 || !product.inStock ? 'text-gray-400' : 'text-primary'}`}>
                ฿{product.price.toLocaleString()}
              </span>
            </div>

            <Separator className="my-6" />

            {/* Out of Stock Warning */}
            {(product.stockQuantity <= 0 || !product.inStock) && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>ขออภัย:</strong> ขณะนี้สินค้าชิ้นนี้หมดสต็อกชั่วคราว คุณสามารถเลือกดูสินค้าใกล้เคียงหรือรอการอัปเดตสต็อกอีกครั้ง
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {product.isControlled && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>ยาควบคุม:</strong> สินค้านี้เป็นยาควบคุมพิเศษ จำเป็นต้องมีใบสั่งแพทย์
                  และจะได้รับการตรวจสอบโดยเภสัชกรก่อนจัดส่ง
                </AlertDescription>
              </Alert>
            )}

            {product.requiresPrescription && (
              <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  สินค้านี้ต้องมีใบสั่งแพทย์ กรุณาอัปโหลดใบสั่งแพทย์ในขั้นตอนการชำระเงิน
                </AlertDescription>
              </Alert>
            )}

            {/* Quantity Selector */}
            <div className={`mb-6 ${product.stockQuantity <= 0 || !product.inStock ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="block text-sm font-medium mb-2">จำนวน</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1 || product.stockQuantity <= 0}
                  >
                    -
                  </Button>
                  <span className="px-6 py-2 font-medium">{product.stockQuantity <= 0 ? 0 : quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stockQuantity || product.stockQuantity <= 0}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  (สูงสุด {product.stockQuantity} ชิ้น)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!product.inStock || product.stockQuantity <= 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stockQuantity <= 0 || !product.inStock ? 'สินค้าหมด' : 'ใส่ตะกร้า'}
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleBuyNow}
                disabled={!product.inStock || product.stockQuantity <= 0}
              >
                <Zap className="w-5 h-5 mr-2 fill-current" />
                {product.stockQuantity <= 0 || !product.inStock ? 'สินค้าหมด' : 'สั่งซื้อทันที'}
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Detailed Info Tabs */}
            <Tabs defaultValue="properties">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">สรรพคุณ</TabsTrigger>
                <TabsTrigger value="warnings">คำเตือน</TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed">{product.properties}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="warnings" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed">{product.warnings}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
