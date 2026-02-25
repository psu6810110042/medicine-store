'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types/product';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Plus, Edit2, Trash2, ChevronLeft, Search, Filter } from 'lucide-react';
import { Input } from '../../../components/ui/input';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

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
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือว่าต้องการลบสินค้านี้?')) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('ไม่สามารถลบสินค้าได้');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">จัดการสินค้า</h1>
              <p className="text-muted-foreground">จำนวนสินค้าทั้งหมด: {filteredProducts.length}</p>
            </div>
          </div>
          <Link href="/admin/products/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มสินค้าใหม่
            </Button>
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาสินค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-48">
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="">ทั้งหมด</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="pt-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">ไม่พบสินค้า</p>
                <Link href="/admin/products/add">
                  <Button>เพิ่มสินค้าใหม่</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">ชื่อสินค้า</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">หมวดหมู่</th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground">ราคา</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">สต็อก</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">สถานะ</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {product.image && product.image !== 'https://via.placeholder.com/150' ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted" />
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {categories.find(c => c.id === product.categoryId)?.name || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold">฿{Number(product.price).toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.stockQuantity < 10 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex gap-2 justify-center flex-wrap">
                            {product.isControlled && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                ยาควบคุม
                              </span>
                            )}
                            {product.requiresPrescription && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                ต้องใบสั่ง
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-center">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Edit2 className="h-3 w-3" />
                                แก้ไข
                              </Button>
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/50 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
