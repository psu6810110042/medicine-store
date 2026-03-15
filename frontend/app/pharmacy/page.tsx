"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardList,
  Package,
  Coins,
  Pill,
  Search,
  X,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  Eye,
  Clock3,
  Truck,
  BadgeCheck,
  Ban,
  FileClock,
  ListFilter,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orderService } from "@/app/services/orderService";
import { Order, OrderItem, OrderStatus } from "@/app/types/order";
import { Product } from "@/app/types/product";
import { toast } from "sonner";
import { productService } from "@/app/services/productService";

const statusLabel: Record<OrderStatus, string> = {
  PENDING_REVIEW: "รอตรวจสอบ",
  PRESCRIPTION: "รอตรวจสอบใบสั่งยา",
  PROCESSING: "กำลังดำเนินการ",
  DONE: "ส่งมอบแล้ว",
  CANCELLED: "ยกเลิกแล้ว",
  STOCK: "รอสินค้า",
};

const statusBadgeMap: Record<
  OrderStatus,
  {
    className: string;
    icon: React.ReactNode;
  }
> = {
  PENDING_REVIEW: {
    className: "border-amber-200 bg-amber-100 text-amber-700",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  PRESCRIPTION: {
    className: "border-sky-200 bg-sky-100 text-sky-700",
    icon: <FileClock className="h-3.5 w-3.5" />,
  },
  PROCESSING: {
    className: "border-emerald-200 bg-emerald-100 text-emerald-700",
    icon: <Truck className="h-3.5 w-3.5" />,
  },
  DONE: {
    className: "border-green-200 bg-green-100 text-green-700",
    icon: <BadgeCheck className="h-3.5 w-3.5" />,
  },
  CANCELLED: {
    className: "border-rose-200 bg-rose-100 text-rose-700",
    icon: <Ban className="h-3.5 w-3.5" />,
  },
  STOCK: {
    className: "border-violet-200 bg-violet-100 text-violet-700",
    icon: <Package className="h-3.5 w-3.5" />,
  },
};

type SortOption = "newest" | "oldest" | "highest" | "lowest";

const sortLabel: Record<SortOption, string> = {
  newest: "ใหม่สุด",
  oldest: "เก่าสุด",
  highest: "ยอดสูงสุด",
  lowest: "ยอดต่ำสุด",
};

type QuickFilter = "all" | "highValue";

const quickFilterLabel: Record<QuickFilter, string> = {
  all: "ทั้งหมด",
  highValue: "ยอดเกิน 500",
};

export default function PharmacyPage() {
  const [active, setActive] = useState<OrderStatus>(OrderStatus.PENDING_REVIEW);
  const [orders, setOrders] = useState<Order[]>([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [stockCount, setStockCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  const fetchAllOrders = useCallback(async () => {
    try {
      setRefreshing(true);

      const [ordersData, productsData] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts(),
      ]);

      const sortedData = ordersData.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedData);

      const parsedProducts: Product[] = Array.isArray(productsData)
        ? productsData
        : ((productsData as { data?: Product[] }).data ?? []);

      const totalStock = parsedProducts.reduce(
        (sum: number, p: Product) => sum + (Number(p.stockQuantity) || 0),
        0
      );
      setStockCount(totalStock);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

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
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o))
      );
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

  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setQuickFilter("all");
  };

  const currentTabOrders = useMemo(() => {
    return orders.filter((o) => o.status === active);
  }, [orders, active]);

  const filtered = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const matched = orders.filter((o) => {
      const statusMatched = o.status === active;
      if (!statusMatched) return false;

      if (quickFilter === "highValue" && Number(o.totalAmount || 0) <= 500) return false;

      if (!keyword) return true;

      const orderIdMatched = String(o.id).toLowerCase().includes(keyword);
      const userMatched = (o.user?.email ?? "").toLowerCase().includes(keyword);
      const itemMatched = (o.items ?? []).some((item) =>
        (item.product?.name ?? "").toLowerCase().includes(keyword)
      );

      return orderIdMatched || userMatched || itemMatched;
    });

    const sorted = [...matched].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "highest") {
        return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
      }
      if (sortBy === "lowest") {
        return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
      }
      return 0;
    });

    return sorted;
  }, [orders, active, searchTerm, sortBy, quickFilter]);

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
      sales: orders
        .filter((o) => o.status !== OrderStatus.CANCELLED)
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
      stockCount,
    };
  }, [orders, stockCount]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Card className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <CardHeader className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                  ระบบเภสัชกร
                </CardTitle>
                <p className="mt-1 text-slate-600">
                  จัดการคำสั่งซื้อ / ตรวจสอบใบสั่งแพทย์ / อนุมัติหรือยกเลิก
                </p>
              </div>

              <span className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
                Role:
                <span className="ml-1 font-semibold text-emerald-700">Pharmacy</span>
              </span>
            </div>
          </CardHeader>
        </Card>

        {refreshing && orders.length === 0 ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="รอตรวจสอบ"
              value={summary.pending}
              accent="from-amber-500 to-orange-500"
              icon={<ClipboardList className="h-6 w-6" />}
              subtitle="คำสั่งซื้อที่ต้องตรวจ"
            />
            <StatCard
              title="รอตรวจใบสั่งยา"
              value={summary.prescription}
              accent="from-indigo-500 to-purple-500"
              icon={<FileClock className="h-6 w-6" />}
              subtitle="ต้องตรวจใบสั่งแพทย์"
            />
            <StatCard
              title="กำลังดำเนินการ"
              value={summary.processing}
              accent="from-teal-500 to-cyan-500"
              icon={<Truck className="h-6 w-6" />}
              subtitle="กำลังจัดยา"
            />
            <StatCard
              title="คำสั่งซื้อทั้งหมด"
              value={summary.total}
              accent="from-emerald-500 to-teal-500"
              icon={<Package className="h-6 w-6" />}
              subtitle="รวมทุกสถานะ"
            />
            <StatCard
              title="ยอดขาย"
              value={`฿${summary.sales.toLocaleString()}`}
              accent="from-sky-500 to-indigo-500"
              icon={<Coins className="h-6 w-6" />}
              subtitle="สรุปจากออเดอร์"
            />
            <StatCard
              title="สินค้าในสต็อก"
              value={summary.stockCount}
              accent="from-fuchsia-500 to-violet-500"
              icon={<Pill className="h-6 w-6" />}
              subtitle="พร้อมจำหน่าย"
            />
          </section>
        )}

        <Tabs value={active} onValueChange={(value) => setActive(value as OrderStatus)}>
          <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
            <TabsTrigger
              value={OrderStatus.PENDING_REVIEW}
              className="rounded-full border px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {statusLabel[OrderStatus.PENDING_REVIEW]} ({summary.pending})
            </TabsTrigger>

            <TabsTrigger
              value={OrderStatus.PRESCRIPTION}
              className="rounded-full border px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {statusLabel[OrderStatus.PRESCRIPTION]} ({summary.prescription})
            </TabsTrigger>

            <TabsTrigger
              value={OrderStatus.PROCESSING}
              className="rounded-full border px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {statusLabel[OrderStatus.PROCESSING]} ({summary.processing})
            </TabsTrigger>

            <TabsTrigger
              value={OrderStatus.DONE}
              className="rounded-full border px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {statusLabel[OrderStatus.DONE]} ({summary.delivered})
            </TabsTrigger>

            <TabsTrigger
              value={OrderStatus.CANCELLED}
              className="rounded-full border px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {statusLabel[OrderStatus.CANCELLED]} ({summary.cancelled})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="overflow-visible rounded-3xl border bg-white shadow-sm">
          <CardHeader className="sticky top-4 z-20 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg font-bold text-slate-900">
                      รายการ: {statusLabel[active]}
                    </CardTitle>

                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <ListFilter className="h-3.5 w-3.5" />
                      กำลังแสดง {filtered.length} / {currentTabOrders.length} รายการ
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      เรียง: {sortLabel[sortBy]}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      ฟิลเตอร์: {quickFilterLabel[quickFilter]}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    {active === OrderStatus.PRESCRIPTION
                      ? "คำสั่งซื้อที่รอตรวจสอบใบสั่งแพทย์ — เภสัชกรต้องตรวจสอบใบสั่งยาและเพิ่มรายการยาให้ลูกค้า"
                      : "คลิกปุ่มเพื่อจัดการคำสั่งซื้อ"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
                <div className="relative w-full lg:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ค้นหาเลขออเดอร์ / ลูกค้า / ชื่อยา"
                    className="w-full rounded-xl border bg-white py-2 pl-10 pr-10 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                  {searchTerm.trim() && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="clear search"
                      title="ล้างคำค้นหา"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
                    <ArrowUpDown className="h-4 w-4 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent text-sm outline-none"
                    >
                      <option value="newest">ใหม่สุด</option>
                      <option value="oldest">เก่าสุด</option>
                      <option value="highest">ยอดสูงสุด</option>
                      <option value="lowest">ยอดต่ำสุด</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={[
                      "rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50",
                      refreshing ? "cursor-not-allowed opacity-60" : "",
                    ].join(" ")}
                  >
                    {refreshing ? "กำลังรีเฟรช..." : "รีเฟรช"}
                  </button>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    รีเซ็ตตัวกรอง
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-5 pt-4">
            {refreshing && orders.length === 0 ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {(Object.keys(quickFilterLabel) as QuickFilter[]).map((filterKey) => {
                    const activeChip = quickFilter === filterKey;
                    return (
                      <button
                        key={filterKey}
                        type="button"
                        onClick={() => setQuickFilter(filterKey)}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          activeChip
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {quickFilterLabel[filterKey]}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <OrderCardSkeleton key={index} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {(Object.keys(quickFilterLabel) as QuickFilter[]).map((filterKey) => {
                    const activeChip = quickFilter === filterKey;
                    return (
                      <button
                        key={filterKey}
                        type="button"
                        onClick={() => setQuickFilter(filterKey)}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          activeChip
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {quickFilterLabel[filterKey]}
                      </button>
                    );
                  })}
                </div>

                {searchTerm.trim() && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                    ผลการค้นหา “{searchTerm}” พบ {filtered.length} รายการ จากทั้งหมด{" "}
                    {currentTabOrders.length} รายการในสถานะนี้
                  </div>
                )}

                {!searchTerm.trim() && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                    กำลังเรียงข้อมูลแบบ <span className="font-semibold">{sortLabel[sortBy]}</span>{" "}
                    และใช้ฟิลเตอร์ <span className="font-semibold">{quickFilterLabel[quickFilter]}</span>
                  </div>
                )}

                {active === OrderStatus.PRESCRIPTION ? (
                  filtered.length === 0 ? (
                    searchTerm.trim() ? (
                      <SearchEmptyState keyword={searchTerm} />
                    ) : (
                      <EmptyState />
                    )
                  ) : (
                    <div className="space-y-6">
                      {filtered.map((order) => (
                        <PrescriptionReviewCard
                          key={order.id}
                          order={order}
                          onOrderUpdated={(updated) => {
                            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
                          }}
                          onStatusChange={async (id, status) => {
                            await updateStatus(id, status);
                          }}
                        />
                      ))}
                    </div>
                  )
                ) : filtered.length === 0 ? (
                  searchTerm.trim() ? (
                    <SearchEmptyState keyword={searchTerm} />
                  ) : (
                    <EmptyState />
                  )
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal open={detailOpen} onClose={closeDetail} title="รายละเอียดคำสั่งซื้อ">
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-slate-900">{selected.id}</p>
                  <StatusBadge status={selected.status} />
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  ลูกค้า: <span className="font-semibold">Customer</span> •{" "}
                  {new Date(selected.createdAt).toLocaleString("th-TH")}
                </p>

                {selected.shippingAddress && (
                  <p className="mt-2 rounded-lg bg-slate-100 p-2 text-sm text-slate-600">
                    <span className="mb-1 block font-semibold">ที่อยู่จัดส่ง:</span>
                    {typeof selected.shippingAddress === "string"
                      ? selected.shippingAddress
                      : `${selected.shippingAddress.street || ""} ${
                          selected.shippingAddress.district || ""
                        } ${selected.shippingAddress.province || ""} ${
                          selected.shippingAddress.postalCode || ""
                        }`.trim()}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">รวม</p>
                <p className="text-xl font-extrabold text-emerald-700">฿{selected.totalAmount}</p>
              </div>
            </div>

            {selected.prescriptionImage ? (
              <Card className="rounded-2xl border bg-white">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">ใบสั่งแพทย์</CardTitle>
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
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <button
                      onClick={() => window.open(selected.prescriptionImage!, "_blank")}
                      className="group overflow-hidden rounded-2xl border bg-slate-50 text-left lg:col-span-2"
                    >
                      <div className="relative aspect-[16/9] w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selected.prescriptionImage}
                          alt="prescription"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="p-3 text-sm text-slate-600 group-hover:text-slate-800">
                        คลิกเพื่อเปิดเต็ม
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-2xl border bg-slate-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">รายการยา</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selected.items.map((it, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {it.product?.name || "สินค้า"}{" "}
                        <span className="font-normal text-slate-500">x{it.quantity}</span>
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-800">฿{it.priceAtTime * it.quantity}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selected.notes ? (
              <Card className="rounded-2xl border bg-amber-50/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900">หมายเหตุเพิ่มเติม</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-700">{selected.notes}</CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </main>
  );
}

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
    <Card className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-2xl border bg-slate-50 p-3 text-slate-700">{icon}</div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="h-1 w-full bg-slate-200" />
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
      </CardContent>
    </Card>
  );
}

function OrderCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
            <div className="h-16 w-full max-w-md animate-pulse rounded-lg bg-slate-200" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-10 animate-pulse rounded bg-slate-200" />
            <div className="h-7 w-20 animate-pulse rounded bg-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border bg-slate-50 p-4 lg:col-span-2">
            <div className="mb-4 h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-10/12 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="mb-4 h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-20 w-full animate-pulse rounded bg-slate-200" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
          <div className="flex gap-2">
            <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 w-20 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 w-20 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const badge = statusBadgeMap[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}
    >
      {badge.icon}
      {statusLabel[status]}
    </span>
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
  const isFinished = order.status === OrderStatus.DONE || order.status === OrderStatus.CANCELLED;

  return (
    <Card className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-extrabold text-slate-900">{order.id}</p>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-slate-600">
              ลูกค้า: <span className="font-semibold">Customer</span> •{" "}
              {new Date(order.createdAt).toLocaleString("th-TH")}
            </p>

            {order.shippingAddress && (
              <p className="mt-2 break-words rounded-lg bg-slate-100 p-2 text-sm text-slate-600">
                <span className="block font-semibold">ที่อยู่จัดส่ง:</span>
                {typeof order.shippingAddress === "string"
                  ? order.shippingAddress
                  : `${order.shippingAddress.street || ""} ${
                      order.shippingAddress.district || ""
                    } ${order.shippingAddress.province || ""} ${
                      order.shippingAddress.postalCode || ""
                    }`.trim()}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">รวม</p>
            <p className="text-xl font-extrabold text-emerald-700">฿{order.totalAmount}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl border bg-slate-50 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">รายการยา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {it.product?.name || "สินค้า"}{" "}
                      <span className="font-normal text-slate-500">x{it.quantity}</span>
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-800">฿{it.priceAtTime * it.quantity}</p>
                </div>
              ))}

              {order.prescriptionImage ? (
                <div className="mt-4 rounded-2xl border bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">ใบสั่งแพทย์</p>
                    <a
                      className="text-sm text-emerald-700 underline hover:text-emerald-800"
                      href={order.prescriptionImage}
                      target="_blank"
                      rel="noreferrer"
                    >
                      เปิดเต็ม
                    </a>
                  </div>
                  <div className="relative mt-2 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.prescriptionImage}
                      alt="prescription"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {order.notes ? (
            <Card className="rounded-2xl border bg-amber-50/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">หมายเหตุเพิ่มเติม</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">{order.notes}</CardContent>
            </Card>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
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
                {(order.status === OrderStatus.PROCESSING || order.status === OrderStatus.STOCK) &&
                order.paymentStatus !== "APPROVED" ? (
                  <button
                    onClick={() => toast.error("ให้แอดมินตรวจสอบสลิปโอนเงินก่อนดำเนินการต่อ")}
                    className="rounded-xl border bg-slate-100 px-4 py-2 text-sm text-slate-600 shadow-sm transition-colors hover:bg-slate-200"
                    title="ต้องให้แอดมินตรวจสอบและยืนยันการชำระเงินก่อน"
                  >
                    รอตรวจสอบชำระเงิน
                  </button>
                ) : (
                  <button
                    onClick={onApprove}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
                  >
                    ยืนยัน
                  </button>
                )}

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
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="rounded-3xl border bg-slate-50">
      <CardContent className="p-10 text-center">
        <p className="text-lg font-bold text-slate-800">ยังไม่มีรายการในสถานะนี้</p>
        <p className="mt-1 text-slate-600">ลองเลือกแท็บอื่น หรือเปลี่ยนฟิลเตอร์</p>
      </CardContent>
    </Card>
  );
}

function SearchEmptyState({ keyword }: { keyword: string }) {
  return (
    <Card className="rounded-3xl border bg-slate-50">
      <CardContent className="p-10 text-center">
        <p className="text-lg font-bold text-slate-800">ไม่พบรายการที่ค้นหา</p>
        <p className="mt-1 text-slate-600">ไม่พบข้อมูลสำหรับ “{keyword}” ในสถานะนี้</p>
      </CardContent>
    </Card>
  );
}

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
      <button onClick={onClose} className="absolute inset-0 bg-black/40" aria-label="close" />
      <div className="absolute left-1/2 top-1/2 w-[min(920px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <p className="font-extrabold text-slate-900">{title}</p>
          <button
            onClick={onClose}
            className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            ปิด
          </button>
        </div>
        <div className="max-h-[75vh] overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}

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
  onStatusChange: (id: string, status: OrderStatus) => Promise<void> | void;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [draftItems, setDraftItems] = useState<PrescriptionDraftItem[]>(
    (order.items ?? []).map((it: OrderItem) => ({
      product: it.product!,
      quantity: it.quantity,
    }))
  );

  const [imageOpen, setImageOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch(`${apiUrl}/products?search=${encodeURIComponent(q)}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("search failed");

        const data = await res.json();
        const products: Product[] = Array.isArray(data) ? data : (data.data ?? []);
        setResults(products);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [apiUrl]
  );

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => doSearch(query), 350);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addProduct = (product: Product) => {
    setDraftItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setQuery("");
    setShowDropdown(false);
    setResults([]);
  };

  const changeQty = (productId: string, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setDraftItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const total = draftItems.reduce((sum, i) => sum + (i.product.price ?? 0) * i.quantity, 0);

  const handleSaveAndApprove = async () => {
    if (draftItems.length === 0) {
      toast.error("กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await orderService.addItemsToOrder(
        order.id,
        draftItems.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
      );
      onOrderUpdated(updated);
      await onStatusChange(order.id, OrderStatus.PROCESSING);
      toast.success("อนุมัติและส่งคำสั่งซื้อเรียบร้อย");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      toast.error(`ไม่สามารถบันทึกรายการยาได้: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    await onStatusChange(order.id, OrderStatus.CANCELLED);
  };

  const prescriptionUrl = order.prescriptionImage ?? null;

  return (
    <Card className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
            ใบสั่งยา
          </span>
          <p className="max-w-xs truncate font-mono text-xs text-slate-500">{order.id}</p>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-sm text-slate-600">
            ลูกค้า: <span className="font-semibold text-slate-800">{order.user?.email ?? "—"}</span>
          </p>
          <StatusBadge status={order.status} />
        </div>

        <p className="text-xs text-slate-400">
          {new Date(order.createdAt).toLocaleString("th-TH", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col divide-y md:flex-row md:divide-x md:divide-y-0">
          <div className="flex shrink-0 flex-col items-center gap-3 bg-slate-50 p-4 md:w-52">
            <p className="self-start text-xs font-semibold uppercase tracking-wide text-slate-400">
              ใบสั่งยา
            </p>

            {prescriptionUrl ? (
              <button
                type="button"
                onClick={() => setImageOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-violet-700 transition-colors hover:bg-violet-50"
              >
                <Eye className="h-4 w-4" />
                ดูใบสั่งยา
              </button>
            ) : (
              <div className="flex h-36 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-400">
                ไม่มีรูปใบสั่งยา
              </div>
            )}

            {prescriptionUrl && (
              <button
                type="button"
                onClick={() => setImageOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs text-violet-700 transition-colors hover:bg-violet-50"
              >
                <Eye className="h-3.5 w-3.5" />
                ดูเต็มจอ
              </button>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-4 p-5">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-slate-700">เพิ่มรายการยา</p>
              <div className="relative">
                <div className="flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
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
                    <span className="animate-pulse text-xs text-slate-400">กำลังค้นหา...</span>
                  )}
                </div>

                {showDropdown && results.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border bg-white shadow-xl"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {results.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProduct(product)}
                        className="flex w-full items-center justify-between gap-3 border-b px-4 py-2.5 text-left text-sm transition-colors last:border-0 hover:bg-violet-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-400">คงเหลือ: {product.stockQuantity}</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-emerald-600">
                          ฿{Number(product.price).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">รายการยาที่เลือก</p>
                {draftItems.length > 0 && (
                  <span className="text-xs font-bold text-slate-700">รวม ฿{total.toLocaleString()}</span>
                )}
              </div>

              {draftItems.length === 0 ? (
                <p className="rounded-xl border border-dashed py-4 text-center text-xs italic text-slate-400">
                  ยังไม่มีรายการ — ค้นหาและเพิ่มยาด้านบน
                </p>
              ) : (
                <div className="space-y-2">
                  {draftItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 rounded-xl border bg-slate-50 px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          ฿{Number(item.product.price).toLocaleString()} × {item.quantity} ={" "}
                          <span className="font-semibold text-slate-700">
                            ฿{(Number(item.product.price) * item.quantity).toLocaleString()}
                          </span>
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => changeQty(item.product.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg border bg-white text-slate-600 hover:bg-red-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(item.product.id, 1)}
                          disabled={item.quantity >= (item.product.stockQuantity ?? 999)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg border bg-white text-slate-600 hover:bg-emerald-50 disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        className="shrink-0 text-slate-300 transition-colors hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                ยกเลิกคำสั่งซื้อ
              </button>

              <button
                type="button"
                onClick={handleSaveAndApprove}
                disabled={submitting || draftItems.length === 0}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {submitting ? "กำลังบันทึก..." : "อนุมัติและส่งคำสั่งซื้อ"}
              </button>
            </div>
          </div>
        </div>
      </CardContent>

      {imageOpen && prescriptionUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setImageOpen(false)}
        >
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setImageOpen(false)}
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={prescriptionUrl}
              alt="ใบสั่งยา"
              className="max-h-[80vh] w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </Card>
  );
}