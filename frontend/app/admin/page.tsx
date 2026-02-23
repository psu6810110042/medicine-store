// medicine-store/frontend/app/admin/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Product, Category } from '../types/product';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Package, AlertCircle, ShieldAlert, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // คำนวณสถิติต่างๆ
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const lowStockThreshold = 10;
    const lowStockCount = products.filter((p: Product) => p.stockQuantity < lowStockThreshold).length;
    const controlledCount = products.filter((p: Product) => p.isControlled).length;
    const prescriptionCount = products.filter((p: Product) => p.requiresPrescription).length;

    return { totalProducts, lowStockCount, controlledCount, prescriptionCount };
  }, [products]);

  // เตรียมข้อมูลกราฟแยกตามหมวดหมู่
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p: Product) => {
      const catName = categories.find((c: Category) => c.id === p.categoryId)?.name || 'Uncategorized';
      counts[catName] = (counts[catName] || 0) + 1;
    });
    return Object.keys(counts).map((key) => ({ name: key, count: counts[key] }));
  }, [products, categories]);

  // สินค้าที่เหลือน้อย (สำหรับแสดงใน Action Required)
  const lowStockItems = useMemo(() => {
    return products
      .filter((p: Product) => p.stockQuantity < 10)
      .sort((a: Product, b: Product) => a.stockQuantity - b.stockQuantity)
      .slice(0, 5);
  }, [products]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">ภาพรวมระบบคลังสินค้า</p>
          </div>
          <Link href="/admin/products">
            <Button className="gap-2">
              จัดการสินค้า <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Stock */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สินค้าทั้งหมด</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">รายการในระบบ</p>
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สินค้าใกล้หมด</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.lowStockCount}</div>
              <p className="text-xs text-muted-foreground">เหลือน้อยกว่า 10 ชิ้น</p>
            </CardContent>
          </Card>

          {/* Controlled Drugs (Replaces Expiring Soon) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยาควบคุม</CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.controlledCount}</div>
              <p className="text-xs text-muted-foreground">รายการที่ต้องควบคุมพิเศษ</p>
            </CardContent>
          </Card>

          {/* Prescription Required (Replaces Expired) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ต้องมีใบสั่งแพทย์</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.prescriptionCount}</div>
              <p className="text-xs text-muted-foreground">จำกัดการขาย</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          
          {/* Chart Section */}
          <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                สัดส่วนสินค้าตามหมวดหมู่
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value: number) => `${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Action Required List */}
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                สินค้าต้องเติมสต็อก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">สต็อกสินค้าเพียงพอทุกรายการ</p>
                ) : (
                  lowStockItems.map((item: Product) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-background border flex items-center justify-center overflow-hidden">
                           {item.image && item.image !== 'https://via.placeholder.com/150' ? (
                              <img src={item.image} alt="" className="h-full w-full object-cover" />
                           ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                           )}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {categories.find(c => c.id === item.categoryId)?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          เหลือ {item.stockQuantity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}