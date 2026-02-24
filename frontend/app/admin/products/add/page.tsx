'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import { Product, Category } from '../../../types/product';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { ChevronLeft, Save, Plus } from 'lucide-react';
import { ImageUpload } from '../../components/ImageUpload';
import { AddCategoryModal } from '../../components/AddCategoryModal';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    stockQuantity: 0,
    inStock: true,
    isControlled: false,
    requiresPrescription: false,
    batchNumber: '',
    expiryDate: '',
    manufacturer: '',
    activeIngredient: '',
    warnings: '',
    image: '',
    properties: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        alert('ไม่สามารถโหลดหมวดหมู่');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategorySuccess = (category: Category) => {
    setCategories(prev => [...prev, category]);
    setFormData(prev => ({ ...prev, categoryId: category.id }));
    setShowAddCategory(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'stockQuantity') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.categoryId) {
      alert('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }
    try {
      setSaving(true);
      await productService.createProduct(formData);
      alert('เพิ่มสินค้าสำเร็จ');
      router.push('/admin/products');
    } catch (err) {
      console.error('Failed to create product:', err);
      alert('ไม่สามารถเพิ่มสินค้า');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">เพิ่มสินค้าใหม่</h1>
            <p className="text-muted-foreground">กรอกข้อมูลสินค้าที่ต้องการเพิ่ม</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ข้อมูลพื้นฐาน</h3>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">ชื่อสินค้า *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="เช่น ยาแก้ปวดสุดแรง"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">รายละเอียด *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="บรรยายสินค้า ประเภท วิธีใช้ คุณสมบัติ ฯลฯ"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">หมวดหมู่ *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer"
                      required
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(true)}
                      className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      เพิ่มหมวดหมู่ใหม่
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">ราคา (บาท) *</label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">ข้อมูลสต็อก</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">จำนวนสต็อก *</label>
                    <Input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">สถานะสต็อก</label>
                    <select
                      value={String(formData.inStock)}
                      onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.value === 'true' }))}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer"
                    >
                      <option value="true">มีสต็อก</option>
                      <option value="false">หมดสต็อก</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">หมายเลขแบตช์</label>
                  <Input
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    placeholder="เช่น B001-2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">วันหมดอายุ</label>
                  <Input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">ผู้ผลิต</label>
                  <Input
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="เช่น บริษัท ยาดี จำกัด"
                  />
                </div>
              </div>

              {/* Regulations */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">ข้อบังคับการขาย</h3>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isControlled"
                    id="isControlled"
                    checked={formData.isControlled}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <label htmlFor="isControlled" className="text-sm font-medium">
                    นี่คือยาควบคุม
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="requiresPrescription"
                    id="requiresPrescription"
                    checked={formData.requiresPrescription}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <label htmlFor="requiresPrescription" className="text-sm font-medium">
                    ต้องมีใบสั่งแพทย์
                  </label>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">รูปภาพ</h3>
                
                <ImageUpload
                  value={formData.image || ''}
                  onChange={(url: string) => setFormData(prev => ({ ...prev, image: url }))}
                />
              </div>

              {/* Additional Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">ข้อมูลเพิ่มเติม</h3>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">สารประกอบหลัก</label>
                  <Input
                    name="activeIngredient"
                    value={formData.activeIngredient}
                    onChange={handleChange}
                    placeholder="เช่น Paracetamol 500mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">คำเตือน/ข้อระวัง</label>
                  <textarea
                    name="warnings"
                    value={formData.warnings}
                    onChange={handleChange}
                    rows={3}
                    placeholder="เช่น การห้ามใช้ข้างเคียง อาการไม่พึงประสงค์ ฯลฯ"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">สรรพคุณ</label>
                  <Input
                    name="properties"
                    value={formData.properties}
                    onChange={handleChange}
                    placeholder="ข้อมูลอื่นๆ"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 border-t pt-6">
                <Link href="/admin/products" className="flex-1">
                  <Button variant="outline" className="w-full">
                    ยกเลิก
                  </Button>
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 rounded-lg text-white hover:bg-emerald-700 disabled:opacity-50 font-bold transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'กำลังบันทึก...' : 'เพิ่มสินค้า'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <AddCategoryModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSuccess={handleAddCategorySuccess}
      />
    </div>
  );
}
