"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, checkAuth } = useAuth();

  const roleLabel = useMemo(() => {
    if (!user) return "";
    if (user.role === "customer") return "Customer";
    if (user.role === "pharmacist") return "Pharmacist";
    return "Admin";
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-2xl border bg-white px-6 py-4 shadow-sm text-slate-700">
          กำลังโหลดข้อมูลโปรไฟล์...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-extrabold text-slate-900">โปรไฟล์ลูกค้า</h1>
            <p className="text-slate-600 mt-2">
              คุณยังไม่ได้เข้าสู่ระบบ หรือ session หมดอายุ
            </p>

            <div className="mt-6 flex gap-2 flex-wrap">
              <button
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
                onClick={() => router.push("/")}
              >
                กลับหน้าแรก
              </button>
              <button
                className="rounded-2xl border bg-white px-4 py-2 font-semibold hover:bg-slate-50"
                onClick={checkAuth}
              >
                ลองโหลดใหม่
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const addressText = user.address
    ? `${user.address.street}, ${user.address.district}, ${user.address.province} ${user.address.postalCode}`
    : "ยังไม่ได้ระบุ";

  const allergiesText =
    user.healthData?.allergies?.length ? user.healthData.allergies.join(", ") : "ยังไม่ได้ระบุ";
  const diseasesText =
    user.healthData?.chronicDiseases?.length
      ? user.healthData.chronicDiseases.join(", ")
      : "ยังไม่ได้ระบุ";
  const medsText =
    user.healthData?.currentMedications?.length
      ? user.healthData.currentMedications.join(", ")
      : "ยังไม่ได้ระบุ";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Header */}
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

            <span className="inline-flex items-center rounded-full border bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal */}
          <div className="lg:col-span-2 rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-lg font-bold text-slate-900">ข้อมูลส่วนตัว</h2>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="ชื่อ-สกุล" value={user.fullName || "-"} />
              <InfoCard label="อีเมล" value={user.email || "-"} />
              <InfoCard label="เบอร์โทร" value={user.phone || "-"} />
              <InfoCard label="ที่อยู่" value={addressText} />
            </div>
          </div>

          {/* Health */}
          <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-lg font-bold text-slate-900">ข้อมูลสุขภาพ</h2>
              <p className="text-sm text-slate-600 mt-1">
                สำหรับช่วยเภสัชให้แนะนำได้เหมาะสม
              </p>
            </div>

            <div className="p-5 space-y-3">
              <InfoCard label="แพ้ยา/แพ้อาหาร" value={allergiesText} />
              <InfoCard label="โรคประจำตัว" value={diseasesText} />
              <InfoCard label="ยาที่ใช้อยู่" value={medsText} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            className="rounded-2xl border bg-white px-4 py-2 font-semibold hover:bg-slate-50"
            onClick={() => router.push("/products")}
          >
            ไปหน้าสินค้า
          </button>
          <button
            className="rounded-2xl border bg-white px-4 py-2 font-semibold hover:bg-slate-50"
            onClick={() => router.push("/cart")}
          >
            ไปตะกร้า
          </button>
          <button
            className="rounded-2xl bg-rose-600 px-4 py-2 text-white font-semibold hover:bg-rose-700"
            onClick={logout}
          >
            ออกจากระบบ
          </button>
          <button
            className="rounded-2xl border bg-white px-4 py-2 font-semibold hover:bg-slate-50"
            onClick={checkAuth}
          >
            รีเฟรชข้อมูล
          </button>
        </div>

        <button
          className="rounded-2xl border bg-white px-4 py-2 font-semibold hover:bg-slate-50"
          onClick={() => router.back()}
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <div className="text-sm font-bold text-slate-900">{label}</div>
      <div className="text-slate-700 mt-1 break-words">{value}</div>
    </div>
  );
}