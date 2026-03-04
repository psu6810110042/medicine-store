'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { mockOrders } from '@/data/mockData';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PrescriptionService() {
  const { user } = useAuth();
  const router = useRouter();
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock image upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
      return;
    }

    if (!prescriptionImage) {
      toast.error('กรุณาอัปโหลดรูปใบสั่งแพทย์');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newOrder = {
        id: `PRE-${Date.now()}`,
        userId: user.id,
        items: [], // Empty initially, to be filled by pharmacist
        totalAmount: 0,
        status: 'prescription_request',
        prescriptionImage: prescriptionImage,
        createdAt: new Date().toISOString(),
        userNotes: notes, // Save user notes here
        pharmacistNotes: '', // Initialize pharmacist notes as empty
      };

      // In a real app, this would be saved to a database
      mockOrders.push(newOrder as any);

      setIsSubmitting(false);
      setStep(3);
      toast.success('ส่งใบสั่งแพทย์สำเร็จ เภสัชกรจะตรวจสอบและเพิ่มยาให้ท่านโดยเร็วที่สุด');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">บริการสั่งยาตามใบสั่งแพทย์</h1>
          <p className="mt-2 text-gray-600">
            อัปโหลดใบสั่งแพทย์เพื่อให้เภสัชกรจัดยาและส่งให้คุณถึงบ้าน
          </p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>ขั้นตอนที่ 1: อัปโหลดใบสั่งแพทย์</CardTitle>
              <CardDescription>
                กรุณาถ่ายภาพใบสั่งแพทย์ที่ชัดเจน ครบถ้วน เพื่อความถูกต้องในการจัดยา
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                {prescriptionImage ? (
                  <div className="relative">
                    <img
                      src={prescriptionImage}
                      alt="Prescription preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setPrescriptionImage(null)}
                    >
                      เปลี่ยนรูปภาพ
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <span className="text-primary font-medium">คลิกเพื่ออัปโหลด</span>
                    <span className="text-gray-500"> หรือลากไฟล์มาวางที่นี่</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <Button
                className="w-full"
                disabled={!prescriptionImage}
                onClick={() => setStep(2)}
              >
                ถัดไป
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>ขั้นตอนที่ 2: ระบุข้อมูลเพิ่มเติม</CardTitle>
              <CardDescription>
                ระบุข้อมูลหรือคำถามที่ต้องการสอบถามเภสัชกร (ถ้ามี)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notes">หมายเหตุถึงเภสัชกร</Label>
                <Textarea
                  id="notes"
                  placeholder="เช่น ต้องการทราบราคาประเมินก่อน, แจ้งอาการเพิ่มเติม..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  ย้อนกลับ
                </Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งใบสั่งแพทย์'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ส่งข้อมูลสำเร็จ!</h2>
                <p className="text-gray-600 mt-2">
                  เภสัชกรได้รับใบสั่งแพทย์ของคุณแล้ว จะทำการตรวจสอบและจัดยาลงในระบบ
                  คุณจะได้รับการแจ้งเตือนเมื่อคำสั่งซื้อพร้อมสำหรับการชำระเงิน
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => router.push('/profile')}>ดูประวัติการสั่งซื้อ</Button>
                <Button variant="outline" onClick={() => router.push('/')}>
                  กลับหน้าแรก
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
