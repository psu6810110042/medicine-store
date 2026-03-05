"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { orderService } from "@/app/services/orderService";
import { productService } from "@/app/services/productService";

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
    status?: "UNPAID" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
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

const PROMPTPAY_QR = "/qrcode/promptpay.png"; // ใส่ที่: frontend/public/qrcode/promptpay.png

export default function PaymentPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isFetching, setIsFetching] = useState(true);

  const orderId = params?.orderId ?? "UNKNOWN";

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId === "UNKNOWN") {
      setIsFetching(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(orderId);
        const mappedOrder: Order = {
          id: data.id,
          customerName: user?.fullName || (data.user?.firstName ? `${data.user.firstName} ${data.user.lastName || ''}`.trim() : 'ผู้ใช้งาน'),
          createdAt: new Date(data.createdAt).toLocaleString("th-TH"),
          items: data.items.map(it => ({
            name: it.product?.name || "สินค้า",
            qty: it.quantity,
            price: it.priceAtTime || 0,
          })),
          total: data.totalAmount,
          payment: {
            method: (data.paymentMethod as PaymentMethod) || "BANK_TRANSFER",
            status: data.paymentStatus || "UNPAID",
            paidAt: data.paidAt ? new Date(data.paidAt).toLocaleString("th-TH") : undefined,
            slipUrl: data.paymentSlipUrl,
            note: data.paymentNote,
          },
        };
        setOrder(mappedOrder);
      } catch (err) {
        console.error(err);
        showToast("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้");
      } finally {
        setIsFetching(false);
      }
    };
    if (!isLoading) {
      fetchOrder();
    }
  }, [orderId, isLoading, user?.fullName]);

  const itemsTotal = useMemo(
    () => order?.items.reduce((sum, it) => sum + it.price * it.qty, 0) ?? 0,
    [order?.items]
  );

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setSlipPreview(order.payment?.slipUrl ?? null);
      setNote(order.payment?.note ?? "");
    }
  }, [order]);

  // mini toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  };

  const copyText = async (text: string, successMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast(successMsg);
    }
  };

  const onPickSlip = (file: File | null) => {
    setSlipFile(file);

    // cleanup blob เก่า กัน memory leak
    if (slipPreview && slipPreview.startsWith("blob:")) {
      URL.revokeObjectURL(slipPreview);
    }

    if (!file) {
      setSlipPreview(null);
      return;
    }
    setSlipPreview(URL.createObjectURL(file));
  };

  // cleanup ตอน unmount
  useEffect(() => {
    return () => {
      if (slipPreview && slipPreview.startsWith("blob:")) {
        URL.revokeObjectURL(slipPreview);
      }
    };
  }, [slipPreview]);

  const canSubmit = Boolean(slipFile || slipPreview) && !submitting;

  const submitPayment = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      let finalSlipUrl = order?.payment?.slipUrl;
      if (slipFile) {
        // อัปโหลดไฟล์ไปที่ server ก่อน
        const uploadRes = await productService.uploadImage(slipFile, "payment-slips");
        finalSlipUrl = uploadRes.url;
      }

      if (!finalSlipUrl) {
        throw new Error("กรุณาอัปโหลดสลิปที่ถูกต้อง");
      }

      const updatedOrder = await orderService.submitPayment(orderId, {
        method: order?.payment?.method || "BANK_TRANSFER",
        note,
        slipUrl: finalSlipUrl,
      });

      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          payment: {
            ...prev.payment,
            method: (updatedOrder.paymentMethod as PaymentMethod) || "BANK_TRANSFER",
            status: updatedOrder.paymentStatus || "PENDING_REVIEW",
            paidAt: updatedOrder.paidAt ? new Date(updatedOrder.paidAt).toLocaleString("th-TH") : undefined,
            slipUrl: updatedOrder.paymentSlipUrl,
            note: updatedOrder.paymentNote,
          },
        };
      });
      showToast("ส่งหลักฐานเรียบร้อย ✅ รอร้านตรวจสอบ");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "ส่งหลักฐานไม่สำเร็จ ลองใหม่อีกครั้ง";
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge =
    order?.payment?.status === "PENDING_REVIEW"
      ? "bg-sky-100 text-sky-700 border-sky-200"
      : order?.payment?.status === "APPROVED"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : order?.payment?.status === "REJECTED"
          ? "bg-rose-100 text-rose-700 border-rose-200"
          : "bg-amber-100 text-amber-700 border-amber-200";

  const statusText =
    order?.payment?.status === "PENDING_REVIEW"
      ? "ส่งสลิปแล้ว (รอตรวจสอบ)"
      : order?.payment?.status === "APPROVED"
        ? "ชำระเงินสำเร็จ"
        : order?.payment?.status === "REJECTED"
          ? "สลิปมีปัญหา"
          : "ยังไม่ชำระเงิน";

  const isPromptPay = order?.payment?.method === "PROMPTPAY";
  const amount = (order?.total ?? itemsTotal).toLocaleString();

  if (isFetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 animate-pulse font-medium">กำลังโหลดข้อมูลคำสั่งซื้อ...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">ไม่พบคำสั่งซื้อ</h2>
        <p className="text-slate-600 mb-6">ไม่พบข้อมูลคำสั่งซื้อที่ท่านต้องการทำรายการ หรือคำสั่งซื้อถูกยกเลิกไปแล้ว</p>
        <button onClick={() => router.push('/')} className="rounded-2xl border px-6 py-3 bg-white hover:bg-slate-50 font-semibold text-slate-700">กลับไปหน้าหลัก</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {toast ? (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
          <div className="rounded-full border bg-white px-4 py-2 text-sm shadow-md">
            {toast}
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
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
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${statusBadge}`}
            >
              {statusText}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
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
                      <p className="text-sm font-semibold text-slate-800">
                        {it.name}{" "}
                        <span className="text-slate-500 font-normal">x{it.qty}</span>
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        ฿{(it.price * it.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <p className="text-sm text-slate-600">รวมทั้งหมด</p>
                  <p className="text-xl font-extrabold text-emerald-700">฿{amount}</p>
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

          {/* Right */}
          <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-lg font-bold text-slate-900">ข้อมูลการโอน</h2>
              <p className="text-sm text-slate-600 mt-1">เลือกวิธีและอัปโหลดสลิป</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setOrder((prev) => prev ? ({
                      ...prev,
                      payment: {
                        ...(prev.payment ?? { status: "UNPAID" as const }),
                        method: "BANK_TRANSFER",
                      },
                    }) : null)
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
                    setOrder((prev) => prev ? ({
                      ...prev,
                      payment: {
                        ...(prev.payment ?? { status: "UNPAID" as const }),
                        method: "PROMPTPAY",
                      },
                    }) : null)
                  }
                  className={[
                    "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                    isPromptPay
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  พร้อมเพย์
                </button>
              </div>

              <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
                {isPromptPay ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-900">PromptPay</p>
                      <button
                        type="button"
                        onClick={() =>
                          copyText(BANK_INFO.promptpayId, "คัดลอกพร้อมเพย์แล้ว ✅")
                        }
                        className="rounded-xl border bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                      >
                        คัดลอกพร้อมเพย์
                      </button>
                    </div>
                    <p>
                      <span className="font-semibold">หมายเลข:</span>{" "}
                      <span className="font-mono">{BANK_INFO.promptpayId}</span>
                    </p>
                    <p>
                      <span className="font-semibold">ยอดที่ต้องโอน:</span>{" "}
                      <span className="text-emerald-700 font-extrabold">฿{amount}</span>
                    </p>

                    <div className="mt-3 rounded-2xl border bg-white p-3">
                      <p className="text-xs text-slate-600 mb-2">สแกน QR เพื่อชำระเงิน</p>
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50">
                        <Image
                          src={PROMPTPAY_QR}
                          alt="promptpay-qr"
                          fill
                          className="object-contain"
                          sizes="420px"
                          priority
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">
                        * ถ้า QR ไม่ขึ้น ให้ตรวจว่ามีไฟล์ที่{" "}
                        <span className="font-mono">public/qrcode/promptpay.png</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-900">โอนเข้าบัญชี</p>
                      <button
                        type="button"
                        onClick={() =>
                          copyText(BANK_INFO.accountNo, "คัดลอกเลขบัญชีแล้ว ✅")
                        }
                        className="rounded-xl border bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                      >
                        คัดลอกเลขบัญชี
                      </button>
                    </div>
                    <p>
                      <span className="font-semibold">ธนาคาร:</span> {BANK_INFO.bankName}
                    </p>
                    <p>
                      <span className="font-semibold">เลขบัญชี:</span>{" "}
                      <span className="font-mono">{BANK_INFO.accountNo}</span>
                    </p>
                    <p>
                      <span className="font-semibold">ชื่อบัญชี:</span> {BANK_INFO.accountName}
                    </p>
                    <p>
                      <span className="font-semibold">ยอดที่ต้องโอน:</span>{" "}
                      <span className="text-emerald-700 font-extrabold">฿{amount}</span>
                    </p>
                  </>
                )}
              </div>

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
                    <div className="text-xs text-slate-500 mt-1">(เลือกแล้วจะมีภาพ preview)</div>
                  </div>
                </label>

                {slipPreview ? (
                  <div className="mt-4 rounded-2xl border bg-slate-50 overflow-hidden">
                    <div className="w-full aspect-[4/5] bg-white flex items-center justify-center">
                      {/* ใช้ img รองรับ blob: ชัวร์กว่า next/image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slipPreview}
                        alt="payment-slip"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <p className="text-xs text-slate-600 truncate">
                        {slipFile?.name ?? "slip-preview"}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (slipPreview && slipPreview.startsWith("blob:")) {
                            URL.revokeObjectURL(slipPreview);
                          }
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

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-sm hover:bg-slate-50"
                >
                  ไปหน้าโปรไฟล์ลูกค้า
                </button>
              </div>
            </div>
          </div>
        </div>

        {!user && !isLoading ? (
          <div className="rounded-2xl border bg-white p-4 text-sm text-slate-700">
            ตอนนี้ยังไม่ได้เข้าสู่ระบบ — หน้านี้แสดงตัวอย่างข้อมูลชำระเงินได้ แต่ชื่อ/โปรไฟล์จะยังไม่ผูกกับผู้ใช้
          </div>
        ) : null}
      </div>
    </div>
  );
}
