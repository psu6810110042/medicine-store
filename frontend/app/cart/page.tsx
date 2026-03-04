'use client';

import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { useCart } from '@/contexts/CartContext';
import { productService } from '@/app/services/productService';
import { orderService } from '@/app/services/orderService';
import { Product } from '@/app/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Upload, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function CartContent() {
  const { cart, updateQuantity, removeFromCart, removeItemsLocally, clearCart, getTotalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, updateProfile } = useAuth();

  // Buy Now state
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get('buyNow');
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null);
  const [buyNowQty, setBuyNowQty] = useState(1);

  // Checkout states
  const [shippingAddress, setShippingAddress] = useState({ street: '', subDistrict: '', district: '', province: '', postalCode: '' });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prescription upload states
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const isBuyNowMode = !!buyNowId;

  // Load products map based on mode
  useEffect(() => {
    const loadProductsData = async () => {
      setLoading(true);
      try {
        if (isBuyNowMode) {
          // Fetch just the single product
          const p = await productService.getProduct(buyNowId!);
          setBuyNowProduct(p);
        } else {
          // Fetch cart products
          if (cart.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
          }
          const fetchedProducts = await productService.getProducts({});
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        toast.error('ไม่สามารถโหลดข้อมูลสินค้าได้');
      } finally {
        setLoading(false);
      }
    };

    loadProductsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyNowId, cart.length]);

  // Autofill shipping address from user profile
  useEffect(() => {
    if (user?.address?.street && user?.address?.district && user?.address?.province) {
      setShippingAddress({
        street: user.address.street || '',
        subDistrict: user.address.subDistrict || '',
        district: user.address.district || '',
        province: user.address.province || '',
        postalCode: user.address.postalCode || '',
      });
    }
  }, [user]);

  const getProduct = (id: string) => products.find(p => p.id === id);

  // Get active items to render/checkout
  const activeItems = useMemo(() => {
    if (isBuyNowMode) {
      if (!buyNowProduct) return [];
      return [{
        productId: buyNowProduct.id,
        quantity: buyNowQty,
        product: buyNowProduct
      }];
    }
    return cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      product: getProduct(item.productId)
    })).filter(item => item.product !== undefined);
  }, [isBuyNowMode, buyNowProduct, buyNowQty, cart, products]);

  const calculateTotal = () => {
    return activeItems.reduce((total, item) => {
      return total + ((item.product?.price || 0) * item.quantity);
    }, 0);
  };

  const requiresPrescription = activeItems.some(item => {
    return item.product?.requiresPrescription || item.product?.isControlled;
  });

  // File handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast.error('รองรับเฉพาะ JPG, PNG หรือ WEBP');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ขนาดไฟล์เกิน 5MB');
        return;
      }
      setPrescriptionFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast.error('รองรับเฉพาะ JPG, PNG หรือ WEBP');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ขนาดไฟล์เกิน 5MB');
        return;
      }
      setPrescriptionFile(file);
    }
  };

  const uploadPrescriptionImage = async (): Promise<string | null> => {
    if (!prescriptionFile) return null;

    const formData = new FormData();
    formData.append("file", prescriptionFile);

    const uploadRes = await fetch(`${API_URL}/upload/image/prescription`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error(err?.message || `ไม่สามารถอัปโหลดไฟล์รูปภาพได้`);
    }

    const { url } = await uploadRes.json();
    return url;
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      return;
    }

    if (requiresPrescription && !prescriptionFile) {
      toast.error('กรุณาอัปโหลดใบสั่งยา เนื่องจากมีรายการยาควบคุม');
      return;
    }

    const isAddressValid = !!shippingAddress.street.trim() && !!shippingAddress.district.trim() && !!shippingAddress.province.trim() && !!shippingAddress.subDistrict.trim() && !!shippingAddress.postalCode.trim();
    if (!isAddressValid) {
      toast.error('กรุณาระบุที่อยู่จัดส่งให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    try {
      let prescriptionImageUrl: string | undefined = undefined;
      if (requiresPrescription && prescriptionFile) {
        const url = await uploadPrescriptionImage();
        if (url) prescriptionImageUrl = url;
      }

      const orderedProductIds = activeItems.map(item => item.productId);

      const createdOrder = await orderService.createOrder({
        items: activeItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress: {
          street: shippingAddress.street.trim(),
          subDistrict: shippingAddress.subDistrict.trim(),
          district: shippingAddress.district.trim(),
          province: shippingAddress.province.trim(),
          postalCode: shippingAddress.postalCode.trim(),
        },
        notes,
        prescriptionImage: prescriptionImageUrl,
      });

      if (!isBuyNowMode) {
        removeItemsLocally(orderedProductIds);
      }

      // If user did not have an address saved, propose saving the typed address to their profile
      if (user && (!user.address || !user.address.street)) {
        await updateProfile({
          address: {
            street: shippingAddress.street.trim(),
            subDistrict: shippingAddress.subDistrict.trim(),
            district: shippingAddress.district.trim(),
            province: shippingAddress.province.trim(),
            postalCode: shippingAddress.postalCode.trim(),
          }
        });
      }

      toast.success('สั่งซื้อสินค้าสำเร็จ!');
      router.push(`/payment/${createdOrder.id}`);
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-primary/20 rounded-full mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (activeItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-24 h-24 text-slate-200 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">ไม่พบสินค้าในรายการสั่งซื้อ</h2>
        <p className="text-slate-600 mb-6">คุณยังไม่ได้เพิ่มสินค้าใดๆ หรือสินค้านี้อาจไม่มีอยู่แล้ว</p>
        <Link href="/">
          <button className="rounded-2xl border px-6 py-3 bg-white hover:bg-slate-50 font-semibold text-slate-700 transition">
            กลับไปเลือกซื้อสินค้า
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" />
            {isBuyNowMode ? 'สั่งซื้อทันที' : 'ตะกร้าสินค้า'}
          </h1>
          <Link href="/">
            <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              เลือกซื้อสินค้าต่อ
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-800">
          {/* Left Column: Items List & Upload */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              {activeItems.map((item) => {
                const product = item.product!;
                return (
                  <div key={item.productId} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 transition-all hover:shadow-md">
                    <div className="w-24 h-24 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-slate-800 line-clamp-2 pr-4 leading-tight">
                            {product.name}
                          </h3>
                          {!isBuyNowMode && (
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              title="ลบสินค้า"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">{product.description}</p>
                        {product.isControlled && (
                          <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded-md text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                            ยาควบคุม
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button
                            className="p-1.5 px-3 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            onClick={() => {
                              if (isBuyNowMode) setBuyNowQty(Math.max(1, buyNowQty - 1));
                              else updateQuantity(item.productId, item.quantity - 1);
                            }}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-4 py-1 text-sm font-semibold text-slate-800 border-x border-slate-200 bg-slate-50 min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            className="p-1.5 px-3 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            onClick={() => {
                              if (isBuyNowMode) setBuyNowQty(Math.min(product.stockQuantity, buyNowQty + 1));
                              else updateQuantity(item.productId, item.quantity + 1);
                            }}
                            disabled={item.quantity >= product.stockQuantity}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            ฿{(product.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* File Upload Section */}
            {requiresPrescription && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <h3 className="font-bold text-orange-900">ระบุข้อมูลทางการแพทย์ (มีรายการยาควบคุม)</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-600 mb-4">
                    กรุณาแนบรูปภาพใบสั่งยา หรือใบรับรองแพทย์ เพื่อให้เภสัชกรตรวจสอบความถูกต้องก่อนจัดส่ง
                  </p>

                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${dragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                      }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {prescriptionFile ? (
                      <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                        <FileCheck className="w-5 h-5" />
                        <span className="font-semibold text-sm truncate max-w-[200px]">{prescriptionFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                          <Upload className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="font-semibold text-slate-700">คลิกเพื่ออัปโหลด <span className="text-slate-500 font-normal">หรือลากไฟล์มาวาง</span></p>
                        <p className="text-xs text-slate-400">รองรับ JPG, PNG หรือ WEBP (ไม่เกิน 5MB)</p>
                      </>
                    )}
                  </div>
                  {prescriptionFile && (
                    <div className="mt-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPrescriptionFile(null); }}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                      >
                        ลบไฟล์ที่เลือก
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 sticky top-24 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">สรุปคำสั่งซื้อ</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span>ยอดรวม ({activeItems.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น)</span>
                  <span className="font-medium text-slate-900">฿{calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ค่าจัดส่ง</span>
                  <span className="font-medium text-emerald-600">ฟรี</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">ยอดรวมทั้งสิ้น</span>
                  <span className="text-3xl font-black text-primary">
                    ฿{calculateTotal().toLocaleString()}
                  </span>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-5">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700">ที่อยู่จัดส่ง <span className="text-rose-500">*</span></label>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">รายละเอียดที่อยู่ (บ้านเลขที่, ซอย, ถนน)</label>
                        <textarea
                          rows={2}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                          value={shippingAddress.street}
                          onChange={e => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">แขวง/ตำบล</label>
                          <input
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                            value={shippingAddress.subDistrict}
                            onChange={e => setShippingAddress({ ...shippingAddress, subDistrict: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">เขต/อำเภอ</label>
                          <input
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                            value={shippingAddress.district}
                            onChange={e => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">จังหวัด</label>
                          <input
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                            value={shippingAddress.province}
                            onChange={e => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">รหัสไปรษณีย์</label>
                          <input
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                            value={shippingAddress.postalCode}
                            onChange={e => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">หมายเหตุถึงร้านค้า <span className="text-slate-400 font-normal">(ถ้ามี)</span></label>
                    <textarea
                      placeholder="ฝากบอกเภสัชกร หรือรายละเอียดเพิ่มเติม..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 placeholder:text-slate-400"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-8 bg-primary hover:bg-primary/90 text-white font-bold text-lg py-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleCheckout}
                disabled={isSubmitting || (requiresPrescription && !prescriptionFile) || !shippingAddress.street.trim() || !shippingAddress.subDistrict.trim() || !shippingAddress.district.trim() || !shippingAddress.province.trim() || !shippingAddress.postalCode.trim() || activeItems.length === 0}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    กำลังดำเนินการ...
                  </div>
                ) : 'ยืนยันการสั่งซื้อ'}
              </Button>

              {!isBuyNowMode && activeItems.length > 0 && (
                <button
                  onClick={clearCart}
                  disabled={isSubmitting}
                  className="w-full mt-4 text-sm font-semibold text-slate-400 hover:text-rose-500 transition-colors"
                >
                  ล้างตะกร้าสินค้า
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 pb-20 max-w-7xl mx-auto flex justify-center items-center"><p className="text-gray-500">กำลังโหลดข้อมูลตะกร้าสินค้า...</p></div>}>
      <CartContent />
    </Suspense>
  );
}
