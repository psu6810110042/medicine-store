'use client';

import Link from 'next/link';
import { UserCircle, Package, ShoppingCart, Minus, Plus, Trash2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart();

  const isProductsPage = pathname?.startsWith('/products');

  return (
    <nav className="w-full border-b border-gray-200/50 bg-white/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Profile
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {isProductsPage ? (
            /* Cart Drawer from Navbar */
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative group border-gray-200 bg-white/50 hover:bg-gray-50/80">
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                  ตะกร้า
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-[10px] bg-primary text-white rounded-full animate-in zoom-in">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-white/95 backdrop-blur-md border-l border-white/20">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> ตะกร้าสินค้าของคุณ ({getTotalItems()} ชิ้น)
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 mt-6 space-y-4 overflow-y-auto pr-2">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <div className="bg-gray-100/50 p-6 rounded-full mb-4">
                        <ShoppingCart className="w-12 h-12 opacity-50 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-600">ยังไม่มีสินค้าในตะกร้า</p>
                      <p className="text-sm text-gray-400 mt-1">เลือกซื้อสินค้าที่คุณต้องการได้เลย</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex gap-4 border-b border-gray-100 pb-4 group">
                        <div className="w-20 h-20 bg-white rounded-xl shadow-sm border border-gray-100 flex-shrink-0 p-2">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">{item.product.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.product.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                              <button className="h-6 w-6 rounded-md bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                              <button className="h-6 w-6 rounded-md bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-primary">฿{(item.product.price * item.quantity).toLocaleString()}</span>
                              <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => removeFromCart(item.product.id)}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="pt-6 border-t mt-auto px-1 pb-4">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                        <span>ยอดรวมสินค้า</span>
                        <span>฿{getTotalPrice().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-gray-900">ยอดรวมทั้งสิ้น</span>
                        <span className="text-primary text-2xl">฿{getTotalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                    <Button className="w-full text-lg h-14 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-md" onClick={() => router.push('/checkout')}>
                      ดำเนินการชำระเงิน <Zap className="w-5 h-5 ml-2 fill-current" />
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          ) : (
            <>
              <Link
                href="/products"
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                สินค้าทั้งหมด
              </Link>
              <div className="w-px h-4 bg-gray-300"></div>
              <Link
                href="/dev"
                className="px-4 py-2 bg-gray-900/5 hover:bg-gray-900/10 text-gray-700 rounded-full text-sm font-medium transition-all"
              >
                Dev Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
