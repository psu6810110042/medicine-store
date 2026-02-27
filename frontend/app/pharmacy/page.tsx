"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ClipboardList, Package, Coins, Pill } from "lucide-react";
import { orderService } from "@/app/services/orderService";
import { Order, OrderStatus } from "@/app/types/order";
import { toast } from "sonner";
const statusLabel: Record<OrderStatus, string> = {
    PENDING_REVIEW: "รอตรวจสอบ",
    PRESCRIPTION: "รอตรวจสอบใบสั่งยา",
    PROCESSING: "กำลังดำเนินการ",
    DONE: "ส่งมอบแล้ว",
    CANCELLED: "ยกเลิกแล้ว",
    STOCK: "รอสินค้า",
};

export default function PharmacyPage() {
    const [active, setActive] = useState<OrderStatus>(OrderStatus.PENDING_REVIEW);
    const [orders, setOrders] = useState<Order[]>([]);

    // ✅ Modal
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState<Order | null>(null);

    // ✅ Refresh states (ใช้ให้ UI รีเฟรชได้ทุกฟังก์ชัน)
    const [refreshing, setRefreshing] = useState(false);

    const fetchAllOrders = async () => {
        try {
            setRefreshing(true);
            const data = await orderService.getOrders();
            // Sort by newest first
            const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(sortedData);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("ไม่สามารถดึงข้อมูลคำสั่งซื้อได้");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const openDetail = (order: Order) => {
        setSelected(order);
        setDetailOpen(true);
    };

    const closeDetail = () => {
        setDetailOpen(false);
        setSelected(null);
    };

    const updateStatus = async (id: string, next: OrderStatus) => {
        try {
            const updated = await orderService.updateOrderStatus(id, next);
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o)));
            toast.success("อัปเดตสถานะสำเร็จ");
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("อัปเดตสถานะไม่สำเร็จ");
        }
    };

    const handleRefresh = async () => {
        setDetailOpen(false);
        setSelected(null);
        await fetchAllOrders();
    };

    const filtered = useMemo(
        () => orders.filter((o) => o.status === active),
        [orders, active]
    );

    const summary = useMemo(() => {
        const pending = orders.filter((o) => o.status === OrderStatus.PENDING_REVIEW).length;
        const prescription = orders.filter((o) => o.status === OrderStatus.PRESCRIPTION).length;
        const processing = orders.filter((o) => o.status === OrderStatus.PROCESSING).length;
        const shipped = orders.filter((o) => o.status === OrderStatus.STOCK).length;
        const delivered = orders.filter((o) => o.status === OrderStatus.DONE).length;
        const cancelled = orders.filter((o) => o.status === OrderStatus.CANCELLED).length;

        return {
            pending,
            prescription,
            processing,
            shipped,
            delivered,
            cancelled,
            total: orders.length,
            sales: orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
            stockCount: 805, // Can be updated if needed
        };
    }, [orders]);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
                {/* Header */}
                <div className="rounded-3xl border bg-white p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
                    <div className="relative flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    ระบบเภสัชกร
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    จัดการคำสั่งซื้อ / ตรวจสอบใบสั่งแพทย์ / อนุมัติหรือยกเลิก
                                </p>
                            </div>
                            <span className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
                                Role:{" "}
                                <span className="ml-1 font-semibold text-emerald-700">Pharmacy</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="รอตรวจสอบ"
                        value={summary.pending}
                        accent="from-amber-500 to-orange-500"
                        icon={<ClipboardList className="w-6 h-6" />}
                        subtitle="คำสั่งซื้อที่ต้องตรวจ"
                    />
                    <StatCard
                        title="คำสั่งซื้อทั้งหมด"
                        value={summary.total}
                        accent="from-emerald-500 to-teal-500"
                        icon={<Package className="w-6 h-6" />}
                        subtitle="รวมทุกสถานะ"
                    />
                    <StatCard
                        title="ยอดขาย"
                        value={`฿${summary.sales.toLocaleString()}`}
                        accent="from-sky-500 to-indigo-500"
                        icon={<Coins className="w-6 h-6" />}
                        subtitle="สรุปจากออเดอร์"
                    />
                    <StatCard
                        title="สินค้าในสต็อก"
                        value={summary.stockCount}
                        accent="from-fuchsia-500 to-violet-500"
                        icon={<Pill className="w-6 h-6" />}
                        subtitle="พร้อมจำหน่าย"
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Tab
                        active={active === OrderStatus.PENDING_REVIEW}
                        onClick={() => setActive(OrderStatus.PENDING_REVIEW)}
                        label={statusLabel[OrderStatus.PENDING_REVIEW]}
                        count={summary.pending}
                    />
                    <Tab
                        active={active === OrderStatus.PRESCRIPTION}
                        onClick={() => setActive(OrderStatus.PRESCRIPTION)}
                        label={statusLabel[OrderStatus.PRESCRIPTION]}
                        count={summary.prescription}
                    />
                    <Tab
                        active={active === OrderStatus.PROCESSING}
                        onClick={() => setActive(OrderStatus.PROCESSING)}
                        label={statusLabel[OrderStatus.PROCESSING]}
                        count={summary.processing}
                    />
                    <Tab
                        active={active === OrderStatus.DONE}
                        onClick={() => setActive(OrderStatus.DONE)}
                        label={statusLabel[OrderStatus.DONE]}
                        count={summary.delivered}
                    />
                    <Tab
                        active={active === OrderStatus.CANCELLED}
                        onClick={() => setActive(OrderStatus.CANCELLED)}
                        label={statusLabel[OrderStatus.CANCELLED]}
                        count={summary.cancelled}
                    />
                </div>

                {/* Content */}
                <div className="rounded-3xl border bg-white shadow-sm">
                    <div className="p-5 border-b flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                รายการ: {statusLabel[active]}
                            </h2>
                            <p className="text-sm text-slate-600">คลิกปุ่มเพื่อจัดการคำสั่งซื้อ</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className={[
                                    "rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50",
                                    refreshing ? "opacity-60 cursor-not-allowed" : "",
                                ].join(" ")}
                            >
                                {refreshing ? "กำลังรีเฟรช..." : "รีเฟรช"}
                            </button>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        {filtered.length === 0 ? (
                            <EmptyState />
                        ) : (
                            filtered.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onDetail={() => openDetail(order)}
                                    onReview={() => openDetail(order)}
                                    onApprove={() => {
                                        let nextStatus = OrderStatus.PROCESSING;
                                        if (order.status === OrderStatus.PROCESSING) nextStatus = OrderStatus.DONE;
                                        else if (order.status === OrderStatus.STOCK) nextStatus = OrderStatus.DONE;
                                        updateStatus(order.id, nextStatus);
                                    }}
                                    onCancel={() => {
                                        updateStatus(order.id, OrderStatus.CANCELLED);
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Modal open={detailOpen} onClose={closeDetail} title="รายละเอียดคำสั่งซื้อ">
                {selected ? (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-extrabold text-slate-900">{selected.id}</p>
                                    <span className="text-xs rounded-full border bg-slate-50 px-2 py-0.5 text-slate-700">
                                        {statusLabel[selected.status]}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">
                                    ลูกค้า: <span className="font-semibold">Customer</span> •{" "}
                                    {new Date(selected.createdAt).toLocaleString("th-TH")}
                                </p>
                                {selected.shippingAddress && (
                                    <p className="text-sm text-slate-600 mt-2 bg-slate-100 p-2 rounded-lg">
                                        <span className="font-semibold block mb-1">ที่อยู่จัดส่ง:</span>
                                        {typeof selected.shippingAddress === 'string'
                                            ? selected.shippingAddress
                                            : `${selected.shippingAddress.street || ''} ${selected.shippingAddress.district || ''} ${selected.shippingAddress.province || ''} ${selected.shippingAddress.postalCode || ''}`.trim()
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">รวม</p>
                                <p className="text-xl font-extrabold text-emerald-700">฿{selected.totalAmount}</p>
                            </div>
                        </div>

                        {selected.prescriptionImage ? (
                            <div className="rounded-2xl border bg-white p-4">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div>
                                        <p className="font-bold text-slate-900">ใบสั่งแพทย์</p>
                                        <p className="text-sm text-slate-600">คลิกที่รูปเพื่อดูเต็ม</p>
                                    </div>

                                    <a
                                        href={selected.prescriptionImage}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50"
                                    >
                                        เปิดเต็ม (แท็บใหม่)
                                    </a>
                                </div>

                                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => window.open(selected.prescriptionImage!, "_blank")}
                                        className="lg:col-span-2 group rounded-2xl border bg-slate-50 overflow-hidden text-left"
                                    >
                                        <div className="relative w-full aspect-[16/9]">
                                            <img
                                                src={selected.prescriptionImage}
                                                alt="prescription"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="p-3 text-sm text-slate-600 group-hover:text-slate-800">
                                            คลิกเพื่อเปิดเต็ม
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        <div className="rounded-2xl border bg-slate-50 p-4">
                            <p className="text-sm font-bold text-slate-900 mb-3">รายการยา</p>
                            <div className="space-y-2">
                                {selected.items.map((it, idx) => (
                                    <div key={idx} className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {it.product?.name || "สินค้า"}{" "}
                                                <span className="text-slate-500 font-normal">x{it.quantity}</span>
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">฿{it.priceAtTime * it.quantity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selected.notes ? (
                            <div className="rounded-2xl border bg-amber-50/60 p-4">
                                <p className="text-sm font-bold text-slate-900 mb-2">หมายเหตุเพิ่มเติม</p>
                                <div className="text-sm text-slate-700">
                                    {selected.notes}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}

/* ---------------- Components ---------------- */

function StatCard({
    title,
    value,
    subtitle,
    accent,
    icon,
}: {
    title: string;
    value: string | number;
    subtitle: string;
    accent: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />
            <div className="p-5 flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-2">{value}</p>
                    <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                </div>
                <div className="rounded-2xl border bg-slate-50 p-3 text-slate-700">{icon}</div>
            </div>
        </div>
    );
}

function Tab({
    active,
    onClick,
    label,
    count,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
}) {
    return (
        <button
            onClick={onClick}
            className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition",
                active
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
            ].join(" ")}
        >
            <span className="font-semibold">{label}</span>
            <span
                className={[
                    "min-w-[28px] text-center rounded-full px-2 py-0.5 text-xs",
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700",
                ].join(" ")}
            >
                {count}
            </span>
        </button>
    );
}

function OrderCard({
    order,
    onDetail,
    onReview,
    onApprove,
    onCancel,
}: {
    order: Order;
    onDetail: () => void;
    onReview: () => void;
    onApprove: () => void;
    onCancel: () => void;
}) {
    const badge =
        order.status === OrderStatus.PENDING_REVIEW
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : order.status === OrderStatus.PRESCRIPTION
                ? "bg-sky-100 text-sky-700 border-sky-200"
                : order.status === OrderStatus.PROCESSING
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200";

    const isFinished = order.status === OrderStatus.DONE || order.status === OrderStatus.CANCELLED;

    return (
        <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5 flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-extrabold text-slate-900">{order.id}</p>
                        <span className={`text-xs border rounded-full px-2 py-0.5 ${badge}`}>
                            {statusLabel[order.status]}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600">
                        ลูกค้า: <span className="font-semibold">Customer</span> •{" "}
                        {new Date(order.createdAt).toLocaleString("th-TH")}
                    </p>
                    {order.shippingAddress && (
                        <p className="text-sm text-slate-600 mt-2 bg-slate-100 p-2 rounded-lg break-words">
                            <span className="font-semibold block">ที่อยู่จัดส่ง:</span>
                            {typeof order.shippingAddress === 'string'
                                ? order.shippingAddress
                                : `${order.shippingAddress.street || ''} ${order.shippingAddress.district || ''} ${order.shippingAddress.province || ''} ${order.shippingAddress.postalCode || ''}`.trim()
                            }
                        </p>
                    )}
                </div>

                <div className="text-right">
                    <p className="text-xs text-slate-500">รวม</p>
                    <p className="text-xl font-extrabold text-emerald-700">฿{order.totalAmount}</p>
                </div>
            </div>

            <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-2xl border bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-900 mb-3">รายการยา</p>
                    <div className="space-y-2">
                        {order.items.map((it, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {it.product?.name || "สินค้า"} <span className="text-slate-500 font-normal">x{it.quantity}</span>
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-slate-800">฿{it.priceAtTime * it.quantity}</p>
                            </div>
                        ))}
                    </div>

                    {order.prescriptionImage ? (
                        <div className="mt-4 rounded-2xl border bg-white p-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-slate-900">ใบสั่งแพทย์</p>
                                <a
                                    className="text-sm underline text-emerald-700 hover:text-emerald-800"
                                    href={order.prescriptionImage}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    เปิดเต็ม
                                </a>
                            </div>
                            <div className="mt-2 relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-50">
                                <img
                                    src={order.prescriptionImage}
                                    alt="prescription"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                {order.notes ? (
                    <div className="rounded-2xl border bg-amber-50/60 p-4">
                        <p className="text-sm font-bold text-slate-900 mb-2">หมายเหตุเพิ่มเติม</p>
                        <div className="text-sm text-slate-700">
                            {order.notes}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ✅ Actions: DONE/STOCK เหลือแค่ตรวจสอบ */}
            <div className="px-5 pb-5 flex items-center justify-between gap-3 flex-wrap">
                <button
                    onClick={onDetail}
                    className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50"
                >
                    ดูรายละเอียด
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onReview}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-black"
                    >
                        ตรวจสอบ
                    </button>

                    {!isFinished && (
                        <>
                            <button
                                onClick={onApprove}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
                            >
                                ยืนยัน
                            </button>
                            <button
                                onClick={onCancel}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700"
                            >
                                ยกเลิก
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-3xl border bg-slate-50 p-10 text-center">
            <p className="text-lg font-bold text-slate-800">ยังไม่มีรายการในสถานะนี้</p>
            <p className="text-slate-600 mt-1">ลองเลือกแท็บอื่น หรือกดรีเฟรช</p>
        </div>
    );
}

/* ---------------- Modal ---------------- */

function Modal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <button
                onClick={onClose}
                className="absolute inset-0 bg-black/40"
                aria-label="close"
            />
            <div className="absolute left-1/2 top-1/2 w-[min(920px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-xl border overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <p className="font-extrabold text-slate-900">{title}</p>
                    <button
                        onClick={onClose}
                        className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50"
                    >
                        ปิด
                    </button>
                </div>
                <div className="p-5 max-h-[75vh] overflow-auto">{children}</div>
            </div>
        </div>
    );
}

/* ---------------- Icons ---------------- */
