'use client';

import { ArrowLeft, Trash2, ShoppingBag, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function SmartCartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getNormalItems,
    getControlledItems,
  } = useCart();

  const normalItems = getNormalItems();
  const controlledItems = getControlledItems();
  const hasControlledMedicine = controlledItems.length > 0;
  const requiresPrescription = cart.some(item => item.product.requiresPrescription);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" className="mb-6" onClick={() => router.push('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปเลือกซื้อสินค้า
          </Button>

          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">ตะกร้าสินค้าว่างเปล่า</h2>
              <p className="text-gray-500 mb-6">เริ่มเลือกซื้อสินค้าเพื่อเพิ่มลงตะกร้า</p>
              <Button onClick={() => router.push('/products')}>เลือกซื้อสินค้า</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const CartItemRow = ({ item, showBadge = false }: { item: any; showBadge?: boolean }) => (
    <div className="flex gap-4 py-4">
      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent && !parent.querySelector('.fallback-icon')) {
              const fallback = document.createElement('div');
              fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center text-gray-400';
              fallback.innerHTML = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold mb-1">{item.product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{item.product.description}</p>
            {showBadge && item.product.isControlled && (
              <Badge variant="destructive" className="text-xs">
                ยาควบคุม
              </Badge>
            )}
            {showBadge && item.product.requiresPrescription && (
              <Badge variant="outline" className="text-xs ml-2">
                ต้องมีใบสั่งแพทย์
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFromCart(item.product.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
            >
              -
            </Button>
            <span className="w-12 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              disabled={item.quantity >= item.product.stockQuantity}
            >
              +
            </Button>
          </div>
          <div className="text-right">
            <div className="font-semibold text-blue-600">
              ฿{(item.product.price * item.quantity).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              ฿{item.product.price.toLocaleString()} x {item.quantity}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.push('/products')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          เลือกซื้อสินค้าต่อ
        </Button>

        <h1 className="text-3xl font-bold mb-6">ตะกร้าสินค้า (Smart Cart)</h1>

        {hasControlledMedicine && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>แจ้งเตือน:</strong> ตะกร้าของคุณมียาควบคุมพิเศษ
              จำเป็นต้องมีใบสั่งแพทย์และจะได้รับการตรวจสอบโดยเภสัชกรก่อนจัดส่ง
            </AlertDescription>
          </Alert>
        )}

        {requiresPrescription && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <FileText className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              สินค้าบางรายการต้องมีใบสั่งแพทย์ กรุณาเตรียมใบสั่งแพทย์เพื่ออัปโหลดในขั้นตอนถัดไป
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Normal Medicines */}
            {normalItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    ยาและผลิตภัณฑ์ทั่วไป ({normalItems.length} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {normalItems.map(item => (
                      <CartItemRow key={item.product.id} item={item} showBadge />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Controlled Medicines */}
            {controlledItems.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    ยาควบคุมพิเศษ ({controlledItems.length} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="divide-y">
                    {controlledItems.map(item => (
                      <CartItemRow key={item.product.id} item={item} showBadge />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">รายการสินค้า</span>
                    <span className="font-medium">{cart.length} รายการ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ยาทั่วไป</span>
                    <span className="font-medium">{normalItems.length} รายการ</span>
                  </div>
                  {controlledItems.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 text-red-600">ยาควบคุม</span>
                      <span className="font-medium text-red-600">{controlledItems.length} รายการ</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ราคาสินค้า</span>
                    <span className="font-medium">฿{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ค่าจัดส่ง</span>
                    <span className="font-medium text-green-600">ฟรี</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>ยอดรวมทั้งหมด</span>
                    <span className="text-blue-600">฿{getTotalPrice().toLocaleString()}</span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => router.push('/checkout')}
                  >
                    ดำเนินการชำระเงิน
                  </Button>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2 text-blue-900">ขั้นตอนต่อไป:</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>1. กรอกที่อยู่จัดส่ง</li>
                      {requiresPrescription && <li>2. อัปโหลดใบสั่งแพทย์</li>}
                      <li>{requiresPrescription ? '3' : '2'}. ชำระเงินและแนบสลิป</li>
                      <li>{requiresPrescription ? '4' : '3'}. รอการตรวจสอบจากเภสัชกร</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}