'use client';

import { useState, useEffect } from 'react';
import { User as UserIcon, MapPin, Heart, Package, Edit2, Save, Clock, CheckCircle2, Truck, CheckCheck, FileText } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Separator } from '@/app/components/ui/separator';
import { Checkbox } from '@/app/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { mockOrders } from '@/data/mockData';
import { toast } from 'sonner';

const COMMON_ALLERGIES = [
  'เพนิซิลลิน (Penicillin)',
  'แอสไพริน (Aspirin)',
  'ไอบูโพรเฟน (Ibuprofen)',
  'ซัลโฟนาไมด์ (Sulfonamides)',
  'ยาแก้ชัก (Anticonvulsants)',
  'ยาชาเฉพาะที่ (Local Anesthetics)',
  'สารทึบรังสี (Iodine/Contrast Dye)',
  'ไม่มีประวัติแพ้ยา',
];

const COMMON_DISEASES = [
  'เบาหวาน (Diabetes)',
  'ความดันโลหิตสูง (Hypertension)',
  'ไขมันในเลือดสูง (Dyslipidemia)',
  'โรคหัวใจ (Heart Disease)',
  'หอบหืด (Asthma)',
  'โรคไตเรื้อรัง (Chronic Kidney Disease)',
  'โรคไทรอยด์ (Thyroid Disease)',
  'ไม่มีโรคประจำตัว',
];

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address?.street || '');
  const [district, setDistrict] = useState(user?.address?.district || '');
  const [province, setProvince] = useState(user?.address?.province || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');

  // Health data state - using arrays for checkboxes
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [otherAllergies, setOtherAllergies] = useState('');

  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [otherDiseases, setOtherDiseases] = useState('');

  const [currentMedications, setCurrentMedications] = useState(
    user?.healthData?.currentMedications?.join(', ') || ''
  );

  // Initialize health data from user profile
  useEffect(() => {
    if (user?.healthData) {
      const uAllergies = user.healthData.allergies || [];
      const commonA = uAllergies.filter(a => COMMON_ALLERGIES.includes(a));
      const otherA = uAllergies.filter(a => !COMMON_ALLERGIES.includes(a)).join(', ');

      // Only update if changed
      if (JSON.stringify(selectedAllergies) !== JSON.stringify(commonA)) {
        setSelectedAllergies(commonA);
      }
      if (otherAllergies !== otherA) {
        setOtherAllergies(otherA);
      }

      const uDiseases = user.healthData.chronicDiseases || [];
      const commonD = uDiseases.filter(d => COMMON_DISEASES.includes(d));
      const otherD = uDiseases.filter(d => !COMMON_DISEASES.includes(d)).join(', ');

      if (JSON.stringify(selectedDiseases) !== JSON.stringify(commonD)) {
        setSelectedDiseases(commonD);
      }
      if (otherDiseases !== otherD) {
        setOtherDiseases(otherD);
      }
    }
  }, [user]);

  const handleToggleAllergy = (allergy: string) => {
    if (allergy === 'ไม่มีประวัติแพ้ยา') {
      setSelectedAllergies(['ไม่มีประวัติแพ้ยา']);
      setOtherAllergies('');
      return;
    }

    setSelectedAllergies(prev => {
      const filtered = prev.filter(a => a !== 'ไม่มีประวัติแพ้ยา');
      if (filtered.includes(allergy)) {
        return filtered.filter(a => a !== allergy);
      } else {
        return [...filtered, allergy];
      }
    });
  };

  const handleToggleDisease = (disease: string) => {
    if (disease === 'ไม่มีโรคประจำตัว') {
      setSelectedDiseases(['ไม่มีโรคประจำตัว']);
      setOtherDiseases('');
      return;
    }

    setSelectedDiseases(prev => {
      const filtered = prev.filter(d => d !== 'ไม่มีโรคประจำตัว');
      if (filtered.includes(disease)) {
        return filtered.filter(d => d !== disease);
      } else {
        return [...filtered, disease];
      }
    });
  };

  const handleSaveProfile = () => {
    const finalAllergies = [...selectedAllergies];
    if (otherAllergies.trim()) {
      otherAllergies.split(',').forEach(a => {
        const trimmed = a.trim();
        if (trimmed && !finalAllergies.includes(trimmed)) {
          finalAllergies.push(trimmed);
        }
      });
    }

    const finalDiseases = [...selectedDiseases];
    if (otherDiseases.trim()) {
      otherDiseases.split(',').forEach(d => {
        const trimmed = d.trim();
        if (trimmed && !finalDiseases.includes(trimmed)) {
          finalDiseases.push(trimmed);
        }
      });
    }

    updateProfile({
      name,
      email,
      phone,
      address: { street: address, district, province, postalCode },
      healthData: {
        allergies: finalAllergies,
        chronicDiseases: finalDiseases,
        currentMedications: currentMedications.split(',').map(m => m.trim()).filter(Boolean),
      },
    });
    setIsEditing(false);
    toast.success('บันทึกข้อมูลสำเร็จ');
  };

  const userOrders = mockOrders.filter(order => order.userId === user?.id);

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      pending: 'secondary',
      verified: 'default',
      preparing: 'default',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };

    const labels: { [key: string]: string } = {
      pending: 'รอตรวจสอบ',
      prescription_request: 'รอเภสัชกรจัดยา',
      verified: 'ตรวจสอบแล้ว',
      preparing: 'กำลังเตรียมสินค้า',
      shipped: 'จัดส่งแล้ว',
      delivered: 'ส่งสำเร็จ',
      cancelled: 'ยกเลิก',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getOrderTrackingSteps = (currentStatus: string) => {
    const statusOrder = ['pending', 'prescription_request', 'verified', 'preparing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    const steps = [
      { id: 'pending', name: 'รอตรวจสอบ', icon: Clock },
      { id: 'prescription_request', name: 'รอเภสัชกรจัดยา', icon: FileText },
      { id: 'verified', name: 'ตรวจสอบแล้ว', icon: CheckCircle2 },
      { id: 'preparing', name: 'กำลังเตรียมสินค้า', icon: Package },
      { id: 'shipped', name: 'จัดส่งแล้ว', icon: Truck },
      { id: 'delivered', name: 'ส่งสำเร็จ', icon: CheckCheck },
    ];

    return steps.map((step, index) => ({
      ...step,
      status: currentStatus === 'cancelled'
        ? 'cancelled'
        : index < currentIndex
          ? 'completed'
          : index === currentIndex
            ? 'current'
            : 'upcoming',
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">โปรไฟล์ของฉัน</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              แก้ไขข้อมูล
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
            <TabsTrigger value="health">ข้อมูลสุขภาพ</TabsTrigger>
            <TabsTrigger value="orders">ประวัติคำสั่งซื้อ</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    ข้อมูลส่วนตัว
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">อีเมล</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveProfile}>
                          <Save className="w-4 h-4 mr-2" />
                          บันทึกข้อมูล
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          ยกเลิก
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

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
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="district">เขต/อำเภอ</Label>
                      <Input
                        id="district"
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">จังหวัด</Label>
                      <Input
                        id="province"
                        value={province}
                        onChange={e => setProvince(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Health Data Tab */}
          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  ข้อมูลสุขภาพ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>สำคัญ:</strong> ข้อมูลเหล่านี้จะช่วยให้เภสัชกรตรวจสอบความปลอดภัยของยาที่คุณสั่งซื้อ
                    </p>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">ประวัติการแพ้ยา</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {COMMON_ALLERGIES.map((allergy) => (
                        <div key={allergy} className="flex items-center space-x-2">
                          <Checkbox
                            id={`allergy-${allergy}`}
                            checked={selectedAllergies.includes(allergy)}
                            onCheckedChange={() => handleToggleAllergy(allergy)}
                            disabled={!isEditing}
                          />
                          <label
                            htmlFor={`allergy-${allergy}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {allergy}
                          </label>
                        </div>
                      ))}
                    </div>
                    <Label htmlFor="other-allergies" className="text-sm text-gray-500 mb-1 block">อื่นๆ (ระบุชื่อยา ถ้ามี)</Label>
                    <Textarea
                      id="other-allergies"
                      placeholder="เช่น ยาแก้ปวดชนิดอื่น, อาหารทะเล (คั่นด้วยเครื่องหมายจุลภาค)"
                      value={otherAllergies}
                      onChange={e => setOtherAllergies(e.target.value)}
                      disabled={!isEditing || selectedAllergies.includes('ไม่มีประวัติแพ้ยา')}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">โรคประจำตัว</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {COMMON_DISEASES.map((disease) => (
                        <div key={disease} className="flex items-center space-x-2">
                          <Checkbox
                            id={`disease-${disease}`}
                            checked={selectedDiseases.includes(disease)}
                            onCheckedChange={() => handleToggleDisease(disease)}
                            disabled={!isEditing}
                          />
                          <label
                            htmlFor={`disease-${disease}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {disease}
                          </label>
                        </div>
                      ))}
                    </div>
                    <Label htmlFor="other-diseases" className="text-sm text-gray-500 mb-1 block">อื่นๆ (ระบุชื่อโรค ถ้ามี)</Label>
                    <Textarea
                      id="other-diseases"
                      placeholder="เช่น โรคตับ, โรคเลือด (คั่นด้วยเครื่องหมายจุลภาค)"
                      value={otherDiseases}
                      onChange={e => setOtherDiseases(e.target.value)}
                      disabled={!isEditing || selectedDiseases.includes('ไม่มีโรคประจำตัว')}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="medications">ยาที่ทานอยู่ปัจจุบัน</Label>
                    <Textarea
                      id="medications"
                      placeholder="เช่น เมทฟอร์มิน, แอมโลดิพีน (คั่นด้วยเครื่องหมายจุลภาค)"
                      value={currentMedications}
                      onChange={e => setCurrentMedications(e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile}>
                        <Save className="w-4 h-4 mr-2" />
                        บันทึกข้อมูล
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        ยกเลิก
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  ประวัติคำสั่งซื้อ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ยังไม่มีประวัติคำสั่งซื้อ</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map(order => {
                      const trackingSteps = getOrderTrackingSteps(order.status);

                      return (
                        <div key={order.id} className="border rounded-lg p-4 sm:p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold">{order.id}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>

                          {/* Order Tracking Timeline */}
                          {order.status !== 'cancelled' && (
                            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                              <h5 className="text-sm font-semibold mb-3 text-gray-700">สถานะการจัดส่ง</h5>
                              <div className="relative">
                                {/* Progress Line */}
                                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 hidden sm:block"
                                  style={{ left: '3%', right: '3%' }}></div>

                                {/* Steps */}
                                <div className="relative flex flex-col sm:flex-row justify-between gap-4 sm:gap-2">
                                  {trackingSteps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isCompleted = step.status === 'completed';
                                    const isCurrent = step.status === 'current';

                                    return (
                                      <div key={step.id} className="flex sm:flex-col items-start sm:items-center flex-1 gap-3 sm:gap-1">
                                        {/* Mobile connection line */}
                                        {index < trackingSteps.length - 1 && (
                                          <div className="absolute left-[14px] w-0.5 bg-gray-200 sm:hidden"
                                            style={{ top: '30px', height: 'calc(100% - 30px)' }}></div>
                                        )}

                                        {/* Icon */}
                                        <div className={`relative z-10 w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isCompleted
                                          ? 'bg-green-500 text-white'
                                          : isCurrent
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-gray-200 text-gray-400'
                                          }`}>
                                          <Icon className="w-3 h-3 sm:w-5 sm:h-5" />
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 sm:text-center">
                                          <p className={`text-xs sm:text-sm ${isCurrent ? 'text-primary font-semibold' : isCompleted ? 'text-green-600 font-medium' : 'text-gray-400'
                                            }`}>
                                            {step.name}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {order.status === 'cancelled' && (
                            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg">
                              <p className="text-sm text-red-800">
                                <strong>คำสั่งซื้อถูกยกเลิก</strong>
                              </p>
                            </div>
                          )}

                          <Separator className="my-3" />

                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {item.product.name} x{item.quantity}
                                </span>
                                <span className="font-medium">
                                  ฿{(item.product.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          <Separator className="my-3" />

                          <div className="flex justify-between items-center">
                            <span className="font-semibold">ยอดรวม</span>
                            <span className="text-lg font-bold text-primary">
                              ฿{order.totalAmount.toLocaleString()}
                            </span>
                          </div>

                          {order.pharmacistNotes && (
                            <div className="mt-3 bg-accent p-3 rounded-lg">
                              <p className="text-xs text-primary font-semibold mb-1">
                                หมายเหตุจากเภสัชกร:
                              </p>
                              <p className="text-sm text-foreground">{order.pharmacistNotes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
