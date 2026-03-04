'use client';

import { CheckCircle2, Package, Clock, FileText, Truck, CheckCheck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  // Order tracking steps
  const trackingSteps = [
    {
      id: 1,
      name: 'รอตรวจสอบ',
      description: 'เภสัชกรกำลังตรวจสอบคำสั่งซื้อ',
      icon: Clock,
      status: 'current', // current, completed, upcoming
    },
    {
      id: 2,
      name: 'ตรวจสอบแล้ว',
      description: 'เภสัชกรอนุมัติคำสั่งซื้อ',
      icon: CheckCircle2,
      status: 'upcoming',
    },
    {
      id: 3,
      name: 'กำลังเตรียมสินค้า',
      description: 'กำลังจัดเตรียมสินค้าสำหรับจัดส่ง',
      icon: Package,
      status: 'upcoming',
    },
    {
      id: 4,
      name: 'จัดส่งแล้ว',
      description: 'สินค้าอยู่ระหว่างการจัดส่ง',
      icon: Truck,
      status: 'upcoming',
    },
    {
      id: 5,
      name: 'ส่งสำเร็จ',
      description: 'สินค้าถึงมือคุณแล้ว',
      icon: CheckCheck,
      status: 'upcoming',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full">
        <CardContent className="p-8 sm:p-12">
          <div className="text-center mb-8">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold mb-2">สั่งซื้อสำเร็จ!</h1>
            <p className="text-gray-600 mb-6">
              เราได้รับคำสั่งซื้อของคุณแล้ว
            </p>

            <div className="bg-accent p-6 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-1">เลขที่คำสั่งซื้อ</p>
              <p className="text-2xl font-bold text-primary">{orderId}</p>
            </div>
          </div>

          {/* Order Tracking Timeline */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-6 text-center">ติดตามสถานะคำสั่งซื้อ</h3>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-10 left-0 right-0 h-0.5 bg-gray-200 hidden sm:block"
                style={{ left: '5%', right: '5%' }}></div>

              {/* Steps */}
              <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-4">
                {trackingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';

                  return (
                    <div key={step.id} className="flex sm:flex-col items-start sm:items-center flex-1 gap-4 sm:gap-2">
                      {/* Mobile connection line */}
                      {index < trackingSteps.length - 1 && (
                        <div className="absolute left-[19px] w-0.5 h-full bg-gray-200 sm:hidden"
                          style={{ top: '40px', height: 'calc(100% - 40px)' }}></div>
                      )}

                      {/* Icon */}
                      <div className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                          ? 'bg-blue-500 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-400'
                        }`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 sm:text-center">
                        <p className={`font-semibold text-sm sm:text-base mb-1 ${isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`}>
                          {step.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-left">
              <strong>รอการตรวจสอบจากเภสัชกร</strong>
              <br />
              คำสั่งซื้อของคุณจะได้รับการตรวจสอบโดยเภสัชกรมืออาชีพภายใน 24 ชั่วโมง
              เพื่อความปลอดภัยของคุณ
            </AlertDescription>
          </Alert>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-left">ขั้นตอนถัดไป:</h3>

            <div className="flex gap-4 items-start text-left">
              <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">1. เภสัชกรตรวจสอบคำสั่งซื้อ</h4>
                <p className="text-sm text-gray-600">
                  เภสัชกรจะตรวจสอบใบสั่งแพทย์ (ถ้ามี) และความปลอดภัยของยาที่คุณสั่ง
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start text-left">
              <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">2. เตรียมสินค้าและจัดส่ง</h4>
                <p className="text-sm text-gray-600">
                  เมื่อได้รับการอนุมัติ เราจะเตรียมสินค้าและจัดส่งภายใน 24-48 ชั่วโมง
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start text-left">
              <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">3. รับสินค้า</h4>
                <p className="text-sm text-gray-600">
                  รับสินค้าที่บ้านและตรวจสอบความถูกต้อง
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={() => router.push('/profile')}>
              ดูประวัติคำสั่งซื้อ
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              กลับหน้าแรก
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
