"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  FileSearch,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { Order } from "../../types/order";

// ── Rejection modal ──────────────────────────────────────────
function RejectModal({
  order,
  onClose,
  onConfirm,
}: {
  order: Order;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(note);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-xl">
            <XCircle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">ปฏิเสธสลิปโอนเงิน</h2>
            <p className="text-xs text-slate-500">
              Order #{order.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Slip thumbnail */}
        {order.paymentSlipUrl && (
          <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.paymentSlipUrl}
              alt="slip"
              className="w-full h-full object-contain"
            />
            <a
              href={order.paymentSlipUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" /> ดูรูปเต็ม
            </a>
          </div>
        )}

        {/* Note field */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            เหตุผลที่ปฏิเสธ{" "}
            <span className="font-normal text-slate-400">(ไม่บังคับ)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="เช่น ยอดเงินไม่ตรง, รูปภาพไม่ชัด, ชื่อบัญชีไม่ถูกต้อง..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "กำลังดำเนินการ..." : "ยืนยันการปฏิเสธ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Order | null>(null);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const data = await orderService.getOrders();

      // Show orders that have a slip OR are PENDING_REVIEW (no slip yet)
      const pendingVerify = data
        .filter(
          (o) =>
            o.paymentStatus === "PENDING_REVIEW" ||
            (o.paymentSlipUrl &&
              o.paymentStatus !== "APPROVED" &&
              o.paymentStatus !== "REJECTED")
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

      setOrders(pendingVerify);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("ดึงข้อมูลรายการสั่งซื้อล้มเหลว");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (orderId: string) => {
    try {
      await orderService.verifyPayment(orderId, { status: "APPROVED" });
      toast.success("✅ ยืนยันสลิปเรียบร้อย");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "อัปเดตสถานะไม่สำเร็จ";
      toast.error(msg);
    }
  };

  const handleReject = async (orderId: string, note: string) => {
    await orderService.verifyPayment(orderId, {
      status: "REJECTED",
      note: note.trim() || undefined,
    });
    toast.success("🚫 ปฏิเสธสลิปเรียบร้อย");
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setRejectTarget(null);
  };

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-slate-500">
        <p className="animate-pulse">กำลังโหลดข้อมูลรายการชำระเงิน...</p>
      </div>
    );
  }

  return (
    <>
      {/* Rejection modal overlay */}
      {rejectTarget && (
        <RejectModal
          order={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={(note) => handleReject(rejectTarget.id, note)}
        />
      )}

      <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                ตรวจสอบการชำระเงิน
              </h1>
              <p className="text-slate-600 mt-1">
                รายการโอนเงินที่รอให้แอดมินยืนยันสลิป ({orders.length} รายการ)
              </p>
            </div>
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              รีเฟรช
            </button>
          </div>

          {/* Empty state */}
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm mt-8">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4 opacity-80" />
              <h3 className="text-xl font-bold text-slate-800">ไม่มีรายการรอตรวจสอบ</h3>
              <p className="text-slate-500 mt-2">สลิปทั้งหมดได้รับการยืนยันเรียบร้อยแล้ว</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => {
                const hasSlip = Boolean(order.paymentSlipUrl);
                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 lg:gap-8 hover:shadow-md transition-shadow"
                  >
                    {/* ── Slip image section ── */}
                    <div className="w-full md:w-1/3 lg:w-[280px] space-y-3 shrink-0 flex flex-col">
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-500" />
                        หลักฐานสลิปโอนเงิน
                      </p>

                      {hasSlip ? (
                        <div className="relative flex-1 min-h-[280px] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={order.paymentSlipUrl}
                            alt="Payment Slip"
                            className="object-contain w-full h-full absolute inset-0 group-hover:scale-[1.03] transition-transform duration-500"
                          />
                          <a
                            href={order.paymentSlipUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 text-white font-medium backdrop-blur-sm"
                          >
                            <ExternalLink className="w-4 h-4" /> เปิดดูรูปภาพเต็ม
                          </a>
                        </div>
                      ) : (
                        <div className="flex flex-1 min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 p-6 text-center">
                          <AlertTriangle className="w-8 h-8 opacity-70" />
                          <div>
                            <p className="font-bold text-sm">ยังไม่มีสลิปแนบ</p>
                            <p className="text-xs text-amber-600 mt-0.5">
                              ลูกค้ายังไม่ได้อัปโหลดหลักฐานการโอนเงิน
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Details section ── */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-5 gap-3">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 truncate">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </h2>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
                            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-slate-700">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              {new Date(order.createdAt).toLocaleString("th-TH")}
                            </span>
                            {order.user && (
                              <span className="px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 truncate max-w-[200px]">
                                {order.user.firstName} {order.user.lastName}
                              </span>
                            )}
                            {/* Payment status badge */}
                            {!hasSlip && (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                <AlertTriangle className="w-3 h-3" /> ไม่มีสลิป
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="sm:text-right bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 self-start sm:self-auto shrink-0">
                          <p className="text-xs font-semibold text-emerald-600/80 mb-0.5 uppercase tracking-wider">
                            ยอดชำระ
                          </p>
                          <p className="text-3xl font-black text-emerald-600">
                            ฿{order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Item list */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 mb-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                          <FileSearch className="w-4 h-4 text-slate-500" />
                          <p className="text-sm font-bold text-slate-800">
                            สรุปรายการสินค้า ({order.items.length})
                          </p>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600 overflow-y-auto pr-2 flex-1 max-h-[160px]">
                          {order.items.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm"
                            >
                              <span className="font-medium text-slate-700 truncate mr-3">
                                {item.product?.name || "สินค้าไม่ระบุ"}
                                <span className="inline-block px-2 py-0.5 ml-2 bg-slate-100 text-slate-500 rounded-md text-xs font-bold">
                                  x{item.quantity}
                                </span>
                              </span>
                              <span className="text-slate-900 font-semibold shrink-0">
                                ฿{(item.priceAtTime * item.quantity).toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {order.paymentNote && (
                          <div className="mt-4 pt-3 border-t border-slate-200">
                            <p className="text-xs font-bold text-amber-700 mb-1.5 uppercase tracking-wide">
                              หมายเหตุจากลูกค้า:
                            </p>
                            <p className="text-sm text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-100 leading-relaxed">
                              {order.paymentNote}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ── Action buttons ── */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-slate-100">
                        {/* Reject — opens modal for optional note */}
                        <button
                          onClick={() => setRejectTarget(order)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-white border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors focus:ring-2 focus:ring-rose-200 outline-none"
                        >
                          <XCircle className="w-4 h-4" /> ปฏิเสธสลิป
                        </button>

                        {/* Approve — only when slip is present */}
                        <button
                          onClick={() => handleApprove(order.id)}
                          disabled={!hasSlip}
                          title={!hasSlip ? "ลูกค้ายังไม่ได้แนบสลิป" : undefined}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md sm:ml-auto"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {hasSlip ? "ยืนยันสลิปถูกต้อง" : "รอสลิปจากลูกค้า"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
