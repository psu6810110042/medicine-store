'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, checkAuth, logout } = useAuth();

  const initialHealth: HealthDataState = useMemo(
    () => ({
      allergies: user?.healthData?.allergies ?? [],
      chronicDiseases: user?.healthData?.chronicDiseases ?? [],
      currentMedications: user?.healthData?.currentMedications ?? [],
    }),
    [user],
  );

  const [activeTab, setActiveTab] = useState<'personal' | 'health'>('personal');
  const [health, setHealth] = useState<HealthDataState>(initialHealth);

  const [otherAllergy, setOtherAllergy] = useState('');
  const [otherDisease, setOtherDisease] = useState('');
  const [currentMedsText, setCurrentMedsText] = useState('');

  // sync when user loaded
  useEffect(() => {
    setHealth(initialHealth);
    setCurrentMedsText((initialHealth.currentMedications ?? []).join(', '));
  }, [initialHealth]);

  useEffect(() => {
    // ทำให้หน้าโปรไฟล์รีเฟรช user เสมอ (กัน user null / stale)
    checkAuth();
  }, [checkAuth]);

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

  const fullName = user.fullName || '-';
  const email = user.email || '-';
  const phone = user.phone || '-';
  const address =
    user.address
      ? `${user.address.street}, ${user.address.district}, ${user.address.province} ${user.address.postalCode}`
      : '-';

  // ✅ checkbox logic: “ไม่มีประวัติแพ้ยา” / “ไม่มีโรคประจำตัว” เป็นตัวล้างรายการ
  const noAllergyChecked = health.allergies.includes('ไม่มีประวัติแพ้ยา');
  const noDiseaseChecked = health.chronicDiseases.includes('ไม่มีโรคประจำตัว');

  const onToggleNoAllergy = () => {
    setHealth((prev) => ({
      ...prev,
      allergies: prev.allergies.includes('ไม่มีประวัติแพ้ยา') ? [] : ['ไม่มีประวัติแพ้ยา'],
    }));
    setOtherAllergy('');
  };

  const onToggleNoDisease = () => {
    setHealth((prev) => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.includes('ไม่มีโรคประจำตัว') ? [] : ['ไม่มีโรคประจำตัว'],
    }));
    setOtherDisease('');
  };

  const onToggleAllergy = (label: string) => {
    setHealth((prev) => {
      // ถ้าเลือกตัวอื่น ให้เอา “ไม่มีประวัติแพ้ยา” ออกก่อน
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

  const onNormalizeMeds = () => {
    const meds = currentMedsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setHealth((prev) => ({ ...prev, currentMedications: meds }));
  };

  // NOTE: ปุ่มบันทึก (UI พร้อม) — ถ้าหลังบ้านมี endpoint แล้วค่อยเปิดใช้
  const onSaveHealth = async () => {
    onNormalizeMeds();

    // ✅ ถ้าคุณมี endpoint แล้ว ค่อย uncomment และปรับ path ให้ตรง
    // ตัวอย่าง: PATCH /users/me/health
    //
    // try {
    //   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    //   const res = await fetch(`${API_URL}/users/me/health`, {
    //     method: 'PATCH',
    //     headers: { 'Content-Type': 'application/json' },
    //     credentials: 'include',
    //     body: JSON.stringify({ healthData: health }),
    //   });
    //   if (!res.ok) throw new Error('Save failed');
    //   await checkAuth();
    //   alert('บันทึกข้อมูลสุขภาพเรียบร้อย');
    // } catch (e) {
    //   console.error(e);
    //   alert('บันทึกไม่สำเร็จ (ตรวจสอบ backend endpoint)');
    // }

    alert('ตอนนี้หน้า UI พร้อมแล้ว ✅ (ถ้าจะบันทึกจริง ให้เพิ่ม endpoint ฝั่ง backend แล้วเปิดโค้ดส่วนบันทึก)');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="rounded-3xl border bg-gradient-to-r from-sky-50 to-emerald-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold text-slate-900">โปรไฟล์ลูกค้า</div>
            <div className="text-sm text-slate-600">ข้อมูลผู้ใช้งานและสุขภาพเบื้องต้น</div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border bg-white px-3 py-1 text-sm text-slate-700">
              {user.role === 'customer' ? 'Customer' : user.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'personal'
                ? 'bg-slate-900 text-white'
                : 'border bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('personal')}
          >
            ข้อมูลส่วนตัว
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'health'
                ? 'bg-slate-900 text-white'
                : 'border bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('health')}
          >
            ข้อมูลสุขภาพ
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'personal' ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <SectionCard title="ข้อมูลส่วนตัว">
            <InfoRow label="ชื่อ-สกุล" value={fullName} />
            <InfoRow label="อีเมล" value={email} />
            <InfoRow label="เบอร์โทร" value={phone} />
            <InfoRow label="ที่อยู่" value={address} />
          </SectionCard>

          <SectionCard title="การใช้งาน">
            <div className="space-y-3">
              <button
                className="w-full rounded-2xl border bg-white px-4 py-3 text-left font-semibold hover:bg-slate-50"
                onClick={() => router.push('/products')}
              >
                ไปหน้าสินค้า
              </button>
              <button
                className="w-full rounded-2xl border bg-white px-4 py-3 text-left font-semibold hover:bg-slate-50"
                onClick={() => router.push('/cart')}
              >
                ไปตะกร้า
              </button>
              <button
                className="w-full rounded-2xl bg-rose-600 px-4 py-3 font-semibold text-white hover:bg-rose-700"
                onClick={logout}
              >
                ออกจากระบบ
              </button>
              <button
                className="w-full rounded-2xl border bg-white px-4 py-3 font-semibold hover:bg-slate-50"
                onClick={() => router.back()}
              >
                ย้อนกลับ
              </button>
            </div>
          </SectionCard>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Left: Allergies + Diseases */}
          <SectionCard title="ข้อมูลสุขภาพ">
            <div className="rounded-2xl border bg-amber-50 px-4 py-3 text-sm text-amber-900">
              สำคัญ: ข้อมูลนี้ช่วยให้เภสัชกรตรวจสอบความปลอดภัยของยาที่คุณสั่งซื้อ
            </div>

            {/* Allergies */}
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
                <div className="text-sm font-semibold text-slate-700">อื่นๆ (ระบุชื่อยา/กลุ่มยา)</div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={otherAllergy}
                    onChange={(e) => setOtherAllergy(e.target.value)}
                    disabled={noAllergyChecked}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                    placeholder="เช่น เพนิซิลลิน, กุ้ง (ถ้าแพ้อาหารก็พิมพ์ได้)"
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

            {/* Diseases */}
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
                <div className="text-sm font-semibold text-slate-700">อื่นๆ (ระบุชื่อโรค)</div>
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

            {/* Current meds */}
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

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                onClick={onSaveHealth}
              >
                บันทึกข้อมูลสุขภาพ
              </button>
              <button
                className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setActiveTab('personal')}
              >
                กลับไปข้อมูลส่วนตัว
              </button>
            </div>
          </SectionCard>

          {/* Right: Summary (เหมือนภาพใหม่) */}
          <SectionCard title="สรุปข้อมูลสุขภาพ">
            <SummaryBox title="แพ้ยา/แพ้อาหาร" value={health.allergies.length ? health.allergies.join(', ') : 'ยังไม่ได้ระบุ'} />
            <SummaryBox title="โรคประจำตัว" value={health.chronicDiseases.length ? health.chronicDiseases.join(', ') : 'ยังไม่ได้ระบุ'} />
            <SummaryBox
              title="ยาที่ใช้อยู่"
              value={
                (currentMedsText || '').trim()
                  ? currentMedsText
                  : health.currentMedications.length
                    ? health.currentMedications.join(', ')
                    : 'ยังไม่ได้ระบุ'
              }
            />
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-4 text-lg font-bold text-slate-900">{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 rounded-2xl border bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="mt-1 break-words text-base font-bold text-slate-900">{value}</div>
    </div>
  );
}

function SummaryBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="mb-4 rounded-2xl border bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-700">{title}</div>
      <div className="mt-1 text-sm text-slate-900">{value}</div>
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
      className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm ${
        disabled ? 'opacity-60' : 'hover:bg-slate-50'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="h-4 w-4"
      />
      <span className="text-slate-800">{label}</span>
    </label>
  );
}