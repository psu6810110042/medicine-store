'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Package,
  Clock,
  FileText,
  CheckCircle2,
  Truck,
  Save,
  Edit2,
  X,
} from 'lucide-react';
import { Order, OrderItem } from '@/app/types/order';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type HealthDataState = {
  allergies: string[];
  chronicDiseases: string[];
  currentMedications: string[];
};

const ALLERGY_OPTIONS = [
  'เพนิซิลลิน (Penicillin)',
  'ไอบูโพรเฟน (Ibuprofen)',
  'ยากันชัก (Anticonvulsants)',
  'สารทึบรังสี (Iodine/Contrast Dye)',
  'แอสไพริน (Aspirin)',
  'ซัลโฟนาไมด์ (Sulfonamides)',
  'ยาชาเฉพาะที่ (Local Anesthetics)',
];

const DISEASE_OPTIONS = [
  'เบาหวาน (Diabetes)',
  'ไขมันในเลือดสูง (Dyslipidemia)',
  'หอบหืด (Asthma)',
  'โรคไทรอยด์ (Thyroid Disease)',
  'ความดันโลหิตสูง (Hypertension)',
  'โรคหัวใจ (Heart Disease)',
  'โรคไตเรื้อรัง (Chronic Kidney Disease)',
];

function toggleInList(list: string[], value: string) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function isMedicineOrMedicalDeviceOrder(order: Order) {
  return (order.items || []).some((item) => {
    const product = item.product;
    if (!product) return false;

    const categoryId = String(product.categoryId || '').toLowerCase();

    return (
      product.requiresPrescription ||
      product.isControlled ||
      categoryId === 'medical-device' ||
      categoryId.includes('medicine') ||
      categoryId.includes('drug') ||
      categoryId.includes('pharma') ||
      categoryId.includes('painkiller') ||
      categoryId.includes('antibiotic') ||
      categoryId.includes('chronic')
    );
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, checkAuth, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'personal' | 'health' | 'orders'>('personal');

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      subDistrict: '',
      district: '',
      province: '',
      postalCode: '',
    },
  });

  const initialHealth: HealthDataState = useMemo(
    () => ({
      allergies: user?.healthData?.allergies ?? [],
      chronicDiseases: user?.healthData?.chronicDiseases ?? [],
      currentMedications: user?.healthData?.currentMedications ?? [],
    }),
    [user]
  );

  const [health, setHealth] = useState<HealthDataState>(initialHealth);
  const [otherAllergy, setOtherAllergy] = useState('');
  const [otherDisease, setOtherDisease] = useState('');
  const [currentMedsText, setCurrentMedsText] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setPersonalForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          subDistrict: user.address?.subDistrict || '',
          district: user.address?.district || '',
          province: user.address?.province || '',
          postalCode: user.address?.postalCode || '',
        },
      });
    }
  }, [user]);

  useEffect(() => {
    setHealth(initialHealth);
    setCurrentMedsText((initialHealth.currentMedications ?? []).join(', '));
  }, [initialHealth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/orders/my`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort(
          (a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      }
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-lg font-semibold">ยังไม่ได้เข้าสู่ระบบ</div>
          <div className="mt-2 text-sm text-slate-600">
            กรุณาเข้าสู่ระบบก่อนเพื่อดูโปรไฟล์
          </div>
          <button
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-white"
            onClick={() => router.push('/')}
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  const handleSavePersonal = async () => {
    const success = await updateProfile(personalForm);
    if (success) {
      setIsEditingPersonal(false);
      alert('บันทึกข้อมูลส่วนตัวเรียบร้อย');
    } else {
      alert('บันทึกไม่สำเร็จ โปรดลองอีกครั้ง');
    }
  };

  const cancelEditPersonal = () => {
    setIsEditingPersonal(false);
    if (user) {
      setPersonalForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          subDistrict: user.address?.subDistrict || '',
          district: user.address?.district || '',
          province: user.address?.province || '',
          postalCode: user.address?.postalCode || '',
        },
      });
    }
  };

  const noAllergyChecked = health.allergies.includes('ไม่มีประวัติแพ้ยา');
  const noDiseaseChecked = health.chronicDiseases.includes('ไม่มีโรคประจำตัว');

  const onToggleNoAllergy = () => {
    setHealth((prev) => ({
      ...prev,
      allergies: prev.allergies.includes('ไม่มีประวัติแพ้ยา')
        ? []
        : ['ไม่มีประวัติแพ้ยา'],
    }));
    setOtherAllergy('');
  };

  const onToggleNoDisease = () => {
    setHealth((prev) => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.includes('ไม่มีโรคประจำตัว')
        ? []
        : ['ไม่มีโรคประจำตัว'],
    }));
    setOtherDisease('');
  };

  const onToggleAllergy = (label: string) => {
    setHealth((prev) => {
      const cleaned = prev.allergies.filter((x) => x !== 'ไม่มีประวัติแพ้ยา');
      return { ...prev, allergies: toggleInList(cleaned, label) };
    });
  };

  const onToggleDisease = (label: string) => {
    setHealth((prev) => {
      const cleaned = prev.chronicDiseases.filter((x) => x !== 'ไม่มีโรคประจำตัว');
      return { ...prev, chronicDiseases: toggleInList(cleaned, label) };
    });
  };

  const onAddOtherAllergy = () => {
    const value = otherAllergy.trim();
    if (!value) return;

    setHealth((prev) => {
      const cleaned = prev.allergies.filter((x) => x !== 'ไม่มีประวัติแพ้ยา');
      if (cleaned.includes(value)) return prev;
      return { ...prev, allergies: [...cleaned, value] };
    });
    setOtherAllergy('');
  };

  const onAddOtherDisease = () => {
    const value = otherDisease.trim();
    if (!value) return;

    setHealth((prev) => {
      const cleaned = prev.chronicDiseases.filter((x) => x !== 'ไม่มีโรคประจำตัว');
      if (cleaned.includes(value)) return prev;
      return { ...prev, chronicDiseases: [...cleaned, value] };
    });
    setOtherDisease('');
  };

  const onSaveHealth = async () => {
    const meds = currentMedsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedHealth = { ...health, currentMedications: meds };
    setHealth(updatedHealth);

    const success = await updateProfile({ healthData: updatedHealth });
    if (success) {
      alert('บันทึกข้อมูลสุขภาพเรียบร้อย');
    } else {
      alert('บันทึกไม่สำเร็จ โปรดลองอีกครั้ง');
    }
  };

  const getStatusBadge = (status: string, orderNeedsPharmacistFlow: boolean) => {
    const normalizedStatus = status.toUpperCase();
    const effectiveStatus =
      !orderNeedsPharmacistFlow && normalizedStatus === 'PRESCRIPTION'
        ? 'PENDING_REVIEW'
        : !orderNeedsPharmacistFlow && normalizedStatus === 'STOCK'
        ? 'PROCESSING'
        : normalizedStatus;

    const variants: { [key: string]: string } = {
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PRESCRIPTION: 'bg-blue-100 text-blue-800 border-blue-200',
      STOCK: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      PROCESSING: 'bg-orange-100 text-orange-800 border-orange-200',
      DONE: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels: { [key: string]: string } = {
      PENDING_REVIEW: 'รอตรวจสอบ/รอชำระเงิน',
      PRESCRIPTION: 'รอเภสัชกรอนุมัติใบสั่งยา',
      STOCK: 'ตรวจสอบแล้ว',
      PROCESSING: 'กำลังเตรียมสินค้า / จัดส่ง',
      DONE: 'ส่งสำเร็จ',
      CANCELLED: 'ยกเลิก',
    };

    return (
      <span
        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
          variants[effectiveStatus] ||
          'border-slate-200 bg-slate-100 text-slate-800'
        }`}
      >
        {labels[effectiveStatus] || status}
      </span>
    );
  };

  const getOrderTrackingSteps = (
    currentStatus: string,
    orderNeedsPharmacistFlow: boolean
  ) => {
    const normalizedStatus = currentStatus.toUpperCase();
    const statusOrder = orderNeedsPharmacistFlow
      ? ['PENDING_REVIEW', 'PRESCRIPTION', 'STOCK', 'PROCESSING', 'DONE']
      : ['PENDING_REVIEW', 'PROCESSING', 'DONE'];

    const effectiveStatus = ['PENDING_REVIEW', 'UNPAID'].includes(normalizedStatus)
      ? 'PENDING_REVIEW'
      : !orderNeedsPharmacistFlow && normalizedStatus === 'PRESCRIPTION'
      ? 'PENDING_REVIEW'
      : !orderNeedsPharmacistFlow && normalizedStatus === 'STOCK'
      ? 'PROCESSING'
      : normalizedStatus;

    const currentIndex = statusOrder.indexOf(effectiveStatus);

    const fullSteps = [
      { id: 'PENDING_REVIEW', name: 'รอตรวจสอบ', icon: Clock },
      { id: 'PRESCRIPTION', name: 'รอเภสัชกรอนุมัติใบสั่งยา', icon: FileText },
      { id: 'STOCK', name: 'ตรวจสอบแล้ว', icon: CheckCircle2 },
      { id: 'PROCESSING', name: 'กำลังเตรียมสินค้า', icon: Package },
      { id: 'DONE', name: 'จัดส่งแล้ว', icon: Truck },
    ];

    const steps = orderNeedsPharmacistFlow
      ? fullSteps
      : fullSteps.filter((step) => step.id !== 'PRESCRIPTION' && step.id !== 'STOCK');

    return steps.map((step, index) => ({
      ...step,
      status:
        normalizedStatus === 'CANCELLED'
          ? 'cancelled'
          : index < currentIndex
          ? 'completed'
          : index === currentIndex
          ? 'current'
          : 'upcoming',
    }));
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] min-h-[600px] w-full max-w-5xl flex-col px-4 py-4 md:py-6">
      <div className="flex-none rounded-3xl border bg-gradient-to-r from-sky-50 to-emerald-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold text-slate-900">โปรไฟล์ของคุณ</div>
            <div className="text-sm text-slate-600">
              จัดการข้อมูลส่วนตัว ข้อมูลสุขภาพ และประวัติคำสั่งซื้อ
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border bg-white px-3 py-1 text-sm font-semibold text-emerald-700 shadow-sm">
              {user.role === 'customer' ? 'Customer' : user.role}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'personal' | 'health' | 'orders')
            }
          >
            <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
              <TabsTrigger
                value="personal"
                className="rounded-full border px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                ข้อมูลส่วนตัว
              </TabsTrigger>

              <TabsTrigger
                value="health"
                className="rounded-full border px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                ข้อมูลสุขภาพ
              </TabsTrigger>

              <TabsTrigger
                value="orders"
                className="rounded-full border px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                ประวัติคำสั่งซื้อ
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mt-4 w-full flex-1 overflow-y-auto pb-8 pr-2">
        {activeTab === 'personal' && (
          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard
              title="ข้อมูลส่วนตัว"
              action={
                !isEditingPersonal ? (
                  <button
                    onClick={() => setIsEditingPersonal(true)}
                    className="flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700"
                  >
                    <Edit2 className="h-4 w-4" /> แก้ไขข้อมูล
                  </button>
                ) : null
              }
            >
              {isEditingPersonal ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      ชื่อ-สกุล
                    </label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                      value={personalForm.fullName}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, fullName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      อีเมล
                    </label>
                    <input
                      disabled
                      className="w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none"
                      value={personalForm.email}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                      value={personalForm.phone}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <h4 className="mb-3 font-semibold text-slate-900">ที่อยู่จัดส่ง</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          รายละเอียดที่อยู่
                        </label>
                        <textarea
                          rows={2}
                          className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                          value={personalForm.address.street}
                          onChange={(e) =>
                            setPersonalForm({
                              ...personalForm,
                              address: {
                                ...personalForm.address,
                                street: e.target.value,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            แขวง/ตำบล
                          </label>
                          <input
                            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                            value={personalForm.address.subDistrict}
                            onChange={(e) =>
                              setPersonalForm({
                                ...personalForm,
                                address: {
                                  ...personalForm.address,
                                  subDistrict: e.target.value,
                                },
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            เขต/อำเภอ
                          </label>
                          <input
                            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                            value={personalForm.address.district}
                            onChange={(e) =>
                              setPersonalForm({
                                ...personalForm,
                                address: {
                                  ...personalForm.address,
                                  district: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            จังหวัด
                          </label>
                          <input
                            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                            value={personalForm.address.province}
                            onChange={(e) =>
                              setPersonalForm({
                                ...personalForm,
                                address: {
                                  ...personalForm.address,
                                  province: e.target.value,
                                },
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            รหัสไปรษณีย์
                          </label>
                          <input
                            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                            value={personalForm.address.postalCode}
                            onChange={(e) =>
                              setPersonalForm({
                                ...personalForm,
                                address: {
                                  ...personalForm.address,
                                  postalCode: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleSavePersonal}
                      className="flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
                      <Save className="h-4 w-4" /> บันทึก
                    </button>
                    <button
                      onClick={cancelEditPersonal}
                      className="flex items-center gap-1 rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <X className="h-4 w-4" /> ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <InfoRow label="ชื่อ-สกุล" value={user.fullName || '-'} />
                  <InfoRow label="อีเมล" value={user.email || '-'} />
                  <InfoRow label="เบอร์โทร" value={user.phone || '-'} />
                  <InfoRow
                    label="ที่อยู่จัดส่ง"
                    value={
                      user.address && user.address.street && user.address.province
                        ? `${user.address.street} ${user.address.subDistrict || ''} ${user.address.district} ${user.address.province} ${user.address.postalCode}`.replace(
                            /\s+/g,
                            ' '
                          )
                        : '-'
                    }
                  />
                </>
              )}
            </SectionCard>

            <SectionCard title="การใช้งานระบบ">
              <div className="space-y-3">
                <button
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-left font-semibold text-slate-700 shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50"
                  onClick={() => router.push('/products')}
                >
                  ช้อปปิ้งสินค้า
                </button>

                <button
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-left font-semibold text-slate-700 shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50"
                  onClick={() => router.push('/cart')}
                >
                  ตะกร้าสินค้าของฉัน
                </button>

                <div className="my-2 border-t border-slate-100"></div>

                <button
                  className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-center font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                  onClick={logout}
                >
                  ออกจากระบบ
                </button>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard title="ข้อมูลสุขภาพ">
              <div className="rounded-2xl border bg-amber-50 px-4 py-3 text-sm text-amber-900">
                สำคัญ: ข้อมูลนี้ช่วยให้เภสัชกรตรวจสอบความปลอดภัยของยาที่คุณจะได้รับ
              </div>

              <div className="mt-5">
                <div className="text-base font-bold text-slate-900">ประวัติการแพ้ยา</div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {ALLERGY_OPTIONS.map((opt) => (
                    <CheckItem
                      key={opt}
                      label={opt}
                      checked={!noAllergyChecked && health.allergies.includes(opt)}
                      disabled={noAllergyChecked}
                      onChange={() => onToggleAllergy(opt)}
                    />
                  ))}

                  <CheckItem
                    label="ไม่มีประวัติแพ้ยา"
                    checked={noAllergyChecked}
                    onChange={onToggleNoAllergy}
                  />
                </div>

                <div className="mt-3">
                  <div className="text-sm font-semibold text-slate-700">
                    อื่นๆ (ระบุชื่อยา/กลุ่มยา)
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={otherAllergy}
                      onChange={(e) => setOtherAllergy(e.target.value)}
                      disabled={noAllergyChecked}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                      placeholder="เช่น เพนิซิลลิน, กุ้ง"
                    />
                    <button
                      onClick={onAddOtherAllergy}
                      disabled={noAllergyChecked}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-base font-bold text-slate-900">โรคประจำตัว</div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {DISEASE_OPTIONS.map((opt) => (
                    <CheckItem
                      key={opt}
                      label={opt}
                      checked={!noDiseaseChecked && health.chronicDiseases.includes(opt)}
                      disabled={noDiseaseChecked}
                      onChange={() => onToggleDisease(opt)}
                    />
                  ))}

                  <CheckItem
                    label="ไม่มีโรคประจำตัว"
                    checked={noDiseaseChecked}
                    onChange={onToggleNoDisease}
                  />
                </div>

                <div className="mt-3">
                  <div className="text-sm font-semibold text-slate-700">
                    อื่นๆ (ระบุชื่อโรค)
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={otherDisease}
                      onChange={(e) => setOtherDisease(e.target.value)}
                      disabled={noDiseaseChecked}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                      placeholder="เช่น ไมเกรน, กรดไหลย้อน"
                    />
                    <button
                      onClick={onAddOtherDisease}
                      disabled={noDiseaseChecked}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-base font-bold text-slate-900">ยาที่ทานอยู่ปัจจุบัน</div>
                <div className="mt-2 text-sm text-slate-600">
                  ใส่ได้หลายรายการ คั่นด้วยเครื่องหมายคอมม่า ( , )
                </div>
                <textarea
                  value={currentMedsText}
                  onChange={(e) => setCurrentMedsText(e.target.value)}
                  className="mt-2 min-h-[88px] w-full rounded-2xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="เช่น เมทฟอร์มิน, แอมโลดิพีน"
                />
              </div>

              <div className="mt-6">
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800"
                  onClick={onSaveHealth}
                >
                  <Save className="h-5 w-5" /> บันทึกข้อมูลสุขภาพ
                </button>
              </div>
            </SectionCard>

            <SectionCard title="สรุปข้อมูลสุขภาพ (ที่บันทึกแล้ว)">
              <SummaryBox
                title="ประวัติการแพ้ยา"
                value={
                  user.healthData?.allergies && user.healthData.allergies.length
                    ? user.healthData.allergies.join(', ')
                    : 'ยังไม่ได้ระบุ / ไม่มี'
                }
              />
              <SummaryBox
                title="โรคประจำตัว"
                value={
                  user.healthData?.chronicDiseases &&
                  user.healthData.chronicDiseases.length
                    ? user.healthData.chronicDiseases.join(', ')
                    : 'ยังไม่ได้ระบุ / ไม่มี'
                }
              />
              <SummaryBox
                title="ยาที่ใช้อยู่"
                value={
                  user.healthData?.currentMedications &&
                  user.healthData.currentMedications.length
                    ? user.healthData.currentMedications.join(', ')
                    : 'ยังไม่ได้ระบุ / ไม่มี'
                }
              />
            </SectionCard>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="max-w-4xl">
            <SectionCard title="ประวัติคำสั่งซื้อ">
              {isLoadingOrders ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
                  <p className="mt-4 text-sm text-slate-500">กำลังโหลดคำสั่งซื้อ...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto mb-4 h-16 w-16 text-slate-200" />
                  <p className="font-medium text-slate-500">ยังไม่มีประวัติคำสั่งซื้อ</p>
                  <button
                    className="mt-4 rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    onClick={() => router.push('/products')}
                  >
                    เริ่มช้อปปิ้งเลย
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  {orders.map((order) => {
                    const orderNeedsPharmacistFlow = isMedicineOrMedicalDeviceOrder(order);
                    const trackingSteps = getOrderTrackingSteps(
                      order.status,
                      orderNeedsPharmacistFlow
                    );

                    return (
                      <div
                        key={order.id}
                        className="rounded-2xl border bg-white p-5 shadow-sm transition-colors hover:border-sky-200"
                      >
                        <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900">
                                คำสั่งซื้อ #{order.id.slice(0, 8).toUpperCase()}
                              </h4>
                              {getStatusBadge(order.status, orderNeedsPharmacistFlow)}
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-sm text-slate-500">ยอดรวม</span>
                            <div className="text-lg font-bold text-emerald-600">
                              ฿{Number(order.totalAmount).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {order.status.toUpperCase() !== 'CANCELLED' && (
                          <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <h5 className="mb-4 text-sm font-bold text-slate-800">
                              สถานะการจัดส่ง
                            </h5>
                            <div className="relative">
                              <div
                                className="absolute left-0 right-0 top-5 hidden h-0.5 bg-slate-200 sm:block"
                                style={{ left: '5%', right: '5%' }}
                              ></div>

                              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:gap-2">
                                {trackingSteps.map((step, index) => {
                                  const Icon = step.icon;
                                  const isCompleted = step.status === 'completed';
                                  const isCurrent = step.status === 'current';

                                  return (
                                    <div
                                      key={step.id}
                                      className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:gap-2"
                                    >
                                      {index < trackingSteps.length - 1 && (
                                        <div
                                          className="absolute left-[14px] w-0.5 bg-slate-200 sm:hidden"
                                          style={{
                                            top: '30px',
                                            height: 'calc(100% - 30px)',
                                          }}
                                        ></div>
                                      )}

                                      <div
                                        className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm transition-colors sm:h-10 sm:w-10 ${
                                          isCompleted
                                            ? 'bg-emerald-500 text-white shadow-emerald-200'
                                            : isCurrent
                                            ? 'bg-sky-500 text-white shadow-sky-200 ring-4 ring-sky-100'
                                            : 'border-2 border-slate-200 bg-white text-slate-400'
                                        }`}
                                      >
                                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                      </div>

                                      <div className="flex-1 pt-1 sm:pt-0 sm:text-center">
                                        <p
                                          className={`text-sm ${
                                            isCurrent
                                              ? 'font-bold text-sky-700'
                                              : isCompleted
                                              ? 'font-semibold text-emerald-600'
                                              : 'font-medium text-slate-400'
                                          }`}
                                        >
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

                        {order.status.toUpperCase() === 'CANCELLED' && (
                          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-800">
                              คำสั่งซื้อถูกยกเลิกแล้ว
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h5 className="mb-3 text-sm font-bold text-slate-800">รายการสินค้า</h5>
                          {order.items?.map((item: OrderItem, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between py-1 text-sm"
                            >
                              <span className="text-slate-700">
                                {item.product?.name || 'สินค้า'}
                                <span className="ml-2 text-slate-400">x{item.quantity}</span>
                              </span>
                              <span className="font-semibold text-slate-900">
                                ฿
                                {(
                                  Number(item.product?.price || 0) * item.quantity
                                ).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.pharmacistNotes && (
                          <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4">
                            <p className="mb-1 flex items-center gap-1 text-sm font-bold text-sky-800">
                              <FileText className="h-4 w-4" /> หมายเหตุจากเภสัชกร:
                            </p>
                            <p className="whitespace-pre-wrap text-sm text-slate-700">
                              {order.pharmacistNotes}
                            </p>
                          </div>
                        )}

                        {order.status.toUpperCase() === 'PRESCRIPTION' && (
                          <div className="mt-5 border-t pt-4">
                            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                              <div>
                                <p className="text-sm font-bold text-blue-800">
                                  รอการอนุมัติจากเภสัชกร
                                </p>
                                <p className="mt-0.5 text-xs text-blue-600">
                                  เภสัชกรกำลังตรวจสอบใบสั่งยาของคุณ เมื่ออนุมัติแล้ว ปุ่ม
                                  "ชำระเงิน" จะปรากฏที่นี่
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {order.status.toUpperCase() === 'PENDING_REVIEW' && (
                          <div className="mt-5 border-t pt-4 text-right">
                            <button
                              onClick={() => router.push(`/payment/${order.id}`)}
                              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                            >
                              ดูรายละเอียด / ชำระเงิน
                            </button>
                          </div>
                        )}

                        {order.status.toUpperCase() === 'PROCESSING' &&
                          (!order.paymentStatus || order.paymentStatus === 'UNPAID') && (
                            <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
                              <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                                ✅ เภสัชกรอนุมัติยาของคุณแล้ว — กรุณาชำระเงินเพื่อดำเนินการต่อ
                              </p>
                              <button
                                onClick={() => router.push(`/payment/${order.id}`)}
                                className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
                              >
                                ชำระเงิน
                              </button>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="text-lg font-bold text-slate-900">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-1 break-words text-base font-bold text-slate-900">{value}</div>
    </div>
  );
}

function SummaryBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-500">{title}</div>
      <div className="mt-1 text-sm font-medium leading-relaxed text-slate-900">{value}</div>
    </div>
  );
}

function CheckItem({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:border-sky-300 hover:bg-sky-50'
      } ${
        checked && !disabled
          ? 'border-sky-300 bg-sky-50 ring-1 ring-sky-300 shadow-sm'
          : ''
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600"
      />
      <span className={`font-medium ${checked && !disabled ? 'text-sky-900' : 'text-slate-700'}`}>
        {label}
      </span>
    </label>
  );
}