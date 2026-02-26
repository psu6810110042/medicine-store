"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { ClipboardList, Package, Coins, Pill } from "lucide-react";

type OrderStatus =
    | "PENDING_REVIEW"
    | "PRESCRIPTION"
    | "PROCESSING"
    | "DONE"
    | "STOCK";

type OrderItem = {
    name: string;
    qty: number;
    price: number;
    note?: string;
};

type Order = {
    id: string;
    customerName: string;
    createdAt: string;
    total: number;
    status: OrderStatus;
    items: OrderItem[];
    patientInfo?: {
        allergies?: string;
        diseases?: string;
    };
    prescription?: {
        imageUrl: string; // "/prescriptions/sample-prescription.jpg"
        doctorName?: string;
        hospital?: string;
        note?: string;
    };
};

const statusLabel: Record<OrderStatus, string> = {
    PENDING_REVIEW: "รอตรวจสอบ",
    PRESCRIPTION: "ใบสั่งแพทย์",
    PROCESSING: "กำลังดำเนินการ",
    DONE: "เสร็จสิ้น",
    STOCK: "คลังสินค้า",
};

export default function PharmacyPage() {
    const [active, setActive] = useState<OrderStatus>("PENDING_REVIEW");

    // ✅ mock DB / ข้อมูลตั้งต้น
    const initialOrders: Order[] = [
        {
            id: "ORD-2024-002",
            customerName: "สมชาย ใจดี",
            createdAt: "20 ม.ค. 2567 • 14:20",
            total: 300,
            status: "PENDING_REVIEW",
            items: [
                { name: "ยาพาราเซตามอล 500mg", qty: 1, price: 180, note: "ยาควบคุม" },
                { name: "อะม็อกซิซิลลิน 500mg", qty: 1, price: 120 },
            ],
            patientInfo: {
                allergies: "เพนิซิลลิน, กุ้ง",
                diseases: "เบาหวาน, ความดันโลหิตสูง",
            },
        },
        {
            id: "PRE-1771752609011",
            customerName: "สมชาย ใจดี",
            createdAt: "22/2/2569 • 16:30",
            total: 400,
            status: "PRESCRIPTION",
            items: [{ name: "ยาตามใบสั่งแพทย์", qty: 1, price: 400 }],
            prescription: {
                imageUrl: "/prescriptions/sample-prescription.jpg",
                doctorName: "เภสัชกร สมหญิงหญิง",
                hospital: "โรงพยาบาลตัวอย่าง",
                note: "โปรดตรวจสอบชื่อยาและขนาดยาให้ตรงตามใบสั่ง",
            },
            patientInfo: {
                allergies: "-",
                diseases: "-",
            },
        },
    ];

    const [orders, setOrders] = useState<Order[]>(initialOrders);

    // ✅ Modal
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState<Order | null>(null);

    // ✅ Refresh states (ใช้ให้ UI รีเฟรชได้ทุกฟังก์ชัน)
    const [refreshing, setRefreshing] = useState(false);

    const openDetail = (order: Order) => {
        setSelected(order);
        setDetailOpen(true);
    };

    const closeDetail = () => {
        setDetailOpen(false);
        setSelected(null);
    };

    const updateStatus = (id: string, next: OrderStatus) => {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
    };

    // ✅ ปุ่มรีเฟรช: โหลดข้อมูลใหม่ + ปิด modal + รีเฟรช UI
    const handleRefresh = async () => {
        setRefreshing(true);

        setDetailOpen(false);
        setSelected(null);

        // mock reload data
        setOrders([...initialOrders]);

        setTimeout(() => setRefreshing(false), 250);
    };

    const filtered = useMemo(
        () => orders.filter((o) => o.status === active),
        [orders, active]
    );

    const summary = useMemo(() => {
        const pending = orders.filter((o) => o.status === "PENDING_REVIEW").length;
        const prescription = orders.filter((o) => o.status === "PRESCRIPTION").length;
        const processing = orders.filter((o) => o.status === "PROCESSING").length;
        const done = orders.filter((o) => o.status === "DONE").length;
        const stock = orders.filter((o) => o.status === "STOCK").length;

        return {
            pending,
            prescription,
            processing,
            done,
            stock,
            total: orders.length,
            sales: orders.reduce((sum, o) => sum + o.total, 0),
            stockCount: 805,
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
                        active={active === "PENDING_REVIEW"}
                        onClick={() => {
                            setActive("PENDING_REVIEW");
                        }}
                        label={statusLabel.PENDING_REVIEW}
                        count={summary.pending}
                    />
                    <Tab
                        active={active === "PRESCRIPTION"}
                        onClick={() => {
                            setActive("PRESCRIPTION");
                        }}
                        label={statusLabel.PRESCRIPTION}
                        count={summary.prescription}
                    />
                    <Tab
                        active={active === "DONE"}
                        onClick={() => {
                            setActive("DONE");
                        }}
                        label={statusLabel.DONE}
                        count={summary.done}
                    />
                    <Tab
                        active={active === "STOCK"}
                        onClick={() => {
                            setActive("STOCK");
                        }}
                        label={statusLabel.STOCK}
                        count={summary.stock}
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
                                        updateStatus(order.id, "DONE");
                                        setActive("DONE");
                                    }}
                                    onCancel={() => {
                                        updateStatus(order.id, "STOCK");
                                        setActive("STOCK");
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
                                    ลูกค้า: <span className="font-semibold">{selected.customerName}</span> •{" "}
                                    {selected.createdAt}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">รวม</p>
                                <p className="text-xl font-extrabold text-emerald-700">฿{selected.total}</p>
                            </div>
                        </div>

                        {selected.prescription ? (
                            <div className="rounded-2xl border bg-white p-4">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div>
                                        <p className="font-bold text-slate-900">ใบสั่งแพทย์</p>
                                        <p className="text-sm text-slate-600">คลิกที่รูปเพื่อดูเต็ม</p>
                                    </div>

                                    <a
                                        href={selected.prescription.imageUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50"
                                    >
                                        เปิดเต็ม (แท็บใหม่)
                                    </a>
                                </div>

                                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => window.open(selected.prescription!.imageUrl, "_blank")}
                                        className="lg:col-span-2 group rounded-2xl border bg-slate-50 overflow-hidden text-left"
                                    >
                                        <div className="relative w-full aspect-[16/9]">
                                            <Image
                                                src={selected.prescription.imageUrl}
                                                alt="prescription"
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 1024px) 100vw, 700px"
                                            />
                                        </div>
                                        <div className="p-3 text-sm text-slate-600 group-hover:text-slate-800">
                                            คลิกเพื่อเปิดเต็ม
                                        </div>
                                    </button>

                                    <div className="rounded-2xl border bg-emerald-50/40 p-4 text-sm text-slate-700 space-y-2">
                                        <p>
                                            <span className="font-semibold">แพทย์:</span>{" "}
                                            {selected.prescription.doctorName ?? "-"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">สถานพยาบาล:</span>{" "}
                                            {selected.prescription.hospital ?? "-"}
                                        </p>
                                        <p className="text-slate-600">{selected.prescription.note ?? ""}</p>
                                    </div>
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
                                                {it.name}{" "}
                                                <span className="text-slate-500 font-normal">x{it.qty}</span>
                                            </p>
                                            {it.note ? (
                                                <span className="inline-flex mt-1 text-xs rounded-full border bg-white px-2 py-0.5 text-rose-700 border-rose-200">
                                                    {it.note}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">฿{it.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-amber-50/60 p-4">
                            <p className="text-sm font-bold text-slate-900 mb-2">ข้อมูลสุขภาพลูกค้า</p>
                            <div className="text-sm text-slate-700 space-y-1">
                                <p>
                                    <span className="font-semibold">แพ้:</span>{" "}
                                    {selected.patientInfo?.allergies ?? "-"}
                                </p>
                                <p>
                                    <span className="font-semibold">โรคประจำตัว:</span>{" "}
                                    {selected.patientInfo?.diseases ?? "-"}
                                </p>
                            </div>
                        </div>
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
        order.status === "PENDING_REVIEW"
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : order.status === "PRESCRIPTION"
                ? "bg-sky-100 text-sky-700 border-sky-200"
                : order.status === "PROCESSING"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200";

    const isFinished = order.status === "DONE" || order.status === "STOCK";

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
                        ลูกค้า: <span className="font-semibold">{order.customerName}</span> •{" "}
                        {order.createdAt}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs text-slate-500">รวม</p>
                    <p className="text-xl font-extrabold text-emerald-700">฿{order.total}</p>
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
                                        {it.name} <span className="text-slate-500 font-normal">x{it.qty}</span>
                                    </p>
                                    {it.note ? (
                                        <span className="inline-flex mt-1 text-xs rounded-full border bg-white px-2 py-0.5 text-rose-700 border-rose-200">
                                            {it.note}
                                        </span>
                                    ) : null}
                                </div>
                                <p className="text-sm font-bold text-slate-800">฿{it.price}</p>
                            </div>
                        ))}
                    </div>

                    {order.prescription ? (
                        <div className="mt-4 rounded-2xl border bg-white p-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-slate-900">ใบสั่งแพทย์</p>
                                <a
                                    className="text-sm underline text-emerald-700 hover:text-emerald-800"
                                    href={order.prescription.imageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    เปิดเต็ม
                                </a>
                            </div>
                            <div className="mt-2 relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-50">
                                <Image
                                    src={order.prescription.imageUrl}
                                    alt="prescription"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 1024px) 100vw, 700px"
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="rounded-2xl border bg-amber-50/60 p-4">
                    <p className="text-sm font-bold text-slate-900 mb-2">ข้อมูลสุขภาพลูกค้า</p>
                    <div className="text-sm text-slate-700 space-y-1">
                        <p>
                            <span className="font-semibold">แพ้:</span> {order.patientInfo?.allergies ?? "-"}
                        </p>
                        <p>
                            <span className="font-semibold">โรคประจำตัว:</span> {order.patientInfo?.diseases ?? "-"}
                        </p>
                    </div>
                </div>
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
