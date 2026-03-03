"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, setIsLoginModalOpen } = useAuth();

  const addressText = useMemo(() => {
    if (!user?.address) return "-";
    const a = user.address;
    return `${a.street}, ${a.district}, ${a.province} ${a.postalCode}`;
  }, [user?.address]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-slate-700">กำลังโหลดข้อมูลผู้ใช้...</p>
          </div>
        </div>
      </div>
    );
  }

  // ถ้าไม่ล็อกอิน ให้เรียก modal จาก AuthContext
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-extrabold text-slate-900">โปรไฟล์ลูกค้า</h1>
            <p className="text-slate-600 mt-1">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์</p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => router.push("/products")}
                className="rounded-2xl border bg-white px-4 py-3 text-sm hover:bg-slate-50"
              >
                ไปหน้าสินค้า
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-2xl border bg-white px-4 py-3 text-sm hover:bg-slate-50"
          >
            ย้อนกลับ
          </button>
        </div>
      </div>
    );
  }

  const roleBadge =
    user.role === "admin"
      ? "bg-violet-100 text-violet-700 border-violet-200"
      : user.role === "pharmacist"
      ? "bg-sky-100 text-sky-700 border-sky-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";

  const roleText =
    user.role === "admin" ? "Admin" : user.role === "pharmacist" ? "Pharmacist" : "Customer";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                โปรไฟล์ลูกค้า
              </h1>
              <p className="text-slate-600 mt-1">ข้อมูลผู้ใช้งานและสุขภาพเบื้องต้น</p>
            </div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${roleBadge}`}>
              {roleText}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-lg font-bold text-slate-900">ข้อมูลส่วนตัว</h2>
            </div>

            <div className="p-5 space-y-4">
              <InfoRow label="ชื่อ-สกุล" value={user.fullName} />
              <InfoRow label="อีเมล" value={user.email} />
              <InfoRow label="เบอร์โทร" value={user.phone} />
              <InfoRow label="ที่อยู่" value={addressText} />
            </div>
          </div>

          {/* Right */}
          <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-lg font-bold text-slate-900">ข้อมูลสุขภาพ</h2>
              <p className="text-sm text-slate-600 mt-1">สำหรับช่วยเภสัชให้แนะนำได้เหมาะสม</p>
            </div>

            <div className="p-5 space-y-4">
              <ListBox title="แพ้ยา/แพ้อาหาร" items={user.healthData?.allergies ?? []} emptyText="ยังไม่ได้ระบุ" />
              <ListBox title="โรคประจำตัว" items={user.healthData?.chronicDiseases ?? []} emptyText="ยังไม่ได้ระบุ" />
              <ListBox title="ยาที่ใช้อยู่" items={user.healthData?.currentMedications ?? []} emptyText="ยังไม่ได้ระบุ" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="rounded-2xl border bg-white px-4 py-3 text-sm hover:bg-slate-50"
          >
            ไปหน้าสินค้า
          </button>

          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="rounded-2xl border bg-white px-4 py-3 text-sm hover:bg-slate-50"
          >
            ไปตะกร้า
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700"
          >
            ออกจากระบบ
          </button>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-2xl border bg-white px-4 py-3 text-sm hover:bg-slate-50"
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900 break-words">{value}</p>
    </div>
  );
}

function ListBox({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-slate-600 mt-2">{emptyText}</p>
      ) : (
        <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-slate-700">
          {items.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      )}
    </div>
  );
}