"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

type PaymentMethod = "BANK_TRANSFER" | "PROMPTPAY";

type OrderItem = { name: string; qty: number; price: number };
type Order = {
  id: string;
  customerName: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  payment?: {
    method: PaymentMethod;
    status?: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
    paidAt?: string;
    slipUrl?: string;
    note?: string;
  };
};

const BANK_INFO = {
  bankName: "ธนาคารตัวอย่าง",
  accountName: "Medicine Store",
  accountNo: "123-4-56789-0",
  promptpayId: "0812345678",
};

export default function PaymentPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();

  const orderId = params?.orderId ?? "UNKNOWN";

  // ✅ Mock order (ภายหลังค่อย fetch จาก backend)
  const [order, setOrder] = useState<Order>({
    id: orderId,
    customerName: "สมชาย ใจดี",
    createdAt: "22/2/2569 • 16:30",
    items: [{ name: "ยาตามใบสั่งแพทย์", qty: 1, price: 400 }],
    total: 400,
    payment: { method: "BANK_TRANSFER", status: "PENDING" },
  });

  const itemsTotal = useMemo(
    () => order.items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [order.items]
  );

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(order.payment?.slipUrl ?? null);
  const [note, setNote] = useState(order.payment?.note ?? "");
  const [submitting, setSubmitting] = useState(false);

  const onPickSlip = (file: File | null) => {
    setSlipFile(file);
    if (!file) {
      setSlipPreview(null);
      return;
    }
    setSlipPreview(URL.createObjectURL(file));
  };

  const canSubmit = Boolean(slipFile || slipPreview) && !submitting;

  const submitPayment = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // ✅ mock submit
      setOrder((prev) => ({
        ...prev,
        payment: {
          ...(prev.payment ?? { method: "BANK_TRANSFER" as PaymentMethod }),
          status: "SUBMITTED",
          paidAt: new Date().toLocaleString("th-TH"),
          slipUrl: slipPreview ?? undefined,
          note,
        },
      }));
      alert("ส่งหลักฐานการชำระเงินเรียบร้อย ✅ รอร้านตรวจสอบ");
    } catch (e) {
      console.error(e);
      alert("ส่งหลักฐานไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge =
    order.payment?.status === "SUBMITTED"
      ? "bg-sky-100 text-sky-700 border-sky-200"
      : order.payment?.status === "APPROVED"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : order.payment?.status === "REJECTED"
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : "bg-amber-100 text-amber-700 border-amber-200";

  const statusText =
    order.payment?.status === "SUBMITTED"
      ? "ส่งสลิปแล้ว (รอตรวจสอบ)"
      : order.payment?.status === "APPROVED"
      ? "ชำระเงินสำเร็จ"
      : order.payment?.status === "REJECTED"
      ? "สลิปมีปัญหา"
      : "ยังไม่ชำระเงิน";

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
                หน้าชำระเงิน
              </h1>
              <p className="text-slate-600 mt-1">
                อัปโหลดสลิปเพื่อยืนยันการชำระเงิน (Order:{" "}
                <span className="font-semibold">{order.id}</span>)
              </p>
            </div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${statusBadge}`}>
              {statusText}
            </span>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: order */}
          <div className="lg:col-span-2 rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-lg font-bold text-slate-900">สรุปคำสั่งซื้อ</h2>
              <p className="text-sm text-slate-600 mt-1">
                ลูกค้า: <span className="font-semibold">{order.customerName}</span> •{" "}
                {order.createdAt}
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900 mb-3">รายการ</p>
                <div className="space-y-2">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {it.name}{" "}
                          <span className="text-slate-500 font-normal">x{it.qty}</span>
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        ฿{(it.price * it.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <p className="text-sm text-slate-600">รวมทั้งหมด</p>
                  <p className="text-xl font-extrabold text-emerald-700">
                    ฿{(order.total ?? itemsTotal).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4">
                <p className="text-sm font-bold text-slate-900">หมายเหตุถึงร้าน (ถ้ามี)</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="เช่น โอนจากชื่อบัญชี..., โอนแล้วเวลา..., ฝากตรวจสอบ..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Right: payment */}
          <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-lg font-bold text-slate-900">ข้อมูลการโอน</h2>
              <p className="text-sm text-slate-600 mt-1">เลือกวิธีและอัปโหลดสลิป</p>
            </div>

            <div className="p-5 space-y-4">
              {/* method */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setOrder((prev) => ({
                      ...prev,
                      payment: { ...(prev.payment ?? { status: "PENDING" }), method: "BANK_TRANSFER" },
                    }))
                  }
                  className={[
                    "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                    order.payment?.method === "BANK_TRANSFER"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  โอนธนาคาร
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOrder((prev) => ({
                      ...prev,
                      payment: { ...(prev.payment ?? { status: "PENDING" }), method: "PROMPTPAY" },
                    }))
                  }
                  className={[
                    "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                    order.payment?.method === "PROMPTPAY"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  พร้อมเพย์
                </button>
              </div>

              {/* info */}
              <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
                {order.payment?.method === "PROMPTPAY" ? (
                  <>
                    <p className="font-bold text-slate-900">PromptPay</p>
                    <p>
                      <span className="font-semibold">หมายเลข:</span> {BANK_INFO.promptpayId}
                    </p>
                    <p className="text-xs text-slate-500">
                      * ใส่จำนวนเงินให้ตรงยอด และอัปโหลดสลิปหลังโอน
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-900">โอนเข้าบัญชี</p>
                    <p>
                      <span className="font-semibold">ธนาคาร:</span> {BANK_INFO.bankName}
                    </p>
                    <p>
                      <span className="font-semibold">เลขบัญชี:</span> {BANK_INFO.accountNo}
                    </p>
                    <p>
                      <span className="font-semibold">ชื่อบัญชี:</span> {BANK_INFO.accountName}
                    </p>
                    <p className="text-xs text-slate-500">
                      * ใส่จำนวนเงินให้ตรงยอด และอัปโหลดสลิปหลังโอน
                    </p>
                  </>
                )}
              </div>

              {/* upload */}
              <div className="rounded-2xl border bg-white p-4">
                <p className="text-sm font-bold text-slate-900">อัปโหลดสลิป</p>
                <p className="text-xs text-slate-500 mt-1">รองรับ .jpg/.png</p>

                <label className="mt-3 block rounded-2xl border border-dashed bg-slate-50 p-4 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPickSlip(e.target.files?.[0] ?? null)}
                  />
                  <div className="text-sm text-slate-700">
                    คลิกเพื่อเลือกไฟล์สลิป
                    <div className="text-xs text-slate-500 mt-1">
                      (เลือกแล้วจะมีภาพ preview)
                    </div>
                  </div>
                </label>

                {slipPreview ? (
                  <div className="mt-4 rounded-2xl border bg-slate-50 overflow-hidden">
                    <div className="relative w-full aspect-[4/5]">
                      <Image
                        src={slipPreview}
                        alt="payment-slip"
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 420px"
                      />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <p className="text-xs text-slate-600 truncate">
                        {slipFile?.name ?? "slip-preview"}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSlipFile(null);
                          setSlipPreview(null);
                        }}
                        className="text-xs rounded-xl border bg-white px-2 py-1 hover:bg-slate-50"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                disabled={!canSubmit}
                onClick={submitPayment}
                className={[
                  "w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition",
                  canSubmit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-300 cursor-not-allowed",
                ].join(" ")}
              >
                {submitting ? "กำลังส่ง..." : "ยืนยันการชำระเงิน"}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm hover:bg-slate-50"
              >
                ย้อนกลับ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}