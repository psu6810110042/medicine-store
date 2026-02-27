"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ClipboardList, Package, Coins, Pill, Search, X, Plus, Minus, CheckCircle, XCircle, Eye } from "lucide-react";
import { orderService } from "@/app/services/orderService";
import { Order, OrderItem, OrderStatus } from "@/app/types/order";
import { Product } from "@/app/types/product";
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
                            <p className="text-sm text-slate-600">
                                {active === OrderStatus.PRESCRIPTION
                                    ? "คำสั่งซื้อที่รอตรวจสอบใบสั่งแพทย์ — เภสัชกรต้องตรวจสอบใบสั่งยาและเพิ่มรายการยาให้ลูกค้า"
                                    : "คลิกปุ่มเพื่อจัดการคำสั่งซื้อ"}
                            </p>
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
                        {active === OrderStatus.PRESCRIPTION ? (
                            filtered.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <div className="space-y-6">
                                    {filtered.map((order) => (
                                        <PrescriptionReviewCard
                                            key={order.id}
                                            order={order}
                                            onOrderUpdated={(updated) => {
                                                setOrders((prev) =>
                                                    prev.map((o) => (o.id === updated.id ? updated : o))
                                                );
                                            }}
                                            onStatusChange={(id, status) => updateStatus(id, status)}
                                        />
                                    ))}
                                </div>
                            )
                        ) : filtered.length === 0 ? (
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


/* ──────────────────────────────────────────────────────────────
   PrescriptionReviewCard
   Full pharmacist workflow: view image → add medicines → approve
   ────────────────────────────────────────────────────────────── */
interface PrescriptionDraftItem {
    product: Product;
    quantity: number;
}

function PrescriptionReviewCard({
    order,
    onOrderUpdated,
    onStatusChange,
}: {
    order: Order;
    onOrderUpdated: (updated: Order) => void;
    onStatusChange: (id: string, status: OrderStatus) => void;
}) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Search
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // Draft item list
    const [draftItems, setDraftItems] = useState<PrescriptionDraftItem[]>(
        (order.items ?? []).map((it: OrderItem) => ({
            product: it.product!,
            quantity: it.quantity,
        }))
    );

    // Image lightbox
    const [imageOpen, setImageOpen] = useState(false);

    // Submitting state
    const [submitting, setSubmitting] = useState(false);

    // Search debounce
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const doSearch = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); setShowDropdown(false); return; }
        setSearching(true);
        try {
            const res = await fetch(`${apiUrl}/products?search=${encodeURIComponent(q)}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('search failed');
            const data = await res.json();
            // Handle both paginated {data:[]} and plain array
            const products: Product[] = Array.isArray(data) ? data : (data.data ?? []);
            setResults(products);
            setShowDropdown(true);
        } catch {
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => doSearch(query), 350);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [query, doSearch]);

    // Click outside → close dropdown
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                searchRef.current && !searchRef.current.contains(e.target as Node)
            ) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const addProduct = (product: Product) => {
        setDraftItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setQuery('');
        setShowDropdown(false);
        setResults([]);
    };

    const changeQty = (productId: string, delta: number) => {
        setDraftItems((prev) =>
            prev
                .map((i) =>
                    i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
                )
                .filter((i) => i.quantity > 0)
        );
    };

    const removeItem = (productId: string) => {
        setDraftItems((prev) => prev.filter((i) => i.product.id !== productId));
    };

    const total = draftItems.reduce(
        (sum, i) => sum + (i.product.price ?? 0) * i.quantity,
        0
    );

    const handleSaveAndApprove = async () => {
        if (draftItems.length === 0) {
            toast.error('กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ');
            return;
        }
        setSubmitting(true);
        try {
            const updated = await orderService.addItemsToOrder(
                order.id,
                draftItems.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
            );
            onOrderUpdated(updated);
            // Move to PROCESSING
            await onStatusChange(order.id, OrderStatus.PROCESSING);
            toast.success('อนุมัติและส่งคำสั่งซื้อเรียบร้อย');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
            toast.error(`ไม่สามารถบันทึกรายการยาได้: ${message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => onStatusChange(order.id, OrderStatus.CANCELLED);

    const prescriptionUrl = order.prescriptionImage ?? null;

    return (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b bg-gradient-to-r from-violet-50 to-indigo-50">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                        ใบสั่งยา
                    </span>
                    <p className="font-mono text-xs text-slate-500 truncate max-w-xs">{order.id}</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                    ลูกค้า: <span className="font-semibold text-slate-800">{order.user?.email ?? '—'}</span>
                </p>
                <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleString('th-TH', {
                        dateStyle: 'medium', timeStyle: 'short',
                    })}
                </p>
            </div>

            {/* Body — two columns */}
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">

                {/* LEFT — prescription image */}
                <div className="md:w-52 shrink-0 bg-slate-50 p-4 flex flex-col items-center gap-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide self-start">ใบสั่งยา</p>
                    {prescriptionUrl ? (
                        <button
                            type="button"
                            onClick={() => setImageOpen(true)}
                            className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-violet-700 hover:bg-violet-50 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            ดูใบสั่งยา
                        </button>
                    ) : (
                        <div className="w-full h-36 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                            ไม่มีรูปใบสั่งยา
                        </div>
                    )}
                    {prescriptionUrl && (
                        <button
                            type="button"
                            onClick={() => setImageOpen(true)}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs text-violet-700 hover:bg-violet-50 transition-colors"
                        >
                            <Eye className="w-3.5 h-3.5" /> ดูเต็มจอ
                        </button>
                    )}
                </div>

                {/* RIGHT — medicine builder */}
                <div className="flex-1 p-5 space-y-4 min-w-0">
                    {/* Search */}
                    <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1.5">เพิ่มรายการยา</p>
                        <div className="relative">
                            <div className="flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2">
                                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="ค้นหาชื่อยา..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                                />
                                {searching && (
                                    <span className="text-xs text-slate-400 animate-pulse">กำลังค้นหา...</span>
                                )}
                            </div>

                            {showDropdown && results.length > 0 && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute z-20 mt-1 w-full rounded-xl border bg-white shadow-xl max-h-52 overflow-y-auto"
                                    style={{ scrollbarWidth: 'none' }}
                                >
                                    {results.map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => addProduct(product)}
                                            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-violet-50 text-left border-b last:border-0 transition-colors"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-800 truncate">{product.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    คงเหลือ: {product.stockQuantity}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-emerald-600 shrink-0 text-xs">
                                                ฿{Number(product.price).toLocaleString()}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selected items */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-semibold text-slate-700">รายการยาที่เลือก</p>
                            {draftItems.length > 0 && (
                                <span className="text-xs font-bold text-slate-700">รวม ฿{total.toLocaleString()}</span>
                            )}
                        </div>
                        {draftItems.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-4 text-center border rounded-xl border-dashed">
                                ยังไม่มีรายการ — ค้นหาและเพิ่มยาด้านบน
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {draftItems.map((item) => (
                                    <div
                                        key={item.product.id}
                                        className="flex items-center gap-3 rounded-xl border bg-slate-50 px-3 py-2.5"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-800 text-sm truncate">{item.product.name}</p>
                                            <p className="text-xs text-slate-500">
                                                ฿{Number(item.product.price).toLocaleString()} × {item.quantity}
                                                {' = '}
                                                <span className="font-semibold text-slate-700">
                                                    ฿{(Number(item.product.price) * item.quantity).toLocaleString()}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => changeQty(item.product.id, -1)}
                                                className="w-6 h-6 rounded-lg border bg-white flex items-center justify-center hover:bg-red-50 text-slate-600"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => changeQty(item.product.id, 1)}
                                                disabled={item.quantity >= (item.product.stockQuantity ?? 999)}
                                                className="w-6 h-6 rounded-lg border bg-white flex items-center justify-center hover:bg-emerald-50 text-slate-600 disabled:opacity-40"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.product.id)}
                                            className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={submitting}
                            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            ยกเลิกคำสั่งซื้อ
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveAndApprove}
                            disabled={submitting || draftItems.length === 0}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {submitting ? 'กำลังบันทึก...' : 'อนุมัติและส่งคำสั่งซื้อ'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Prescription image lightbox */}
            {imageOpen && prescriptionUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setImageOpen(false)}
                >
                    <div
                        className="relative max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setImageOpen(false)}
                            className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-slate-600 hover:bg-slate-100 z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <img
                            src={prescriptionUrl}
                            alt="ใบสั่งยา"
                            className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
