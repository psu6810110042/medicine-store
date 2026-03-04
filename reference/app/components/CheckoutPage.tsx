'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, CheckCircle2, FileText, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Separator } from '@/app/components/ui/separator';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, getControlledItems, clearCart } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState(user?.address?.street || '');
  const [district, setDistrict] = useState(user?.address?.district || '');
  const [province, setProvince] = useState(user?.address?.province || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [paymentSlipFile, setPaymentSlipFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const hasControlledMedicine = getControlledItems().length > 0;
  const requiresPrescription = cart.some(item => item.product.requiresPrescription);

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart.length, router]);

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์มีขนาดใหญ่เกิน 5MB');
        return;
      }
      setPrescriptionFile(file);
      toast.success('อัปโหลดใบสั่งแพทย์สำเร็จ');
    }
  };

  const handlePaymentSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์มีขนาดใหญ่เกิน 5MB');
        return;
      }
      setPaymentSlipFile(file);
      toast.success('อัปโหลดสลิปการโอนเงินสำเร็จ');
    }
  };

  const handleSubmitOrder = () => {
    // Validation
    if (!address || !district || !province || !postalCode || !phone) {
      toast.error('กรุณากรอกที่อยู่จัดส่งให้ครบถ้วน');
      return;
    }

    if (requiresPrescription && !prescriptionFile) {
      toast.error('กรุณาอัปโหลดใบสั่งแพทย์');
      return;
    }

    if (!paymentSlipFile) {
      toast.error('กรุณาอัปโหลดสลิปการโอนเงิน');
      return;
    }

    // Create order (in real app, this would send to API)
    const orderId = `ORD-${Date.now()}`;

    toast.success('สั่งซื้อสำเร็จ! รอการตรวจสอบจากเภสัชกร');
    clearCart();

    // Navigate to order success page
    setTimeout(() => {
      router.push(`/order-success?orderId=${orderId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.push('/cart')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับไปยังตะกร้า
        </Button>

        <h1 className="text-3xl font-bold mb-6">ชำระเงิน</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  ที่อยู่จัดส่ง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">ที่อยู่</Label>
                    <Textarea
                      id="address"
                      placeholder="บ้านเลขที่ ถนน ซอย"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">เขต/อำเภอ</Label>
                      <Input
                        id="district"
                        placeholder="วัฒนา"
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">จังหวัด</Label>
                      <Input
                        id="province"
                        placeholder="กรุงเทพมหานคร"
                        value={province}
                        onChange={e => setProvince(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                      <Input
                        id="postalCode"
                        placeholder="10110"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                      <Input
                        id="phone"
                        placeholder="0812345678"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prescription Upload */}
            {requiresPrescription && (
              <Card className="border-yellow-200">
                <CardHeader className="bg-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-yellow-900">
                    <FileText className="w-5 h-5" />
                    อัปโหลดใบสั่งแพทย์ (จำเป็น)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                    <AlertDescription className="text-yellow-800">
                      คำสั่งซื้อของคุณมียาที่ต้องมีใบสั่งแพทย์ กรุณาอัปโหลดรูปใบสั่งแพทย์ที่ชัดเจน
                    </AlertDescription>
                  </Alert>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePrescriptionUpload}
                      className="hidden"
                      id="prescription-upload"
                    />
                    <label htmlFor="prescription-upload" className="cursor-pointer">
                      {prescriptionFile ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle2 className="w-6 h-6" />
                          <span>{prescriptionFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            คลิกเพื่ออัปโหลดใบสั่งแพทย์
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            รองรับไฟล์ JPG, PNG, PDF (สูงสุด 5MB)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  ชำระเงิน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">ข้อมูลบัญชีธนาคาร</h4>
                  <div className="space-y-1 text-sm">
                    <p>ธนาคารกสิกรไทย</p>
                    <p>เลขที่บัญชี: 123-4-56789-0</p>
                    <p>ชื่อบัญชี: บริษัท MEDS จำกัด</p>
                    <p className="font-semibold text-blue-600 mt-2">
                      ยอดโอน: ฿{getTotalPrice().toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentSlipUpload}
                    className="hidden"
                    id="payment-slip-upload"
                  />
                  <label htmlFor="payment-slip-upload" className="cursor-pointer">
                    {paymentSlipFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                        <span>{paymentSlipFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          อัปโหลดสลิปการโอนเงิน (จำเป็น)
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          รองรับไฟล์ JPG, PNG (สูงสุด 5MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>หมายเหตุเพิ่มเติม (ถ้ามี)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="ระบุข้อมูลเพิ่มเติมหรือคำขอพิเศษ..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product.name} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          ฿{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

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
                    onClick={handleSubmitOrder}
                  >
                    ยืนยันคำสั่งซื้อ
                  </Button>

                  {hasControlledMedicine && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-xs text-red-800">
                        คำสั่งซื้อของคุณจะได้รับการตรวจสอบโดยเภสัชกรก่อนจัดส่ง
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}